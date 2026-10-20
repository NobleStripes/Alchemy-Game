// @vitest-environment jsdom
import './testSupport'
import { describe, expect, it, vi } from 'vitest'
import { coreRuntimeCatalog as core } from '../modules/runtimeCatalog'
import { installedRegionalModules } from '../modules/installed'
import { installedModuleOwnership } from '../modules/ownership'
import { createChallengeReducer, createChallengeState } from '../engine/challengeRules'
import { exportProgress, freshProgress, MAX_SAVE_BYTES, parseProgress, SAVE_KEY, type SavedProgress } from './persistence'
import { createModuleSaveEnvelope, parseModuleSaveEnvelope } from './moduleProgress'
import { DURABLE_CONFLICT, DURABLE_LOCK } from './durableModulePersistence'
import { createGameStore, snapshotProgress } from './useGameStore'

const pack = installedRegionalModules[0]
const regional = (enabledModuleIds: readonly string[] = ['achaemenid']) =>
  createGameStore({ mode: 'internal-regional', enabledModuleIds })
const disk = () => localStorage.getItem(SAVE_KEY)!

function seedCore(): SavedProgress {
  const progress: SavedProgress = {
    ...freshProgress(),
    discoveredIds: core.elements.map((element) => element.id),
    discoveredRecipeIds: core.recipes.map((recipe) => recipe.id),
    unlockedEraIds: core.eras.map((era) => era.id),
    activeEraId: 'classical-antiquity',
    rewardedChallengeEraIds: core.eras.map((era) => era.id),
    rewardedCollectionIds: core.collections.map((collection) => collection.id),
    insightCredits: 0,
  }
  localStorage.setItem(SAVE_KEY, exportProgress(progress))
  return progress
}

describe('unified active catalog sessions', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('migrates internal legacy v%i only on a successful write', async (version) => {
    const original = JSON.stringify({ ...freshProgress(), version, hintCredits: 2 })
    localStorage.setItem(SAVE_KEY, original)
    const expected = parseProgress(original)!
    const store = regional()
    expect(snapshotProgress(store.getState())).toEqual(snapshotProgress(expected))
    expect(disk()).toBe(original)
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toBeNull()
    expect(parseModuleSaveEnvelope(disk())?.progress).toEqual({ ...expected, soundEnabled: false })
  })

  it('keeps production core-only/v7 and does not publish a rejected selection', async () => {
    const store = createGameStore()
    expect(store.getState().activeModuleIds).toEqual([])
    expect(store.getState().catalog).toEqual(core)
    expect(() => regional(['missing-pack'])).toThrow(/not installed/)
    expect(() => regional(['achaemenid', 'achaemenid'])).toThrow(/unique/)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    store.getState().toggleFavorite('ember')
    await store.flushProgress()
    expect(JSON.parse(disk())).toMatchObject({ version: 7, favoriteIds: ['ember'] })
    expect(JSON.parse(disk())).not.toHaveProperty('catalog')
  })

  it('publishes all content and indexes together without altering other sessions', () => {
    const production = createGameStore()
    const store = regional()
    const catalog = store.getState().catalog
    expect(catalog.elements).toHaveLength(228)
    expect(catalog.recipes).toHaveLength(294)
    expect(catalog.eras).toEqual(core.eras)
    expect(catalog.histories).toHaveLength(150)
    expect(catalog.collections).toHaveLength(core.collections.length + 1)
    expect(catalog.sources).toHaveLength(core.sources.length + pack.research.sources.length)
    expect(catalog.recipeReviews).toHaveLength(core.recipeReviews.length + 3)
    expect(catalog.challenges).toHaveLength(core.challenges.length + 1)
    for (const element of pack.elements) {
      expect(catalog.elementsById.get(element.id)).toEqual(element)
      expect(catalog.researchByElementId.has(element.id)).toBe(true)
    }
    expect(production.getState().catalog).toEqual(core)
    expect(production.getState().catalog.elementsById.has(pack.elements[0].id)).toBe(false)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('hints, combines, reads, favorites, and persists regional records without repeated rewards', async () => {
    seedCore()
    const store = regional()
    store.setState({ insightCredits: 3 })
    store.getState().requestHint()
    expect(store.getState().revealedHintRecipeIds).toContain(pack.recipes[0].id)
    for (const recipe of pack.recipes) store.getState().transmuteWith(...recipe.inputs)
    const id = pack.elements[0].id
    store.getState().toggleFavorite(id)
    store.getState().toggleHistoricalRead(id)
    store.getState().selectElement(id)
    await store.flushProgress()
    expect(store.getState().recentIngredientIds[0]).toBe(id)
    expect(store.getState().lastAttempt).toBeNull()
    expect(store.getState().rewardedCollectionIds).toContain(pack.collections[0].id)
    const reloaded = regional()
    expect(snapshotProgress(reloaded.getState())).toEqual(snapshotProgress(store.getState()))
    expect(parseModuleSaveEnvelope(disk())?.ownership).toEqual(installedModuleOwnership)
    const credits = reloaded.getState().insightCredits
    reloaded.getState().transmuteWith(...pack.recipes[0].inputs)
    await reloaded.flushProgress()
    expect(reloaded.getState().lastAttempt?.kind).toBe('known')
    expect(reloaded.getState().insightCredits).toBe(credits)
  })

  it('keeps regional challenge runs isolated and acknowledges only durable, idempotent rewards', async () => {
    const store = regional()
    const challenge = pack.challenges[0]
    const reduce = createChallengeReducer(challenge, store.getState().catalog)
    let run = createChallengeState(challenge)
    run = reduce(run, { type: 'place', slot: 'first', elementId: challenge.starterIds[0] })
    run = reduce(run, { type: 'place', slot: 'second', elementId: challenge.starterIds[1] })
    run = reduce(run, { type: 'combine' })
    expect(run.completed).toBe(true)
    const before = snapshotProgress(store.getState())
    store.setState({ insightCredits: 1 })
    expect(await store.getState().recordChallengeCompletion(challenge.id, 0)).toMatchObject({ saved: false })
    expect(await store.getState().recordChallengeCompletion(challenge.id, run.attemptCount))
      .toEqual({ saved: true, firstCompletion: true, insightEarned: 1 })
    expect(await store.getState().recordChallengeCompletion(challenge.id, run.attemptCount))
      .toEqual({ saved: true, firstCompletion: false, insightEarned: 0 })
    expect(store.getState().discoveredIds).toEqual(before.discoveredIds)
    expect(store.getState().discoveredRecipeIds).toEqual(before.discoveredRecipeIds)
    expect(regional().getState().challengeRecords).toEqual([{
      challengeId: challenge.id, completed: true, bestAttemptCount: 1,
    }])
  })

  it('does not count regional discoveries toward core age goals or award core receipts early', async () => {
    const progress = seedCore()
    const era = core.eras.at(-1)!
    const eraElements = core.elements.filter((element) => element.era === era.id)
    const required = new Set(era.landmarkIds)
    const selected = new Set(eraElements.filter((element) => required.has(element.id)).map((element) => element.id))
    for (const element of eraElements) {
      if (selected.size >= era.discoveryGoal - 1) break
      selected.add(element.id)
    }
    const discoveredIds = progress.discoveredIds.filter((id) =>
      core.elementsById.get(id)?.era !== era.id || selected.has(id))
    localStorage.setItem(SAVE_KEY, JSON.stringify(createModuleSaveEnvelope({
      ...progress, discoveredIds: [...discoveredIds, pack.elements[0].id],
      discoveredRecipeIds: [], rewardedCollectionIds: [],
      rewardedChallengeEraIds: progress.rewardedChallengeEraIds.filter((id) => id !== era.id),
    }, installedModuleOwnership)))
    const store = regional()
    expect(store.getState().discoveredIds.filter((id) => core.elementsById.get(id)?.era === era.id))
      .toHaveLength(era.discoveryGoal - 1)
    store.getState().transmuteWith(...core.recipes[0].inputs)
    await store.flushProgress()
    expect(store.getState().discoveredIds).toContain(pack.elements[0].id)
    expect(store.getState().rewardedChallengeEraIds).not.toContain(era.id)
    expect(regional().getState().persistenceError).toBeNull()
  })

  it('preserves dormant records across core-active archive writes and restores them without another reward', async () => {
    seedCore()
    const first = regional()
    for (const recipe of pack.recipes) first.getState().transmuteWith(...recipe.inputs)
    first.getState().toggleFavorite(pack.elements[0].id)
    first.getState().toggleHistoricalRead(pack.elements[0].id)
    await first.flushProgress()
    await first.getState().recordChallengeCompletion(pack.challenges[0].id, 1)
    const original = snapshotProgress(first.getState())
    const disabled = regional([])
    expect(disabled.getState().discoveredIds).toEqual(core.elements.map((element) => element.id))
    expect(disabled.getState().favoriteIds).toEqual([])
    expect(disabled.getState().readHistoricalElementIds).toEqual([])
    expect(disabled.getState().challengeRecords).toEqual([])
    disabled.getState().toggleSound()
    await disabled.flushProgress()
    const enabled = regional()
    expect(snapshotProgress(enabled.getState())).toEqual({ ...original, soundEnabled: false })
    expect(await enabled.getState().recordChallengeCompletion(pack.challenges[0].id, 1))
      .toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
  })

  it('clears dormant records only on explicit all-progress reset', async () => {
    seedCore()
    const first = regional()
    first.getState().transmuteWith(...pack.recipes[0].inputs)
    await first.flushProgress()
    const disabled = regional([])
    disabled.getState().resetProgress()
    await disabled.flushProgress()
    expect(regional().getState().discoveredIds).toEqual(core.starterElementIds)
    expect(parseModuleSaveEnvelope(disk())?.progress.experimentHistory).toEqual([])
  })

  it('allocates stable experiment IDs above dormant history during queued active writes', async () => {
    seedCore()
    const first = regional()
    for (const recipe of pack.recipes) first.getState().transmuteWith(...recipe.inputs)
    await first.flushProgress()
    const disabled = regional([])
    expect(disabled.getState().experimentHistory).toEqual([])
    disabled.getState().transmuteWith(...core.recipes[0].inputs)
    disabled.getState().transmuteWith(...core.recipes[1].inputs)
    disabled.getState().toggleFavorite('ember')
    await disabled.flushProgress()
    expect(disabled.getState().persistenceError).toBeNull()
    const reloaded = regional()
    expect(reloaded.getState().experimentHistory.map((entry) => entry.id)).toEqual([1, 2, 3, 4, 5])
    expect(reloaded.getState().favoriteIds).toContain('ember')
  })

  it('blocks changed active ownership but keeps an incompatible disabled module dormant', async () => {
    const progress = seedCore()
    const ownership = installedModuleOwnership.map((owner) => ({ ...owner, version: '9.0.0' }))
    localStorage.setItem(SAVE_KEY, JSON.stringify(createModuleSaveEnvelope(progress, ownership)))
    const original = disk()
    const active = regional()
    expect(active.getState().persistenceError).toMatch(/migration required/)
    active.getState().toggleSound()
    await active.flushProgress()
    expect(disk()).toBe(original)
    const dormant = regional([])
    expect(dormant.getState().persistenceError).toBeNull()
    dormant.getState().toggleSound()
    await dormant.flushProgress()
    expect(parseModuleSaveEnvelope(disk())?.ownership).toEqual(ownership)
  })

  it('rejects invalid regional challenge scores in an archive instead of normalizing them as core', async () => {
    const progress = seedCore()
    const archive = createModuleSaveEnvelope(progress, installedModuleOwnership)
    archive.progress.challengeRecords = [{ challengeId: pack.challenges[0].id, completed: true, bestAttemptCount: 0 }]
    localStorage.setItem(SAVE_KEY, JSON.stringify(archive))
    const original = disk()
    const store = regional()
    expect(store.getState().persistenceError).toBeTruthy()
    expect(await store.getState().recordChallengeCompletion(pack.challenges[0].id, 1)).toMatchObject({ saved: false })
    expect(disk()).toBe(original)
  })

  it('rejects active formula receipts without their result instead of publishing invalid progress', () => {
    const progress = seedCore()
    const archive = createModuleSaveEnvelope({
      ...progress, discoveredRecipeIds: [...progress.discoveredRecipeIds, pack.recipes[0].id],
    }, installedModuleOwnership)
    localStorage.setItem(SAVE_KEY, JSON.stringify(archive))
    const original = disk()
    const store = regional()
    expect(store.getState().persistenceError).toMatch(/Invalid active formula record/)
    expect(store.getState().discoveredIds).toEqual(core.starterElementIds)
    expect(disk()).toBe(original)
  })

  it('enforces the byte limit without replacing a valid existing save', async () => {
    seedCore()
    const original = disk()
    const store = regional()
    store.setState({ collapsedShelves: Array.from({ length: 60000 }, () => 'classical-antiquity') })
    expect(new TextEncoder().encode(JSON.stringify(snapshotProgress(store.getState()))).byteLength)
      .toBeGreaterThan(MAX_SAVE_BYTES)
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toMatch(/exceeds the storage size limit/)
    expect(disk()).toBe(original)
  })

  it('surfaces asynchronous quota errors and never acknowledges a failed challenge reward', async () => {
    const store = regional()
    store.setState({ insightCredits: 1 })
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    store.getState().toggleSound()
    await store.flushProgress()
    expect(store.getState().persistenceError).toMatch(/could not be validated or saved/)
    expect(await store.getState().recordChallengeCompletion(pack.challenges[0].id, 1)).toMatchObject({ saved: false })
    expect(store.getState().challengeRecords).toEqual([])
    expect(store.getState().insightCredits).toBe(1)
    writes.mockRestore()
    expect(await store.getState().recordChallengeCompletion(pack.challenges[0].id, 1)).toMatchObject({ saved: true })
    expect(store.getState().persistenceError).toBeNull()
  })

  it('reports conflicts on synchronization and preserves the winner and losing memory', async () => {
    const first = regional()
    const second = regional()
    first.getState().toggleSound()
    await first.flushProgress()
    const winner = disk()
    second.synchronizeProgress()
    expect(second.getState().persistenceError).toBe(DURABLE_CONFLICT)
    expect(second.getState().soundEnabled).toBe(true)
    second.getState().toggleFavorite('ember')
    await second.flushProgress()
    expect(disk()).toBe(winner)
  })

  it('requires locks and prevents production v7 sessions from overwriting an internal archive', async () => {
    seedCore()
    const original = disk()
    const noLocks = regional()
    const locks = navigator.locks
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    noLocks.getState().toggleSound()
    await noLocks.flushProgress()
    expect(noLocks.getState().persistenceError).toBe(DURABLE_LOCK)
    expect(disk()).toBe(original)
    Object.defineProperty(navigator, 'locks', { configurable: true, value: locks })
    const internal = regional()
    internal.getState().toggleFavorite('ember')
    await internal.flushProgress()
    const archive = disk()
    const production = createGameStore()
    expect(production.getState().persistenceError).toMatch(/could not be read/)
    production.getState().toggleSound()
    await production.flushProgress()
    expect(disk()).toBe(archive)
  })
})
