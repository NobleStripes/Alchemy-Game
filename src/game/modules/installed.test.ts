import { describe, expect, it } from 'vitest'
import { installedRegionalModules, resolveInstalledRegions } from './installed.ts'
import { runtimeCatalog } from './runtimeCatalog.ts'
import { resolveCombination } from '../engine/resolveCombination.ts'
import { createRecipeIndex } from '../engine/resolveCombination.ts'

describe('Achaemenid first-party regional pilot', () => {
  it('preserves the original core-only game', () => {
    const result = resolveInstalledRegions([])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toEqual(runtimeCatalog.elements)
    expect(result.catalog.recipes).toEqual(runtimeCatalog.recipes)
    expect(result.catalog.eras).toEqual(runtimeCatalog.eras)
    expect(result.catalog.collections).toEqual(runtimeCatalog.collections)
    expect(result.catalog.histories).toEqual(runtimeCatalog.histories)
    expect(result.catalog.challenges).toEqual(runtimeCatalog.challenges)
    expect(result.activeModuleIds).toEqual([])
  })

  it('validates all optional discoveries, sources, reviews and challenges together', () => {
    const result = resolveInstalledRegions(['achaemenid'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toHaveLength(runtimeCatalog.elements.length + 3)
    expect(result.catalog.recipes).toHaveLength(runtimeCatalog.recipes.length + 3)
    expect(result.catalog.challenges).toHaveLength(runtimeCatalog.challenges.length + 1)
    expect(result.catalog.histories).toHaveLength(runtimeCatalog.histories.length + 3)
    for (const element of installedRegionalModules[0].elements) {
      expect(result.catalog.researchByElementId.has(element.id)).toBe(true)
      expect(result.catalog.elementsById.get(element.id)).toEqual(element)
    }
    for (const recipe of installedRegionalModules[0].recipes) {
      expect(result.catalog.reviewsByRecipeId.has(recipe.id)).toBe(true)
      expect(resolveCombination(...recipe.inputs, createRecipeIndex([...result.catalog.recipes]))?.result).toBe(recipe.result)
    }
    expect(result.catalog.challengesById.has('achaemenid-courier-lab')).toBe(true)
  })

  it('does not change existing ages, requirements or original recipe definitions', () => {
    const result = resolveInstalledRegions(['achaemenid'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.eras).toEqual(runtimeCatalog.eras)
    expect(result.catalog.recipes.slice(0, runtimeCatalog.recipes.length)).toEqual(runtimeCatalog.recipes)
    expect(result.catalog.collections.slice(0, runtimeCatalog.collections.length)).toEqual(runtimeCatalog.collections)
  })

  it('rejects an unavailable historical pack without activating it', () => {
    const result = resolveInstalledRegions(['not-installed'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/not installed/)
  })
})
