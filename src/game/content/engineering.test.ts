import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from './index'
import { researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { getExhaustedElements } from '../engine/elementStatus'
import { validateContent } from '../engine/validateContent'

const additions = ['slaked-lime', 'lime-mortar', 'volcanic-ash', 'concrete', 'road-network', 'public-bath']
const index = createRecipeIndex(recipes)

describe('optional engineering discoveries', () => {
  it.each([
    ['quicklime', 'tide', 'slaked-lime', 'stone-age', 'material-process'],
    ['slaked-lime', 'sand', 'lime-mortar', 'stone-age', 'simplified-process'],
    ['rock', 'heat', 'volcanic-ash', 'first-light', 'symbolic'],
    ['lime-mortar', 'volcanic-ash', 'concrete', 'classical-antiquity', 'simplified-process'],
    ['road', 'map', 'road-network', 'classical-antiquity', 'symbolic'],
    ['aqueduct', 'heat', 'public-bath', 'classical-antiquity', 'symbolic'],
  ])('resolves %s + %s as %s in either order with reviewed production semantics', (a, b, result, era, classification) => {
    const recipe = resolveCombination(a, b, index)!
    expect(recipe.result).toBe(result)
    expect(resolveCombination(b, a, index)).toEqual(recipe)
    expect(elements.find((element) => element.id === result)?.era).toBe(era)
    expect(reviewsByRecipeId.get(recipe.id)).toMatchObject({ classification })
    expect(reviewsByRecipeId.get(recipe.id)!.sourceIds.length).toBeGreaterThan(0)
  })

  it('reuses engineering discoveries without replacing their existing routes or ages', () => {
    expect(resolveCombination('stone', 'city', index)?.result).toBe('aqueduct')
    expect(resolveCombination('masonry', 'aqueduct', index)?.result).toBe('arch')
    expect(resolveCombination('arch', 'city', index)?.result).toBe('amphitheater')
    expect(resolveCombination('heat', 'limestone', index)?.result).toBe('quicklime')
    expect(elements.find((element) => element.id === 'aqueduct')?.era).toBe('iron-age')
    expect(elements.some((element) => element.id === 'mortar')).toBe(false)
    expect(resolveCombination('lime-mortar', 'ash', index)).toBeNull()
  })

  it('keeps every age and collection reachable without the optional engineering branch', () => {
    const originalElements = elements.slice(0, 178)
    const originalRecipes = recipes.slice(0, 216)
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(validateContent(originalElements, originalRecipes, eras, collections)).toEqual([])
    for (const era of eras) {
      expect([...era.unlockRequires, ...era.grants, ...era.landmarkIds].some((id) => additions.includes(id))).toBe(false)
    }
    expect(collections.flatMap((collection) => collection.elementIds).some((id) => additions.includes(id))).toBe(false)
    expect(recipes.slice(216, 222)).toHaveLength(6)
    expect(elements.slice(178, 184).map((element) => element.id)).toEqual(additions)
  })

  it.each([
    ['elements', elements.slice(0, 178), '6ed50b6d187f7bac60fb41946119f06a390fecd82fba65f6fda0121431abe92a'],
    ['recipes', recipes.slice(0, 216), '3f5ee356734d8f90f9a31e84f2643b2fb1354c808316bc0cbdb79dba3a8ee76a'],
  ])('preserves every pre-engineering %s definition in order', async (_, definitions, expected) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(definitions)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(expected)
  })

  it('reactivates Quicklime through the graph without storing final-status metadata', () => {
    const discovered = new Set(['quicklime'])
    expect(getExhaustedElements(recipes.slice(0, 216), discovered)).toContain('quicklime')
    expect(getExhaustedElements(recipes, discovered)).not.toContain('quicklime')
    expect(getExhaustedElements(recipes.slice(0, 222), new Set(additions))).toEqual(new Set(['concrete', 'road-network', 'public-bath']))
  })

  it('separates material transformations, missing ingredients and modern cement', () => {
    const lime = researchByElementId.get('slaked-lime')!
    expect(lime.manufactureOrUse.text).toContain('CaO + H2O -> Ca(OH)2')
    expect(lime.manufactureOrUse.text).toContain('not a handling procedure')
    const mortar = researchByElementId.get('lime-mortar')!
    expect(mortar.manufactureOrUse.text).toContain('Ca(OH)2 + CO2 -> CaCO3 + H2O')
    expect(mortar.manufactureOrUse.text).toContain('not every lime mortar sets under water')
    const concrete = researchByElementId.get('concrete')!
    expect(concrete.historicalOverview.text).toContain('not modern Portland-cement concrete')
    expect(concrete.manufactureOrUse.text).toContain('coarse')
    expect(concrete.manufactureOrUse.text).toContain('ground clinker')
    expect(concrete.gameplaySimplifications.join(' ')).toContain('omits coarse aggregate')
    expect(concrete.historicalUncertainty.join(' ')).toContain('experimental conditions')
    const ash = researchByElementId.get('volcanic-ash')!
    expect(ash.historicalOverview.text).toContain('not wood-combustion ash')
    expect(ash.gameplaySimplifications.join(' ')).toContain('heating an ordinary rock does not produce')
    expect(ash.agePlacement.status).toBe('fictional-prologue')
  })

  it('documents operating water infrastructure and earlier engineering without universal invention claims', () => {
    const aqueduct = researchByElementId.get('aqueduct')!
    expect(aqueduct.historicalOverview.text).toContain('Assyrian works and Greek tunnels')
    for (const phrase of ['downward gradient', 'rather than pumping', 'not one universal slope',
      'settling tanks', 'fountains, latrines, baths', 'Debris removal, leak repairs']) {
      expect(aqueduct.manufactureOrUse.text).toContain(phrase)
    }
    expect(researchByElementId.get('arch')!.historicalOverview.text).toContain('Etruscan')
    expect(researchByElementId.get('amphitheater')!.historicalOverview.text).toContain('violence')
    const baths = researchByElementId.get('public-bath')!
    expect(baths.historicalOverview.text).toContain('Greek public baths')
    expect(baths.manufactureOrUse.text).toContain('hot air under raised floors')
    expect(baths.manufactureOrUse.text).toContain('not a universal prerequisite')
    expect(baths.manufactureOrUse.text).toContain('unfired Mud Brick')
    const roads = researchByElementId.get('road-network')!
    expect(roads.historicalOverview.text).toContain('incorporated older routes')
    expect(roads.approximateDates[0].note).toContain('not the invention of roads')
  })
})
