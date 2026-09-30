import { elementsById, recipes } from '../content'
import { rainmakerChallenge } from '../content/challenges'
import { createRecipeIndex, resolveCombination } from './resolveCombination'

export type ChallengeSlot = 'first' | 'second'

export interface ChallengeState {
  discoveredIds: string[]
  firstSlotId: string | null
  secondSlotId: string | null
  result: { kind: 'discovery' | 'known' | 'failure'; resultId?: string } | null
  attemptCount: number
  completed: boolean
}

export type ChallengeAction =
  | { type: 'select'; elementId: string }
  | { type: 'place'; slot: ChallengeSlot; elementId: string }
  | { type: 'clearSlot'; slot: ChallengeSlot }
  | { type: 'clearAll' }
  | { type: 'combine' }
  | { type: 'retry' }

const recipeIndex = createRecipeIndex(recipes.filter((recipe) => {
  const result = elementsById.get(recipe.result)
  return result && rainmakerChallenge.allowedResultEraIds.includes(result.era)
}))

export function createChallengeState(): ChallengeState {
  return {
    discoveredIds: [...rainmakerChallenge.starterIds],
    firstSlotId: null,
    secondSlotId: null,
    result: null,
    attemptCount: 0,
    completed: false,
  }
}

export function challengeReducer(state: ChallengeState, action: ChallengeAction): ChallengeState {
  if (action.type === 'retry') return createChallengeState()
  if (state.completed) return state

  switch (action.type) {
    case 'select':
    case 'place': {
      if (!elementsById.has(action.elementId) || !state.discoveredIds.includes(action.elementId)) return state
      const slot = action.type === 'place' ? action.slot : state.firstSlotId ? 'second' : 'first'
      return { ...state, [slot === 'first' ? 'firstSlotId' : 'secondSlotId']: action.elementId, result: null }
    }
    case 'clearSlot':
      return { ...state, [action.slot === 'first' ? 'firstSlotId' : 'secondSlotId']: null, result: null }
    case 'clearAll':
      return { ...state, firstSlotId: null, secondSlotId: null, result: null }
    case 'combine': {
      if (!state.firstSlotId || !state.secondSlotId) return state
      const recipe = resolveCombination(state.firstSlotId, state.secondSlotId, recipeIndex)
      const attemptCount = state.attemptCount + 1
      if (!recipe) {
        return { ...state, secondSlotId: null, result: { kind: 'failure' }, attemptCount }
      }
      const known = state.discoveredIds.includes(recipe.result)
      return {
        ...state,
        discoveredIds: known ? state.discoveredIds : [...state.discoveredIds, recipe.result],
        firstSlotId: null,
        secondSlotId: null,
        result: { kind: known ? 'known' : 'discovery', resultId: recipe.result },
        attemptCount,
        completed: recipe.result === rainmakerChallenge.targetId,
      }
    }
  }
}