// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { collections, elements, eras, starterElementIds } from '../content'
import { createProgressPersistence, CONFLICT_ERROR, exportProgress, loadProgress, readProgress, MAX_EXPERIMENT_HISTORY, MAX_SAVE_BYTES, parseProgress, saveProgress, type SavedProgress } from './persistence'

const defaults = {
  favoriteIds: [], soundEnabled: true, experimentHistory: [],
  rewardedCollectionIds: [], challengeRecords: [],
}

function fresh(): SavedProgress {
  return parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!
}

describe('progress persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('distinguishes missing, invalid, loaded and unreadable saves without writing', () => {
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    expect(readProgress()).toEqual({ status: 'missing', raw: null })
    for (const raw of ['', '{', JSON.stringify({ version: 99 })]) {
      window.localStorage.setItem('unwritten-atlas-progress', raw)
      writes.mockClear()
      expect(readProgress()).toEqual({ status: 'failed', reason: 'invalid' })
      expect(window.localStorage.getItem('unwritten-atlas-progress')).toBe(raw)
      expect(writes).not.toHaveBeenCalled()
    }
    const raw = exportProgress(fresh())
    window.localStorage.setItem('unwritten-atlas-progress', raw)
    expect(readProgress()).toEqual({ status: 'loaded', raw, progress: fresh() })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(readProgress()).toEqual({ status: 'failed', reason: 'unavailable' })
  })

  it('serializes competing tabs and refuses a stale queued snapshot', async () => {
    const callbacks: Array<() => void> = []
    vi.stubGlobal('navigator', { locks: { request: vi.fn((_name, _options, callback) =>
      new Promise((resolve) => { callbacks.push(() => resolve(callback())) })) } })
    const first = createProgressPersistence()
    const second = createProgressPersistence()
    const firstProgress = { ...fresh(), favoriteIds: ['ember'] }
    const secondProgress = { ...fresh(), soundEnabled: false }
    const firstWrite = first.write(firstProgress)
    const secondWrite = second.write(secondProgress)
    callbacks.shift()!()
    expect(await firstWrite).toBe(true)
    const original = localStorage.getItem('unwritten-atlas-progress')
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    callbacks.shift()!()
    expect(await secondWrite).toBe(false)
    expect(second.error).toBe(CONFLICT_ERROR)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(original)
    expect(writes).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('adopts external saves only when clean and ignores delayed unchanged events', () => {
    const clean = createProgressPersistence()
    const dirty = createProgressPersistence()
    const progress = { ...fresh(), favoriteIds: ['ember'] }
    saveProgress(progress)
    expect(clean.synchronize(fresh())).toEqual(progress)
    expect(clean.synchronize(progress)).toBeNull()
    expect(dirty.synchronize({ ...fresh(), soundEnabled: false })).toBeNull()
    expect(dirty.error).toBe(CONFLICT_ERROR)
    localStorage.removeItem('unwritten-atlas-progress')
    expect(clean.synchronize(progress)).toEqual(fresh())
    expect(dirty.synchronize(fresh())).toBeNull()
    expect(dirty.error).toBe(CONFLICT_ERROR)
  })

  it('blocks saving without Web Locks rather than using unsafe writes', async () => {
    vi.stubGlobal('navigator', {})
    const persistence = createProgressPersistence()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    expect(await persistence.write(fresh())).toBe(false)
    expect(persistence.error).toContain('Safe saving is unavailable')
    expect(writes).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('latches lock rejection and preserves the original save', async () => {
    const original = exportProgress(fresh())
    localStorage.setItem('unwritten-atlas-progress', original)
    vi.stubGlobal('navigator', { locks: { request: () => Promise.reject(new Error('denied')) } })
    const persistence = createProgressPersistence()
    expect(await persistence.write({ ...fresh(), soundEnabled: false })).toBe(false)
    expect(persistence.error).toContain('Safe saving is unavailable')
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(original)
    expect(persistence.synchronize(fresh())).toBeNull()
    vi.unstubAllGlobals()
  })

  it('migrates version 1 element progress without inventing recipe history', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({ version: 1, discoveredIds: ['ember', 'steam'] }),
    )

    expect(loadProgress()).toEqual({
      ...defaults,
      version: 7,
      discoveredIds: [...starterElementIds, 'steam'],
      discoveredRecipeIds: [],
      insightCredits: 3,
      insightFailureProgress: 0,
      rewardedChallengeEraIds: [],
      revealedHintRecipeIds: [],
      failedPairKeys: [],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    })
  })

  it('migrates version 2 progress with fresh hint credits', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({
        version: 2,
        discoveredIds: ['ember', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
      }),
    )

    expect(loadProgress()).toEqual({
      ...defaults,
      version: 7,
      discoveredIds: [...starterElementIds, 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 3,
      insightFailureProgress: 0,
      rewardedChallengeEraIds: [],
      revealedHintRecipeIds: [],
      failedPairKeys: [],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    })
  })

  it('migrates version 3 progress without failed pair history', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({
        version: 3,
        discoveredIds: ['ember', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
        hintCredits: 2,
        revealedHintRecipeIds: ['concentrated-flame'],
      }),
    )

    expect(loadProgress()).toEqual({
      ...defaults,
      version: 7,
      discoveredIds: [...starterElementIds, 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 2,
      insightFailureProgress: 0,
      rewardedChallengeEraIds: [],
      revealedHintRecipeIds: ['concentrated-flame'],
      failedPairKeys: [],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    })
  })

  it('migrates version 4 progress into Origins', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({
        version: 4,
        discoveredIds: ['ember', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
        hintCredits: 2,
        revealedHintRecipeIds: [],
        failedPairKeys: ['gale::tide'],
      }),
    )

    expect(loadProgress()).toEqual({
      ...defaults,
      version: 7,
      discoveredIds: [...starterElementIds, 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 2,
      insightFailureProgress: 0,
      rewardedChallengeEraIds: [],
      revealedHintRecipeIds: [],
      failedPairKeys: ['gale::tide'],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    })
  })

  it('drops failed pairs that are valid in the current recipe graph', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({
        version: 4,
        discoveredIds: ['ember', 'land', 'stone'],
        discoveredRecipeIds: [],
        hintCredits: 3,
        revealedHintRecipeIds: [],
        failedPairKeys: ['land::stone', 'gale::tide'],
      }),
    )

    expect(loadProgress()?.failedPairKeys).toEqual(['gale::tide'])
  })

  it('migrates version 5 credits and open leads into Insights', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({
        version: 5,
        discoveredIds: ['ember', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
        hintCredits: 2,
        revealedHintRecipeIds: ['concentrated-flame'],
        failedPairKeys: ['gale::tide'],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }),
    )

    expect(loadProgress()).toMatchObject({
      version: 7,
      insightCredits: 2,
      insightFailureProgress: 0,
      revealedHintRecipeIds: ['concentrated-flame'],
    })
  })

  it('writes version 7 Insight, failure, and era state with legacy input defaults', () => {
    expect(
      saveProgress({
        discoveredIds: ['ember', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
        insightCredits: 2,
        insightFailureProgress: 4,
        rewardedChallengeEraIds: ['first-light'],
        revealedHintRecipeIds: ['concentrated-flame'],
        failedPairKeys: ['gale::tide'],
        unlockedEraIds: ['first-light', 'stone-age'],
        activeEraId: 'stone-age',
      }),
    ).toBe(true)
    expect(loadProgress()).toEqual({
      ...defaults,
      version: 7,
      discoveredIds: [...starterElementIds, 'steam', 'human'],
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 2,
      insightFailureProgress: 4,
      rewardedChallengeEraIds: ['first-light'],
      revealedHintRecipeIds: ['concentrated-flame'],
      failedPairKeys: ['gale::tide'],
      unlockedEraIds: ['first-light', 'stone-age'],
      activeEraId: 'stone-age',
    })
  })

  it('migrates version 6 and clamps legacy credits without inventing history', () => {
    const progress = { ...fresh(), version: 6, insightCredits: 99 }
    expect(parseProgress(JSON.stringify(progress))).toEqual({ ...fresh(), insightCredits: 3 })
    expect(parseProgress(JSON.stringify({ ...progress, version: 5, hintCredits: 99 }))).toEqual(fresh())
  })

  it('round trips every v7 field and serializes no actions or transient state', () => {
    const progress: SavedProgress = {
      ...fresh(), discoveredIds: [...starterElementIds, 'steam'],
      discoveredRecipeIds: ['first-vapor'], favoriteIds: ['steam'], soundEnabled: false,
      experimentHistory: [{ id: 8, inputs: ['ember', 'tide'], outcome: 'discovery', resultId: 'steam', recipeId: 'first-vapor' }],
      challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 }],
    }
    const serialized = exportProgress({ ...progress, firstSlotId: 'ember', action: 'transient' } as SavedProgress)
    expect(JSON.parse(serialized)).toEqual(progress)
    expect(parseProgress(serialized)).toEqual(progress)
    expect(saveProgress(progress)).toBe(true)
    expect(loadProgress()).toEqual(progress)
  })

  it.each([
    '{', 'null', '{}', JSON.stringify({ version: 8, discoveredIds: [] }),
    JSON.stringify({ version: 0, discoveredIds: [] }),
    JSON.stringify({ version: 1, discoveredIds: [1] }),
  ])('rejects malformed or unsupported saves: %s', (raw) => {
    expect(parseProgress(raw)).toBeNull()
  })

  it('rejects malformed v7 fields and out-of-range values', () => {
    for (const patch of [
      { favoriteIds: null }, { soundEnabled: 'true' }, { insightCredits: 4 },
      { insightFailureProgress: 5 }, { experimentHistory: [{ id: 1, inputs: ['ember'], outcome: 'known' }] },
      { challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 3 }] },
    ]) expect(parseProgress(JSON.stringify({ ...fresh(), ...patch }))).toBeNull()
  })

  it('enforces byte limits including multibyte input', () => {
    expect(parseProgress(' '.repeat(MAX_SAVE_BYTES + 1))).toBeNull()
    expect(parseProgress(JSON.stringify({ version: 1, discoveredIds: [], ignored: '\u00e9'.repeat(MAX_SAVE_BYTES / 2) }))).toBeNull()
    expect(saveProgress({ ...fresh(), failedPairKeys: ['x'.repeat(MAX_SAVE_BYTES)] })).toBe(false)
  })

  it('normalizes references, canonicalizes failures and retains historical no-reactions', () => {
    const progress = parseProgress(JSON.stringify({
      ...fresh(), discoveredIds: ['ember', 'ember', 'steam', 'missing'],
      discoveredRecipeIds: ['first-vapor', 'first-vapor', 'missing', 'rainfall'],
      revealedHintRecipeIds: ['concentrated-flame', 'missing', 'rainfall'],
      favoriteIds: ['ember', 'ember', 'rain', 'missing'],
      failedPairKeys: ['tide::gale', 'gale::tide', 'ember::tide', 'missing::ember', 'ember', 'ember::tide::gale'],
      unlockedEraIds: ['missing', 'first-light', 'first-light'], activeEraId: 'missing',
      rewardedChallengeEraIds: ['first-light', 'first-light', 'missing'], rewardedCollectionIds: ['missing'],
      experimentHistory: [
        { id: 1, inputs: ['ember', 'tide'], outcome: 'no-reaction' },
        { id: 2, inputs: ['missing', 'tide'], outcome: 'no-reaction' },
        { id: 3, inputs: ['ember', 'tide'], outcome: 'locked', lockedEraId: 'stone-age', resultId: 'steam' },
        { id: 4, inputs: ['ember', 'tide'], outcome: 'known', recipeId: 'first-vapor', resultId: 'rain' },
      ],
      challengeRecords: [{ challengeId: 'unknown', completed: true, bestAttemptCount: 4 }],
    }))!
    expect(progress.discoveredIds).toEqual([...starterElementIds, 'steam'])
    expect(progress.discoveredRecipeIds).toEqual(['first-vapor'])
    expect(progress.revealedHintRecipeIds).toEqual(['concentrated-flame'])
    expect(progress.favoriteIds).toEqual(['ember'])
    expect(progress.failedPairKeys).toEqual(['gale::tide'])
    expect(progress.activeEraId).toBe('first-light')
    expect(progress.rewardedChallengeEraIds).toEqual(['first-light'])
    expect(progress.rewardedCollectionIds).toEqual([])
    expect(progress.challengeRecords).toEqual([])
    expect(progress.experimentHistory).toEqual([{ id: 1, inputs: ['ember', 'tide'], outcome: 'no-reaction' }])
  })

  it('caps oldest-first history at the newest 50 and deduplicates sequence IDs', () => {
    const history = Array.from({ length: 60 }, (_, index) => ({ id: index + 1, inputs: ['gale', 'tide'], outcome: 'no-reaction' }))
    const parsed = parseProgress(JSON.stringify({ ...fresh(), experimentHistory: [...history.reverse(), history[0]] }))!
    expect(parsed.experimentHistory).toHaveLength(MAX_EXPERIMENT_HISTORY)
    expect(parsed.experimentHistory[0].id).toBe(11)
    expect(parsed.experimentHistory.at(-1)?.id).toBe(60)
  })

  it('reconciles legacy eras and grants without minting Insight rewards', () => {
    const discoveries = elements.map((element) => element.id)
    for (const version of [1, 2, 3, 4, 5, 6]) {
      const parsed = parseProgress(JSON.stringify({
        ...fresh(), version, discoveredIds: discoveries, hintCredits: 1, insightCredits: 1,
      }))!
      expect(parsed.unlockedEraIds).toEqual(eras.map((era) => era.id))
      expect(parsed.insightCredits).toBe(version < 3 ? 3 : 1)
      expect(parsed.experimentHistory).toEqual([])
      expect(parsed.rewardedCollectionIds).toEqual(collections.map((collection) => collection.id))
      expect(parsed.rewardedChallengeEraIds).toEqual(version === 5 ? eras.map((era) => era.id) : [])
    }
  })

  it('uses the same parser for loading and handles unavailable storage', () => {
    const raw = exportProgress(fresh())
    window.localStorage.setItem('unwritten-atlas-progress', raw)
    expect(loadProgress()).toEqual(parseProgress(raw))
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(loadProgress()).toBeNull()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(saveProgress(fresh())).toBe(false)
  })

  it('retains v7 reward markers but never retrospectively rewards unmarked imports or reloads', () => {
    const progress = { ...fresh(), discoveredIds: elements.map((element) => element.id), insightCredits: 0 }
    expect(parseProgress(exportProgress(progress))?.rewardedCollectionIds).toEqual([])
    const marked = { ...progress, rewardedCollectionIds: [collections[0].id, collections[0].id, 'missing'] }
    expect(saveProgress(marked)).toBe(true)
    expect(loadProgress()?.rewardedCollectionIds).toEqual([collections[0].id])
    expect(loadProgress()?.insightCredits).toBe(0)
  })

  it('unlocks the Iron gate and grants ore without a loading reward', () => {
    const parsed = parseProgress(exportProgress({
      ...fresh(), discoveredIds: ['bronze', 'forge', 'law', 'city'], insightCredits: 0,
    }))!
    expect(parsed.unlockedEraIds).toContain('iron-age')
    expect(parsed.discoveredIds).toContain('iron-ore')
    expect(parsed.insightCredits).toBe(0)
    expect(parsed.rewardedCollectionIds).toEqual([])
  })
})