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
      version: 2,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: [],
    })
  })

  it('writes version 2 element and recipe progress', () => {
    expect(saveProgress(['ember', 'steam'], ['first-vapor'])).toBe(true)
    expect(loadProgress()).toEqual({
      version: 2,
      discoveredIds: ['ember', 'steam'],
      discoveredRecipeIds: ['first-vapor'],
    })
  })
})