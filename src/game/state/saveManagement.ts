import { installedRegionalModules, resolveInstalledRegions } from '../modules/installed'
import { installedModuleOwnership } from '../modules/ownership'
import type { RuntimeCatalog } from '../modules/runtimeCatalog'
import { createDurableModulePersistence, DURABLE_CONFLICT } from './durableModulePersistence'
import { validateActiveProgress } from './internalProgressPersistence'
import { compactModuleHistory, prepareModuleArchive } from './moduleArchiveRules'
import {
  createModuleSaveEnvelope, parseModuleSaveEnvelope, projectModuleProgress,
  type ModuleSaveEnvelope,
} from './moduleProgress'
import {
  createProgressPersistence, exportProgress, freshProgress, MAX_SAVE_BYTES, parseProgress, savedProgressSchema,
  type SavedProgress,
} from './persistence'

export interface ModuleStatus {
  id: string
  title: string
  version: string
  regions: readonly string[]
  historicalPeriod: string
  description: string
  installed: boolean
  state: 'enabled' | 'disabled' | 'unavailable' | 'incompatible'
  reason?: string
  counts: { elements: number; recipes: number; histories: number; collections: number; challenges: number }
}

export interface SavePreview {
  kind: 'modules' | 'import'
  expectedRaw: string | null
  replacementRaw: string
  format: 'legacy' | 'archive'
  enabledModuleIds: readonly string[]
  totalDiscoveries: number
  activeDiscoveries: number
  dormantDiscoveries: number
  performedRecipes: number
  favorites: number
  readingMarks: number
  rewardReceipts: number
  experiments: number
  warnings: readonly string[]
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : String(cause)
}

export function prepareArchiveSelection(archive: ModuleSaveEnvelope, enabledIds: readonly string[]) {
  const resolved = resolveInstalledRegions(enabledIds)
  if (!resolved.ok) throw new Error(resolved.errors.join('; '))
  const ownership = installedModuleOwnership.filter((owner) => resolved.activeModuleIds.includes(owner.moduleId))
  const prepared = prepareModuleArchive(archive, ownership)
  const selected = createModuleSaveEnvelope(prepared.progress, prepared.ownership, resolved.activeModuleIds)
  validateActiveProgress(projectModuleProgress(selected, resolved.activeModuleIds).progress, resolved.catalog)
  return { archive: selected, catalog: resolved.catalog, activeModuleIds: resolved.activeModuleIds }
}

export function resolveSavedSelection(saved: ModuleSaveEnvelope) {
  const base = prepareArchiveSelection(saved, [])
  const warnings: string[] = []
  let enabledIds = saved.enabledModuleIds.filter((id) => {
    const owner = installedModuleOwnership.find((item) => item.moduleId === id)
    if (!owner) {
      warnings.push(`Module ${id} is unavailable; its progress remains dormant.`)
      return false
    }
    try {
      prepareModuleArchive(saved, [owner])
      return true
    } catch (cause) {
      warnings.push(`Module ${id} is incompatible: ${message(cause)} Its progress remains dormant.`)
      return false
    }
  })
  let changed = true
  while (changed) {
    const previous = enabledIds
    enabledIds = previous.filter((id) => {
      const pack = installedRegionalModules.find((item) => item.manifest.id === id)!
      if (pack.manifest.dependencies.every((dependency) => previous.includes(dependency))) return true
      warnings.push(`Module ${id} has an unavailable or disabled dependency; its progress remains dormant.`)
      return false
    })
    changed = previous.length !== enabledIds.length
  }
  try {
    return { ...prepareArchiveSelection(saved, enabledIds), warnings }
  } catch (cause) {
    warnings.push(`Saved regional content cannot be activated: ${message(cause)} Regional progress remains dormant.`)
    return { ...base, warnings }
  }
}

export function describeModules(archive: ModuleSaveEnvelope | null, activeIds: readonly string[]): ModuleStatus[] {
  const base = archive ?? createModuleSaveEnvelope(freshProgress(), [])
  const installed: ModuleStatus[] = installedRegionalModules.map((pack) => {
    let state: ModuleStatus['state'] = activeIds.includes(pack.manifest.id) ? 'enabled' : 'disabled'
    let reason: string | undefined
    if (state !== 'enabled') {
      try {
        prepareArchiveSelection(base, [...new Set([...activeIds, pack.manifest.id])])
      } catch (cause) {
        state = 'incompatible'
        reason = message(cause)
      }
    }
    return {
      id: pack.manifest.id, title: pack.manifest.title, version: pack.manifest.version,
      regions: pack.manifest.regions, historicalPeriod: pack.manifest.historicalPeriod,
      description: pack.manifest.description, installed: true, state, reason,
      counts: {
        elements: pack.elements.length, recipes: pack.recipes.length,
        histories: pack.research.records.length, collections: pack.collections.length,
        challenges: pack.challenges.length,
      },
    }
  })
  const unavailable: ModuleStatus[] = base.ownership
    .filter((owner) => !installed.some((item) => item.id === owner.moduleId))
    .map((owner) => ({
      id: owner.moduleId, title: owner.moduleId, version: owner.version, regions: [],
      historicalPeriod: 'Not available in this installation',
      description: 'Archived progress is preserved. Save claims do not install or enable content.',
      installed: false, state: 'unavailable',
      counts: {
        elements: owner.elementIds.length, recipes: owner.recipeIds.length,
        histories: owner.researchElementIds.length, collections: owner.collectionIds.length,
        challenges: owner.challengeIds.length,
      },
    }))
  return [...installed, ...unavailable]
}

function parseSave(raw: string) {
  if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) throw new Error('Save exceeds the 1 MiB size limit.')
  const archive = parseModuleSaveEnvelope(raw)
  if (archive) return { format: 'archive' as const, archive: compactModuleHistory(prepareModuleArchive(archive, [])) }
  const legacy = parseProgress(raw)
  if (legacy) return { format: 'legacy' as const, archive: createModuleSaveEnvelope(legacy, []) }
  throw new Error('Save is invalid or uses an unsupported future format. Nothing was replaced.')
}

function preview(
  kind: SavePreview['kind'], expectedRaw: string | null, archive: ModuleSaveEnvelope,
  format: SavePreview['format'], warnings: readonly string[], catalog: RuntimeCatalog,
): SavePreview {
  const active = projectModuleProgress(archive, archive.enabledModuleIds).progress
  validateActiveProgress(active, catalog)
  const replacementRaw = format === 'archive' ? JSON.stringify(archive) : exportProgress(archive.progress)
  if (new TextEncoder().encode(replacementRaw).byteLength > MAX_SAVE_BYTES) {
    throw new Error('Resulting save exceeds the 1 MiB size limit. Nothing was replaced.')
  }
  return {
    kind, expectedRaw, replacementRaw, format, enabledModuleIds: archive.enabledModuleIds,
    totalDiscoveries: archive.progress.discoveredIds.length,
    activeDiscoveries: active.discoveredIds.length,
    dormantDiscoveries: archive.progress.discoveredIds.length - active.discoveredIds.length,
    performedRecipes: archive.progress.discoveredRecipeIds.length,
    favorites: archive.progress.favoriteIds.length, readingMarks: archive.progress.readHistoricalElementIds.length,
    rewardReceipts: archive.progress.rewardedCollectionIds.length + archive.progress.rewardedChallengeEraIds.length +
      archive.progress.challengeRecords.filter((record) => record.completed).length,
    experiments: archive.progress.experimentHistory.length, warnings,
  }
}

export function previewModuleChange(
  expectedRaw: string | null, progress: SavedProgress, currentIds: readonly string[], enabledIds: readonly string[],
): SavePreview {
  const existing = expectedRaw === null ? createModuleSaveEnvelope(progress, []) : parseSave(expectedRaw).archive
  // The caller flushes campaign writes before requesting this preview.
  validateActiveProgress(progress, prepareArchiveSelection(existing, currentIds).catalog)
  if (JSON.stringify(savedProgressSchema.parse(progress)) !==
    JSON.stringify(savedProgressSchema.parse(projectModuleProgress(existing, currentIds).progress))) {
    throw new Error('The campaign has unsaved changes. Save successfully before changing modules.')
  }
  const selected = prepareArchiveSelection(existing, enabledIds)
  return preview('modules', expectedRaw, selected.archive, 'archive', expectedRaw !== null &&
    !parseModuleSaveEnvelope(expectedRaw)
    ? ['This replaces your legacy save with a module archive. Older releases cannot read it. Export a backup first.']
    : [], selected.catalog)
}

export function previewSaveImport(raw: string, expectedRaw: string | null): SavePreview {
  const current = expectedRaw === null ? null : parseSave(expectedRaw)
  const imported = parseSave(raw)
  const selected = resolveSavedSelection(imported.archive)
  const format = imported.format === 'archive' || current?.format === 'archive' ? 'archive' : 'legacy'
  return preview('import', expectedRaw, selected.archive, format, [
    'Import replaces ALL current progress, including regional discoveries and achievements not in this file. Export a backup first.',
    ...selected.warnings,
  ], selected.catalog)
}

export async function commitSavePreview(candidate: SavePreview): Promise<void> {
  // Revalidate the candidate, including installed ownership, rather than trust a UI object.
  const validated = previewSaveImport(candidate.replacementRaw, candidate.expectedRaw)
  if (validated.replacementRaw !== candidate.replacementRaw) {
    throw new Error('Save compatibility changed after preview. Review a new preview before replacing progress.')
  }
  if (validated.format === 'archive') {
    const archive = parseModuleSaveEnvelope(validated.replacementRaw)!
    const persistence = createDurableModulePersistence()
    if (persistence.raw !== candidate.expectedRaw) throw new Error(DURABLE_CONFLICT)
    if (!await persistence.replaceArchive(archive)) throw new Error(persistence.error ?? 'Save replacement failed.')
  } else {
    const persistence = createProgressPersistence()
    if (persistence.raw !== candidate.expectedRaw) throw new Error(DURABLE_CONFLICT)
    if (!await persistence.write(parseProgress(validated.replacementRaw)!)) {
      throw new Error(persistence.error ?? 'Save replacement failed.')
    }
  }
}
