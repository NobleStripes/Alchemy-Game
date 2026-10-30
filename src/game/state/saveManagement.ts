import { coreRuntimeCatalog } from '../content/runtimeCatalog'
import { createDurableModulePersistence, DURABLE_CONFLICT } from './durableModulePersistence'
import { validateActiveProgress } from './legacyArchivePersistence'
import { compactModuleHistory, prepareModuleArchive } from './moduleArchiveRules'
import {
  createModuleSaveEnvelope, parseModuleSaveEnvelope, projectModuleProgress,
  type ModuleSaveEnvelope,
} from './moduleProgress'
import {
  createProgressPersistence, exportProgress, MAX_SAVE_BYTES, parseProgress,
} from './persistence'

export interface SavePreview {
  expectedRaw: string | null
  replacementRaw: string
  format: 'legacy' | 'archive'
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

function parseSave(raw: string) {
  if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) throw new Error('Save exceeds the 1 MiB size limit.')
  const archive = parseModuleSaveEnvelope(raw)
  if (archive) return { format: 'archive' as const, archive: compactModuleHistory(prepareModuleArchive(archive)) }
  const legacy = parseProgress(raw)
  if (legacy) return { format: 'legacy' as const, archive: createModuleSaveEnvelope(legacy, []) }
  throw new Error('Save is invalid or uses an unsupported future format. Nothing was replaced.')
}

export function previewSaveImport(raw: string, expectedRaw: string | null): SavePreview {
  const current = expectedRaw === null ? null : parseSave(expectedRaw)
  const imported = parseSave(raw)
  const archive: ModuleSaveEnvelope = { ...imported.archive, enabledModuleIds: [] }
  const active = projectModuleProgress(archive).progress
  validateActiveProgress(active, coreRuntimeCatalog)
  const format = imported.format === 'archive' || current?.format === 'archive' ? 'archive' : 'legacy'
  const replacementRaw = format === 'archive' ? JSON.stringify(archive) : exportProgress(active)
  if (new TextEncoder().encode(replacementRaw).byteLength > MAX_SAVE_BYTES) {
    throw new Error('Resulting save exceeds the 1 MiB size limit. Nothing was replaced.')
  }
  return {
    expectedRaw, replacementRaw, format,
    totalDiscoveries: archive.progress.discoveredIds.length,
    activeDiscoveries: active.discoveredIds.length,
    dormantDiscoveries: archive.progress.discoveredIds.length - active.discoveredIds.length,
    performedRecipes: archive.progress.discoveredRecipeIds.length,
    favorites: archive.progress.favoriteIds.length,
    readingMarks: archive.progress.readHistoricalElementIds.length,
    rewardReceipts: archive.progress.rewardedCollectionIds.length + archive.progress.rewardedChallengeEraIds.length +
      archive.progress.challengeRecords.filter((record) => record.completed).length,
    experiments: archive.progress.experimentHistory.length,
    warnings: [
      'Import replaces ALL current progress, including inactive records not in this file. Export a backup first.',
      ...(archive.ownership.length > 0
        ? ['Legacy DLC records are preserved for backup but remain inactive. Only the base game is playable.']
        : []),
    ],
  }
}

export async function commitSavePreview(candidate: SavePreview): Promise<void> {
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
