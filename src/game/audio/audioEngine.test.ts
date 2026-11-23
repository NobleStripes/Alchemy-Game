// @vitest-environment jsdom

import { afterEach, expect, it, vi } from 'vitest'
import { createGameStore } from '../state/useGameStore'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('keeps selection usable when the browser cannot create an audio context', () => {
  const error = new Error('Audio context unavailable')
  vi.stubGlobal('AudioContext', vi.fn(function () { throw error }))
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const store = createGameStore()

  expect(() => store.getState().selectElement('ember')).not.toThrow()
  expect(store.getState().firstSlotId).toBe('ember')
  expect(warning).toHaveBeenCalledWith('Game audio could not be initialized.', error)
})
