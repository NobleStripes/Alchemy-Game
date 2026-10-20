import { describe, expect, it } from 'vitest'
import { runtimeCatalog } from './runtimeCatalog.ts'
import { resolveFullRuntimeCatalog } from './fullRegistry.ts'

function pack() {
  return {
    manifest: {
      schemaVersion: 1, id: 'test-region', version: '1.0.0',
      minimumCoreVersion: '0.0.0', title: 'Synthetic Test Region',
      description: 'Only a test fixture, not researched history.',
      regions: ['Synthetic region'], historicalPeriod: 'Test',
      targetEraIds: ['classical-antiquity'], dependencies: [],
    },
    elements: [{
      id: 'test-region-marker', name: 'Synthetic Marker', sigil: 'SM',
      category: 'knowledge', description: 'Not historical content.',
      starter: false, era: 'classical-antiquity',
    }],
    recipes: [{
      id: 'test-region-formula', inputs: ['rock', 'academy'],
      result: 'test-region-marker', flavor: 'Synthetic test association.',
    }],
    collections: [],
  }
}

describe('Phase 10E full runtime catalog validation', () => {
  it('preserves core definitions and all cross-reference indexes', () => {
    const result = resolveFullRuntimeCatalog([], [], '0.0.0')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.activeModuleIds).toEqual([])
    expect(result.catalog.elements).toEqual(runtimeCatalog.elements)
    expect(result.catalog.recipes).toEqual(runtimeCatalog.recipes)
    expect(result.catalog.histories).toEqual(runtimeCatalog.histories)
    expect(result.catalog.sources).toEqual(runtimeCatalog.sources)
    expect(result.catalog.recipeReviews).toEqual(runtimeCatalog.recipeReviews)
    expect(result.catalog.challenges).toEqual(runtimeCatalog.challenges)
  })

  it('rejects an otherwise reachable module missing research and recipe reviews', () => {
    const result = resolveFullRuntimeCatalog([pack()], ['test-region'], '0.0.0')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/lacks history/)
    expect(result.errors.join(' ')).toMatch(/lacks recipe review/)
  })

  it('rejects malformed source, review and challenge shapes before activation', () => {
    const invalid = { ...pack(), challenges: [{
      id: 'test-region-lab', name: 'Test lab', starterIds: [],
      targetId: 'test-region-marker', allowedResultEraIds: ['classical-antiquity'],
      minimumAttempts: 1,
    }] }
    const result = resolveFullRuntimeCatalog([invalid], ['test-region'], '0.0.0')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/Invalid module/)
  })
})
