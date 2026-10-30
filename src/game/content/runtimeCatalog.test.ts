import { describe, expect, it } from 'vitest'
import rawElements from './elements.json'
import rawRecipes from './recipes.json'
import rawEras from './eras.json'
import rawCollections from './collections.json'
import rawResearch from './research.json'
import rawReviews from './recipeReviews.json'
import { elements, recipes, eras, collections } from './index.ts'
import { challenges } from './challenges.ts'
import { historicalResearch } from './research.ts'
import { recipeReviews } from './recipeReviews.ts'
import { createChallengeReducer, createChallengeState } from '../engine/challengeRules.ts'
import { createRuntimeCatalog, runtimeCatalog } from './runtimeCatalog.ts'

describe('shared core runtime catalog', () => {
  it.each([
    ['elements', rawElements, '39382d3b955d65761293c86dbe1529fbb212465721c27e84fcff9186a9dd1b6a'],
    ['recipes', rawRecipes, 'a6afd9fcf77ad19a8e5735ef03bfec45add65a73ebf6f791c9bec09bce57cffe'],
    ['eras', rawEras, '3d526226733e65e43b32c5bea4722fc0ab3629b90a152164b04f59edb4c63884'],
    ['collections', rawCollections, '455170eb41f0df382c01538f7d174950fbaacc2d877a3f089fdcbbb79f7665fe'],
    ['research', rawResearch, '860d7c46ac27d0514e6a20ea6b74b9717295ae9658eadd97159ec399a7ed6677'],
    ['recipe reviews', rawReviews, 'a786e2dd23da5552072c20b4ad21174ad5f5743e73755f09deb1fe461e9f0e4e'],
  ])('preserves exact base %s definitions', async (_name, definitions, fingerprint) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(definitions)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(fingerprint)
  })
  it('retains every core gameplay, research, review, and challenge definition', () => {
    expect(elements).toHaveLength(225)
    expect(recipes).toHaveLength(291)
    expect(eras).toHaveLength(5)
    expect(historicalResearch.records).toHaveLength(147)
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
    expect([...runtimeCatalog.elementsById.values()]).toEqual(elements)
    expect([...runtimeCatalog.researchByElementId.values()]).toEqual(historicalResearch.records)
    expect([...runtimeCatalog.reviewsByRecipeId.values()]).toEqual(recipeReviews.reviews)
    expect([...runtimeCatalog.challengesById.values()]).toEqual(challenges)
    expect(runtimeCatalog.starterElementIds).toEqual(elements.filter((element) => element.starter).map((element) => element.id))
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
