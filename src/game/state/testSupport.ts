import { afterEach, beforeEach, vi } from 'vitest'
import { createGameStore } from './useGameStore'

const holder = vi.hoisted(() => ({ store: null as ReturnType<typeof createGameStore> | null }))

vi.mock('./useGameStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useGameStore')>()
  holder.store = actual.useGameStore
  return { ...actual, get useGameStore() { return holder.store } }
})

beforeEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: (_name: string, _options: LockOptions, callback: LockGrantedCallback<unknown>) => {
        try { return Promise.resolve(callback(null)) } catch (error) { return Promise.reject(error) }
      },
    },
  })
  localStorage.clear()
  holder.store = createGameStore()
})

afterEach(async () => { await holder.store?.flushProgress() })