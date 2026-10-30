// @vitest-environment jsdom
import './testSupport'
import { describe, expect, it, vi } from 'vitest'
import { coreRuntimeCatalog as core } from '../content/runtimeCatalog'
import { createModuleSaveEnvelope, parseModuleSaveEnvelope } from './moduleProgress'
import { exportProgress, freshProgress, MAX_SAVE_BYTES, parseProgress, SAVE_KEY } from './persistence'
import { previewSaveImport } from './saveManagement'
import { legacyArchive, legacyOwnership } from './legacyArchiveFixture'
import { createGameStore, snapshotProgress } from './useGameStore'

const raw = () => localStorage.getItem(SAVE_KEY)!

describe('base-game save management', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])('loads v%i without a startup write and saves only as v7', async (version) => {
    const original = JSON.stringify({ ...freshProgress(), version, hintCredits: 2 })
    localStorage.setItem(SAVE_KEY, original)
    const store = createGameStore()
    expect(snapshotProgress(store.getState())).toEqual(snapshotProgress(parseProgress(original)!))
    expect(raw()).toBe(original)
    expect(await store.exportSave()).toBe(original)
    store.getState().toggleFavorite('ember')
    await store.flushProgress()
    expect(store.getState().saveFormat).toBe('legacy')
    expect(JSON.parse(raw())).toMatchObject({ version: 7, favoriteIds: ['ember'] })
    expect(parseModuleSaveEnvelope(raw())).toBeNull()
  })

  it.each(['achaemenid', 'lost-region'])('imports %s archives without activating content or discarding inactive records', async (moduleId) => {
    const owner = moduleId === 'achaemenid' ? legacyOwnership : {
      moduleId, version: '9.0.0', elementIds: ['lost-region-discovery'], recipeIds: ['lost-region-formula'],
      collectionIds: ['lost-region-reward'], researchElementIds: ['lost-region-discovery'], challengeIds: ['lost-region-lab'],
    }
    const imported = legacyArchive([moduleId], owner)
    const store = createGameStore()
    const original = localStorage.getItem(SAVE_KEY)
    const preview = await store.previewImport(JSON.stringify(imported))
    expect(preview.dormantDiscoveries).toBe(owner.elementIds.length)
    expect(preview.activeDiscoveries).toBe(5)
    expect(preview.warnings.join(' ')).toMatch(/remain inactive/)
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
    await store.confirmSaveReplacement(preview)
    const reloaded = createGameStore()
    expect(reloaded.getState().catalog).toBe(core)
    expect(parseModuleSaveEnvelope(raw())).toEqual({ ...imported, enabledModuleIds: [] })
    reloaded.getState().toggleSound()
    await reloaded.flushProgress()
    expect(parseModuleSaveEnvelope(raw())?.progress).toEqual({ ...imported.progress, soundEnabled: false })
  })

  it('permits changed legacy ownership versions because all DLC remains inactive', async () => {
    const owner = { ...legacyOwnership, version: '9.0.0', elementIds: [...legacyOwnership.elementIds, 'achaemenid-retired'] }
    const imported = legacyArchive(['achaemenid'], owner)
    localStorage.setItem(SAVE_KEY, JSON.stringify(imported))
    const store = createGameStore()
    expect(store.getState().persistenceError).toBeNull()
    store.getState().toggleSound()
    await store.flushProgress()
    expect(parseModuleSaveEnvelope(raw())?.ownership).toEqual([owner])
  })

  it('previews legacy replacement and keeps an existing archive in archive format', async () => {
    const imported = { ...freshProgress(), favoriteIds: ['ember'], soundEnabled: false }
    let store = createGameStore()
    const preview = await store.previewImport(exportProgress(imported))
    expect(preview.format).toBe('legacy')
    expect(preview.warnings.join(' ')).toMatch(/replaces ALL/)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
    await store.confirmSaveReplacement(preview)
    expect(JSON.parse(raw())).toEqual(imported)
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    store = createGameStore()
    const resetPreview = await store.previewImport(exportProgress(imported))
    expect(resetPreview.format).toBe('archive')
    await store.confirmSaveReplacement(resetPreview)
    expect(parseModuleSaveEnvelope(raw())?.progress).toEqual(imported)
    expect(parseModuleSaveEnvelope(raw())?.ownership).toEqual([])
  })

  it('preserves original bytes on failed replacement and allows retry', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    const original = raw()
    const store = createGameStore()
    const preview = await store.previewImport(exportProgress(freshProgress()))
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/could not be validated or saved/)
    expect(raw()).toBe(original)
    expect(await store.exportSave()).toBe(original)
    expect(store.getState().reloadRequired).toBe(false)
    writes.mockRestore()
    await store.confirmSaveReplacement(preview)
    expect(store.getState().reloadRequired).toBe(true)
    const replaced = raw()
    store.getState().toggleSound()
    await store.flushProgress()
    expect(raw()).toBe(replaced)
  })

  it('requires locks for replacement and protects a competing tab winner', async () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(legacyArchive()))
    const store = createGameStore()
    const preview = await store.previewImport(exportProgress(freshProgress()))
    const original = raw()
    const locks = navigator.locks
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/Web Locks/)
    expect(raw()).toBe(original)
    Object.defineProperty(navigator, 'locks', { configurable: true, value: locks })
    localStorage.setItem(SAVE_KEY, exportProgress({ ...freshProgress(), soundEnabled: false }))
    const winner = raw()
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/changed externally/)
    expect(raw()).toBe(winner)
  })

  it('rejects stale and tampered previews', async () => {
    const store = createGameStore()
    const preview = await store.previewImport(exportProgress(freshProgress()))
    store.getState().toggleFavorite('ember')
    await store.flushProgress()
    const newer = raw()
    await expect(store.confirmSaveReplacement(preview)).rejects.toThrow(/changed after preview/)
    expect(raw()).toBe(newer)
    const valid = await store.previewImport(exportProgress(freshProgress()))
    await expect(store.confirmSaveReplacement({ ...valid, replacementRaw: '{"version":99}' })).rejects.toThrow(/invalid|unsupported/)
    expect(raw()).toBe(newer)
  })

  it.each([
    '{"version":99,"discoveredIds":[]}',
    '{"format":"unwritten-atlas-module-save","envelopeVersion":2}',
    '{"version":7',
    'x'.repeat(MAX_SAVE_BYTES + 1),
  ])('rejects invalid, future or oversized imports without writing (%#)', async (input) => {
    localStorage.setItem(SAVE_KEY, exportProgress(freshProgress()))
    const original = raw()
    await expect(createGameStore().previewImport(input)).rejects.toThrow(/invalid|unsupported|1 MiB/)
    expect(raw()).toBe(original)
  })

  it('protects invalid existing archives while allowing exact backup export', async () => {
    const archive = legacyArchive()
    archive.ownership[0].elementIds.push('ember')
    const original = JSON.stringify(archive)
    localStorage.setItem(SAVE_KEY, original)
    const store = createGameStore()
    expect(store.getState().persistenceError).toBeTruthy()
    expect(await store.exportSave()).toBe(original)
    store.getState().resetProgress()
    await store.flushProgress()
    await expect(store.previewImport(exportProgress(freshProgress()))).rejects.toThrow()
    expect(raw()).toBe(original)
  })

  it('reports unreadable storage instead of silently exporting a new campaign', async () => {
    const store = createGameStore()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    await expect(store.exportSave()).rejects.toThrow(/cannot be read/)
  })

  it('rejects forged ownership, invalid core receipts and duplicate challenge records', () => {
    const forged = createModuleSaveEnvelope(freshProgress(), [{
      ...legacyOwnership, elementIds: ['ember'], researchElementIds: [],
    }])
    expect(() => previewSaveImport(JSON.stringify(forged), null)).toThrow(/namespace|core/)
    const invalid = createModuleSaveEnvelope({ ...freshProgress(), discoveredRecipeIds: [core.recipes[0].id] }, [])
    expect(() => previewSaveImport(JSON.stringify(invalid), null)).toThrow(/Invalid active formula/)
    const duplicates = createModuleSaveEnvelope({
      ...freshProgress(), challengeRecords: [
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
      ],
    }, [])
    expect(() => previewSaveImport(JSON.stringify(duplicates), null)).toThrow(/Duplicate/)
  })
})
