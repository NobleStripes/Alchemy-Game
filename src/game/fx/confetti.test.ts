// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { triggerConfetti } from './confetti'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('discovery motion preference', () => {
  it('does not create animated canvas effects when reduced motion is requested', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    triggerConfetti()
    expect(context).not.toHaveBeenCalled()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('still attempts the effect without reduced motion and removes unsupported canvases', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    triggerConfetti()
    expect(context).toHaveBeenCalledOnce()
    expect(document.querySelector('canvas')).toBeNull()
  })
})
