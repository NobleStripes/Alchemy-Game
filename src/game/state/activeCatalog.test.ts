// @vitest-environment jsdom
import './testSupport'
import { describe, expect, it, vi } from 'vitest'
import { coreRuntimeCatalog as core } from '../content/runtimeCatalog'
import { isEraChallengeComplete } from '../engine/insightRules'
import { freshProgress, parseProgress, SAVE_KEY } from './persistence'
import { createModuleSaveEnvelope, parseModuleSaveEnvelope, projectModuleProgress } from './moduleProgress'
import { DURABLE_CONFLICT, DURABLE_LOCK } from './durableModulePersistence'
import { legacyArchive, legacyOwnership } from './legacyArchiveFixture'
import { createGameStore, snapshotProgress } from './useGameStore'

const disk = () => localStorage.getItem(SAVE_KEY)!

describe('core-only catalog sessions', () => {
  it.each(['legacy', 'archive'] as const)('completes every age from a fresh %s campaign using original core formulas', async (format) => {
    if (format === 'archive') localStorage.setItem(SAVE_KEY, JSON.stringify(createModuleSaveEnvelope(freshProgress(), [])))
    let store = createGameStore()
    expect(store.getState().catalog).toBe(core)
    expect(core.elements).toHaveLength(225)
    expect(core.recipes).toHaveLength(291)
    expect(core.eras).toHaveLength(5)
    const performed = new Set<string>()
    let advanced = true
    while (advanced) {
      advanced = false
      for (const recipe of core.recipes) {
        const state = store.getState()
        if (performed.has(recipe.id) ||
          !recipe.inputs.every((id) => state.discoveredIds.includes(id)) ||
          !state.unlockedEraIds.includes(core.elementsById.get(recipe.result)!.era)) continue
        state.transmuteWith(...recipe.inputs)
        expect(store.getState().lastAttempt?.kind).toMatch(/discovery|known/)
        performed.add(recipe.id)
        advanced = true
      }
    }
    await store.flushProgress()
    expect(store.getState().persistenceError).toBeNull()
    store = createGameStore()
    expect(store.getState().saveFormat).toBe(format)
    expect(new Set(store.getState().discoveredIds)).toEqual(new Set(core.elements.map((element) => element.id)))
    expect(new Set(store.getState().discoveredRecipeIds)).toEqual(new Set(core.recipes.map((recipe) => recipe.id)))
    expect(store.getState().unlockedEraIds).toEqual(core.eras.map((era) => era.id))
    for (const era of core.eras) expect(isEraChallengeComplete(era, store.getState().discoveredIds, core.elements)).toBe(true)
  })

  it.each([{ ids: [] }, { ids: ['achaemenid'] }])('projects an old selection $ids to core without changing stored bytes or rewarding on load', async ({ ids }) => {
    const archive = legacyArchive(ids)
    const original = JSON.stringify(archive)
    localStorage.setItem(SAVE_KEY, original)
    const store = createGameStore()
    expect(store.getState().catalog).toBe(core)
    expect(snapshotProgress(store.getState())).toEqual(snapshotProgress(projectModuleProgress(archive).progress))
    expect(disk()).toBe(original)
    expect(await store.exportSave()).toBe(original)
    expect(store).not.toHaveProperty('previewModules')
    expect(store).not.toHaveProperty('getModuleStatuses')
    expect(store.getState()).not.toHaveProperty('activeModuleIds')
    const before = snapshotProgress(store.getState())
    store.getState().selectElement(legacyOwnership.elementIds[0])
    store.getState().placeElement('second', legacyOwnership.elementIds[0])
    store.getState().transmuteWith(legacyOwnership.elementIds[0], 'ember')
    expect(store.getState().prepareCombination(legacyOwnership.elementIds[0], 'ember')).toBe(false)
    expect(await store.getState().recordChallengeCompletion(legacyOwnership.challengeIds[0], 1)).toMatchObject({ saved: false })
    expect(snapshotProgress(store.getState())).toEqual(before)
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toBeNull()
    expect(parseModuleSaveEnvelope(disk())).toEqual({
      ...archive, enabledModuleIds: [], progress: { ...archive.progress, soundEnabled: false },
    })
    expect(snapshotProgress(createGameStore().getState())).toEqual({ ...before, soundEnabled: false })
  })

  it('retains archived experiments and receipts beyond the visible history limit', async () => {
    const archive = legacyArchive()
    localStorage.setItem(SAVE_KEY, JSON.stringify(archive))
    const store = createGameStore()
    for (let count = 0; count < 55; count++) store.getState().transmuteWith('ember', 'tide')
    await store.flushProgress()
    const saved = parseModuleSaveEnvelope(disk())!
    expect(store.getState().persistenceError).toBeNull()
    expect(store.getState().experimentHistory).toHaveLength(50)
    expect(saved.progress.experimentHistory).toHaveLength(51)
    expect(saved.progress.experimentHistory).toContainEqual(archive.progress.experimentHistory[1])
    for (const key of ['favoriteIds', 'readHistoricalElementIds', 'rewardedCollectionIds', 'challengeRecords',
      'failedPairKeys', 'revealedHintRecipeIds'] as const) expect(saved.progress[key]).toEqual(archive.progress[key])
    expect(saved.progress.insightCredits).toBe(archive.progress.insightCredits)
    expect(saved.progress.insightFailureProgress).toBe(archive.progress.insightFailureProgress)
    expect(createGameStore().getState().catalog).toBe(core)
  })

  it('clears inactive progress only on deliberate total reset', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    const store = createGameStore()
    store.getState().resetProgress()
    await store.flushProgress()
    const saved = parseModuleSaveEnvelope(disk())!
    expect(saved.progress).toEqual(freshProgress())
    expect(saved.enabledModuleIds).toEqual([])
    expect(createGameStore().getState().catalog).toBe(core)
  })

  it('surfaces asynchronous quota failures and does not acknowledge failed challenge rewards', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    const original = disk()
    const store = createGameStore()
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toMatch(/could not be validated or saved/)
    expect(await store.getState().recordChallengeCompletion('rainmaker', 4)).toMatchObject({ saved: false })
    expect(disk()).toBe(original)
    writes.mockRestore()
    expect(await store.getState().recordChallengeCompletion('rainmaker', 4)).toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
  })

  it('requires locks and preserves competing-tab winners', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    const original = disk()
    const store = createGameStore()
    const locks = navigator.locks
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toBe(DURABLE_LOCK)
    expect(disk()).toBe(original)
    Object.defineProperty(navigator, 'locks', { configurable: true, value: locks })
    const first = createGameStore()
    const second = createGameStore()
    first.getState().toggleSound()
    await first.flushProgress()
    const winner = disk()
    second.synchronizeProgress()
    expect(second.getState().persistenceError).toBe(DURABLE_CONFLICT)
    second.getState().toggleFavorite('ember')
    await second.flushProgress()
    expect(disk()).toBe(winner)
    expect(parseProgress(winner)).toBeNull()
  })
})
