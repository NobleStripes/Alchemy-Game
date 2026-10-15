import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { historicalSourceSchema } from './schema'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { getGraphMetrics, getTemporarilyExhaustedElements } from '../engine/elementStatus'
import { selectHintRecipe } from '../engine/hintRules'
import { isEraChallengeComplete } from '../engine/insightRules'
import { validateContent } from '../engine/validateContent'

const additions = ['grinding-stone', 'spindle', 'yarn', 'kiln', 'fired-brick', 'tin-ore']
const backlog = ['flour', 'fibre', 'loom', 'textile', 'tin', 'brick']
const routes = [
  ['rock', 'stone-tool', 'grinding-stone', 'prepared-grindstone', 'symbolic'],
  ['fibre', 'stone-tool', 'spindle', 'spinning-tool', 'symbolic'],
  ['spindle', 'fibre', 'yarn', 'twisted-yarn', 'simplified-process'],
  ['pottery', 'hearth', 'kiln', 'firing-workshop', 'symbolic'],
  ['kiln', 'brick', 'fired-brick', 'fired-building-unit', 'simplified-process'],
  ['quarry', 'rock', 'tin-ore', 'recognized-tin-ore', 'symbolic'],
  ['grinding-stone', 'crop', 'flour', 'hand-ground-flour', 'material-process'],
  ['loom', 'yarn', 'textile', 'woven-yarn', 'simplified-process'],
  ['tin-ore', 'charcoal', 'tin', 'reduced-tin-ore', 'simplified-process'],
  ['fired-brick', 'fired-brick', 'wall', 'fired-brick-wall', 'simplified-process'],
  ['fibre', 'human', 'yarn', 'hand-twisted-yarn', 'simplified-process'],
]
const recipeIds = new Set(routes.map((route) => route[3]))
const index = createRecipeIndex(recipes)

describe('production foundations milestone', () => {
  it('meets the 200-element and paired 97-history milestones without unused nodes', () => {
    expect(elements).toHaveLength(200)
    expect(recipes).toHaveLength(243)
    expect(elements.slice(194).map((element) => element.id)).toEqual(additions)
    expect(recipes.slice(232).map((recipe) => recipe.id)).toEqual([...recipeIds])
    expect(historicalResearch.records).toHaveLength(97)
    expect(historicalResearch.records.slice(85).map((record) => record.elementId)).toEqual([...additions, ...backlog])
    expect(historicalResearch.records.reduce((sum, record) => sum + record.approximateDates.length, 0)).toBe(149)
    expect(elements.slice(0, 194).filter((element) => !researchByElementId.has(element.id))).toHaveLength(103)
    expect(getGraphMetrics(elements, recipes)).toEqual({ total: 200, ingredients: 151, terminal: 49, unused: 0 })
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
  })

  it.each(routes)('resolves %s + %s as %s with an individual cited review', (a, b, result, id, classification) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(reviewsByRecipeId.get(id)).toMatchObject({ classification })
    const sources = reviewsByRecipeId.get(id)!.sourceIds
    expect(sources.length).toBeGreaterThan(0)
    expect(sources.every((sourceId) => historicalResearch.sources.some(
      (source) => source.id === sourceId && source.verification.status === 'verified',
    ))).toBe(true)
  })

  it('keeps all legacy paths, gates, objectives and completion available without the expansion', () => {
    const legacyElements = elements.filter((element) => !additions.includes(element.id))
    const legacyRecipes = recipes.filter((recipe) => !recipeIds.has(recipe.id))
    expect(legacyElements).toHaveLength(194)
    expect(legacyRecipes).toHaveLength(232)
    expect(validateContent(legacyElements, legacyRecipes, eras, collections)).toEqual([])
    const legacyIds = legacyElements.map((element) => element.id)
    for (const era of eras) expect(isEraChallengeComplete(era, legacyIds, elements)).toBe(true)
    for (const [a, b, result] of [
      ['clay', 'hearth', 'pottery'], ['clay', 'ember', 'brick'],
      ['quarry', 'tide', 'tin'], ['loom', 'fibre', 'textile'],
      ['crop', 'tool', 'flour'], ['rotary-quern', 'crop', 'flour'],
    ]) expect(resolveCombination(a, b, index)?.result).toBe(result)
  })

  it('offers hand-work yarn during the Stone Age rather than requiring a later spindle', () => {
    expect(elements.find((element) => element.id === 'spindle')?.era).toBe('bronze-age')
    expect(elements.find((element) => element.id === 'yarn')?.era).toBe('stone-age')
    const ids = elements.filter((element) => ['first-light', 'stone-age'].includes(element.era)).map((element) => element.id)
    const known = recipes.filter((recipe) => ids.includes(recipe.result) && recipe.id !== 'hand-twisted-yarn').map((recipe) => recipe.id)
    expect(selectHintRecipe(recipes, ['fibre', 'human'], known, [], elements, 'stone-age')?.id).toBe('hand-twisted-yarn')
    expect(resolveCombination('fibre', 'human', index)?.result).toBe('yarn')
  })

  it('reactivates exhausted ingredients when new outgoing routes are introduced', () => {
    const legacyRecipes = recipes.filter((recipe) => !recipeIds.has(recipe.id))
    const discovered = new Set(elements.slice(0, 194).map((element) => element.id))
    const performed = new Set(legacyRecipes.map((recipe) => recipe.id))
    const unlocked = new Set(eras.map((era) => era.id))
    const elementEras = new Map(elements.map((element) => [element.id, element.era]))
    const before = getTemporarilyExhaustedElements(legacyRecipes, discovered, performed, unlocked, elementEras)
    const after = getTemporarilyExhaustedElements(recipes, discovered, performed, unlocked, elementEras)
    for (const id of ['pottery', 'hearth', 'fibre', 'quarry', 'rock']) {
      expect(before.has(id)).toBe(true)
      expect(after.has(id)).toBe(false)
    }
  })

  it.each([...additions, ...backlog])('adds a complete bounded history for %s', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    expect(record.historicalOverview.sourceIds.length).toBeGreaterThan(0)
    expect(record.manufactureOrUse.sourceIds.length).toBeGreaterThan(0)
    expect(record.historicalSignificance.sourceIds.length).toBeGreaterThan(0)
    expect(record.agePlacement.sourceIds.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.independentDevelopments).toEqual([])
  })

  it('retains evidence limits instead of inventing firsts or universal production sequences', () => {
    expect(researchByElementId.get('kiln')!.historicalOverview.text).toContain('coexistence')
    expect(researchByElementId.get('kiln')!.historicalUncertainty.join(' ')).toContain('not the full Miller chapter')
    expect(researchByElementId.get('yarn')!.historicalOverview.text).toContain('spindle-free')
    expect(researchByElementId.get('fibre')!.gameplaySimplifications.join(' ')).toContain('Plant and Stone Tool')
    expect(researchByElementId.get('spindle')!.agePlacement.text).toContain('not the invention')
    expect(researchByElementId.get('loom')!.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('brick')!.gameplaySimplifications.join(' ')).toContain('dried Mud Brick')
    expect(researchByElementId.get('tin-ore')!.archaeologicalEvidence).toEqual([])
    expect(researchByElementId.get('tin')!.approximateDates).toEqual([])
    const preprint = historicalResearch.sources.find((source) => source.id === 'indus-brick-chronology')!
    expect(historicalSourceSchema.parse(preprint).sourceType).toBe('research-preprint')
    expect(preprint.verification).toMatchObject({ status: 'verified', accessLevel: 'selected-passages' })
  })
})
