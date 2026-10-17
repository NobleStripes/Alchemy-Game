import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import { historicalResearch, researchByElementId } from './research'
import { recipeReviews, reviewsByRecipeId } from './recipeReviews'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'

const index = createRecipeIndex(recipes)
const routes = [
  ['adhesive', 'stone-tool', 'axe', 'adhesive-hafting', 'symbolic'],
  ['paddle', 'dugout-canoe', 'voyage', 'dugout-voyage', 'symbolic'],
  ['pottery-wheel', 'clay', 'pottery', 'wheel-assisted-pottery', 'simplified-process'],
  ['crucible', 'copper-ore', 'copper', 'crucible-copper', 'simplified-process'],
  ['plumb-line', 'masonry', 'wall', 'aligned-masonry-wall', 'symbolic'],
  ['watermill', 'crop', 'flour', 'watermill-flour', 'simplified-process'],
] as const
const approvedIds = [
  'resin', 'adhesive', 'dugout-canoe', 'paddle',
  'pottery-wheel', 'crucible', 'annealing', 'plumb-line', 'waterwheel', 'watermill',
]

async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('optional recipe connections and research sign-off', () => {
  it('appends only three missing pairs and preserves the complete 225/288 catalog', async () => {
    expect(elements).toHaveLength(225)
    expect(recipes).toHaveLength(291)
    expect(await fingerprint(elements)).toBe('39382d3b955d65761293c86dbe1529fbb212465721c27e84fcff9186a9dd1b6a')
    expect(await fingerprint(recipes.slice(0, 288))).toBe('68c4e25fafefb8056365fdc479e38525f96062bbef05cebdf12e8a4647ba3187')
    expect(recipes.slice(288).map((recipe) => recipe.id)).toEqual([
      'dugout-voyage', 'crucible-copper', 'aligned-masonry-wall',
    ])
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(validateContent(elements, recipes.slice(0, 288), eras, collections)).toEqual([])
  })

  it.each(routes)('keeps %s + %s as %s under %s with a cited %s review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(recipes.filter((recipe) =>
      recipe.inputs.includes(a) && recipe.inputs.includes(b),
    )).toHaveLength(1)
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe(classification)
    expect(review.caution.length).toBeGreaterThan(100)
    expect(review.sourceIds.length).toBeGreaterThan(0)
    for (const sourceId of review.sourceIds) {
      const source = historicalResearch.sources.find((entry) => entry.id === sourceId)!
      expect(source.verification.status).toBe('verified')
      if (source.verification.status !== 'verified') throw new Error(`Unverified source: ${sourceId}`)
      expect(source.verification.locator.length).toBeGreaterThan(100)
    }
  })

  it('rejects the conflicting Spear proposal without changing either old tool result', () => {
    expect(resolveCombination('adhesive', 'stone-tool', index)?.result).toBe('axe')
    expect(resolveCombination('stone-tool', 'tree', index)).toMatchObject({ id: 'long-reach', result: 'spear' })
    expect(recipes.filter((recipe) => recipe.result === 'spear')).toHaveLength(1)
  })

  it('pins the complete 225/291 release baseline for future appended batches', async () => {
    expect(await fingerprint(elements.slice(0, 225))).toBe('39382d3b955d65761293c86dbe1529fbb212465721c27e84fcff9186a9dd1b6a')
    expect(await fingerprint(recipes.slice(0, 291))).toBe('a6afd9fcf77ad19a8e5735ef03bfec45add65a73ebf6f791c9bec09bce57cffe')
  })

  it('resolves all 21 post-215 formulas symmetrically and rejects their reversed duplicates', () => {
    for (const recipe of recipes.slice(270, 291)) {
      expect(resolveCombination(...recipe.inputs, index)).toEqual(recipe)
      expect(resolveCombination(recipe.inputs[1], recipe.inputs[0], index)).toEqual(recipe)
      const duplicate = { ...recipe, id: `${recipe.id}-duplicate`, inputs: [recipe.inputs[1], recipe.inputs[0]] as [string, string] }
      expect(validateContent(elements, [...recipes, duplicate], eras, collections)).toEqual(
        expect.arrayContaining([expect.stringContaining(`Recipes ${recipe.id} and ${duplicate.id} share pair`)]),
      )
    }
  })

  it('retains older pottery, copper, wall and flour routes independently of later equipment', () => {
    for (const [result, equipment] of [
      ['pottery', 'pottery-wheel'], ['copper', 'crucible'],
      ['wall', 'plumb-line'], ['flour', 'watermill'],
    ]) {
      expect(recipes.slice(0, 270).some((recipe) =>
        recipe.result === result && !recipe.inputs.includes(equipment),
      )).toBe(true)
    }
    expect(reviewsByRecipeId.get('wheel-assisted-pottery')!.caution).toMatch(/hand|older/)
    expect(reviewsByRecipeId.get('watermill-flour')!.caution).toContain('earlier hand-milling')
    expect(reviewsByRecipeId.get('aligned-masonry-wall')!.caution).toContain('does not date their invention')
    expect(reviewsByRecipeId.get('dugout-voyage')!.caution).toContain('does not date paddling')
  })

  it.each(approvedIds)('has a complete cited Atlas record for approved %s, with explicit evidence limits', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    for (const field of ['historicalOverview', 'manufactureOrUse', 'historicalSignificance', 'agePlacement'] as const) {
      expect(record[field].text.length).toBeGreaterThan(100)
      expect(record[field].sourceIds.length).toBeGreaterThan(0)
    }
    expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.relatedDiscoveries.length).toBeGreaterThan(0)
    expect(record.furtherResearch.length).toBeGreaterThan(0)
    expect(record.independentDevelopments).toEqual([])
  })

  it('bounds the new crucible source to the original abstract and distinguishes separate assemblages', () => {
    const source = historicalResearch.sources.find((entry) => entry.id === 'iberian-crucible-smelting')!
    expect(source.sourceType).toBe('peer-reviewed-study')
    expect(source.publicationDate).toBeNull()
    expect(source.verification).toMatchObject({
      status: 'verified', accessLevel: 'abstract-only', checkedOn: '2026-10-17',
    })
    if (source.verification.status !== 'verified') throw new Error('Crucible source must be verified')
    expect(source.verification.locator).toContain('two separate slag cakes')
    const record = researchByElementId.get('crucible')!
    expect(record.approximateDates).toEqual([])
    expect(record.archaeologicalEvidence.find((entry) =>
      entry.sourceIds.includes(source.id),
    )?.interpretation).toBe('hypothesis')
    expect(record.manufactureOrUse.text).toContain('does not turn the El Argar melting vessel')
    expect(record.relatedDiscoveries.map((entry) => entry.elementId)).toEqual(
      expect.arrayContaining(['copper-ore', 'copper']),
    )
  })

  it('reports unchanged history gaps rather than counting new formulas as researched elements', () => {
    expect(historicalResearch.records).toHaveLength(147)
    expect(historicalResearch.records.flatMap((record) => record.approximateDates)).toHaveLength(176)
    expect(elements.filter((element) => !researchByElementId.has(element.id))).toHaveLength(78)
    expect(historicalResearch.sources.filter((source) => source.verification.status === 'verified')).toHaveLength(161)
    expect(historicalResearch.sources.filter((source) => source.verification.status === 'pending')).toHaveLength(1)
    expect(recipeReviews.reviews.filter((review) => review.sourceIds.length > 0)).toHaveLength(186)
    expect(recipeReviews.reviews.filter((review) => review.sourceIds.length === 0)).toHaveLength(105)
  })
})
