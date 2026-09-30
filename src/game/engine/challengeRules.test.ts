import { describe, expect, it } from 'vitest'
import { elementsById, recipes } from '../content'
import { rainmakerChallenge } from '../content/challenges'
import { challengeReducer, createChallengeState, type ChallengeAction, type ChallengeState } from './challengeRules'

function combine(state: ChallengeState, firstId: string, secondId: string) {
  const actions: ChallengeAction[] = [
    { type: 'place', slot: 'first', elementId: firstId },
    { type: 'place', slot: 'second', elementId: secondId },
    { type: 'combine' },
  ]
  return actions.reduce(challengeReducer, state)
}

function win() {
  return [['tide', 'tide'], ['sea', 'gale'], ['mist', 'gale'], ['cloud', 'tide']]
    .reduce((state, [firstId, secondId]) => combine(state, firstId, secondId), createChallengeState())
}

describe('Rainmaker reducer', () => {
  it('starts with only the four starters and excludes empty attempts', () => {
    const state = createChallengeState()
    expect(state.discoveredIds).toEqual(rainmakerChallenge.starterIds)
    expect(challengeReducer(state, { type: 'combine' })).toBe(state)
    const half = challengeReducer(state, { type: 'select', elementId: 'tide' })
    expect(challengeReducer(half, { type: 'combine' })).toBe(half)
  })

  it('allows repeated selection of the same element and counts known recipes', () => {
    let state = createChallengeState()
    state = challengeReducer(state, { type: 'select', elementId: 'tide' })
    state = challengeReducer(state, { type: 'select', elementId: 'tide' })
    expect([state.firstSlotId, state.secondSlotId]).toEqual(['tide', 'tide'])
    state = challengeReducer(state, { type: 'combine' })
    expect(state.result).toEqual({ kind: 'discovery', resultId: 'sea' })
    expect([state.firstSlotId, state.secondSlotId]).toEqual([null, null])
    state = combine(state, 'tide', 'tide')
    expect(state.attemptCount).toBe(2)
    expect(state.result?.kind).toBe('known')
    expect(state.discoveredIds.filter((id) => id === 'sea')).toHaveLength(1)
  })

  it('counts repeated failures, retaining only the first slot', () => {
    const state = combine(combine(createChallengeState(), 'tide', 'gale'), 'tide', 'gale')
    expect(state.attemptCount).toBe(2)
    expect(state.result).toEqual({ kind: 'failure' })
    expect([state.firstSlotId, state.secondSlotId]).toEqual(['tide', null])
    expect(state.discoveredIds).toEqual(rainmakerChallenge.starterIds)
  })

  it('rejects unknown and undiscovered IDs for selection and placement', () => {
    const state = createChallengeState()
    for (const elementId of ['rain', 'missing']) {
      expect(challengeReducer(state, { type: 'select', elementId })).toBe(state)
      expect(challengeReducer(state, { type: 'place', slot: 'second', elementId })).toBe(state)
    }
  })

  it('clears one or both slots without counting attempts', () => {
    const state = { ...createChallengeState(), firstSlotId: 'ember', secondSlotId: 'stone' }
    expect(challengeReducer(state, { type: 'clearSlot', slot: 'first' })).toMatchObject({ firstSlotId: null, secondSlotId: 'stone', attemptCount: 0 })
    expect(challengeReducer(state, { type: 'clearAll' })).toMatchObject({ firstSlotId: null, secondSlotId: null, attemptCount: 0 })
  })

  it('does not resolve recipes from later eras or grant their results', () => {
    const recipe = recipes.find((entry) => elementsById.get(entry.result)?.era !== 'first-light')!
    const state = { ...createChallengeState(), discoveredIds: [...new Set([...rainmakerChallenge.starterIds, ...recipe.inputs])] }
    const next = combine(state, ...recipe.inputs)
    expect(next.result?.kind).toBe('failure')
    expect(next.discoveredIds).toEqual(state.discoveredIds)
  })

  it('reaches Rain in four attempts and freezes every gameplay action', () => {
    const state = win()
    expect(state).toMatchObject({ completed: true, attemptCount: 4, result: { kind: 'discovery', resultId: 'rain' } })
    expect(state.discoveredIds).toEqual(['ember', 'tide', 'stone', 'gale', 'sea', 'mist', 'cloud', 'rain'])
    const actions: ChallengeAction[] = [
      { type: 'select', elementId: 'tide' }, { type: 'place', slot: 'first', elementId: 'ember' },
      { type: 'clearSlot', slot: 'second' }, { type: 'clearAll' }, { type: 'combine' },
    ]
    for (const action of actions) expect(challengeReducer(state, action)).toBe(state)
  })

  it('retry resets both unfinished and completed runs to fresh transient state', () => {
    expect(challengeReducer(win(), { type: 'retry' })).toEqual(createChallengeState())
    expect(challengeReducer(combine(createChallengeState(), 'tide', 'gale'), { type: 'retry' })).toEqual(createChallengeState())
  })
})