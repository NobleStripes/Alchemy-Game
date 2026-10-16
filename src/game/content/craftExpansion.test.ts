import { describe, expect, it } from 'vitest'
import rawResearch from './research.json'
import craftResearch from './craftResearch.json'
import { collections, elements, eras, recipes } from '.'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { historicalDatabaseSchema } from './schema'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { getExhaustedElements, getGraphMetrics, getTemporarilyExhaustedElements } from '../engine/elementStatus'
import { selectHintRecipe } from '../engine/hintRules'
import { isEraChallengeComplete } from '../engine/insightRules'
import { validateContent } from '../engine/validateContent'

const additions = [
  'smelting-furnace', 'clay-tablet', 'sealed-tablet', 'weight-standard',
  'axe', 'adze', 'wedge', 'fishhook', 'fishing-weir',
  'iron-chisel', 'gouge', 'wax-tablet', 'pulley', 'water-screw', 'vault',
]
const backlog = [
  'copper', 'bronze', 'forge', 'seal', 'scribe', 'archive', 'balance', 'bronze-tool',
  'masonry', 'irrigation', 'bellows', 'bloomery', 'iron', 'iron-tool', 'blacksmith',
]
const routes = [
  ['kiln', 'charcoal', 'smelting-furnace', 'ore-reduction-workshop', 'symbolic'],
  ['smelting-furnace', 'copper-ore', 'copper', 'furnace-copper', 'simplified-process'],
  ['smelting-furnace', 'tin-ore', 'tin', 'furnace-tin', 'simplified-process'],
  ['clay', 'quill', 'clay-tablet', 'inscribed-clay-support', 'simplified-process'],
  ['clay-tablet', 'seal', 'sealed-tablet', 'authenticated-clay-document', 'simplified-process'],
  ['balance', 'rock', 'weight-standard', 'calibrated-trade-weights', 'symbolic'],
  ['stone-tool', 'cordage', 'axe', 'hafted-stone-axe', 'symbolic'],
  ['axe', 'stone-tool', 'adze', 'transverse-woodworking-edge', 'symbolic'],
  ['axe', 'tree', 'wedge', 'wooden-splitting-tool', 'simplified-process'],
  ['bone', 'cordage', 'fishhook', 'bone-line-hook', 'simplified-process'],
  ['basket', 'river', 'fishing-weir', 'stationary-fish-barrier', 'symbolic'],
  ['fishhook', 'fish', 'food', 'line-fishing-food', 'symbolic'],
  ['fishing-weir', 'fish', 'food', 'weir-fishing-food', 'symbolic'],
  ['adze', 'tree', 'shelter', 'shaped-wooden-shelter', 'symbolic'],
  ['wedge', 'tree', 'timber', 'split-construction-timber', 'simplified-process'],
  ['iron-tool', 'rock', 'iron-chisel', 'specialized-iron-edge', 'symbolic'],
  ['iron-tool', 'adze', 'gouge', 'curved-carpentry-edge', 'symbolic'],
  ['timber', 'writing', 'wax-tablet', 'waxed-writing-board', 'symbolic'],
  ['iron-chisel', 'rock', 'masonry', 'chisel-worked-masonry', 'symbolic'],
  ['gouge', 'timber', 'boat', 'gouged-wooden-vessel', 'symbolic'],
  ['weight-standard', 'trade', 'merchant', 'calibrated-exchange', 'symbolic'],
  ['wheel', 'cordage', 'pulley', 'rope-guiding-wheel', 'symbolic'],
  ['irrigation', 'lathe', 'water-screw', 'rotating-water-lift', 'symbolic'],
  ['arch', 'masonry', 'vault', 'extended-arched-span', 'symbolic'],
  ['pulley', 'quarry', 'masonry', 'pulley-assisted-building', 'symbolic'],
  ['water-screw', 'river', 'irrigation', 'screw-lifted-irrigation', 'symbolic'],
  ['vault', 'concrete', 'public-bath', 'vaulted-bath-space', 'symbolic'],
] as const
const index = createRecipeIndex(recipes)

async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('craft and engineering expansion', () => {
  it('validates the bundled appendix and combines it without dropping or replacing full articles', () => {
    expect(historicalDatabaseSchema.parse(craftResearch)).toEqual(craftResearch)
    expect(rawResearch.records).toHaveLength(97)
    expect(craftResearch.records).toHaveLength(50)
    expect(craftResearch.sources).toHaveLength(33)
    expect(historicalResearch.records).toEqual([...rawResearch.records, ...craftResearch.records])
    expect(historicalResearch.sources).toEqual([...craftResearch.sources, ...rawResearch.sources])
  })

  it('meets the paired 215-element and 127-history milestone with no unused discoveries', () => {
    const milestoneElements = elements.slice(0, 215)
    const milestoneRecipes = recipes.slice(0, 270)
    const milestoneResearch = historicalResearch.records.slice(0, 127)
    expect(milestoneElements).toHaveLength(215)
    expect(milestoneRecipes).toHaveLength(270)
    expect(milestoneElements.slice(200).map((element) => element.id)).toEqual(additions)
    expect(milestoneRecipes.slice(243).map((recipe) => recipe.id)).toEqual(routes.map((route) => route[3]))
    expect(milestoneResearch).toHaveLength(127)
    expect(milestoneResearch.slice(97).map((record) => record.elementId)).toEqual([...additions, ...backlog])
    expect(milestoneResearch.flatMap((record) => record.approximateDates)).toHaveLength(160)
    const researched = new Set(milestoneResearch.map((record) => record.elementId))
    expect(elements.slice(0, 194).filter((element) => !researched.has(element.id))).toHaveLength(88)
    expect(getGraphMetrics(milestoneElements, milestoneRecipes)).toEqual({ total: 215, ingredients: 168, terminal: 47, unused: 0 })
    expect(validateContent(milestoneElements, milestoneRecipes, eras, collections)).toEqual([])
  })

  it('preserves the complete 200-element catalog and every one of its 243 formulas', async () => {
    expect(await fingerprint(elements.slice(0, 200))).toBe('4a893b676b40b2aaafd5709025d2e6ccec78be267d01281588d7eaf403774c6c')
    expect(await fingerprint(recipes.slice(0, 243))).toBe('e06f823d33e7e62e49b6fabb6ecf8dfa46b27715e4e608c981abc095015d15b4')
    expect(validateContent(elements.slice(0, 200), recipes.slice(0, 243), eras, collections)).toEqual([])
    for (const era of eras) {
      expect(isEraChallengeComplete(era, elements.slice(0, 200).map((element) => element.id), elements)).toBe(true)
    }
  })

  it.each(routes)('resolves %s + %s as %s in both orders with an individual cited review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe(classification)
    expect(review.caution.length).toBeGreaterThan(80)
    expect(review.sourceIds.length).toBeGreaterThan(0)
    expect(review.sourceIds.every((sourceId) => historicalResearch.sources.some(
      (source) => source.id === sourceId && source.verification.status === 'verified',
    ))).toBe(true)
  })

  it('keeps every new discovery reachable in its assigned age without a later-age input', () => {
    const reached = new Set<string>()
    for (const era of eras) {
      for (const element of elements) {
        if (element.starter || era.grants.includes(element.id)) reached.add(element.id)
      }
      const allowed = new Set(elements.filter((element) =>
        eras.findIndex((entry) => entry.id === element.era) <= eras.indexOf(era),
      ).map((element) => element.id))
      let changed = true
      while (changed) {
        changed = false
        for (const recipe of recipes) {
          if (allowed.has(recipe.result) && recipe.inputs.every((id) => reached.has(id)) && !reached.has(recipe.result)) {
            reached.add(recipe.result)
            changed = true
          }
        }
      }
      for (const id of additions.filter((id) => elements.find((element) => element.id === id)?.era === era.id)) {
        expect(reached.has(id), `${id} must be reachable during ${era.id}`).toBe(true)
      }
    }
  })

  it('reactivates the old terminal Lathe and gives it an available contextual hint', () => {
    const discovered = new Set(elements.slice(0, 200).map((element) => element.id))
    const performed = recipes.slice(0, 243).map((recipe) => recipe.id)
    const unlocked = new Set(eras.map((era) => era.id))
    const elementEras = new Map(elements.map((element) => [element.id, element.era]))
    expect(getExhaustedElements(recipes.slice(0, 243), discovered)).toContain('lathe')
    expect(getExhaustedElements(recipes, discovered)).not.toContain('lathe')
    expect(getTemporarilyExhaustedElements(recipes, discovered, new Set(performed), unlocked, elementEras).has('lathe')).toBe(false)
    expect(selectHintRecipe(recipes, ['lathe', 'irrigation'], performed, [], elements, 'classical-antiquity')?.id)
      .toBe('rotating-water-lift')
  })

  it.each([...additions, ...backlog])('supplies a complete, bounded history for %s', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    for (const field of ['historicalOverview', 'manufactureOrUse', 'historicalSignificance', 'agePlacement'] as const) {
      expect(record[field].text.length).toBeGreaterThan(100)
      expect(record[field].sourceIds.length).toBeGreaterThan(0)
    }
    expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.independentDevelopments).toEqual([])
  })

  it('distinguishes tablet, impression, sealing tool and envelope using bounded evidence', () => {
    const record = researchByElementId.get('sealed-tablet')!
    expect(record.historicalOverview.text).toContain('AO 9386')
    expect(record.historicalOverview.text).toContain('envelope is not merely another name')
    expect(record.manufactureOrUse.text).toContain('inner tablets were not')
    expect(record.archaeologicalEvidence[0].text).toContain('purchase in 1924')
    expect(record.agePlacement.sourceIds).toEqual(['louvre-tablet-envelope'])
    expect(reviewsByRecipeId.get('authenticated-clay-document')!.caution).toContain('without automatically adding an envelope')
    expect(recipes.filter((recipe) => recipe.result === 'sealed-tablet')).toHaveLength(1)
    expect(elements.some((element) => ['seal-impression', 'clay-envelope'].includes(element.id))).toBe(false)
  })

  it('retains regional standards and the limits of artifact, replica and textual evidence', () => {
    expect(researchByElementId.get('weight-standard')!.historicalOverview.text).toContain('not one ancient worldwide standard')
    expect(researchByElementId.get('weight-standard')!.historicalUncertainty.join(' ')).toContain('not a review of the complete PNAS paper')
    expect(researchByElementId.get('iron-chisel')!.approximateDates).toEqual([])
    expect(researchByElementId.get('iron-chisel')!.historicalUncertainty.join(' ')).toContain('context is not yet known')
    expect(researchByElementId.get('gouge')!.historicalOverview.text).toContain('replicas are not the excavated originals')
    expect(researchByElementId.get('wax-tablet')!.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('fishhook')!.archaeologicalEvidence[0].text).toContain('rather than eaten catches')
    for (const id of ['pulley', 'water-screw']) {
      expect(researchByElementId.get(id)!.archaeologicalEvidence[0].evidenceType).toBe('textual-evidence')
      expect(researchByElementId.get(id)!.approximateDates).toEqual([])
    }
    expect(reviewsByRecipeId.get('furnace-tin')!.caution).toContain('not evidence for a named ancient tin furnace')
    expect(reviewsByRecipeId.get('rotating-water-lift')!.caution).toContain('does not require a lathe')
  })
})
