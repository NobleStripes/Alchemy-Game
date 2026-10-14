import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from './index'
import { historicalResearch, researchByElementId } from './research'
import { reviewsByRecipeId } from './recipeReviews'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'
import { getExhaustedElements } from '../engine/elementStatus'

const index = createRecipeIndex(recipes)
const additions = ['merchant-network', 'customs-duty']

describe('optional commerce branch', () => {
  it.each([
    ['coin', 'law', 'coinage', 'authorized-coins'],
    ['coin', 'forge', 'mint', 'coin-workshop'],
    ['amphora', 'voyage', 'maritime-trade', 'amphora-voyage'],
    ['merchant', 'road-network', 'merchant-network', 'connected-merchants'],
    ['maritime-trade', 'law', 'customs-duty', 'regulated-cargo'],
  ])('resolves %s + %s as %s in both orders with a sourced symbolic caution', (a, b, result, id) => {
    expect(resolveCombination(a, b, index)).toMatchObject({ id, result })
    expect(resolveCombination(b, a, index)).toEqual(resolveCombination(a, b, index))
    expect(elements.find((element) => element.id === result)?.era).toBe('classical-antiquity')
    const review = reviewsByRecipeId.get(id)!
    expect(review.classification).toBe('symbolic')
    expect(review.sourceIds.length).toBeGreaterThan(0)
  })

  it.each([
    [elements.slice(0, 184), '427386c93a3c915a936d407f0c9cbf8caea16487b827af80afb48432f977be46'],
    [recipes.slice(0, 222), '76452813d8886d6db6433d8d92c2cbb3b124879d14514142a06946007c2be4d6'],
  ])('preserves the complete pre-commerce catalog prefix %#', async (definitions, expected) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(definitions)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(expected)
  })

  it('keeps new routes optional for all age gates, landmarks, goals and collections', () => {
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
    expect(validateContent(elements.slice(0, 184), recipes.slice(0, 222), eras, collections)).toEqual([])
    expect(elements.slice(184).map((element) => element.id)).toEqual(additions)
    for (const age of eras) {
      expect([...age.unlockRequires, ...age.grants, ...age.landmarkIds].some((id) => additions.includes(id))).toBe(false)
    }
    expect(collections.flatMap((collection) => collection.elementIds).some((id) => additions.includes(id))).toBe(false)
    expect(elements.find((element) => element.id === 'amphora')?.era).toBe('bronze-age')
    expect(resolveCombination('pottery', 'trade', index)?.result).toBe('amphora')
    expect(resolveCombination('bronze', 'market', index)?.result).toBe('coin')
  })

  it('can reach trade, networks and customs without discovering coins, coinage or mints', () => {
    const excluded = new Set(['coin', 'coinage', 'mint'])
    const available = new Set(elements.filter((element) => element.starter).map((element) => element.id))
    const unlocked = new Set([eras[0].id])
    let changed = true
    while (changed) {
      const size = available.size + unlocked.size
      for (const era of eras) {
        if (era.unlockRequires.every((id) => available.has(id))) {
          unlocked.add(era.id)
          for (const id of era.grants) available.add(id)
        }
      }
      for (const recipe of recipes) {
        const era = elements.find((element) => element.id === recipe.result)!.era
        if (!excluded.has(recipe.result) && unlocked.has(era) && recipe.inputs.every((id) => available.has(id))) {
          available.add(recipe.result)
        }
      }
      changed = size !== available.size + unlocked.size
    }
    for (const id of ['trade', 'merchant', 'amphora', 'maritime-trade', ...additions]) expect(available).toContain(id)
    for (const id of excluded) expect(available).not.toContain(id)
  })

  it('reactivates Road Network and Maritime Trade using outgoing graph edges', () => {
    const ids = new Set(['road-network', 'maritime-trade', ...additions])
    expect(getExhaustedElements(recipes.slice(0, 222), ids)).toEqual(new Set(['road-network', 'maritime-trade']))
    expect(getExhaustedElements(recipes, ids)).toEqual(new Set(additions))
  })

  it('distinguishes early electrum evidence, mint techniques and regional monetary traditions', () => {
    const coinage = researchByElementId.get('coinage')!
    expect(coinage.historicalOverview.text).toContain('gold-silver alloy')
    expect(coinage.historicalOverview.text).toContain('late seventh-century BCE')
    expect(coinage.historicalOverview.text).toContain('did not universally require coined money')
    expect(coinage.manufactureOrUse.text).toContain('standardized exchange')
    expect(coinage.manufactureOrUse.text).toContain('not a guarantee')
    expect(coinage.manufactureOrUse.text).toContain('Indian punch-marked')
    expect(coinage.manufactureOrUse.text).toContain('Chinese traditions')
    expect(coinage.historicalUncertainty.join(' ')).toContain('issuer motives remain interpretations')
    expect(coinage.independentDevelopments[0].text).toContain('does not establish simultaneous invention')
    const mint = researchByElementId.get('mint')!
    expect(mint.manufactureOrUse.text).toContain('Weight standards')
    expect(mint.manufactureOrUse.text).toContain('cast forms')
  })

  it('keeps customs distinct from port-only rules, first-tax dates and Palmyrene local taxation', () => {
    const customs = researchByElementId.get('customs-duty')!
    expect(customs.historicalOverview.text).toContain('inland stations')
    expect(customs.historicalOverview.text).toContain('modern national borders')
    expect(customs.manufactureOrUse.text).toContain('local taxes rather than caravan trade')
    expect(customs.approximateDates.map((date) => date.dateType)).toEqual(['dated-evidence', 'dated-evidence'])
    expect(customs.approximateDates[0].note).toContain('Not the invention')
    expect(customs.historicalUncertainty.join(' ')).toContain('earlier base')
    const palmyra = historicalResearch.sources.find((source) => source.id === 'manchester-palmyra-tariff')!
    expect(palmyra.verification).toMatchObject({ status: 'verified', accessLevel: 'abstract-only' })
    expect(reviewsByRecipeId.get('regulated-cargo')?.caution).toContain('local taxes')
  })
})
