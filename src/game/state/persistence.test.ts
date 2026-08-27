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
      version: 5,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: [],
      hintCredits: 3,
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
      version: 5,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      hintCredits: 3,
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
      version: 5,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      hintCredits: 2,
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
      version: 5,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      hintCredits: 2,
      revealedHintRecipeIds: [],
      failedPairKeys: ['gale::tide'],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    })
  })

  it('writes version 5 progress, hints, failures, and era state', () => {
    expect(
      saveProgress(
        ['ember', 'steam'],
        ['first-vapor'],
        2,
        ['concentrated-flame'],
        ['gale::tide'],
        ['first-light', 'stone-age'],
        'stone-age',
      ),
    ).toBe(true)
    expect(loadProgress()).toEqual({
      version: 5,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: ['first-vapor'],
      hintCredits: 2,
      revealedHintRecipeIds: ['concentrated-flame'],
      failedPairKeys: ['gale::tide'],
      unlockedEraIds: ['first-light', 'stone-age'],
      activeEraId: 'stone-age',
    })
  })
})