// @vitest-environment jsdom
import './testSupport'
import { describe, expect, it, vi } from 'vitest'
import { installedRegionalModules } from '../modules/installed'
import { installedModuleOwnership } from '../modules/ownership'
import { coreRuntimeCatalog as core } from '../modules/runtimeCatalog'
import { createModuleSaveEnvelope, parseModuleSaveEnvelope, type ModuleOwnership } from './moduleProgress'
import { exportProgress, freshProgress, MAX_SAVE_BYTES, SAVE_KEY, type SavedProgress } from './persistence'
import { previewSaveImport } from './saveManagement'
import { createGameStore, snapshotProgress } from './useGameStore'

const pack = installedRegionalModules[0]
const raw = () => localStorage.getItem(SAVE_KEY)!
const archive = () => parseModuleSaveEnvelope(raw())!

function seedCore() {
  const progress: SavedProgress = {
    ...freshProgress(),
    discoveredIds: core.elements.map((element) => element.id),
    discoveredRecipeIds: core.recipes.map((recipe) => recipe.id),
    unlockedEraIds: core.eras.map((era) => era.id), activeEraId: 'classical-antiquity',
    rewardedChallengeEraIds: core.eras.map((era) => era.id),
    rewardedCollectionIds: core.collections.map((collection) => collection.id),
    insightCredits: 1,
  }
  localStorage.setItem(SAVE_KEY, exportProgress(progress))
  return progress
}

describe('production save management', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('keeps legacy v%i until a confirmed, validated module migration', async (version) => {
    const original = JSON.stringify({ ...freshProgress(), version, hintCredits: 2 })
    localStorage.setItem(SAVE_KEY, original)
    const store = createGameStore()
    const before = snapshotProgress(store.getState())
    expect(store.getState().saveFormat).toBe('legacy')
    expect(store.getState().activeModuleIds).toEqual([])
    const preview = await store.previewModules(['achaemenid'])
    expect(raw()).toBe(original)
    expect(await store.exportSave()).toBe(original)
    expect(preview.warnings.join(' ')).toMatch(/Older releases cannot read/)
    await store.confirmSaveReplacement(preview)
    expect(archive().enabledModuleIds).toEqual(['achaemenid'])
    expect(store.getState().reloadRequired).toBe(true)
    store.getState().toggleSound()
    const reloaded = createGameStore()
    expect(reloaded.getState().saveFormat).toBe('archive')
    expect(reloaded.getState().activeModuleIds).toEqual(['achaemenid'])
    expect(reloaded.getState().catalog.elements).toHaveLength(228)
    expect(snapshotProgress(reloaded.getState())).toEqual(before)
    expect(reloaded.getState().persistenceError).toBeNull()
  })

  it('exports complete stored archives and preserves dormant progress across production disable/reload/enable', async () => {
    seedCore()
    let store = createGameStore()
    await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
    store = createGameStore()
    store.getState().requestHint()
    const recipe = pack.recipes[1]
    store.getState().transmuteWith(...recipe.inputs)
    store.getState().toggleFavorite(recipe.result)
    store.getState().toggleHistoricalRead(recipe.result)
    store.getState().transmuteWith(recipe.result, 'ember')
    await store.flushProgress()
    await store.getState().recordChallengeCompletion(pack.challenges[0].id, 1)
    const regionalProgress = snapshotProgress(store.getState())
    const stored = raw()
    expect(await store.exportSave()).toBe(stored)
    expect(archive().progress).toEqual({ ...regionalProgress, version: 7 })
    const preview = await store.previewModules([])
    expect(preview.dormantDiscoveries).toBe(1)
    expect(preview.activeDiscoveries).toBe(225)
    expect(raw()).toBe(stored)
    await store.confirmSaveReplacement(preview)
    store = createGameStore()
    expect(store.getState().activeModuleIds).toEqual([])
    expect(store.getState().favoriteIds).toEqual([])
    expect(store.getState().readHistoricalElementIds).toEqual([])
    expect(store.getState().failedPairKeys).toEqual([])
    expect(store.getState().revealedHintRecipeIds).toEqual([])
    expect(store.getState().challengeRecords).toEqual([])
    expect(store.getState().experimentHistory).toEqual([])
    for (let attempt = 0; attempt < 55; attempt++) store.getState().transmuteWith(...core.recipes[0].inputs)
    await store.flushProgress()
    expect(store.getState().persistenceError).toBeNull()
    expect(store.getState().experimentHistory).toHaveLength(50)
    expect(archive().progress.experimentHistory).toHaveLength(52)
    expect(archive().progress.failedPairKeys).toEqual(regionalProgress.failedPairKeys)
    expect(archive().progress.revealedHintRecipeIds).toEqual(regionalProgress.revealedHintRecipeIds)
    expect(archive().progress.favoriteIds).toEqual([recipe.result])
    expect(archive().progress.readHistoricalElementIds).toEqual([recipe.result])
    await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
    store = createGameStore()
    expect(store.getState().discoveredIds).toContain(recipe.result)
    expect(store.getState().favoriteIds).toEqual([recipe.result])
    expect(store.getState().readHistoricalElementIds).toEqual([recipe.result])
    expect(store.getState().revealedHintRecipeIds).toEqual(regionalProgress.revealedHintRecipeIds)
    expect(await store.getState().recordChallengeCompletion(pack.challenges[0].id, 1))
      .toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
    expect(archive().progress.challengeRecords).toHaveLength(1)
  })

  it('distinguishes disabling from total reset while retaining the selected installed module', async () => {
    seedCore()
    let store = createGameStore()
    await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
    store = createGameStore()
    store.getState().transmuteWith(...pack.recipes[0].inputs)
    await store.flushProgress()
    await store.confirmSaveReplacement(await store.previewModules([]))
    store = createGameStore()
    store.getState().resetProgress()
    await store.flushProgress()
    expect(archive().progress.discoveredIds).toEqual(core.starterElementIds)
    expect(archive().progress.experimentHistory).toEqual([])
    await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
    store = createGameStore()
    store.getState().resetProgress()
    await store.flushProgress()
    expect(createGameStore().getState().activeModuleIds).toEqual(['achaemenid'])
    expect(createGameStore().getState().discoveredIds).toEqual(core.starterElementIds)
  })

  it('leaves original v7 bytes recoverable after failed migration and permits a retry', async () => {
    seedCore()
    const original = raw()
    const store = createGameStore()
    const preview = await store.previewModules(['achaemenid'])
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/could not be validated or saved/)
    expect(raw()).toBe(original)
    expect(await store.exportSave()).toBe(original)
    expect(store.getState().reloadRequired).toBe(false)
    writes.mockRestore()
    await store.confirmSaveReplacement(preview)
    expect(archive().enabledModuleIds).toEqual(['achaemenid'])
  })

  it('requires Web Locks for confirmed migration and preserves a competing tab winner', async () => {
    seedCore()
    const original = raw()
    const store = createGameStore()
    const preview = await store.previewModules(['achaemenid'])
    const locks = navigator.locks
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/Web Locks/)
    expect(raw()).toBe(original)
    Object.defineProperty(navigator, 'locks', { configurable: true, value: locks })
    localStorage.setItem(SAVE_KEY, exportProgress({ ...freshProgress(), soundEnabled: false }))
    const winner = raw()
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/changed externally/)
    expect(raw()).toBe(winner)
    expect(store.getState().reloadRequired).toBe(false)
  })

  it('rejects a stale preview after a newer campaign write', async () => {
    const store = createGameStore()
    const preview = await store.previewModules(['achaemenid'])
    store.getState().toggleFavorite('ember')
    await store.flushProgress()
    const newer = raw()
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/changed after preview/)
    expect(raw()).toBe(newer)
  })

  it.each([
    '{"version":99,"discoveredIds":[]}',
    '{"format":"unwritten-atlas-module-save","envelopeVersion":2}',
    '{"version":7',
  ])('rejects invalid/future import without replacing bytes: %s', async (input) => {
    seedCore()
    const original = raw()
    await expect(createGameStore().previewImport(input)).rejects.toThrow(/invalid|unsupported/)
    expect(raw()).toBe(original)
  })

  it('protects an existing unsupported future save and still permits an exact backup export', async () => {
    const original = '{"version":99,"doNotLose":"future progress"}'
    localStorage.setItem(SAVE_KEY, original)
    const store = createGameStore()
    expect(store.getState().persistenceError).toBeTruthy()
    expect(await store.exportSave()).toBe(original)
    await expect(store.previewImport(exportProgress(freshProgress()))).rejects.toThrow(/could not be read/)
    store.getState().resetProgress()
    await store.flushProgress()
    expect(raw()).toBe(original)
  })

  it('imports legacy saves only after preview and keeps existing archive sessions in archive format', async () => {
    seedCore()
    let store = createGameStore()
    const imported = { ...freshProgress(), favoriteIds: ['ember'], soundEnabled: false }
    const original = raw()
    const preview = await store.previewImport(exportProgress(imported))
    expect(preview.format).toBe('legacy')
    expect(preview.totalDiscoveries).toBe(4)
    expect(preview.warnings.join(' ')).toMatch(/replaces ALL/)
    expect(raw()).toBe(original)
    await store.confirmSaveReplacement(preview)
    expect(JSON.parse(raw())).toEqual(imported)
    store = createGameStore()
    await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
    store = createGameStore()
    const resetPreview = await store.previewImport(exportProgress(imported))
    expect(resetPreview.format).toBe('archive')
    expect(resetPreview.enabledModuleIds).toEqual([])
    await store.confirmSaveReplacement(resetPreview)
    expect(archive().progress).toEqual(imported)
    expect(archive().ownership).toEqual([])
  })

  it('keeps missing module records dormant on import, with an unavailable management state', async () => {
    const owner: ModuleOwnership = {
      moduleId: 'lost-region', version: '1.0.0', elementIds: ['lost-region-discovery'],
      recipeIds: ['lost-region-formula'], collectionIds: ['lost-region-reward'],
      researchElementIds: ['lost-region-discovery'], challengeIds: ['lost-region-lab'],
    }
    const imported = createModuleSaveEnvelope({
      ...freshProgress(), discoveredIds: [...core.starterElementIds, owner.elementIds[0]],
      discoveredRecipeIds: owner.recipeIds, favoriteIds: owner.elementIds, readHistoricalElementIds: owner.elementIds,
      rewardedCollectionIds: owner.collectionIds,
      challengeRecords: [{ challengeId: owner.challengeIds[0], completed: true, bestAttemptCount: 3 }],
      revealedHintRecipeIds: owner.recipeIds,
      failedPairKeys: ['ember::lost-region-discovery'],
      experimentHistory: [{ id: 1, inputs: ['ember', owner.elementIds[0]], outcome: 'no-reaction' }],
    }, [owner], [owner.moduleId])
    let store = createGameStore()
    const preview = await store.previewImport(JSON.stringify(imported))
    expect(preview.dormantDiscoveries).toBe(1)
    expect(preview.enabledModuleIds).toEqual([])
    expect(preview.warnings.join(' ')).toMatch(/unavailable/)
    await store.confirmSaveReplacement(preview)
    store = createGameStore()
    expect(store.getModuleStatuses().find((item) => item.id === owner.moduleId)?.state).toBe('unavailable')
    store.getState().toggleSound()
    await store.flushProgress()
    expect(archive().progress).toEqual({ ...imported.progress, soundEnabled: false })
  })

  it.each(['version', 'ownership'])('requires an explicit migration for incompatible module %s', async (kind) => {
    const progress = seedCore()
    const owners = installedModuleOwnership.map((owner) => kind === 'version'
      ? { ...owner, version: '9.0.0' }
      : { ...owner, elementIds: [...owner.elementIds, 'achaemenid-old-discovery'] })
    localStorage.setItem(SAVE_KEY, JSON.stringify(createModuleSaveEnvelope(progress, owners, ['achaemenid'])))
    const store = createGameStore()
    expect(store.getState().activeModuleIds).toEqual([])
    expect(store.getState().moduleWarnings.join(' ')).toMatch(/migration required/)
    expect(store.getModuleStatuses()[0].state).toBe('incompatible')
    const before = raw()
    await expect(store.previewModules(['achaemenid'])).rejects.toThrow(/migration required/)
    expect(raw()).toBe(before)
    store.getState().toggleSound()
    await store.flushProgress()
    expect(archive().ownership).toEqual(owners)
  })

  it('rejects forged core ownership and duplicate challenge receipts before import', () => {
    const forged = createModuleSaveEnvelope(freshProgress(), [{
      ...installedModuleOwnership[0], elementIds: ['ember'], researchElementIds: [],
    }])
    expect(() => previewSaveImport(JSON.stringify(forged), null)).toThrow(/namespace|core/)
    const duplicates = createModuleSaveEnvelope({
      ...freshProgress(), challengeRecords: [
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
      ],
    }, [])
    expect(() => previewSaveImport(JSON.stringify(duplicates), null)).toThrow(/Duplicate/)
    expect(() => previewSaveImport('x'.repeat(MAX_SAVE_BYTES + 1), null)).toThrow(/1 MiB/)
  })

  it('compacts exhausted IDs across dormant and active histories before appending safely', async () => {
    const progress = seedCore()
    const recipe = core.recipes[0]
    const saved = createModuleSaveEnvelope({
      ...progress, discoveredIds: [...progress.discoveredIds, pack.elements[0].id],
      experimentHistory: [
        { id: Number.MAX_SAFE_INTEGER - 1, inputs: recipe.inputs, outcome: 'known', recipeId: recipe.id, resultId: recipe.result },
        { id: Number.MAX_SAFE_INTEGER, inputs: ['ember', pack.elements[0].id], outcome: 'no-reaction' },
      ],
    }, installedModuleOwnership)
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved))
    const store = createGameStore()
    expect(store.getState().experimentHistory.map((entry) => entry.id)).toEqual([1])
    store.getState().transmuteWith(...recipe.inputs)
    store.getState().transmuteWith(...core.recipes[1].inputs)
    await store.flushProgress()
    expect(store.getState().persistenceError).toBeNull()
    expect(archive().progress.experimentHistory.map((entry) => entry.id)).toEqual([1, 2, 3, 4])
    expect(createGameStore().getState().experimentHistory.map((entry) => entry.id)).toEqual([1, 3, 4])
  })
})
