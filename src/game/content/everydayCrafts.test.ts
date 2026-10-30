import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import rawCraftResearch from './craftResearch.json'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { getGraphMetrics } from '../engine/elementStatus'
import { isEraChallengeComplete } from '../engine/insightRules'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'

const additions = [
  'sewing', 'salted-meat', 'loom-weight', 'sailcloth', 'wick',
  'lamp', 'lever', 'winch', 'sundial', 'dome',
]
const backlog = ['needle', 'hide', 'clothing', 'meat', 'food', 'storage', 'sail', 'boat', 'trade', 'merchant']
const routes = [
  ['needle', 'fibre', 'sewing', 'stitched-material', 'simplified-process'],
  ['sewing', 'hide', 'clothing', 'sewn-hide-clothing', 'simplified-process'],
  ['salt', 'meat', 'salted-meat', 'salt-preserved-meat', 'simplified-process'],
  ['salted-meat', 'pottery', 'storage', 'stored-salted-provisions', 'symbolic'],
  ['clay', 'loom', 'loom-weight', 'weighted-loom-equipment', 'symbolic'],
  ['loom-weight', 'yarn', 'textile', 'weighted-warp-weaving', 'simplified-process'],
  ['textile', 'boat', 'sailcloth', 'prepared-sail-textile', 'symbolic'],
  ['sailcloth', 'cordage', 'sail', 'rigged-sailcloth', 'simplified-process'],
  ['fibre', 'cordage', 'wick', 'prepared-fibre-wick', 'symbolic'],
  ['pottery', 'wick', 'lamp', 'wicked-pottery-lamp', 'simplified-process'],
  ['lamp', 'house', 'home', 'lamplit-home', 'symbolic'],
  ['timber', 'rock', 'lever', 'supported-timber-lever', 'symbolic'],
  ['lever', 'rock', 'quarry', 'levered-quarry-stone', 'symbolic'],
  ['lever', 'cordage', 'winch', 'rope-winding-winch', 'symbolic'],
  ['winch', 'anchor', 'harbor', 'harbor-winding-gear', 'symbolic'],
  ['observation', 'mathematical-astronomy', 'sundial', 'observed-shadow-time', 'symbolic'],
  ['sundial', 'geometry', 'knowledge', 'geometric-dial-study', 'symbolic'],
  ['vault', 'geometry', 'dome', 'curved-roof-design', 'symbolic'],
  ['dome', 'concrete', 'public-bath', 'domed-bath-space', 'symbolic'],
  ['needle', 'textile', 'clothing', 'stitched-woven-clothing', 'simplified-process'],
] as const
const index = createRecipeIndex(recipes)

describe('everyday crafts and practical engineering', () => {
  it('adds exactly ten useful discoveries, twenty routes and twenty full histories', () => {
    expect(elements).toHaveLength(235)
    expect(recipes).toHaveLength(311)
    expect(elements.slice(225).map((element) => element.id)).toEqual(additions)
    expect(recipes.slice(291).map((recipe) => recipe.id)).toEqual(routes.map((route) => route[3]))
    expect(historicalResearch.records).toHaveLength(167)
    expect(historicalResearch.records.slice(147).map((record) => record.elementId)).toEqual([...additions, ...backlog])
    expect(elements.filter((element) => !researchByElementId.has(element.id))).toHaveLength(68)
    expect(getGraphMetrics(elements, recipes)).toEqual({ total: 235, ingredients: 193, terminal: 42, unused: 0 })
    expect(eras.map((era) => elements.filter((element) => element.era === era.id).length)).toEqual([43, 58, 58, 28, 48])
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    for (const id of additions) {
      expect(elements.find((element) => element.id === id)?.starter).toBe(false)
      expect(recipes.some((recipe) => recipe.inputs.includes(id))).toBe(true)
    }
    for (const id of ['salt', 'needle', 'textile']) {
      expect(recipes.slice(0, 291).some((recipe) => recipe.inputs.includes(id))).toBe(false)
      expect(recipes.slice(291).some((recipe) => recipe.inputs.includes(id))).toBe(true)
    }
  })

  it('preserves the complete pre-expansion craft appendix, not just its history IDs', async () => {
    const baseline = {
      ...rawCraftResearch,
      sources: rawCraftResearch.sources.slice(0, 34),
      records: rawCraftResearch.records.slice(0, 50),
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(baseline)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
      .toBe('4b34e410f46a53849cce5d6a87e6a9e4fe750f2187518712cd629d41df0f49a2')
  })

  it.each(routes)('resolves %s + %s as %s in both orders with its own %s review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(resolveCombination(a, b, createRecipeIndex(recipes.slice(0, 291)))).toBeNull()
    const duplicate = { ...recipes.find((recipe) => recipe.id === id)!, id: `${id}-duplicate`, inputs: [b, a] as [string, string] }
    expect(validateContent(elements, [...recipes, duplicate], eras, collections)).toContain(
      `Recipes ${id} and ${duplicate.id} share pair ${[a, b].sort().join('::')}.`,
    )
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe(classification)
    expect(review.caution.length).toBeGreaterThan(100)
    expect(review.sourceIds.length).toBeGreaterThan(0)
    for (const sourceId of review.sourceIds) {
      expect(historicalResearch.sources.find((source) => source.id === sourceId)?.verification.status).toBe('verified')
    }
  })

  it('reaches each addition in its own age without later ingredients, and retains old-only completion', () => {
    const reached = new Set<string>()
    for (const [eraIndex, era] of eras.entries()) {
      for (const element of elements) if (element.starter || era.grants.includes(element.id)) reached.add(element.id)
      const allowed = new Set(elements.filter((element) =>
        eras.findIndex((entry) => entry.id === element.era) <= eraIndex,
      ).map((element) => element.id))
      let changed = true
      while (changed) {
        changed = false
        for (const recipe of recipes) {
          if (allowed.has(recipe.result) && !reached.has(recipe.result) && recipe.inputs.every((id) => reached.has(id))) {
            reached.add(recipe.result)
            changed = true
          }
        }
      }
      for (const id of additions) {
        const assignedAge = eras.findIndex((entry) => entry.id === elements.find((element) => element.id === id)!.era)
        expect(reached.has(id), `${id} during ${era.id}`).toBe(eraIndex >= assignedAge)
      }
      expect(isEraChallengeComplete(era, elements.slice(0, 225).map((element) => element.id), elements)).toBe(true)
      expect(era.grants.some((id) => additions.includes(id))).toBe(false)
      expect(era.landmarkIds.some((id) => additions.includes(id))).toBe(false)
    }
    expect(validateContent(elements.slice(0, 225), recipes.slice(0, 291), eras, collections)).toEqual([])
    for (const result of ['clothing', 'storage', 'textile', 'sail', 'home', 'quarry', 'harbor', 'knowledge', 'public-bath']) {
      expect(recipes.slice(0, 291).some((recipe) => recipe.result === result)).toBe(true)
    }
  })

  it.each([...additions, ...backlog])('provides a complete bounded history for %s without inventing independent developments', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    for (const field of ['historicalOverview', 'manufactureOrUse', 'historicalSignificance', 'agePlacement'] as const) {
      expect(record[field].text.length).toBeGreaterThan(100)
      expect(record[field].sourceIds.length).toBeGreaterThan(0)
      for (const sourceId of record[field].sourceIds) {
        expect(historicalResearch.sources.find((source) => source.id === sourceId)?.verification.status).toBe('verified')
      }
    }
    expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
    expect(record.relatedDiscoveries.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.furtherResearch.length).toBeGreaterThan(0)
    expect(record.independentDevelopments).toEqual([])
  })

  it('keeps indirect evidence, regional periods, omitted components and priority claims explicit', () => {
    expect(researchByElementId.get('sewing')!.archaeologicalEvidence[0].interpretation).toBe('hypothesis')
    expect(researchByElementId.get('hide')!.approximateDates).toEqual([])
    expect(researchByElementId.get('sailcloth')!.approximateDates).toEqual([])
    expect(researchByElementId.get('sundial')!.approximateDates).toEqual([])
    expect(researchByElementId.get('loom-weight')!.approximateDates[0].dateRange).toBe('323-31 BCE')
    expect(researchByElementId.get('loom-weight')!.agePlacement.text).toContain('overlapping the Classical age')
    expect(researchByElementId.get('lamp')!.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('lamp')!.manufactureOrUse.text).toContain('fuel')
    expect(researchByElementId.get('salted-meat')!.manufactureOrUse.text).toContain('not a tested preservation procedure')
    expect(researchByElementId.get('lever')!.approximateDates).toEqual([])
    expect(researchByElementId.get('winch')!.archaeologicalEvidence[0].evidenceType).toBe('textual-evidence')
    expect(researchByElementId.get('dome')!.agePlacement.text).toContain('priority language')
  })
})
