import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import rawCollections from './collections.json'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { getGraphMetrics, getTemporarilyExhaustedElements } from '../engine/elementStatus'
import { selectHintRecipe } from '../engine/hintRules'
import { isEraChallengeComplete } from '../engine/insightRules'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'

const additions = ['resin', 'adhesive', 'dugout-canoe', 'paddle']
const backlog = ['stone-tool', 'cordage', 'net', 'hearth']
const routes = [
  ['forest', 'stone-tool', 'resin', 'harvested-forest-resin', 'symbolic'],
  ['resin', 'heat', 'adhesive', 'prepared-resin-adhesive', 'simplified-process'],
  ['forest', 'axe', 'dugout-canoe', 'hollowed-tree-canoe', 'symbolic'],
  ['dugout-canoe', 'tree', 'paddle', 'canoe-paddle-equipment', 'symbolic'],
  ['adhesive', 'stone-tool', 'axe', 'adhesive-hafting', 'symbolic'],
  ['dugout-canoe', 'net', 'food', 'canoe-net-fishing', 'symbolic'],
  ['paddle', 'boat', 'voyage', 'paddled-voyage', 'symbolic'],
] as const
const index = createRecipeIndex(recipes)

async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('Stone Age materials and watercraft', () => {
  it('appends exactly four discoveries, seven routes and eight full histories', () => {
    expect(elements).toHaveLength(219)
    expect(recipes).toHaveLength(277)
    expect(elements.slice(215).map((element) => element.id)).toEqual(additions)
    expect(recipes.slice(270).map((recipe) => recipe.id)).toEqual(routes.map((route) => route[3]))
    expect(historicalResearch.records).toHaveLength(135)
    expect(historicalResearch.records.slice(127).map((record) => record.elementId)).toEqual([...additions, ...backlog])
    expect(historicalResearch.records.flatMap((record) => record.approximateDates)).toHaveLength(168)
    expect(elements.slice(0, 194).filter((element) => !researchByElementId.has(element.id))).toHaveLength(84)
    expect(getGraphMetrics(elements, recipes)).toEqual({ total: 219, ingredients: 173, terminal: 46, unused: 0 })
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    for (const id of additions) {
      expect(elements.find((element) => element.id === id)).toMatchObject({ era: 'stone-age', starter: false })
      expect(recipes.some((recipe) => recipe.inputs.includes(id))).toBe(true)
    }
  })

  it('preserves every 215/270 definition and unchanged era and collection requirement', async () => {
    expect(await fingerprint(elements.slice(0, 215))).toBe('b76f245d2212347c93d2c78b43f180280108486e490d86bb696a2d5565e9214b')
    expect(await fingerprint(recipes.slice(0, 270))).toBe('f96c2f16edd9ba3bfabd31803b1157642ea424299a21f64169f73d8cabfbfd7f')
    expect(await fingerprint(eras)).toBe('3d526226733e65e43b32c5bea4722fc0ab3629b90a152164b04f59edb4c63884')
    expect(await fingerprint(rawCollections)).toBe('455170eb41f0df382c01538f7d174950fbaacc2d877a3f089fdcbbb79f7665fe')
    expect(collections).toEqual(rawCollections)
    expect(validateContent(elements.slice(0, 215), recipes.slice(0, 270), eras, collections)).toEqual([])
    for (const era of eras) {
      expect(isEraChallengeComplete(era, elements.slice(0, 215).map((element) => element.id), elements)).toBe(true)
    }
  })

  it.each(routes)('resolves %s + %s as %s in both orders with a cited individual review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(resolveCombination(a, b, createRecipeIndex(recipes.slice(0, 270)))).toBeNull()
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe(classification)
    expect(review.caution.length).toBeGreaterThan(100)
    expect(review.sourceIds.length).toBeGreaterThan(0)
    for (const sourceId of review.sourceIds) {
      expect(historicalResearch.sources.find((source) => source.id === sourceId)?.verification.status).toBe('verified')
    }
  })

  it('reaches all additions during Stone Age without Timber, Boat, Sail or metal tools', () => {
    const reached = new Set<string>()
    for (const era of eras.slice(0, 2)) {
      for (const element of elements) if (element.starter) reached.add(element.id)
      for (const id of era.grants) reached.add(id)
      const allowed = new Set(elements.filter((element) =>
        eras.findIndex((entry) => entry.id === element.era) <= eras.indexOf(era),
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
      for (const id of additions) expect(reached.has(id)).toBe(era.id === 'stone-age')
    }
    for (const id of ['boat', 'timber', 'sail', 'iron-tool', 'gouge', 'voyage']) expect(reached.has(id)).toBe(false)
    expect(resolveCombination('stone-tool', 'cordage', index)?.result).toBe('axe')
  })

  it('reactivates formerly completed ingredients and offers the new route as a contextual hint', () => {
    const discovered = new Set(elements.slice(0, 215).map((element) => element.id))
    const performed = new Set(recipes.slice(0, 270).map((recipe) => recipe.id))
    const unlocked = new Set(eras.map((era) => era.id))
    const elementEras = new Map(elements.map((element) => [element.id, element.era]))
    const before = getTemporarilyExhaustedElements(recipes.slice(0, 270), discovered, performed, unlocked, elementEras)
    const after = getTemporarilyExhaustedElements(recipes, discovered, performed, unlocked, elementEras)
    expect(before.has('forest')).toBe(true)
    expect(after.has('forest')).toBe(false)
    expect(selectHintRecipe(recipes, ['forest', 'stone-tool'], [...performed], [], elements, 'stone-age')?.id)
      .toBe('harvested-forest-resin')
  })

  it.each([...additions, ...backlog])('provides complete and bounded research for %s', (id) => {
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

  it('keeps evidence dates, natural formation, hypotheses and access limits separate', () => {
    expect(researchByElementId.get('resin')!.approximateDates[0]).toMatchObject({
      dateType: 'undated', precision: 'undated', regions: [],
    })
    expect(researchByElementId.get('resin')!.approximateDates[1].note).toContain('not a direct resin date')
    expect(researchByElementId.get('adhesive')!.historicalUncertainty.join(' ')).toContain('Gum is not conifer resin')
    expect(researchByElementId.get('dugout-canoe')!.approximateDates.map((date) => date.dateRange))
      .toEqual(['Circa 8250-7550 BCE: Pesse canoe', 'Circa 3500 BCE: Broksoe dugout'])
    expect(researchByElementId.get('paddle')!.approximateDates).toEqual([])
    expect(researchByElementId.get('paddle')!.archaeologicalEvidence[1].interpretation).toBe('hypothesis')
    expect(researchByElementId.get('net')!.approximateDates[0].note).toContain('radiocarbon BP')
    expect(researchByElementId.get('cordage')!.approximateDates[0].note).toContain('not a direct cord date')
    for (const id of ['stone-tool', 'hearth']) expect(researchByElementId.get(id)!.approximateDates).toEqual([])
    expect(historicalResearch.sources.find((source) => source.id === 'antrea-net-environment')?.verification)
      .toMatchObject({ status: 'verified', accessLevel: 'abstract-only' })
    expect(historicalResearch.sources.find((source) => source.id === 'drents-pesse-canoe')?.verification)
      .toMatchObject({ status: 'verified', accessLevel: 'collection-record' })
  })
})
