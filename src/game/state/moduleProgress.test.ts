import { describe, expect, it } from 'vitest'
import { parseProgress, exportProgress } from './persistence.ts'
import {
  createModuleSaveEnvelope, parseModuleSaveEnvelope, projectModuleProgress,
  type ModuleOwnership,
} from './moduleProgress.ts'

const ownership: ModuleOwnership = {
  moduleId: 'achaemenid',
  version: '1.0.0',
  elementIds: ['achaemenid-royal-road'],
  recipeIds: ['achaemenid-route'],
  collectionIds: ['achaemenid-connections'],
  challengeIds: ['achaemenid-lab'],
  researchElementIds: ['achaemenid-royal-road'],
}

function fixture() {
  const core = parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!
  return createModuleSaveEnvelope({
    ...core,
    discoveredIds: [...core.discoveredIds, 'achaemenid-royal-road'],
    discoveredRecipeIds: ['achaemenid-route'],
    revealedHintRecipeIds: ['achaemenid-route'],
    favoriteIds: ['achaemenid-royal-road'],
    readHistoricalElementIds: ['achaemenid-royal-road'],
    rewardedCollectionIds: ['achaemenid-connections'],
    challengeRecords: [{ challengeId: 'achaemenid-lab', completed: true, bestAttemptCount: 3 }],
    experimentHistory: [{
      id: 1, inputs: ['ember', 'achaemenid-royal-road'],
      recipeId: 'achaemenid-route', resultId: 'achaemenid-royal-road', outcome: 'discovery',
    }],
    failedPairKeys: ['achaemenid-royal-road::ember'],
  }, [ownership])
}

describe('Phase 10B module progress archive', () => {
  it('keeps legacy version 7 serialization independent of module records', () => {
    const core = parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!
    const envelope = createModuleSaveEnvelope(core, [])
    expect(JSON.parse(exportProgress(core)).version).toBe(7)
    expect(envelope.progress).toEqual(core)
    expect(envelope.ownership).toEqual([])
  })

  it('hides inactive module progress without modifying durable records', () => {
    const archive = fixture()
    const before = JSON.stringify(archive)
    const projected = projectModuleProgress(archive, [])
    expect(projected.inactiveModuleIds).toEqual(['achaemenid'])
    expect(projected.progress.discoveredIds).not.toContain('achaemenid-royal-road')
    expect(projected.progress.discoveredRecipeIds).toEqual([])
    expect(projected.progress.revealedHintRecipeIds).toEqual([])
    expect(projected.progress.favoriteIds).toEqual([])
    expect(projected.progress.readHistoricalElementIds).toEqual([])
    expect(projected.progress.rewardedCollectionIds).toEqual([])
    expect(projected.progress.challengeRecords).toEqual([])
    expect(projected.progress.experimentHistory).toEqual([])
    expect(projected.progress.failedPairKeys).toEqual([])
    expect(JSON.stringify(archive)).toEqual(before)
  })

  it('restores achievements and discovered records when compatible module returns', () => {
    const archive = fixture()
    const initial = projectModuleProgress(archive, [])
    const restored = projectModuleProgress(archive, ['achaemenid'])
    expect(initial.inactiveModuleIds).toEqual(['achaemenid'])
    expect(restored.inactiveModuleIds).toEqual([])
    expect(restored.progress).toEqual(archive.progress)
    expect(restored.progress.challengeRecords[0].completed).toBe(true)
    expect(restored.progress.rewardedCollectionIds).toContain('achaemenid-connections')
  })

  it('parses a module archive without passing it to the legacy v7 loader', () => {
    const archive = fixture()
    const serialized = JSON.stringify(archive)
    expect(parseModuleSaveEnvelope(serialized)).toEqual(archive)
    expect(parseProgress(serialized)).toBeNull()
  })

  it('rejects duplicate or conflicting ownership, unsupported versions and malformed archives', () => {
    const archive = fixture()
    expect(() => createModuleSaveEnvelope(archive.progress, [ownership, ownership])).toThrow()
    expect(parseModuleSaveEnvelope(JSON.stringify({
      ...archive, envelopeVersion: 20,
    }))).toBeNull()
    expect(parseModuleSaveEnvelope('{')).toBeNull()
    expect(parseModuleSaveEnvelope(JSON.stringify({
      ...archive, ownership: [ownership, { ...ownership, moduleId: 'another' }],
    }))).toBeNull()
  })
})
