import { describe, expect, it } from 'vitest'
import { installedModuleOwnership } from './ownership.ts'
import { installedRegionalModules } from './installed.ts'
import { parseProgress } from '../state/persistence.ts'
import { createModuleSaveEnvelope, projectModuleProgress } from '../state/moduleProgress.ts'
import { prepareModuleArchive, rebaseActiveModuleProgress } from '../state/moduleArchiveRules.ts'

const fresh = () => parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!

describe('Achaemenid module ownership and dormant progress', () => {
  it('derives exact content ownership from the bundled historical pack', () => {
    const pack = installedRegionalModules[0]
    const owned = installedModuleOwnership[0]
    expect(owned.moduleId).toBe(pack.manifest.id)
    expect(owned.elementIds).toEqual(pack.elements.map((entry) => entry.id))
    expect(owned.recipeIds).toEqual(pack.recipes.map((entry) => entry.id))
    expect(owned.researchElementIds).toEqual(pack.research.records.map((entry) => entry.elementId))
    expect(owned.challengeIds).toEqual(pack.challenges.map((entry) => entry.id))
  })

  it('retains discoveries, read histories and earned rewards while unavailable', () => {
    const ownership = installedModuleOwnership[0]
    const core = fresh()
    const full = {
      ...core,
      discoveredIds: [...core.discoveredIds, ownership.elementIds[0]],
      discoveredRecipeIds: [ownership.recipeIds[0]],
      favoriteIds: [ownership.elementIds[0]],
      readHistoricalElementIds: [ownership.elementIds[0]],
      rewardedCollectionIds: [ownership.collectionIds[0]],
      challengeRecords: [{
        challengeId: ownership.challengeIds[0], completed: true, bestAttemptCount: 1,
      }],
    }
    const archive = prepareModuleArchive(createModuleSaveEnvelope(full, [ownership]), [ownership])
    const hidden = projectModuleProgress(archive, [])
    expect(hidden.progress.discoveredIds).not.toContain(ownership.elementIds[0])
    expect(hidden.progress.challengeRecords).toEqual([])
    const rebased = rebaseActiveModuleProgress(archive, {
      ...hidden.progress, soundEnabled: false,
    }, [])
    expect(rebased.progress.soundEnabled).toBe(false)
    expect(rebased.progress.discoveredIds).toContain(ownership.elementIds[0])
    expect(rebased.progress.readHistoricalElementIds).toContain(ownership.elementIds[0])
    expect(rebased.progress.rewardedCollectionIds).toEqual([ownership.collectionIds[0]])
    expect(rebased.progress.challengeRecords).toEqual(full.challengeRecords)
    expect(projectModuleProgress(rebased, [ownership.moduleId]).progress.discoveredRecipeIds).toEqual(full.discoveredRecipeIds)
  })
})
