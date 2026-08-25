import { create } from 'zustand'
import { elementsById, recipes, starterElementIds } from '../content'
import {
  createRecipeIndex,
  resolveCombination,
} from '../engine/resolveCombination'
import { loadProgress, saveProgress } from './persistence'

type SlotName = 'first' | 'second'

interface AttemptResult {
  kind: 'discovery' | 'known' | 'failure'
  title: string
  detail: string
  resultId?: string
}

interface GameState {
  discoveredIds: string[]
  discoveredRecipeIds: string[]
  firstSlotId: string | null
  secondSlotId: string | null
  lastAttempt: AttemptResult | null
  selectElement: (elementId: string) => void
  placeElement: (slot: SlotName, elementId: string) => void
  clearSlot: (slot: SlotName) => void
  transmute: () => void
  resetProgress: () => void
}

const recipeIndex = createRecipeIndex(recipes)

function initialProgress() {
  const savedProgress = loadProgress()
  return {
    discoveredIds: Array.from(
      new Set([
        ...starterElementIds,
        ...(savedProgress?.discoveredIds ?? []).filter((elementId) =>
          elementsById.has(elementId),
        ),
      ]),
    ),
    discoveredRecipeIds: (savedProgress?.discoveredRecipeIds ?? []).filter(
      (recipeId) => recipes.some((recipe) => recipe.id === recipeId),
    ),
  }
}

const savedProgress = initialProgress()

export const useGameStore = create<GameState>((set, get) => ({
  discoveredIds: savedProgress.discoveredIds,
  discoveredRecipeIds: savedProgress.discoveredRecipeIds,
  firstSlotId: null,
  secondSlotId: null,
  lastAttempt: null,

  selectElement: (elementId) => {
    const { firstSlotId, secondSlotId } = get()
    if (!firstSlotId) {
      set({ firstSlotId: elementId, lastAttempt: null })
    } else if (!secondSlotId) {
      set({ secondSlotId: elementId, lastAttempt: null })
    } else {
      set({ secondSlotId: elementId, lastAttempt: null })
    }
  },

  placeElement: (slot, elementId) => {
    set({
      [slot === 'first' ? 'firstSlotId' : 'secondSlotId']: elementId,
      lastAttempt: null,
    })
  },

  clearSlot: (slot) => {
    set({
      [slot === 'first' ? 'firstSlotId' : 'secondSlotId']: null,
      lastAttempt: null,
    })
  },

  transmute: () => {
    const { discoveredIds, discoveredRecipeIds, firstSlotId, secondSlotId } = get()
    if (!firstSlotId || !secondSlotId) {
      set({
        lastAttempt: {
          kind: 'failure',
          title: 'The circle waits',
          detail: 'Two essences are required.',
        },
      })
      return
    }

    const recipe = resolveCombination(firstSlotId, secondSlotId, recipeIndex)
    if (!recipe) {
      set({
        firstSlotId: null,
        secondSlotId: null,
        lastAttempt: {
          kind: 'failure',
          title: 'No resonance',
          detail: 'These essences remain unchanged.',
        },
      })
      return
    }

    const result = elementsById.get(recipe.result)
    if (!result) return

    const isNew = !discoveredIds.includes(result.id)
    const nextDiscoveries = isNew
      ? [...discoveredIds, result.id]
      : discoveredIds
    const nextRecipeIds = discoveredRecipeIds.includes(recipe.id)
      ? discoveredRecipeIds
      : [...discoveredRecipeIds, recipe.id]
    saveProgress(nextDiscoveries, nextRecipeIds)

    set({
      discoveredIds: nextDiscoveries,
      discoveredRecipeIds: nextRecipeIds,
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: {
        kind: isNew ? 'discovery' : 'known',
        title: isNew ? `Discovered ${result.name}` : result.name,
        detail: recipe.flavor,
        resultId: result.id,
      },
    })
  },

  resetProgress: () => {
    saveProgress(starterElementIds, [])
    set({
      discoveredIds: [...starterElementIds],
      discoveredRecipeIds: [],
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },
}))