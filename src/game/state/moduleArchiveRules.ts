import { collections, elements, eras, recipes } from '../content/index.ts'
import { challengesById } from '../content/challenges.ts'
import { researchByElementId } from '../content/research.ts'
import { pairKey } from '../engine/resolveCombination.ts'
import {
  createModuleSaveEnvelope,
  projectModuleProgress,
  type ModuleOwnership,
  type ModuleSaveEnvelope,
} from './moduleProgress.ts'
import { savedProgressSchema, MAX_EXPERIMENT_HISTORY, type SavedProgress } from './persistence.ts'

const kinds = [
  'elementIds', 'recipeIds', 'collectionIds', 'challengeIds', 'researchElementIds',
] as const
type OwnedKind = typeof kinds[number]

const core = {
  elementIds: new Set(elements.map((item) => item.id)),
  recipeIds: new Set(recipes.map((item) => item.id)),
  collectionIds: new Set(collections.map((item) => item.id)),
  challengeIds: new Set(challengesById.keys()),
  researchElementIds: new Set(researchByElementId.keys()),
}
const eraIds = new Set(eras.map((era) => era.id))

export class ArchiveIntegrityError extends Error {}

function reject(message: string): never {
  throw new ArchiveIntegrityError(message)
}

function sameIDs(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id))
}

function identicalOwnership(previous: ModuleOwnership, next: ModuleOwnership): boolean {
  return previous.version === next.version &&
    kinds.every((kind) => sameIDs(previous[kind], next[kind]))
}

/** A missing pack may stay archived, but may not claim a core ID. */
function assertOwnershipSafety(owners: readonly ModuleOwnership[]) {
  const seenModules = new Set<string>()
  const seen = Object.fromEntries(kinds.map((kind) => [kind, new Set<string>()])) as Record<OwnedKind, Set<string>>
  for (const owner of owners) {
    if (seenModules.has(owner.moduleId)) reject('Duplicate module ownership.')
    seenModules.add(owner.moduleId)
    for (const kind of kinds) {
      for (const id of owner[kind]) {
        if (!id.startsWith(owner.moduleId + '-')) {
          reject('Module ' + owner.moduleId + ' claims an ID outside its namespace: ' + id + '.')
        }
        if (core[kind].has(id)) reject('Module ' + owner.moduleId + ' claims core content ' + id + '.')
        if (seen[kind].has(id)) reject('Two modules claim ' + kind + ' ' + id + '.')
        seen[kind].add(id)
      }
    }
    for (const id of owner.researchElementIds) {
      if (!owner.elementIds.includes(id)) reject('Research claim ' + id + ' has no owned element.')
    }
  }
}

function allowedIDs(owners: readonly ModuleOwnership[]) {
  return Object.fromEntries(kinds.map((kind) => [
    kind, new Set([...core[kind], ...owners.flatMap((owner) => owner[kind])]),
  ])) as Record<OwnedKind, Set<string>>
}

function assertReferences(progress: SavedProgress, owners: readonly ModuleOwnership[]) {
  const allowed = allowedIDs(owners)
  const ensure = (kind: OwnedKind, ids: readonly string[]) => {
    for (const id of ids) {
      if (!allowed[kind].has(id)) reject('Unrecognized ' + kind + ' reference: ' + id + '.')
    }
  }
  ensure('elementIds', progress.discoveredIds)
  ensure('recipeIds', progress.discoveredRecipeIds)
  ensure('recipeIds', progress.revealedHintRecipeIds)
  ensure('elementIds', progress.favoriteIds)
  ensure('researchElementIds', progress.readHistoricalElementIds)
  ensure('collectionIds', progress.rewardedCollectionIds)
  ensure('challengeIds', progress.challengeRecords.map((record) => record.challengeId))
  for (const id of [...progress.unlockedEraIds, ...progress.rewardedChallengeEraIds, progress.activeEraId]) {
    if (!eraIds.has(id)) reject('Unknown core age ' + id + '.')
  }
  for (const id of progress.collapsedShelves) {
    if (!eraIds.has(id)) reject('Unknown core shelf ' + id + '.')
  }
  for (const pair of progress.failedPairKeys) {
    const inputs = pair.split('::')
    if (inputs.length !== 2 || pairKey(inputs[0], inputs[1]) !== pair) {
      reject('Invalid failed-pair key ' + pair + '.')
    }
    ensure('elementIds', inputs)
  }
  for (const entry of progress.experimentHistory) {
    ensure('elementIds', entry.inputs)
    if (entry.resultId) ensure('elementIds', [entry.resultId])
    if (entry.recipeId) ensure('recipeIds', [entry.recipeId])
    if (entry.lockedEraId && !eraIds.has(entry.lockedEraId)) {
      reject('Unknown experiment age ' + entry.lockedEraId + '.')
    }
  }
}

/** Exact installed ownership is required before a pack can become active. */
export function prepareModuleArchive(
  saved: ModuleSaveEnvelope,
  enabled: readonly ModuleOwnership[],
): ModuleSaveEnvelope {
  assertOwnershipSafety(saved.ownership)
  assertOwnershipSafety(enabled)
  const byId = new Map(saved.ownership.map((owner) => [owner.moduleId, owner]))
  for (const owner of enabled) {
    const earlier = byId.get(owner.moduleId)
    if (earlier && !identicalOwnership(earlier, owner)) {
      reject('Module ' + owner.moduleId + ' has changed version or content ownership; migration required.')
    }
    byId.set(owner.moduleId, owner)
  }
  const owners = [...byId.values()].sort((a, b) => a.moduleId.localeCompare(b.moduleId))
  assertOwnershipSafety(owners)
  assertReferences(saved.progress, owners)
  return createModuleSaveEnvelope(saved.progress, owners)
}

function intersectsInactive(
  entry: SavedProgress['experimentHistory'][number],
  inactiveElements: ReadonlySet<string>,
  inactiveRecipes: ReadonlySet<string>,
): boolean {
  return entry.inputs.some((id) => inactiveElements.has(id)) ||
    Boolean(entry.resultId && inactiveElements.has(entry.resultId)) ||
    Boolean(entry.recipeId && inactiveRecipes.has(entry.recipeId))
}

/** Active changes are rebased onto the full archive; unavailable records survive. */
export function rebaseActiveModuleProgress(
  archive: ModuleSaveEnvelope,
  activeProgress: SavedProgress,
  enabledIds: readonly string[],
): ModuleSaveEnvelope {
  const parsed = savedProgressSchema.safeParse(activeProgress)
  if (!parsed.success) reject('Active progress does not match the save schema.')
  const enabled = new Set(enabledIds)
  if (enabled.size !== enabledIds.length) reject('Repeated enabled module ID.')
  if (enabledIds.some((id) => !archive.ownership.some((owner) => owner.moduleId === id))) {
    reject('Active module is not recorded in archive ownership.')
  }

  const activeOwners = archive.ownership.filter((owner) => enabled.has(owner.moduleId))
  const inactiveOwners = archive.ownership.filter((owner) => !enabled.has(owner.moduleId))
  assertReferences(activeProgress, activeOwners)
  assertReferences(archive.progress, archive.ownership)

  const inactive = (kind: OwnedKind) => new Set(inactiveOwners.flatMap((owner) => owner[kind]))
  const mergeIDs = (key: 'discoveredIds' | 'favoriteIds' | 'readHistoricalElementIds' |
    'discoveredRecipeIds' | 'revealedHintRecipeIds' | 'rewardedCollectionIds',
  kind: OwnedKind) => {
    const retained = archive.progress[key].filter((id) => inactive(kind).has(id))
    return [...new Set([...activeProgress[key], ...retained])]
  }

  const inactiveElements = inactive('elementIds')
  const inactiveRecipes = inactive('recipeIds')
  const inactiveChallenges = inactive('challengeIds')

  const retiredPair = (key: string) => key.split('::').some((id) => inactiveElements.has(id))
  const failedPairKeys = [...new Set([
    ...activeProgress.failedPairKeys,
    ...archive.progress.failedPairKeys.filter(retiredPair),
  ])]

  const priorActive = projectModuleProgress(archive, enabledIds).progress.experimentHistory
  const activeById = new Map(priorActive.map((entry) => [entry.id, entry]))
  const inactiveHistory = archive.progress.experimentHistory.filter(
    (entry) => intersectsInactive(entry, inactiveElements, inactiveRecipes),
  )
  let nextHistoryId = Math.max(0, ...archive.progress.experimentHistory.map((entry) => entry.id))
  const activeHistory = activeProgress.experimentHistory.map((entry) => {
    const existing = activeById.get(entry.id)
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(entry)) {
        reject('Historical experiment ' + entry.id + ' was changed rather than appended.')
      }
      return entry
    }
    nextHistoryId += 1
    if (!Number.isSafeInteger(nextHistoryId)) reject('Experiment history ID exhausted.')
    return { ...entry, id: nextHistoryId }
  })

  const mergedHistory = [...inactiveHistory, ...activeHistory]
    .sort((a, b) => a.id - b.id)
    .slice(-MAX_EXPERIMENT_HISTORY)

  const challengeRecords = [
    ...activeProgress.challengeRecords,
    ...archive.progress.challengeRecords.filter(
      (record) => inactiveChallenges.has(record.challengeId),
    ),
  ]
  const merged: SavedProgress = {
    ...activeProgress,
    discoveredIds: mergeIDs('discoveredIds', 'elementIds'),
    discoveredRecipeIds: mergeIDs('discoveredRecipeIds', 'recipeIds'),
    revealedHintRecipeIds: mergeIDs('revealedHintRecipeIds', 'recipeIds'),
    favoriteIds: mergeIDs('favoriteIds', 'elementIds'),
    readHistoricalElementIds: mergeIDs('readHistoricalElementIds', 'researchElementIds'),
    rewardedCollectionIds: mergeIDs('rewardedCollectionIds', 'collectionIds'),
    challengeRecords,
    failedPairKeys,
    experimentHistory: mergedHistory,
  }
  assertReferences(merged, archive.ownership)
  return createModuleSaveEnvelope(merged, archive.ownership)
}

/** Explicit full reset clears dormant progress too, unlike merely disabling a pack. */
export function clearModuleArchiveProgress(
  archive: ModuleSaveEnvelope,
  fresh: SavedProgress,
): ModuleSaveEnvelope {
  assertOwnershipSafety(archive.ownership)
  assertReferences(fresh, [])
  return createModuleSaveEnvelope(fresh, archive.ownership)
}
