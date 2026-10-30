// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportProgress, parseProgress, SAVE_KEY } from './persistence.ts'
import { createDurableModulePersistence, readDurableModuleSave, DURABLE_CONFLICT } from './durableModulePersistence.ts'
import { createModuleSaveEnvelope, type ModuleOwnership } from './moduleProgress.ts'

const owner: ModuleOwnership = {
  moduleId: 'achaemenid', version: '1.0.0',
  elementIds: ['achaemenid-royal-road'],
  recipeIds: ['achaemenid-route'],
  collectionIds: ['achaemenid-collection'],
  challengeIds: ['achaemenid-lab'],
  researchElementIds: ['achaemenid-royal-road'],
}
const fresh = () => parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!
afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
function locks() {
  vi.stubGlobal('navigator', { locks: { request: (_name: string, _options: unknown, cb: () => boolean) =>
    Promise.resolve(cb()) } })
}

describe('Phase 10C durable module transactions', () => {
  it('migrates a legacy v7 save atomically and preserves its original fields', async () => {
    locks()
    const legacy = { ...fresh(), favoriteIds: ['ember'] }
    localStorage.setItem(SAVE_KEY, exportProgress(legacy))
    const persistence = createDurableModulePersistence()
    expect(persistence.initial?.progress).toEqual(legacy)
    expect(await persistence.writeActive(legacy)).toBe(true)
    const disk = readDurableModuleSave()
    expect(disk.status).toBe('loaded')
    if (disk.status === 'loaded') {
      expect(disk.legacy).toBe(false)
      expect(disk.archive.progress).toEqual(legacy)
    }
    expect(parseProgress(localStorage.getItem(SAVE_KEY)!)).toBeNull()
  })

  it('preserves dormant discoveries, favorites, and earned receipts during active writes', async () => {
    locks()
    const core = fresh()
    const archived = createModuleSaveEnvelope({
      ...core,
      discoveredIds: [...core.discoveredIds, 'achaemenid-royal-road'],
      favoriteIds: ['achaemenid-royal-road'],
      discoveredRecipeIds: ['achaemenid-route'],
      rewardedCollectionIds: ['achaemenid-collection'],
      challengeRecords: [{ challengeId: 'achaemenid-lab', completed: true, bestAttemptCount: 3 }],
    }, [owner])
    localStorage.setItem(SAVE_KEY, JSON.stringify(archived))
    const persistence = createDurableModulePersistence()
    expect(await persistence.writeActive({ ...core, soundEnabled: false })).toBe(true)
    const result = readDurableModuleSave()
    if (result.status !== 'loaded') throw new Error('Archive absent')
    expect(result.archive.progress.discoveredIds).toContain('achaemenid-royal-road')
    expect(result.archive.progress.favoriteIds).toEqual(['achaemenid-royal-road'])
    expect(result.archive.progress.challengeRecords[0].completed).toBe(true)
    expect(result.archive.progress.soundEnabled).toBe(false)
  })

  it('protects new save data from old-format writes by making it unreadable to v7', async () => {
    locks()
    const p = createDurableModulePersistence()
    expect(await p.writeActive(fresh())).toBe(true)
    expect(parseProgress(localStorage.getItem(SAVE_KEY)!)).toBeNull()
  })

  it('blocks conflicting tabs and preserves the winner', async () => {
    locks()
    const first = createDurableModulePersistence()
    const second = createDurableModulePersistence()
    expect(await first.writeActive({ ...fresh(), soundEnabled: false })).toBe(true)
    const winner = localStorage.getItem(SAVE_KEY)
    expect(await second.writeActive(fresh())).toBe(false)
    expect(second.error).toBe(DURABLE_CONFLICT)
    expect(localStorage.getItem(SAVE_KEY)).toBe(winner)
  })

  it('rejects corrupt saves before writing', async () => {
    locks()
    localStorage.setItem(SAVE_KEY, '{"version":99}')
    const p = createDurableModulePersistence()
    expect(p.blocked).toBe(true)
    expect(await p.writeActive(fresh())).toBe(false)
    expect(localStorage.getItem(SAVE_KEY)).toBe('{"version":99}')
  })

  it('requires locks and leaves original v7 bytes untouched without them', async () => {
    vi.stubGlobal('navigator', {})
    const old = exportProgress(fresh())
    localStorage.setItem(SAVE_KEY, old)
    const p = createDurableModulePersistence()
    expect(await p.writeActive(fresh())).toBe(false)
    expect(localStorage.getItem(SAVE_KEY)).toBe(old)
  })
})
