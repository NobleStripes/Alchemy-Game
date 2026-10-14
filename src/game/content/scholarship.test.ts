import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from './index'
import { learningChallenges } from './challenges'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'
import { getExhaustedElements } from '../engine/elementStatus'

const additions = ['historical-writing', 'cartography', 'commentary']
const index = createRecipeIndex(recipes)

describe('optional scholarship discoveries', () => {
  it.each([
    ['scribe', 'knowledge', 'historical-writing', 'remembered-past'],
    ['map', 'geometry', 'cartography', 'reasoned-maps'],
    ['scroll', 'logic', 'commentary', 'interpreted-text'],
    ['archive', 'city', 'library', 'city-of-texts'],
    ['human', 'agora', 'rhetoric', 'public-persuasion'],
  ])('resolves %s + %s to %s in both orders with sourced context', (a, b, result, id) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(elements.find((element) => element.id === result)?.era).toBe('classical-antiquity')
    expect(reviewsByRecipeId.get(id)).toMatchObject({ classification: 'symbolic' })
    expect(reviewsByRecipeId.get(id)!.sourceIds.length).toBeGreaterThan(0)
    expect(researchByElementId.has(result)).toBe(true)
  })

  it.each([
    [elements.slice(0, 186), 'ea33a447f020f356ec90b5e27897da71ca5d37da50aabab7d25f41369d252e62'],
    [recipes.slice(0, 224), '8bb44bc5d9c59e8ff8eac71d4bfab51e25771b4f4ff531032ecd1a59ff05af2a'],
  ])('preserves all previous gameplay definitions %#', async (definitions, expected) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(definitions)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(expected)
  })

  it('validates gated reachability with and without the optional branch', () => {
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(validateContent(elements.slice(0, 186), recipes.slice(0, 224), eras, collections)).toEqual([])
    expect(elements.slice(186).map((element) => element.id)).toEqual(additions)
    const requirements = JSON.stringify({ eras, collections, learningChallenges })
    for (const id of additions) expect(requirements).not.toContain(`"${id}"`)
    for (const id of ['writing', 'scroll', 'map', 'scribe', 'archive']) {
      expect(elements.find((element) => element.id === id)?.era).toBe('bronze-age')
    }
    expect(elements.some((element) => ['mathematics', 'geography'].includes(element.id))).toBe(false)
  })

  it('gives Logic an outgoing use while keeping new terminal discoveries selectable', () => {
    const ids = new Set(['logic', ...additions])
    expect(getExhaustedElements(recipes.slice(0, 224), ids)).toEqual(new Set(['logic']))
    expect(getExhaustedElements(recipes, ids)).toEqual(new Set(additions))
  })

  it('distinguishes textual narratives, royal inscriptions and their interpretations', () => {
    const history = researchByElementId.get('historical-writing')!
    expect(history.agePlacement.status).toBe('earlier-precedents')
    expect(history.historicalOverview.text).toContain('not the beginning')
    expect(history.manufactureOrUse.text).toContain('not automatic proof')
    expect(history.archaeologicalEvidence.map((item) => item.evidenceType)).toEqual([
      'textual-evidence', 'artifact', 'interpretation',
    ])
    expect(history.archaeologicalEvidence.at(-1)?.interpretation).toBe('disputed')
    expect(researchByElementId.get('library')!.manufactureOrUse.text).toContain('colophons')
    expect(researchByElementId.get('rhetoric')!.manufactureOrUse.text).toContain('not a transcript')
  })

  it('distinguishes geographic representation from modern precision and uncertain functions', () => {
    const maps = researchByElementId.get('cartography')!
    expect(maps.manufactureOrUse.text).toContain('not modern precision surveys')
    expect(maps.historicalUncertainty.join(' ')).toContain('findspot is probable')
    expect(maps.archaeologicalEvidence.find((item) => item.evidenceType === 'interpretation')?.interpretation).toBe('hypothesis')
    const source = historicalResearch.sources.find((source) => source.id === 'whe-babylonian-map')!
    expect(source.verification.status).toBe('verified')
    if (source.verification.status === 'verified') expect(source.verification.locator).toContain('direct object page was blocked')
  })

  it('connects Chinese mathematical commentary and earlier Egyptian explanations without Greek prerequisites', () => {
    const commentary = researchByElementId.get('commentary')!
    expect(commentary.agePlacement.text).toContain('not derived')
    expect(commentary.approximateDates[1]).toMatchObject({
      dateType: 'dated-evidence', precision: 'year-resolved',
    })
    expect(commentary.approximateDates[1].note).toContain('not the first')
    expect(commentary.gameplaySimplifications.join(' ')).toContain('neither papyrus rolls nor Greek formal logic')
    expect(commentary.historicalUncertainty.join(' ')).toContain('modern analogy')
  })
})
