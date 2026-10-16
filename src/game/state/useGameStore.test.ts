// @vitest-environment jsdom

import './testSupport'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { soundEngine } from '../audio/audioEngine'
import { collections, elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { learningChallenges } from '../content/challenges'
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
  it('persists shelf preferences without changing campaign discoveries and resets them', async () => {
    const before = campaign()
    state().toggleHideFinalElements()
    state().toggleShelf('first-light')
    state().toggleShelf('stone-age')
    await useGameStore.flushProgress()
    expect(campaign()).toEqual({ ...before, hideFinalElements: true, collapsedShelves: ['first-light', 'stone-age'] })
    expect(createGameStore().getState()).toMatchObject({ hideFinalElements: true, collapsedShelves: ['first-light', 'stone-age'] })
    state().toggleShelf('first-light')
    expect(state().collapsedShelves).toEqual(['stone-age'])
    state().toggleShelf('unknown')
    expect(state().collapsedShelves).toEqual(['stone-age'])
    state().resetProgress()
    expect(state()).toMatchObject({ hideFinalElements: false, collapsedShelves: [] })
  })

  it('adopts external shelf preferences and reports preference write failures', async () => {
    const external = createGameStore()
    external.getState().toggleShelf('first-light')
    external.getState().toggleHideFinalElements()
    await external.flushProgress()
    useGameStore.synchronizeProgress()
    expect(state()).toMatchObject({ hideFinalElements: true, collapsedShelves: ['first-light'] })
    failWrites()
    state().toggleHideFinalElements()
    await useGameStore.flushProgress()
    expect(state().hideFinalElements).toBe(false)
    expect(state().persistenceError).not.toBeNull()
  })
  it('keeps eight distinct recent ingredients in selection order without saving or changing progression', () => {
    const ids = elements.slice(0, 10).map((element) => element.id)
    useGameStore.setState({ discoveredIds: ids })
    const before = campaign()
    const savedBefore = disk()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    for (const id of ids) state().selectElement(id)
    expect(state().recentIngredientIds).toEqual(ids.slice(-8).reverse())
    state().placeElement('second', ids[3])
    expect(state().recentIngredientIds).toEqual([ids[3], ...ids.slice(-8).reverse().filter((id) => id !== ids[3])])
    state().prepareCombination(ids[7], ids[9])
    expect(state().recentIngredientIds.slice(0, 3)).toEqual([ids[9], ids[7], ids[3]])
    state().prepareCombination(ids[7], ids[7])
    expect(state().recentIngredientIds[0]).toBe(ids[7])
    expect(state().recentIngredientIds).toHaveLength(8)
    expect(new Set(state().recentIngredientIds).size).toBe(8)
    state().clearSlot('first')
    state().clearSlot('second')
    expect(state().recentIngredientIds).toHaveLength(8)
    expect(campaign()).toEqual(before)
    expect(writes).not.toHaveBeenCalled()
    expect(disk()).toBe(savedBefore)
    expect(createGameStore().getState().recentIngredientIds).toEqual([])
  })

  it('tracks immediate combinations through successful discoveries but excludes recents from version 7 saves', () => {
    state().transmuteWith('stone', 'ember')
    expect(state().recentIngredientIds).toEqual(['ember', 'stone'])
    state().placeElement('first', 'metal')
    expect(state().recentIngredientIds).toEqual(['metal', 'ember', 'stone'])
    state().toggleSound()
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    expect(JSON.parse(disk()!)).not.toHaveProperty('recentIngredientIds')
    expect(createGameStore().getState().recentIngredientIds).toEqual([])
    state().resetProgress()
    expect(state().recentIngredientIds).toEqual([])
  })

  it('removes recent ingredients no longer discovered after adopting external progress', () => {
    state().transmuteWith('stone', 'ember')
    state().placeElement('first', 'metal')
    localStorage.setItem(saveKey, exportProgress(fresh()))
    useGameStore.synchronizeProgress()
    expect(state().recentIngredientIds).toEqual(['ember', 'stone'])
    expect(state().firstSlotId).toBeNull()
  })

  it('never records hidden or unknown ingredients in recent history', () => {
    expect(state().prepareCombination('ember', 'metal')).toBe(false)
    state().selectElement('metal')
    state().placeElement('second', 'missing')
    expect(state().recentIngredientIds).toEqual([])
  })

  it('persists explicit reading without spending Insight or affecting rewards, then clears it on reset', () => {
    state().transmuteWith('stone', 'ember')
    state().transmuteWith('ember', 'ember')
    useGameStore.setState({ insightCredits: 0 })
    state().prepareCombination('ember', 'tide')
    const before = campaign()
    state().toggleHistoricalRead('writing')
    state().toggleHistoricalRead('heat')
    state().toggleHistoricalRead('missing')
    expect(campaign()).toEqual(before)
    state().toggleHistoricalRead('metal')
    expect(campaign()).toEqual({ ...before, readHistoricalElementIds: ['metal'] })
    expect(state().firstSlotId).toBe('ember')
    expect(state().secondSlotId).toBe('tide')
    expect(createGameStore().getState().readHistoricalElementIds).toEqual(['metal'])
    state().resetProgress()
    expect(state().readHistoricalElementIds).toEqual([])
    expect(loadProgress()?.readHistoricalElementIds).toEqual([])
  })

  it.each(starterElementIds)('makes %s history readable from a fresh campaign without changing gameplay', (id) => {
    useGameStore.setState({ insightCredits: 0 })
    state().prepareCombination('ember', 'tide')
    const before = campaign()
    expect(before.readHistoricalElementIds).toEqual([])
    state().toggleHistoricalRead(id)
    expect(campaign()).toEqual({ ...before, readHistoricalElementIds: [id] })
    expect(state()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'tide' })
    expect(createGameStore().getState().readHistoricalElementIds).toEqual([id])
    state().toggleHistoricalRead(id)
    expect(campaign()).toEqual(before)
  })

  it('surfaces failed reading-marker saves without overwriting the existing save', () => {
    state().transmuteWith('stone', 'ember')
    const original = disk()
    failWrites()
    state().toggleHistoricalRead('metal')
    expect(state().persistenceError).not.toBeNull()
    expect(disk()).toBe(original)
    expect(createGameStore().getState().readHistoricalElementIds).toEqual([])
  })

  it.each(learningChallenges)('saves and rewards $name once without campaign discoveries or reading requirements', async (challenge) => {
    useGameStore.setState({ insightCredits: 0 })
    const before = campaign()
    expect((await state().recordChallengeCompletion(challenge.id, challenge.minimumAttempts - 1)).saved).toBe(false)
    expect(campaign()).toEqual(before)
    const receipt = await state().recordChallengeCompletion(challenge.id, challenge.minimumAttempts)
    expect(receipt).toMatchObject({ saved: true, firstCompletion: true, insightEarned: 1 })
    expect(campaign()).toEqual({
      ...before, insightCredits: 1,
      challengeRecords: [{ challengeId: challenge.id, completed: true, bestAttemptCount: challenge.minimumAttempts }],
    })
    expect(createGameStore().getState().challengeRecords).toEqual(state().challengeRecords)
    expect((await state().recordChallengeCompletion(challenge.id, challenge.minimumAttempts + 1)).firstCompletion).toBe(false)
    expect(state().insightCredits).toBe(1)
    expect(state().challengeRecords[0].bestAttemptCount).toBe(challenge.minimumAttempts)
  })

  it.each(learningChallenges)('consumes the $name first reward at the cap without banking overflow', async (challenge) => {
    expect(state().insightCredits).toBe(3)
    expect(await state().recordChallengeCompletion(challenge.id, challenge.minimumAttempts))
      .toMatchObject({ saved: true, firstCompletion: true, insightEarned: 0 })
    useGameStore.setState({ insightCredits: 0 })
    expect(await state().recordChallengeCompletion(challenge.id, challenge.minimumAttempts))
      .toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
    expect(state().insightCredits).toBe(0)
  })

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

  it.each([
    ['stone-age', 'harvested-forest-resin', 'forest', 'stone-tool', 'resin'],
    ['stone-age', 'prepared-resin-adhesive', 'resin', 'heat', 'adhesive'],
    ['stone-age', 'hollowed-tree-canoe', 'forest', 'axe', 'dugout-canoe'],
    ['stone-age', 'canoe-paddle-equipment', 'dugout-canoe', 'tree', 'paddle'],
    ['bronze-age', 'paddled-voyage', 'paddle', 'boat', 'voyage'],
    ['stone-age', 'prepared-leather', 'hide', 'ash', 'leather'],
    ['bronze-age', 'threaded-frame', 'fibre', 'tree', 'loom'],
    ['iron-age', 'iron-specialist', 'iron-tool', 'human', 'blacksmith'],
    ['iron-age', 'rotating-grindstone', 'rock', 'wheel', 'rotary-quern'],
    ['iron-age', 'turning-workshop', 'timber', 'wheel', 'lathe'],
    ['iron-age', 'alphabetic-signs', 'writing', 'scribe', 'alphabet'],
  ])('keeps new %s discoveries locked until their age is available', (eraId, recipeId, firstId, secondId, resultId) => {
    const eraIndex = eras.findIndex((era) => era.id === eraId)
    useGameStore.setState({
      discoveredIds: [...new Set([...starterElementIds, firstId, secondId])],
      unlockedEraIds: eras.slice(0, eraIndex).map((era) => era.id),
    })
    state().transmuteWith(firstId, secondId)
    expect(state().discoveredIds).not.toContain(resultId)
    expect(state().discoveredRecipeIds).not.toContain(recipeId)
    expect(state().revealedHintRecipeIds).toEqual([recipeId])
    expect(state().experimentHistory).toEqual([{
      id: 1, inputs: [firstId, secondId], outcome: 'locked', lockedEraId: eraId,
    }])
    expect(state().lastAttempt?.resultId).toBeUndefined()
    expect(state().insightCredits).toBe(3)
  })

  it.each([
    ['first-light', 'drying-sea', 'sea', 'wind', 'salt'],
    ['stone-age', 'harvested-forest-resin', 'forest', 'stone-tool', 'resin'],
    ['stone-age', 'prepared-resin-adhesive', 'resin', 'heat', 'adhesive'],
    ['stone-age', 'hollowed-tree-canoe', 'forest', 'axe', 'dugout-canoe'],
    ['stone-age', 'canoe-paddle-equipment', 'dugout-canoe', 'tree', 'paddle'],
    ['stone-age', 'adhesive-hafting', 'adhesive', 'stone-tool', 'axe'],
    ['stone-age', 'canoe-net-fishing', 'dugout-canoe', 'net', 'food'],
    ['bronze-age', 'paddled-voyage', 'paddle', 'boat', 'voyage'],
    ['stone-age', 'prepared-leather', 'hide', 'ash', 'leather'],
    ['bronze-age', 'threaded-frame', 'fibre', 'tree', 'loom'],
    ['iron-age', 'iron-specialist', 'iron-tool', 'human', 'blacksmith'],
    ['iron-age', 'rotating-grindstone', 'rock', 'wheel', 'rotary-quern'],
    ['iron-age', 'turning-workshop', 'timber', 'wheel', 'lathe'],
    ['iron-age', 'alphabetic-signs', 'writing', 'scribe', 'alphabet'],
    ['iron-age', 'rotary-flour', 'rotary-quern', 'crop', 'flour'],
    ['iron-age', 'alphabetic-manuscript', 'alphabet', 'papyrus', 'manuscript'],
  ])('persists a new %s discovery and its formula across reload', (eraId, recipeId, firstId, secondId, resultId) => {
    const unlockedEras = eras.slice(0, eras.findIndex((era) => era.id === eraId) + 1)
    useGameStore.setState({
      discoveredIds: [...new Set([
        ...starterElementIds, firstId, secondId,
        ...unlockedEras.flatMap((era) => era.grants),
      ])],
      unlockedEraIds: unlockedEras.map((era) => era.id),
      activeEraId: eraId,
    })
    state().transmuteWith(firstId, secondId)
    expect(state().lastAttempt).toMatchObject({ kind: 'discovery', resultId })
    expect(state().discoveredIds).toContain(resultId)
    expect(state().discoveredRecipeIds).toContain(recipeId)
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    const reloaded = createGameStore().getState()
    expect(snapshotProgress(reloaded)).toEqual(campaign())
    expect(reloaded.persistenceError).toBeNull()
    expect(reloaded.activeEraId).toBe(eraId)
  })

  it('preserves a pre-batch v7 save and its formerly unknown pair until a new experiment', () => {
    const progress: SavedProgress = {
      ...fresh(),
      discoveredIds: elements.slice(0, 144).map((element) => element.id),
      discoveredRecipeIds: recipes.slice(0, 178).map((recipe) => recipe.id),
      unlockedEraIds: eras.map((era) => era.id),
      activeEraId: 'iron-age',
      rewardedChallengeEraIds: eras.map((era) => era.id),
      rewardedCollectionIds: collections.map((collection) => collection.id),
      challengeRecords: learningChallenges.map((challenge) => ({
        challengeId: challenge.id, completed: true, bestAttemptCount: challenge.minimumAttempts,
      })),
      insightCredits: 1,
      insightFailureProgress: 3,
      failedPairKeys: [pairKey('rock', 'wheel')],
      experimentHistory: [{ id: 1, inputs: ['rock', 'wheel'], outcome: 'no-reaction' }],
      readHistoricalElementIds: ['metal'],
    }
    const serialized = exportProgress(progress)
    localStorage.setItem(saveKey, serialized)
    const store = createGameStore()
    expect(snapshotProgress(store.getState())).toEqual(snapshotProgress({ ...progress, failedPairKeys: [] }))
    expect(disk()).toBe(serialized)
    expect(store.getState().discoveredIds).toHaveLength(144)
    store.getState().transmuteWith('wheel', 'rock')
    expect(store.getState().lastAttempt).toMatchObject({ kind: 'discovery', resultId: 'rotary-quern' })
    expect(store.getState().experimentHistory[0]).toEqual(progress.experimentHistory[0])
    expect(store.getState().failedPairKeys).toEqual([])
    expect(store.getState().insightCredits).toBe(1)
    expect(store.getState().rewardedChallengeEraIds).toEqual(progress.rewardedChallengeEraIds)
    expect(store.getState().rewardedCollectionIds).toEqual(progress.rewardedCollectionIds)
    expect(store.getState().challengeRecords).toEqual(progress.challengeRecords)
    store.getState().toggleHistoricalRead('rotary-quern')
    expect(createGameStore().getState().readHistoricalElementIds).toEqual(['metal', 'rotary-quern'])
  })

  it('loads a pre-expansion complete catalog without granting new discoveries or repeating rewards', () => {
    const progress: SavedProgress = {
      ...fresh(),
      discoveredIds: elements.slice(0, 120).map((element) => element.id),
      discoveredRecipeIds: recipes.slice(0, 151).map((recipe) => recipe.id),
      unlockedEraIds: eras.map((era) => era.id),
      activeEraId: 'iron-age',
      rewardedChallengeEraIds: eras.map((era) => era.id),
      rewardedCollectionIds: collections.map((collection) => collection.id),
      challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 }],
      insightCredits: 1,
      favoriteIds: ['steel'],
      soundEnabled: false,
    }
    const serialized = JSON.stringify(progress)
    window.localStorage.setItem(saveKey, serialized)
    const loadedStore = createGameStore()
    expect(snapshotProgress(loadedStore.getState())).toEqual(snapshotProgress(progress))
    expect(window.localStorage.getItem(saveKey)).toBe(serialized)
    expect(loadedStore.getState().discoveredIds).toHaveLength(120)

    loadedStore.getState().transmuteWith('rain', 'rock')
    const next = loadedStore.getState()
    expect(next.discoveredIds).toEqual([...progress.discoveredIds, 'river'])
    expect(next.discoveredRecipeIds).toEqual([...progress.discoveredRecipeIds, 'rain-cut-river'])
    expect(next.insightCredits).toBe(1)
    expect(next.rewardedChallengeEraIds).toEqual(progress.rewardedChallengeEraIds)
    expect(next.rewardedCollectionIds).toEqual(progress.rewardedCollectionIds)
    expect(next.challengeRecords).toEqual(progress.challengeRecords)
    expect(next.favoriteIds).toEqual(['steel'])
    expect(next.soundEnabled).toBe(false)
    expect(snapshotProgress(createGameStore().getState())).toEqual(snapshotProgress(next))
  })

  it('keeps Lens gated to Iron Age while Wayfinding remains available in Stone Age', () => {
    useGameStore.setState({
      discoveredIds: [...starterElementIds, 'human', 'wind', 'glass', 'tool', 'copper-ore'],
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'],
      activeEraId: 'stone-age',
    })
    state().transmuteWith('human', 'wind')
    expect(state().lastAttempt).toMatchObject({ kind: 'discovery', resultId: 'compass' })
    expect(state().discoveredIds).toContain('compass')
    state().transmuteWith('glass', 'tool')
    expect(state().lastAttempt).toMatchObject({ kind: 'failure', title: 'A later page' })
    expect(state().lastAttempt?.detail).toContain('Iron Age must be unlocked first')
    expect(state().discoveredIds).not.toContain('lens')
    expect(state().revealedHintRecipeIds).toContain('ground-glass')
    expect(state().discoveredRecipeIds).not.toContain('ground-glass')
    expect(state().experimentHistory.at(-1)).toEqual({
      id: 2, inputs: ['glass', 'tool'], outcome: 'locked', lockedEraId: 'iron-age',
    })
    expect(snapshotProgress(createGameStore().getState())).toEqual(campaign())
  })

  it('loads a moved Lens without retroactive Insight and retains its formula, history and favorite', () => {
    const progress: SavedProgress = {
      ...fresh(),
      discoveredIds: [...starterElementIds, 'human', 'glass', 'tool', 'lens', 'copper-ore'],
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'],
      activeEraId: 'stone-age',
      discoveredRecipeIds: ['ground-glass'],
      experimentHistory: [{ id: 1, inputs: ['glass', 'tool'], outcome: 'discovery', resultId: 'lens', recipeId: 'ground-glass' }],
      favoriteIds: ['lens'],
      rewardedChallengeEraIds: ['first-light', 'stone-age'],
      insightCredits: 1,
    }
    const serialized = JSON.stringify(progress)
    window.localStorage.setItem(saveKey, serialized)
    const loadedStore = createGameStore()
    const loaded = loadedStore.getState()
    expect(loaded.unlockedEraIds).toContain('iron-age')
    expect(loaded.discoveredIds).toEqual([...progress.discoveredIds, 'iron-ore'])
    expect(loaded.discoveredRecipeIds).toEqual(['ground-glass'])
    expect(loaded.experimentHistory).toEqual(progress.experimentHistory)
    expect(loaded.favoriteIds).toEqual(['lens'])
    expect(loaded.insightCredits).toBe(1)
    expect(loaded.rewardedChallengeEraIds).toEqual(progress.rewardedChallengeEraIds)
    expect(window.localStorage.getItem(saveKey)).toBe(serialized)
    loadedStore.getState().toggleSound()
    expect(snapshotProgress(createGameStore().getState())).toEqual(snapshotProgress(loadedStore.getState()))
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

  it('loads earlier Age V completions without rewarding or inventing optional objective progress', () => {
    const progress: SavedProgress = {
      ...fresh(),
      discoveredIds: elements.slice(0, 158).map((element) => element.id),
      discoveredRecipeIds: recipes.slice(0, 194).map((recipe) => recipe.id),
      unlockedEraIds: eras.map((era) => era.id),
      activeEraId: 'classical-antiquity',
      rewardedChallengeEraIds: eras.map((era) => era.id),
      rewardedCollectionIds: collections.slice(0, 6).map((collection) => collection.id),
      challengeRecords: learningChallenges.slice(0, 3).map((challenge) => ({
        challengeId: challenge.id, completed: true, bestAttemptCount: challenge.minimumAttempts,
      })),
      insightCredits: 2,
      favoriteIds: ['agora', 'bird'],
    }
    const serialized = exportProgress(progress)
    localStorage.setItem(saveKey, serialized)
    const reloaded = createGameStore()
    expect(snapshotProgress(reloaded.getState())).toEqual(snapshotProgress(progress))
    expect(disk()).toBe(serialized)
    expect(reloaded.getState().rewardedCollectionIds).toHaveLength(6)
    expect(reloaded.getState().challengeRecords).toHaveLength(3)
  })

  it.each(collections)('rewards $name in the discovery transaction exactly once without reading', (collection) => {
    const resultId = collection.elementIds[collection.elementIds.length - 1]
    const recipe = recipes.find((entry) => entry.result === resultId)!
    const priorRewards = collections.filter((entry) => entry.id !== collection.id).map((entry) => entry.id)
    useGameStore.setState({
      discoveredIds: [...new Set([...starterElementIds, ...collection.elementIds.filter((id) => id !== recipe.result), ...recipe.inputs])],
      insightCredits: 0, favoriteIds: ['ember'], soundEnabled: false,
      challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 5 }],
      unlockedEraIds: eras.map((era) => era.id),
      rewardedChallengeEraIds: eras.map((era) => era.id),
      rewardedCollectionIds: priorRewards,
    })
    state().transmuteWith(...recipe.inputs)
    expect(state().rewardedCollectionIds).toEqual([...priorRewards, collection.id])
    expect(state().insightCredits).toBe(1)
    expect(state().lastAttempt?.insightEarned).toBe(1)
    expect(state().readHistoricalElementIds).toEqual([])
    expect(loadProgress()).toEqual({ version: 7, ...campaign() })
    state().transmuteWith(...recipe.inputs)
    expect(state().insightCredits).toBe(1)
    expect(state().rewardedCollectionIds).toEqual([...priorRewards, collection.id])
    expect(state().lastAttempt?.insightEarned).toBe(0)
    const progress = loadProgress()!
    useGameStore.setState(snapshotProgress(progress))
    expect(state().insightCredits).toBe(1)
    state().transmuteWith(...recipe.inputs)
    expect(state().insightCredits).toBe(1)
  })

  it('preserves all old completions on upgrade and awards only new landmark receipts on a successful combination', async () => {
    const oldCollections = collections.filter((collection) => !collection.landmarkId).map((collection) => collection.id)
    const oldChallenges = [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
      ...learningChallenges.slice(0, 7).map((challenge) => ({
        challengeId: challenge.id, completed: true, bestAttemptCount: challenge.minimumAttempts,
      }))]
    const progress = {
      ...fresh(), discoveredIds: elements.map((element) => element.id),
      unlockedEraIds: eras.map((era) => era.id), rewardedChallengeEraIds: eras.map((era) => era.id),
      rewardedCollectionIds: oldCollections, challengeRecords: oldChallenges, insightCredits: 0,
    }
    localStorage.setItem(saveKey, exportProgress(progress))
    const upgraded = createGameStore()
    expect({ version: 7, ...snapshotProgress(upgraded.getState()) }).toEqual(progress)
    upgraded.getState().transmuteWith('gale', 'tide')
    expect(upgraded.getState().rewardedCollectionIds).toEqual(oldCollections)
    upgraded.getState().transmuteWith('ember', 'tide')
    expect(upgraded.getState().rewardedCollectionIds).toEqual(collections.map((collection) => collection.id))
    expect(upgraded.getState().insightCredits).toBe(3)
    expect(upgraded.getState().challengeRecords).toEqual(oldChallenges)
    expect(upgraded.getState().rewardedChallengeEraIds).toEqual(progress.rewardedChallengeEraIds)
    expect(await upgraded.getState().recordChallengeCompletion('civic-foundations', 2))
      .toMatchObject({ saved: true, firstCompletion: true, insightEarned: 0 })
    const reloaded = createGameStore()
    expect(reloaded.getState().rewardedCollectionIds).toEqual(collections.map((collection) => collection.id))
    expect(reloaded.getState().challengeRecords).toEqual([
      ...oldChallenges, { challengeId: 'civic-foundations', completed: true, bestAttemptCount: 2 },
    ])
    expect(await reloaded.getState().recordChallengeCompletion('civic-foundations', 3))
      .toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
  })

  it('awards an existing engineering collection and its supporting landmark independently', () => {
    useGameStore.setState({
      discoveredIds: [...starterElementIds, 'masonry', 'aqueduct', 'arch', 'city'],
      unlockedEraIds: eras.map((era) => era.id),
      rewardedChallengeEraIds: eras.map((era) => era.id), insightCredits: 0,
    })
    state().transmuteWith('arch', 'city')
    expect(state().rewardedCollectionIds).toEqual(['classical-engineering', 'aqueduct-landmark'])
    expect(state().insightCredits).toBe(2)
    state().transmuteWith('arch', 'city')
    expect(state().insightCredits).toBe(2)
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