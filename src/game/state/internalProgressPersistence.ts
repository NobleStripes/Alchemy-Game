import type { RuntimeCatalog } from '../modules/runtimeCatalog.ts'
import { isCollectionComplete } from '../engine/collectionRules.ts'
import { pairKey } from '../engine/resolveCombination.ts'
import { createDurableModulePersistence } from './durableModulePersistence.ts'
import { prepareModuleArchive } from './moduleArchiveRules.ts'
import { projectModuleProgress, type ModuleOwnership } from './moduleProgress.ts'
import { freshProgress, savedProgressSchema, type SavedProgress } from './persistence.ts'

function validateActiveProgress(progress: SavedProgress, catalog: RuntimeCatalog) {
  savedProgressSchema.parse(progress)
  const discovered = new Set(progress.discoveredIds)
  const recipes = new Map(catalog.recipes.map((recipe) => [recipe.id, recipe]))
  const eras = new Set(catalog.eras.map((era) => era.id))
  const require = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  require(progress.discoveredIds.every((id) => catalog.elementsById.has(id)), 'Unknown active discovery.')
  require(catalog.starterElementIds.every((id) => discovered.has(id)), 'Missing starting discovery.')
  for (const id of [...progress.discoveredRecipeIds, ...progress.revealedHintRecipeIds]) {
    const recipe = recipes.get(id)
    require(!!recipe && recipe.inputs.every((input) => discovered.has(input)) &&
      (!progress.discoveredRecipeIds.includes(id) || discovered.has(recipe.result)), 'Invalid active formula record.')
  }
  require(progress.favoriteIds.every((id) => discovered.has(id)), 'Invalid active favorite.')
  require(progress.readHistoricalElementIds.every((id) =>
    discovered.has(id) && catalog.researchByElementId.has(id)), 'Invalid active reading mark.')
  require([...progress.unlockedEraIds, ...progress.rewardedChallengeEraIds, ...progress.collapsedShelves, progress.activeEraId]
    .every((id) => eras.has(id)), 'Unknown active age.')
  require(progress.unlockedEraIds.includes(progress.activeEraId), 'Active age is locked.')
  for (const id of progress.rewardedCollectionIds) {
    const collection = catalog.collections.find((item) => item.id === id)
    require(!!collection && isCollectionComplete(collection, progress.discoveredIds), 'Invalid active collection receipt.')
  }
  for (const record of progress.challengeRecords) {
    const challenge = catalog.challengesById.get(record.challengeId)
    require(!!challenge && record.bestAttemptCount >= challenge.minimumAttempts, 'Invalid active challenge score.')
  }
  for (const key of progress.failedPairKeys) {
    const inputs = key.split('::')
    require(inputs.length === 2 && inputs.every((id) => discovered.has(id)) &&
      pairKey(inputs[0], inputs[1]) === key, 'Invalid active failed pair.')
  }
  for (const entry of progress.experimentHistory) {
    require(entry.inputs.every((id) => discovered.has(id)), 'Invalid active experiment inputs.')
    const recipe = entry.recipeId ? recipes.get(entry.recipeId) : undefined
    const pairRecipe = catalog.recipeIndex.get(pairKey(...entry.inputs))
    require(entry.outcome === 'no-reaction'
      ? !entry.recipeId && !entry.resultId && !entry.lockedEraId
      : entry.outcome === 'locked'
        ? !entry.recipeId && !entry.resultId && !!pairRecipe &&
          catalog.elementsById.get(pairRecipe.result)?.era === entry.lockedEraId
        : !!recipe && recipe.result === entry.resultId && discovered.has(recipe.result) &&
          pairKey(...recipe.inputs) === pairKey(...entry.inputs) && !entry.lockedEraId,
    'Invalid active experiment record.')
  }
}

/** Internal sessions must use isolated storage; this can migrate that save. */
export function createInternalProgressPersistence(
  catalog: RuntimeCatalog,
  ownership: readonly ModuleOwnership[],
  enabledIds: readonly string[],
) {
  const durable = createDurableModulePersistence(ownership)
  let error = durable.error
  let initial = freshProgress()
  let invalid = false
  let notify = (_error: string | null) => { void _error }
  try {
    if (durable.initial) {
      const archive = prepareModuleArchive(durable.initial, ownership)
      const candidate = projectModuleProgress(archive, enabledIds).progress
      validateActiveProgress(candidate, catalog)
      initial = candidate
    }
  } catch (cause) {
    invalid = true
    error = `Module progress cannot be activated: ${cause instanceof Error ? cause.message : String(cause)}`
  }
  durable.onError((next) => { error = next; notify(error) })

  function write(progress: Omit<SavedProgress, 'version'>, commit?: () => void, reset = false): Promise<boolean> {
    if (invalid) return Promise.resolve(false)
    const saved = { ...progress, version: 7 as const }
    try {
      validateActiveProgress(saved, catalog)
    } catch (cause) {
      error = `Module progress cannot be saved: ${cause instanceof Error ? cause.message : String(cause)}`
      notify(error)
      return Promise.resolve(false)
    }
    return reset ? durable.resetAll(saved, commit) : durable.writeActive(saved, enabledIds, commit)
  }

  return {
    initial,
    get historyIdFloor() {
      return Math.max(0, ...durable.initial?.progress.experimentHistory.map((entry) => entry.id) ?? [])
    },
    get error() { return error },
    write,
    reset(progress: Omit<SavedProgress, 'version'>) { return write(progress, undefined, true) },
    synchronize(): SavedProgress | null {
      if (!invalid) durable.synchronize()
      return null
    },
    flush: durable.flush,
    onError(listener: (next: string | null) => void) { notify = listener },
  }
}
