import { describe, expect, it } from 'vitest'
import { elementsById, eras, recipes } from '.'
import { createChallengeReducer, createChallengeState } from '../engine/challengeRules'
import { challenges, challengesById, learningChallenges, rainmakerChallenge } from './challenges'
import { historicalResearch } from './research'

describe('challenge content', () => {
  it('has unique IDs and valid material, age and verified reference links', () => {
    expect(challengesById.size).toBe(challenges.length)
    expect(rainmakerChallenge.education).toBeUndefined()
    for (const challenge of challenges) {
      expect(new Set(challenge.starterIds).size).toBe(challenge.starterIds.length)
      expect(challenge.starterIds.every((id) => elementsById.has(id))).toBe(true)
      expect(challenge.starterIds).not.toContain(challenge.targetId)
      expect(elementsById.has(challenge.targetId)).toBe(true)
      expect(challenge.allowedResultEraIds.every((id) => eras.some((era) => era.id === id))).toBe(true)
      for (const id of challenge.education?.sourceIds ?? []) {
        expect(historicalResearch.sources.find((source) => source.id === id)?.verification.status).toBe('verified')
      }
    }
  })

  it.each(challenges)('proves $name minimum attempts using all available alternate routes', (challenge) => {
    const available = recipes.filter((recipe) => challenge.allowedResultEraIds.includes(elementsById.get(recipe.result)!.era))
    const queue = [{ ids: new Set(challenge.starterIds), attempts: 0 }]
    const seen = new Set([challenge.starterIds.slice().sort().join('|')])
    let minimum: number | undefined
    for (let index = 0; index < queue.length; index += 1) {
      const { ids, attempts } = queue[index]
      if (ids.has(challenge.targetId)) {
        minimum = attempts
        break
      }
      if (attempts >= challenge.minimumAttempts) continue
      for (const recipe of available) {
        if (ids.has(recipe.result) || !recipe.inputs.every((id) => ids.has(id))) continue
        const next = new Set([...ids, recipe.result])
        const key = [...next].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        queue.push({ ids: next, attempts: attempts + 1 })
      }
    }
    expect(minimum).toBe(challenge.minimumAttempts)
  })

  it.each(learningChallenges)('resets $name to its own starters after a counted failure', (challenge) => {
    const reducer = createChallengeReducer(challenge)
    let state = createChallengeState(challenge)
    const pair = challenge.starterIds.flatMap((first) => challenge.starterIds.map((second) => [first, second]))
      .find(([first, second]) => !recipes.some((recipe) =>
        challenge.allowedResultEraIds.includes(elementsById.get(recipe.result)!.era)
        && recipe.inputs.includes(first) && recipe.inputs.includes(second)
        && (first !== second || recipe.inputs[0] === recipe.inputs[1])))!
    state = reducer(state, { type: 'place', slot: 'first', elementId: pair[0] })
    state = reducer(state, { type: 'place', slot: 'second', elementId: pair[1] })
    state = reducer(state, { type: 'combine' })
    expect(state.result).toEqual({ kind: 'failure' })
    expect(state.attemptCount).toBe(1)
    expect(reducer(state, { type: 'retry' })).toEqual(createChallengeState(challenge))
  })

  it('preserves both the shorter roll route and the longer writing-and-scribe route to records', () => {
    const challenge = challengesById.get('records-lab')!
    const reducer = createChallengeReducer(challenge)
    let state = createChallengeState(challenge)
    for (const [first, second] of [['clay', 'reed'], ['writing', 'human'], ['papyrus', 'cordage'], ['scroll', 'scribe']]) {
      state = reducer(state, { type: 'place', slot: 'first', elementId: first })
      state = reducer(state, { type: 'place', slot: 'second', elementId: second })
      state = reducer(state, { type: 'combine' })
      expect(state.result?.recipeId).toBeDefined()
    }
    expect(state.completed).toBe(true)
    expect(state.attemptCount).toBe(4)
  })
})
