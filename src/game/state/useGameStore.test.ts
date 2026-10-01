// @vitest-environment jsdom

import './testSupport'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { soundEngine } from '../audio/audioEngine'
import { collections, elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { pairKey } from '../engine/resolveCombination'
import { exportProgress, loadProgress, MAX_EXPERIMENT_HISTORY, parseProgress, type SavedProgress } from './persistence'
import { createGameStore, snapshotProgress, useGameStore } from './useGameStore'

vi.mock('../audio/audioEngine', () => ({ soundEngine: {
  setEnabled: vi.fn(), playSelect: vi.fn(), playClear: vi.fn(), playFailure: vi.fn(),
  playNewDiscovery: vi.fn(), playMerge: vi.fn(), playUnlock: vi.fn(), playHint: vi.fn(),
} }))
vi.mock('../fx/confetti', () => ({ triggerConfetti: vi.fn() }))

const saveKey = 'unwritten-atlas-progress'
const state = () => useGameStore.getState()
const campaign = () => snapshotProgress(state())
const disk = () => window.localStorage.getItem(saveKey)
const fresh = (): SavedProgress => parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!
const failWrites = () => vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })

describe('campaign state', () => {
  it.each(['', '{', JSON.stringify({ version: 99 })])('protects an unreadable original throughout in-memory play: %s', async (raw) => {
    localStorage.setItem(saveKey, raw)
    const store = createGameStore()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    expect(store.getState().persistenceError).toContain('Autosaving is paused')
    store.getState().transmuteWith('ember', 'tide')
    expect(store.getState().discoveredIds).toContain('steam')
    store.getState().toggleFavorite('steam')
    store.getState().toggleSound()
    expect((await store.getState().recordChallengeCompletion('rainmaker', 4)).saved).toBe(false)
    expect(store.getState().challengeRecords).toEqual([])
    store.getState().resetProgress()
    expect(store.getState().persistenceError).toContain('Autosaving is paused')
    expect(localStorage.getItem(saveKey)).toBe(raw)
    expect(writes).not.toHaveBeenCalled()
  })

  it('keeps a read-failure latch even when storage becomes readable again', () => {
    const raw = exportProgress(fresh())
    localStorage.setItem(saveKey, raw)
    const reads = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    const store = createGameStore()
    reads.mockRestore()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    store.getState().toggleSound()
    expect(writes).not.toHaveBeenCalled()
    expect(localStorage.getItem(saveKey)).toBe(raw)
    const reloaded = createGameStore()
    reloaded.getState().toggleSound()
    expect(reloaded.getState().persistenceError).toBeNull()
    expect(writes).toHaveBeenCalledOnce()
  })

  it('rebases exhausted history IDs so the next saved attempt remains loadable', () => {
    const progress = fresh()
    progress.experimentHistory = [{ id: Number.MAX_SAFE_INTEGER, inputs: ['gale', 'tide'], outcome: 'no-reaction' }]
    useGameStore.setState(snapshotProgress(progress))
    state().transmuteWith('ember', 'tide')
    expect(state().experimentHistory.map((entry) => entry.id)).toEqual([1, 2])
    expect(loadProgress()?.discoveredIds).toContain('steam')
    expect(loadProgress()?.experimentHistory).toEqual(state().experimentHistory)
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
    useGameStore.setState({ soundEnabled: true })
    state().resetProgress()
    vi.clearAllMocks()
  })

  it('adopts a clean external save before deriving an action even without a storage event', () => {
    const other = createGameStore()
    other.getState().transmuteWith('ember', 'ember')
    state().transmuteWith('ember', 'tide')
    expect(state().discoveredIds).toEqual(expect.arrayContaining(['heat', 'steam']))
    expect(state().experimentHistory.map((entry) => entry.resultId)).toEqual(['heat', 'steam'])
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    expect(state().persistenceError).toBeNull()
  })

  it('synchronizes sound and valid slots, clears removed slots, and cleans up listeners', () => {
    state().prepareCombination('ember', 'tide')
    const disconnect = useGameStore.connectProgress()
    const other = createGameStore()
    other.getState().transmuteWith('ember', 'tide')
    other.getState().toggleSound()
    const saved = disk()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    window.dispatchEvent(new StorageEvent('storage', { key: saveKey, newValue: '{' }))
    expect(state().soundEnabled).toBe(false)
    expect(state().firstSlotId).toBe('ember')
    expect(state().secondSlotId).toBe('tide')
    expect(disk()).toBe(saved)
    expect(writes).not.toHaveBeenCalled()
    state().prepareCombination('steam', 'ember')
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
    expect(state().firstSlotId).toBeNull()
    expect(state().secondSlotId).toBe('ember')
    expect(state().soundEnabled).toBe(true)
    expect(state().lastAttempt).toBeNull()
    disconnect()
    localStorage.setItem(saveKey, exportProgress({ ...fresh(), soundEnabled: false }))
    window.dispatchEvent(new StorageEvent('storage', { key: saveKey }))
    expect(state().soundEnabled).toBe(true)
  })

  it('keeps newer queued memory dirty after the first write and blocks external conflict', async () => {
    const callbacks: Array<() => void> = []
    vi.spyOn(navigator.locks, 'request').mockImplementation((_name, _options, callback) =>
      new Promise((resolve) => { callbacks.push(() => resolve(callback!(null))) }))
    state().transmuteWith('ember', 'tide')
    state().transmuteWith('ember', 'ember')
    expect(state().experimentHistory).toHaveLength(2)
    callbacks.shift()!()
    expect(loadProgress()?.experimentHistory).toHaveLength(1)
    const external = exportProgress({ ...loadProgress()!, favoriteIds: ['ember'] })
    localStorage.setItem(saveKey, external)
    useGameStore.synchronizeProgress()
    expect(state().persistenceError).toContain('unsaved changes')
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    callbacks.shift()!()
    await useGameStore.flushProgress()
    expect(state().experimentHistory).toHaveLength(2)
    expect(disk()).toBe(external)
    state().resetProgress()
    expect(disk()).toBe(external)
    expect(writes).not.toHaveBeenCalled()
  })

  it('preserves unsaved progress instead of adopting an external save after a quota failure', () => {
    const writes = failWrites()
    state().transmuteWith('ember', 'tide')
    writes.mockRestore()
    const other = createGameStore()
    other.getState().toggleSound()
    const saved = disk()
    useGameStore.synchronizeProgress()
    expect(state().discoveredIds).toContain('steam')
    expect(state().soundEnabled).toBe(true)
    expect(state().persistenceError).toContain('unsaved changes')
    state().toggleFavorite('steam')
    expect(disk()).toBe(saved)
  })

  it('does not acknowledge or reward a pending challenge and rejects conflicting saves', async () => {
    useGameStore.setState({ insightCredits: 0 })
    const callbacks: Array<() => void> = []
    vi.spyOn(navigator.locks, 'request').mockImplementation((_name, _options, callback) =>
      new Promise((resolve) => { callbacks.push(() => resolve(callback!(null))) }))
    const result = state().recordChallengeCompletion('rainmaker', 4)
    await vi.waitFor(() => expect(callbacks).toHaveLength(1))
    expect(state().challengeRecords).toEqual([])
    expect(state().insightCredits).toBe(0)
    const before = campaign()
    state().toggleSound()
    state().resetProgress()
    expect(campaign()).toEqual(before)
    const external = exportProgress({ ...fresh(), favoriteIds: ['ember'] })
    localStorage.setItem(saveKey, external)
    callbacks.shift()!()
    expect((await result).saved).toBe(false)
    expect(state().challengeRecords).toEqual([])
    expect(state().insightCredits).toBe(0)
    expect(disk()).toBe(external)
  })

  it('preserves current memory and blocks writes when an external save becomes invalid', () => {
    state().transmuteWith('ember', 'tide')
    const before = campaign()
    localStorage.setItem(saveKey, '{')
    useGameStore.synchronizeProgress()
    expect(campaign()).toEqual(before)
    expect(state().persistenceError).toContain('could not be read')
    state().toggleSound()
    expect(disk()).toBe('{')
  })

  it('prepares discovered inputs atomically, accepts duplicates and changes no progress or storage', () => {
    state().transmuteWith('ember', 'tide')
    const before = campaign()
    const saved = disk()
    expect(state().prepareCombination('ember', 'ember')).toBe(true)
    expect(state()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'ember', lastAttempt: null })
    expect(campaign()).toEqual(before)
    expect(disk()).toBe(saved)
    expect(state().prepareCombination('unknown', 'ember')).toBe(false)
    expect(state().prepareCombination('rain', 'ember')).toBe(false)
    expect(state()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'ember', lastAttempt: null })
    expect(campaign()).toEqual(before)
    expect(disk()).toBe(saved)
  })

  it('records discovery, known and repeated no-reaction attempts in order; excludes empty attempts', () => {
    const saved = disk()
    state().transmute()
    expect(state().experimentHistory).toEqual([])
    expect(disk()).toBe(saved)
    state().transmuteWith('ember', 'tide')
    state().transmuteWith('tide', 'ember')
    state().transmuteWith('gale', 'tide')
    state().transmuteWith('gale', 'tide')
    expect(state().experimentHistory).toEqual([
      { id: 1, inputs: ['ember', 'tide'], outcome: 'discovery', resultId: 'steam', recipeId: 'first-vapor' },
      { id: 2, inputs: ['tide', 'ember'], outcome: 'known', resultId: 'steam', recipeId: 'first-vapor' },
      { id: 3, inputs: ['gale', 'tide'], outcome: 'no-reaction' },
      { id: 4, inputs: ['gale', 'tide'], outcome: 'no-reaction' },
    ])
    expect(loadProgress()?.experimentHistory).toEqual(state().experimentHistory)
    expect(state().failedPairKeys).toEqual(['gale::tide'])
    expect(state()).toMatchObject({ firstSlotId: 'gale', secondSlotId: null })
  })

  it('records locked attempts and open leads without result or recipe spoilers', () => {
    const recipe = recipes.find((entry) => elementsById.get(entry.result)?.era === 'stone-age')!
    useGameStore.setState({ discoveredIds: [...new Set([...starterElementIds, ...recipe.inputs])] })
    state().transmuteWith(...recipe.inputs)
    expect(state().experimentHistory).toEqual([{ id: 1, inputs: recipe.inputs, outcome: 'locked', lockedEraId: 'stone-age' }])
    expect(state().revealedHintRecipeIds).toEqual([recipe.id])
    expect(state().failedPairKeys).toEqual([])
    expect(state().lastAttempt?.resultId).toBeUndefined()
    expect(loadProgress()?.experimentHistory).toEqual(state().experimentHistory)
  })

  it('keeps the newest 50 attempts and uses max existing sequence plus one', () => {
    useGameStore.setState({ experimentHistory: [{ id: 80, inputs: ['gale', 'tide'], outcome: 'no-reaction' }] })
    for (let index = 0; index < 55; index += 1) state().transmuteWith('gale', 'tide')
    expect(state().experimentHistory).toHaveLength(MAX_EXPERIMENT_HISTORY)
    expect(state().experimentHistory[0].id).toBe(86)
    expect(state().experimentHistory.at(-1)?.id).toBe(135)
    expect(loadProgress()?.experimentHistory).toEqual(state().experimentHistory)
  })

  it('persists preferences immediately and carries every new field through success', async () => {
    useGameStore.setState({ rewardedCollectionIds: [collections[0].id] })
    state().toggleFavorite('ember')
    state().toggleSound()
    await state().recordChallengeCompletion('rainmaker', 8)
    state().transmuteWith('gale', 'tide')
    const before = campaign()
    state().transmuteWith('ember', 'tide')
    expect(state().favoriteIds).toEqual(['ember'])
    expect(state().soundEnabled).toBe(false)
    expect(state().challengeRecords).toEqual(before.challengeRecords)
    expect(state().rewardedCollectionIds).toEqual(before.rewardedCollectionIds)
    expect(state().experimentHistory[0]).toEqual(before.experimentHistory[0])
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    expect(JSON.parse(disk()!)).toEqual({ version: 7, ...campaign() })
    expect(soundEngine.setEnabled).toHaveBeenCalledWith(false)
    const saved = disk()
    state().toggleFavorite('unknown')
    state().toggleFavorite('rain')
    expect(state().favoriteIds).toEqual(['ember'])
    expect(disk()).toBe(saved)
    state().toggleFavorite('ember')
    expect(loadProgress()?.favoriteIds).toEqual([])
  })

  it('resets favorites, history and rewards but preserves and synchronizes sound', async () => {
    useGameStore.setState({ rewardedCollectionIds: [collections[0].id] })
    state().toggleFavorite('ember')
    state().toggleSound()
    state().transmuteWith('ember', 'tide')
    await state().recordChallengeCompletion('rainmaker', 4)
    state().resetProgress()
    expect(campaign()).toEqual(snapshotProgress({ ...fresh(), soundEnabled: false }))
    expect(state()).toMatchObject({ firstSlotId: null, secondSlotId: null, lastAttempt: null })
    expect(loadProgress()).toEqual({ ...fresh(), soundEnabled: false })
    expect(soundEngine.setEnabled).toHaveBeenLastCalledWith(false)
  })

  it('allows gameplay in memory on failed writes and clears persistence error on the next write', () => {
    const saved = disk()
    const writes = failWrites()
    state().transmuteWith('ember', 'tide')
    expect(state().discoveredIds).toContain('steam')
    expect(state().experimentHistory).toHaveLength(1)
    expect(state().persistenceError).toBeTruthy()
    expect(disk()).toBe(saved)
    writes.mockRestore()
    state().toggleFavorite('steam')
    expect(state().persistenceError).toBeNull()
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
  })

  it('challenge completion changes only records and credits, is idempotent and improves the best score', async () => {
    state().transmuteWith('gale', 'tide')
    useGameStore.setState({ insightCredits: 0 })
    const before = state()
    expect((await state().recordChallengeCompletion('rainmaker', 8)).saved).toBe(true)
    const first = { challengeId: 'rainmaker', completed: true, bestAttemptCount: 8 }
    expect(state()).toEqual({ ...before, insightCredits: 1, challengeRecords: [first] })
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    const saved = disk()
    expect((await state().recordChallengeCompletion('rainmaker', 10)).saved).toBe(true)
    expect(state()).toEqual({ ...before, insightCredits: 1, challengeRecords: [first] })
    expect(disk()).toBe(saved)
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(true)
    expect(state()).toEqual({ ...before, insightCredits: 1, challengeRecords: [{ ...first, bestAttemptCount: 4 }] })
  })

  it('caps first challenge reward at 3 and never banks overflow', async () => {
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(true)
    expect(state().insightCredits).toBe(3)
    useGameStore.setState({ insightCredits: 1 })
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(true)
    expect(state().insightCredits).toBe(1)
  })

  it.each([['other', 4], ['rainmaker', 0], ['rainmaker', 3], ['rainmaker', 4.5], ['rainmaker', Infinity]])(
    'rejects invalid challenge completion %s/%s without side effects', async (challengeId, attempts) => {
      const before = state()
      const saved = disk()
      expect((await state().recordChallengeCompletion(challengeId, attempts)).saved).toBe(false)
      expect(state()).toBe(before)
      expect(disk()).toBe(saved)
    },
  )

  it('does not grant credits or mark challenge completion on failed writes and permits retry', async () => {
    useGameStore.setState({ insightCredits: 0 })
    const before = state()
    const saved = disk()
    const writes = failWrites()
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(false)
    expect(state()).toEqual({ ...before, persistenceError: 'Progress could not be saved.' })
    expect(disk()).toBe(saved)
    writes.mockRestore()
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(true)
    expect(state()).toEqual({ ...before, insightCredits: 1, challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 }] })
  })

  it('leaves a completed challenge best score untouched when its improvement cannot be saved', async () => {
    expect((await state().recordChallengeCompletion('rainmaker', 8)).saved).toBe(true)
    state().prepareCombination('ember', 'tide')
    const before = state()
    const saved = disk()
    failWrites()
    expect((await state().recordChallengeCompletion('rainmaker', 4)).saved).toBe(false)
    expect(state()).toEqual({ ...before, persistenceError: 'Progress could not be saved.' })
    expect(disk()).toBe(saved)
  })

  it('clears stale canonical failures in the successful transaction', () => {
    useGameStore.setState({ failedPairKeys: ['ember::tide', 'gale::tide'] })
    state().transmuteWith('tide', 'ember')
    expect(state().failedPairKeys).toEqual(['gale::tide'])
    expect(loadProgress()?.failedPairKeys).toEqual(['gale::tide'])
  })

  it('persists active era and hint updates without changing preferences or attempt history', () => {
    const discoveredIds = [...starterElementIds, 'human']
    const recipePairs = new Set(recipes.map((recipe) => pairKey(...recipe.inputs)))
    const failedPairKeys = [...new Set(discoveredIds.flatMap((firstId) =>
      discoveredIds.map((secondId) => pairKey(firstId, secondId)),
    ))].filter((key) => !recipePairs.has(key)).slice(0, 3)
    useGameStore.setState({
      insightCredits: 3, failedPairKeys,
      unlockedEraIds: ['first-light', 'stone-age'], discoveredIds,
      favoriteIds: ['ember'], soundEnabled: false,
      experimentHistory: [{ id: 4, inputs: ['gale', 'tide'], outcome: 'no-reaction' }],
    })
    const before = campaign()
    state().setActiveEra('stone-age')
    expect(loadProgress()?.activeEraId).toBe('stone-age')
    state().requestHint()
    expect(state().insightCredits).toBe(2)
    expect(state().revealedHintRecipeIds).toHaveLength(1)
    expect(state().favoriteIds).toEqual(before.favoriteIds)
    expect(state().soundEnabled).toBe(false)
    expect(state().experimentHistory).toEqual(before.experimentHistory)
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
  })

  it('loads persisted preferences and synchronizes audio during initialization', async () => {
    window.localStorage.setItem(saveKey, exportProgress({ ...fresh(), soundEnabled: false, favoriteIds: ['ember'] }))
    const reloaded = createGameStore().getState()
    expect(reloaded.soundEnabled).toBe(false)
    expect(reloaded.favoriteIds).toEqual(['ember'])
    expect(reloaded.persistenceError).toBeNull()
    expect(soundEngine.setEnabled).toHaveBeenLastCalledWith(false)
  })

  it('rewards a newly completed collection in the discovery transaction exactly once', () => {
    const collection = collections.find((entry) => entry.name === 'Stormwatch')!
    const recipe = recipes.find((entry) => entry.result === 'lightning')!
    useGameStore.setState({
      discoveredIds: [...new Set([...starterElementIds, ...collection.elementIds.filter((id) => id !== recipe.result), ...recipe.inputs])],
      insightCredits: 0, favoriteIds: ['ember'], soundEnabled: false,
      challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 5 }],
    })
    state().transmuteWith(...recipe.inputs)
    expect(state().rewardedCollectionIds).toEqual([collection.id])
    expect(state().insightCredits).toBe(1)
    expect(state().lastAttempt?.insightEarned).toBe(1)
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    state().transmuteWith(...recipe.inputs)
    expect(state().insightCredits).toBe(1)
    expect(state().rewardedCollectionIds).toEqual([collection.id])
    expect(state().lastAttempt?.insightEarned).toBe(0)
    const progress = loadProgress()!
    useGameStore.setState(snapshotProgress(progress))
    expect(state().insightCredits).toBe(1)
    state().transmuteWith(...recipe.inputs)
    expect(state().insightCredits).toBe(1)
  })

  it('marks all completed collections once even at the wallet cap, without banking overflow', () => {
    useGameStore.setState({
      discoveredIds: elements.map((element) => element.id), unlockedEraIds: eras.map((era) => era.id),
      rewardedChallengeEraIds: eras.map((era) => era.id), insightCredits: 2,
    })
    state().transmuteWith('ember', 'tide')
    expect(state().rewardedCollectionIds).toEqual(collections.map((collection) => collection.id))
    expect(state().insightCredits).toBe(3)
    expect(state().lastAttempt?.insightEarned).toBe(1)
    useGameStore.setState({ insightCredits: 0 })
    state().transmuteWith('ember', 'tide')
    expect(state().insightCredits).toBe(0)
  })

  it('does not award collections on loading, preparation or a failed reaction', async () => {
    const collection = collections[0]
    const progress = { ...fresh(), discoveredIds: [...starterElementIds, ...collection.elementIds], insightCredits: 0 }
    window.localStorage.setItem(saveKey, exportProgress(progress))
    const loadedStore = createGameStore()
    const loadedState = () => loadedStore.getState()
    expect(loadedState().rewardedCollectionIds).toEqual([])
    expect(loadedState().prepareCombination('gale', 'tide')).toBe(true)
    expect(loadedState().insightCredits).toBe(0)
    loadedState().transmute()
    expect(loadedState().rewardedCollectionIds).toEqual([])
    expect(loadedState().insightCredits).toBe(0)
    const reloaded = createGameStore().getState()
    expect(reloaded.rewardedCollectionIds).toEqual([])
    expect(reloaded.insightCredits).toBe(0)
  })

  it('live Iron unlock grants ore and retains preferences, history and reward records', () => {
    const recipe = recipes.find((entry) => entry.result === 'law')!
    useGameStore.setState({
      discoveredIds: [...new Set([...starterElementIds, 'bronze', 'forge', 'city', ...recipe.inputs])],
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'], insightCredits: 0,
      favoriteIds: ['ember'], soundEnabled: false,
    })
    state().transmuteWith(...recipe.inputs)
    expect(state().activeEraId).toBe('iron-age')
    expect(state().discoveredIds).toContain('iron-ore')
    expect(state().insightCredits).toBe(1)
    expect(state().favoriteIds).toEqual(['ember'])
    expect(state().soundEnabled).toBe(false)
    expect(state().experimentHistory).toHaveLength(1)
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
  })
})