import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '../content/index.ts'
import { resolveRegionalCatalog, type CoreCatalog } from './registry.ts'

const core: CoreCatalog = { elements, recipes, eras, collections }

function modulePack(id = 'test-region', dependencies: string[] = []) {
  return {
    manifest: {
      schemaVersion: 1,
      id,
      version: '1.0.0',
      minimumCoreVersion: '0.0.0',
      title: 'Test historical module',
      description: 'Synthetic test data, not historical content.',
      regions: ['Test region'],
      historicalPeriod: 'Undated testing fixture',
      targetEraIds: ['classical-antiquity'],
      dependencies,
    },
    elements: [{
      id: `${id}-marker`,
      name: `Test Marker ${id}`,
      sigil: 'TM',
      category: 'knowledge',
      description: 'A synthetic discovery for validating the registry.',
      starter: false,
      era: 'classical-antiquity',
    }],
    recipes: [{
      id: `${id}-formula`,
      inputs: ['rock', 'academy'],
      result: `${id}-marker`,
      flavor: 'A synthetic combination for validation.',
    }],
    collections: [],
  }
}

function expectRejected(result: ReturnType<typeof resolveRegionalCatalog>, match: RegExp) {
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.errors.join(' ')).toMatch(match)
}

describe('Phase 10A regional module registry', () => {
  it('preserves the complete core catalog without enabled modules', () => {
    const result = resolveRegionalCatalog(core, [], [], '0.0.0')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toEqual(elements)
    expect(result.catalog.recipes).toEqual(recipes)
    expect(result.catalog.eras).toEqual(eras)
    expect(result.catalog.collections).toEqual(collections)
    expect(result.catalog.activeModuleIds).toEqual([])
    expect(result.catalog.elements).not.toBe(elements)
  })

  it('composes one synthetic optional discovery without changing the core', () => {
    const pack = modulePack()
    const result = resolveRegionalCatalog(core, [pack], [pack.manifest.id], '0.0.0')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toHaveLength(elements.length + 1)
    expect(result.catalog.recipes).toHaveLength(recipes.length + 1)
    expect(result.catalog.elements.slice(0, elements.length)).toEqual(elements)
    expect(result.catalog.recipes.slice(0, recipes.length)).toEqual(recipes)
    expect(result.catalog.eras).toEqual(eras)
  })

  it('rejects duplicate unordered ingredient pairs without changing core data', () => {
    const first = modulePack()
    const second = modulePack('other-region')
    expectRejected(
      resolveRegionalCatalog(core, [first, second], ['other-region', 'test-region'], '0.0.0'),
      /share pair/,
    )
    expect(core.elements).toHaveLength(elements.length)
  })

  it('rejects undeclared, missing, disabled, and cyclic dependencies', () => {
    const a = modulePack('alpha')
    const b = modulePack('beta', ['alpha'])
    b.recipes[0].inputs = ['alpha-marker', 'academy']
    expectRejected(resolveRegionalCatalog(core, [a, b], ['beta'], '0.0.0'), /disabled module alpha/)
    expectRejected(resolveRegionalCatalog(core, [b], ['beta'], '0.0.0'), /missing module alpha/)
    a.manifest.dependencies = ['beta']
    expectRejected(resolveRegionalCatalog(core, [a, b], ['alpha', 'beta'], '0.0.0'), /cycle/)
    a.manifest.dependencies = []
    b.manifest.dependencies = []
    expectRejected(resolveRegionalCatalog(core, [a, b], ['alpha', 'beta'], '0.0.0'), /without declaring a dependency/)
  })

  it('rejects module-owned IDs without prefixes, starters, and invalid target ages', () => {
    const wrongId = modulePack()
    wrongId.elements[0].id = 'unscoped'
    expectRejected(resolveRegionalCatalog(core, [wrongId], ['test-region'], '0.0.0'), /must begin with test-region-/)

    const starter = modulePack()
    starter.elements[0].starter = true
    expectRejected(resolveRegionalCatalog(core, [starter], ['test-region'], '0.0.0'), /cannot add starting essences/)

    const wrongAge = modulePack()
    wrongAge.manifest.targetEraIds = ['classical-antiquity', 'imaginary-era']
    expectRejected(resolveRegionalCatalog(core, [wrongAge], ['test-region'], '0.0.0'), /missing core era/)
  })

  it('rejects incompatible versions and missing enabled modules', () => {
    const pack = modulePack()
    pack.manifest.minimumCoreVersion = '2.0.0'
    expectRejected(resolveRegionalCatalog(core, [pack], ['test-region'], '0.0.0'), /needs core version/)
    expectRejected(resolveRegionalCatalog(core, [], ['absent'], '0.0.0'), /not installed/)
  })

  it('rejects direct overwrites of pre-existing core discoveries', () => {
    const pack = modulePack()
    pack.elements[0].id = 'rock'
    expectRejected(resolveRegionalCatalog(core, [pack], ['test-region'], '0.0.0'), /must begin with/)
  })
})
