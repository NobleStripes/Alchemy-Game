import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from './index'
import { learningChallenges } from './challenges'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'
import { getExhaustedElements } from '../engine/elementStatus'

const additions = ['imperial-bureaucracy', 'provincial-government', 'diplomatic-mission', 'caravan-route', 'cultural-exchange']
const index = createRecipeIndex(recipes)

describe('optional regional administration and connections', () => {
  it.each([
    ['empire', 'scribe', 'imperial-bureaucracy', 'recorded-rule'],
    ['imperial-bureaucracy', 'city', 'provincial-government', 'delegated-rule'],
    ['nation', 'rhetoric', 'diplomatic-mission', 'authorized-envoys'],
    ['merchant', 'land', 'caravan-route', 'overland-caravans'],
    ['diplomatic-mission', 'knowledge', 'cultural-exchange', 'encountered-ideas'],
  ])('resolves %s + %s to %s in both orders with sourced symbolic context', (a, b, result, id) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(elements.find((element) => element.id === result)?.era).toBe('classical-antiquity')
    expect(reviewsByRecipeId.get(id)?.classification).toBe('symbolic')
    expect(reviewsByRecipeId.get(id)!.sourceIds.length).toBeGreaterThan(0)
    expect(researchByElementId.get(result)?.approximateDates.length).toBeGreaterThan(0)
  })

  it.each([
    [elements.slice(0, 189), '8689e41b46f4403e136c91d7d443b25306ee1cb8a5ae1b86c7757e31d4075c81'],
    [recipes.slice(0, 227), 'd899691f79ca95fc962cd9b34e9cd278e7be0bea1f1a3cae9dc0f74b2a441523'],
  ])('preserves every prior gameplay definition %#', async (definitions, expected) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(definitions)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(expected)
  })

  it('keeps the full gated graph reachable and the branch optional for all progression targets', () => {
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(validateContent(elements.slice(0, 189), recipes.slice(0, 227), eras, collections)).toEqual([])
    expect(elements.slice(189, 194).map((element) => element.id)).toEqual(additions)
    const requirements = JSON.stringify({ eras, collections, learningChallenges })
    for (const id of additions) expect(requirements).not.toContain(`"${id}"`)
    expect(resolveCombination('merchant', 'map', index)?.result).toBe('voyage')
    expect(elements.find((element) => element.id === 'nation')?.name).toBe('Polity')
    expect(elements.find((element) => element.id === 'empire')?.era).toBe('iron-age')
  })

  it('derives new uses of Empire without marking intermediate administration as terminal', () => {
    const ids = new Set(['empire', ...additions])
    expect(getExhaustedElements(recipes.slice(0, 227), ids)).toEqual(new Set(['empire']))
    expect(getExhaustedElements(recipes, ids)).toEqual(new Set(['provincial-government', 'caravan-route', 'cultural-exchange']))
  })

  it('distinguishes regional institutions, royal prescriptions and later examination systems', () => {
    const bureaucracy = researchByElementId.get('imperial-bureaucracy')!
    expect(bureaucracy.manufactureOrUse.text).toContain('not proof that every official complied')
    expect(bureaucracy.historicalOverview.text).toContain('Qin')
    expect(bureaucracy.historicalOverview.text).toContain('Han')
    expect(bureaucracy.gameplaySimplifications.join(' ')).toContain('later Sui')
    const provincial = researchByElementId.get('provincial-government')!
    expect(provincial.independentDevelopments[0].text).toContain('not equated')
    expect(provincial.approximateDates.at(-1)).toMatchObject({
      dateType: 'dated-evidence', precision: 'year-resolved', regions: ['Lumbini, present-day Nepal'],
    })
    expect(provincial.archaeologicalEvidence[0].text).toContain('Brahmi')
  })

  it('separates diplomatic claims from reception and avoids universal exchange prerequisites', () => {
    const mission = researchByElementId.get('diplomatic-mission')!
    expect(mission.manufactureOrUse.text).toContain('not independent proof')
    expect(mission.gameplaySimplifications.join(' ')).toContain('Greek rhetoric is not')
    const route = researchByElementId.get('caravan-route')!
    expect(route.agePlacement.text).toContain('no single worldwide opening date')
    const exchange = researchByElementId.get('cultural-exchange')!
    expect(exchange.gameplaySimplifications.join(' ')).toContain('diplomacy is not universally required')
    expect(exchange.gameplaySimplifications.join(' ')).toContain('conquest')
    expect(exchange.manufactureOrUse.text).toContain('not proof of universal harmony')
  })

  it('discloses selected-passages access rather than claiming direct inspection of every original', () => {
    for (const id of ['isac-fortification', 'csu-asoka-edicts', 'unesco-lumbini', 'whe-qin', 'whe-sima-qian', 'columbia-examinations', 'whe-silk-road']) {
      const verification = historicalResearch.sources.find((source) => source.id === id)!.verification
      expect(verification.status).toBe('verified')
      if (verification.status === 'verified') expect(verification.accessLevel).toBe('selected-passages')
    }
    const edicts = historicalResearch.sources.find((source) => source.id === 'csu-asoka-edicts')!
    expect(edicts.institution).toContain('hosted translation')
    if (edicts.verification.status === 'verified') expect(edicts.verification.locator).toContain('not a university critical edition')
  })
})
