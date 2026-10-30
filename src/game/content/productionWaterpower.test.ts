import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import rawCollections from './collections.json'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { getGraphMetrics } from '../engine/elementStatus'
import { isEraChallengeComplete } from '../engine/insightRules'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'

const additions = ['pottery-wheel', 'crucible', 'annealing', 'plumb-line', 'waterwheel', 'watermill']
const backlog = ['pottery', 'wheel', 'mold', 'quarry', 'crop', 'bread']
const routes = [
  ['wheel', 'pottery', 'pottery-wheel', 'rotating-pottery-workshop', 'symbolic'],
  ['kiln', 'pottery', 'crucible', 'metallurgical-vessel', 'symbolic'],
  ['copper', 'heat', 'annealing', 'copper-heat-treatment', 'simplified-process'],
  ['cordage', 'rock', 'plumb-line', 'suspended-vertical-reference', 'symbolic'],
  ['river', 'wheel', 'waterwheel', 'river-driven-wheel', 'symbolic'],
  ['waterwheel', 'rotary-quern', 'watermill', 'water-powered-milling', 'simplified-process'],
  ['pottery-wheel', 'clay', 'pottery', 'wheel-assisted-pottery', 'simplified-process'],
  ['crucible', 'bronze', 'bronze-tool', 'crucible-bronze-casting', 'simplified-process'],
  ['annealing', 'copper', 'tool', 'annealed-copper-working', 'symbolic'],
  ['plumb-line', 'rock', 'masonry', 'plumbed-stonework', 'symbolic'],
  ['watermill', 'crop', 'flour', 'watermill-flour', 'simplified-process'],
] as const
const index = createRecipeIndex(recipes)

async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('specialized production, measurement and water power', () => {
  it('meets the paired 225-element / 147-history milestone without unused discoveries', () => {
    const milestoneElements = elements.slice(0, 225)
    const milestoneResearch = historicalResearch.records.slice(0, 147)
    const researchedIds = new Set(milestoneResearch.map((record) => record.elementId))
    expect(milestoneElements).toHaveLength(225)
    expect(recipes.slice(0, 288)).toHaveLength(288)
    expect(milestoneElements.slice(219).map((element) => element.id)).toEqual(additions)
    expect(recipes.slice(277, 288).map((recipe) => recipe.id)).toEqual(routes.map((route) => route[3]))
    expect(milestoneResearch).toHaveLength(147)
    expect(milestoneResearch.slice(135).map((record) => record.elementId)).toEqual([...additions, ...backlog])
    expect(milestoneResearch.flatMap((record) => record.approximateDates)).toHaveLength(176)
    expect(elements.slice(0, 194).filter((element) => !researchedIds.has(element.id))).toHaveLength(78)
    expect(getGraphMetrics(milestoneElements, recipes.slice(0, 291))).toEqual({ total: 225, ingredients: 179, terminal: 46, unused: 0 })
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(eras.map((era) => milestoneElements.filter((element) => element.era === era.id).length)).toEqual([43, 57, 54, 26, 45])
    for (const id of additions) {
      expect(elements.find((element) => element.id === id)?.starter).toBe(false)
      expect(recipes.some((recipe) => recipe.inputs.includes(id))).toBe(true)
    }
  })

  it('preserves the entire 219/277 baseline and every progression and collection definition', async () => {
    expect(await fingerprint(elements.slice(0, 219))).toBe('3b816f630163c5e2e56771c135d52970a676820ad4180c53f0aea448e0433f80')
    expect(await fingerprint(recipes.slice(0, 277))).toBe('09e17b23e795aa3f0205e089e539e3ade69b21a5377df18ec53fd4af81a18470')
    expect(await fingerprint(eras)).toBe('3d526226733e65e43b32c5bea4722fc0ab3629b90a152164b04f59edb4c63884')
    expect(await fingerprint(rawCollections)).toBe('455170eb41f0df382c01538f7d174950fbaacc2d877a3f089fdcbbb79f7665fe')
    expect(collections).toEqual(rawCollections)
    expect(validateContent(elements.slice(0, 219), recipes.slice(0, 277), eras, collections)).toEqual([])
    for (const era of eras) {
      expect(isEraChallengeComplete(era, elements.slice(0, 219).map((element) => element.id), elements)).toBe(true)
      expect(era.grants.some((id) => additions.includes(id))).toBe(false)
    }
  })

  it.each(routes)('resolves %s + %s as %s in both orders with a verified review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(resolveCombination(a, b, createRecipeIndex(recipes.slice(0, 277)))).toBeNull()
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe(classification)
    expect(review.caution.length).toBeGreaterThan(100)
    expect(review.sourceIds.length).toBeGreaterThan(0)
    for (const sourceId of review.sourceIds) {
      expect(historicalResearch.sources.find((source) => source.id === sourceId)?.verification.status).toBe('verified')
    }
  })

  it('reaches the four production discoveries in Bronze Age and water power only in Age V', () => {
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
      for (const id of additions.slice(0, 4)) expect(reached.has(id), `${id} during ${era.id}`).toBe(eraIndex >= 2)
      for (const id of additions.slice(4)) expect(reached.has(id), `${id} during ${era.id}`).toBe(eraIndex >= 4)
      for (const id of ['pottery', 'crop', 'bread', 'flour']) {
        if (eraIndex >= 1) expect(reached.has(id), `${id} during ${era.id}`).toBe(true)
      }
      if (eraIndex >= 2) expect(reached.has('masonry')).toBe(true)
    }
  })

  it.each([...additions, ...backlog])('provides a complete bounded history for %s', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    for (const field of ['historicalOverview', 'manufactureOrUse', 'historicalSignificance', 'agePlacement'] as const) {
      expect(record[field].text.length).toBeGreaterThan(100)
      expect(record[field].sourceIds.length).toBeGreaterThan(0)
    }
    expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.furtherResearch.length).toBeGreaterThan(0)
    expect(record.independentDevelopments).toEqual([])
  })

  it('separates regional dates, missing components, process meanings and reconstruction limits', () => {
    const wheel = researchByElementId.get('pottery-wheel')!
    expect(wheel.agePlacement.status).toBe('earlier-precedents')
    expect(wheel.approximateDates.map((date) => date.regions)).toEqual([['Near East'], ['Egypt']])
    expect(wheel.historicalOverview.text).toContain('staged or hybrid')
    expect(researchByElementId.get('crucible')!.manufactureOrUse.text).toContain('non-refractory')
    expect(researchByElementId.get('annealing')!.archaeologicalEvidence[0].interpretation).toBe('hypothesis')
    expect(researchByElementId.get('annealing')!.manufactureOrUse.text).toContain('cooling rule')
    expect(researchByElementId.get('plumb-line')!.manufactureOrUse.text).toContain('string is now missing')
    expect(researchByElementId.get('plumb-line')!.approximateDates[0].dateType).toBe('dated-evidence')
    expect(researchByElementId.get('waterwheel')!.manufactureOrUse.text).toMatch(/undershot.*overshot/)
    expect(researchByElementId.get('waterwheel')!.archaeologicalEvidence[1].interpretation).toBe('hypothesis')
    expect(researchByElementId.get('watermill')!.historicalOverview.text).toContain('Hand-operated')
    for (const id of ['crucible', 'annealing', 'mold', 'quarry', 'crop']) {
      expect(researchByElementId.get(id)!.approximateDates).toEqual([])
    }
    for (const id of ['berg-potters-wheel', 'el-argar-crucible']) {
      expect(historicalResearch.sources.find((source) => source.id === id)?.verification)
        .toMatchObject({ status: 'verified', accessLevel: 'abstract-only' })
    }
  })
})
