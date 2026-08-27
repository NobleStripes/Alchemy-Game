// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { loadProgress, saveProgress } from './persistence'

describe('progress persistence', () => {
  beforeEach(() => window.localStorage.clear())

  it('migrates version 1 element progress without inventing recipe history', () => {
    window.localStorage.setItem(
      'unwritten-atlas-progress',
      JSON.stringify({ version: 1, discoveredIds: ['ember', 'steam'] }),
    )

    expect(loadProgress()).toEqual({
      version: 6,
      discoveredIds: ['ember', 'steam'],
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
      version: 6,
      discoveredIds: ['ember', 'steam'],
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
      version: 6,
      discoveredIds: ['ember', 'steam'],
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
      version: 6,
      discoveredIds: ['ember', 'steam'],
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
      version: 6,
      insightCredits: 2,
      insightFailureProgress: 0,
      revealedHintRecipeIds: ['concentrated-flame'],
    })
  })

  it('writes version 6 Insight, failure, and era state', () => {
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
      version: 6,
      discoveredIds: ['ember', 'steam'],
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
})