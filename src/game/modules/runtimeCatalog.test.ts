import { describe, expect, it } from 'vitest'
import { elements, recipes, eras, collections } from '../content/index.ts'
import { challenges } from '../content/challenges.ts'
import { historicalResearch } from '../content/research.ts'
import { recipeReviews } from '../content/recipeReviews.ts'
import { createChallengeReducer, createChallengeState } from '../engine/challengeRules.ts'
import { createRuntimeCatalog, runtimeCatalog } from './runtimeCatalog.ts'

describe('Phase 10D shared runtime catalog', () => {
  it('retains every core gameplay, research, review, and challenge definition', () => {
    expect(runtimeCatalog.elements).toEqual(elements)
    expect(runtimeCatalog.recipes).toEqual(recipes)
    expect(runtimeCatalog.eras).toEqual(eras)
    expect(runtimeCatalog.collections).toEqual(collections)
    expect(runtimeCatalog.histories).toEqual(historicalResearch.records)
    expect(runtimeCatalog.sources).toEqual(historicalResearch.sources)
    expect(runtimeCatalog.recipeReviews).toEqual(recipeReviews.reviews)
    expect(runtimeCatalog.challenges).toEqual(challenges)
    expect(runtimeCatalog.elementsById.size).toBe(elements.length)
    expect(runtimeCatalog.recipeIndex.size).toBe(recipes.length)
  })

  it('builds a self-contained synthetic catalog without altering core indexes', () => {
    const item = { ...elements.find((x) => x.id === 'rock')!, id: 'synthetic-stone', name: 'Synthetic Stone' }
    const invented = { id: 'synthetic-combination', inputs: ['ember', 'tide'] as [string, string], result: 'synthetic-stone', flavor: 'Test only.' }
    const catalog = createRuntimeCatalog({
      elements: [...elements, item], recipes: [invented], eras, collections: [],
      sources: [], histories: [], recipeReviews: [], challenges: [],
    })
    expect(catalog.elementsById.get(item.id)?.name).toBe('Synthetic Stone')
    expect(catalog.recipeIndex.get('ember::tide')?.result).toBe(item.id)
    expect(runtimeCatalog.elementsById.has(item.id)).toBe(false)
  })

  it('allows the challenge reducer to resolve formulas using a supplied catalog', () => {
    const item = { ...elements.find((x) => x.id === 'rock')!, id: 'synthetic-result', name: 'Synthetic Result' }
    const invented = { id: 'synthetic-route', inputs: ['ember', 'tide'] as [string, string], result: item.id, flavor: 'Test.' }
    const catalog = createRuntimeCatalog({
      elements: [...elements, item], recipes: [invented], eras, collections: [],
      sources: [], histories: [], recipeReviews: [], challenges: [],
    })
    const challenge = {
      id: 'synthetic-lab', name: 'Test', starterIds: ['ember', 'tide'], targetId: item.id,
      allowedResultEraIds: ['first-light'], minimumAttempts: 1,
    }
    const reduce = createChallengeReducer(challenge, catalog)
    let state = createChallengeState(challenge)
    state = reduce(state, { type: 'place', slot: 'first', elementId: 'ember' })
    state = reduce(state, { type: 'place', slot: 'second', elementId: 'tide' })
    state = reduce(state, { type: 'combine' })
    expect(state.completed).toBe(true)
    expect(state.result?.resultId).toBe(item.id)
    expect(runtimeCatalog.recipeIndex.get('ember::tide')?.result).not.toBe(item.id)
  })
})
