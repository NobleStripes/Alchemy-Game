import { coreRuntimeCatalog as core } from '../content/runtimeCatalog'
import { pairKey } from '../engine/resolveCombination'
import { createModuleSaveEnvelope, type ModuleOwnership } from './moduleProgress'
import { freshProgress } from './persistence'

// Save metadata only: no playable DLC definitions or sources are needed.
export const legacyOwnership: ModuleOwnership = {
  moduleId: 'achaemenid', version: '0.1.0',
  elementIds: ['achaemenid-satrapy', 'achaemenid-royal-road', 'achaemenid-fortification-tablets'],
  recipeIds: ['achaemenid-satrapy-combination', 'achaemenid-royal-road-combination', 'achaemenid-fortification-tablets-combination'],
  collectionIds: ['achaemenid-connections'],
  challengeIds: ['achaemenid-courier-lab'],
  researchElementIds: ['achaemenid-satrapy', 'achaemenid-royal-road', 'achaemenid-fortification-tablets'],
}

export function legacyArchive(enabledModuleIds = ['achaemenid'], owner = legacyOwnership) {
  owner = structuredClone(owner)
  return createModuleSaveEnvelope({
    ...freshProgress(),
    discoveredIds: [...core.starterElementIds, 'steam', ...owner.elementIds],
    discoveredRecipeIds: [core.recipeIndex.get('ember::tide')!.id, ...owner.recipeIds],
    unlockedEraIds: core.eras.map((era) => era.id),
    activeEraId: 'classical-antiquity',
    favoriteIds: ['ember', ...owner.elementIds],
    readHistoricalElementIds: ['ember', ...owner.researchElementIds],
    rewardedCollectionIds: owner.collectionIds,
    challengeRecords: [
      { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
      ...owner.challengeIds.map((challengeId) => ({ challengeId, completed: true, bestAttemptCount: 1 })),
    ],
    revealedHintRecipeIds: owner.recipeIds,
    failedPairKeys: [pairKey('ember', owner.elementIds[0])],
    experimentHistory: [
      { id: 1, inputs: ['ember', 'tide'], outcome: 'discovery', resultId: 'steam', recipeId: core.recipeIndex.get('ember::tide')!.id },
      { id: 2, inputs: ['ember', owner.elementIds[0]], outcome: 'no-reaction' },
    ],
    insightCredits: 1, insightFailureProgress: 2,
    hideFinalElements: true, collapsedShelves: ['stone-age'],
  }, [owner], enabledModuleIds)
}
