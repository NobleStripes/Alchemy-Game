import { create } from 'zustand'
import { elementsById, eras, recipes, starterElementIds } from '../content'
import { areHintsUnlocked, selectHintRecipe } from '../engine/hintRules'
import {
  createRecipeIndex,
  pairKey,
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
  hintCredits: number
  revealedHintRecipeIds: string[]
  activeHintRecipeId: string | null
  failedPairKeys: string[]
  firstSlotId: string | null
  secondSlotId: string | null
  lastAttempt: AttemptResult | null
  selectElement: (elementId: string) => void
  placeElement: (slot: SlotName, elementId: string) => void
  clearSlot: (slot: SlotName) => void
  transmute: () => void
  requestHint: () => void
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
    hintCredits: savedProgress?.hintCredits ?? 3,
    revealedHintRecipeIds: (savedProgress?.revealedHintRecipeIds ?? []).filter(
      (recipeId) => recipes.some((recipe) => recipe.id === recipeId),
    ),
    failedPairKeys: (savedProgress?.failedPairKeys ?? []).filter((key) => {
      const [firstId, secondId] = key.split('::')
      return elementsById.has(firstId) && elementsById.has(secondId)
    }),
  }
}

const savedProgress = initialProgress()

export const useGameStore = create<GameState>((set, get) => ({
  discoveredIds: savedProgress.discoveredIds,
  discoveredRecipeIds: savedProgress.discoveredRecipeIds,
  hintCredits: savedProgress.hintCredits,
  revealedHintRecipeIds: savedProgress.revealedHintRecipeIds,
  activeHintRecipeId: savedProgress.revealedHintRecipeIds.at(-1) ?? null,
  failedPairKeys: savedProgress.failedPairKeys,
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
    const {
      discoveredIds,
      discoveredRecipeIds,
      hintCredits,
      revealedHintRecipeIds,
      activeHintRecipeId,
      failedPairKeys,
      firstSlotId,
      secondSlotId,
    } = get()
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
      const failedKey = pairKey(firstSlotId, secondSlotId)
      const nextFailedPairs = failedPairKeys.includes(failedKey)
        ? failedPairKeys
        : [...failedPairKeys, failedKey]
      saveProgress(
        discoveredIds,
        discoveredRecipeIds,
        hintCredits,
        revealedHintRecipeIds,
        nextFailedPairs,
      )
      set({
        failedPairKeys: nextFailedPairs,
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
    saveProgress(
      nextDiscoveries,
      nextRecipeIds,
      hintCredits,
      revealedHintRecipeIds,
      failedPairKeys,
    )

    set({
      discoveredIds: nextDiscoveries,
      discoveredRecipeIds: nextRecipeIds,
      activeHintRecipeId:
        activeHintRecipeId === recipe.id ? null : activeHintRecipeId,
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

  requestHint: () => {
    const {
      discoveredIds,
      discoveredRecipeIds,
      hintCredits,
      revealedHintRecipeIds,
      failedPairKeys,
    } = get()
    const era = eras[0]
    if (
      hintCredits === 0 ||
      !areHintsUnlocked(
        discoveredIds,
        failedPairKeys,
        era.discoveryGoal,
        era.keystone,
      )
    ) {
      return
    }

    const recipe = selectHintRecipe(
      recipes,
      discoveredIds,
      discoveredRecipeIds,
      revealedHintRecipeIds,
    )
    if (!recipe) return

    const nextHintCredits = hintCredits - 1
    const nextRevealedHints = [...revealedHintRecipeIds, recipe.id]
    saveProgress(
      discoveredIds,
      discoveredRecipeIds,
      nextHintCredits,
      nextRevealedHints,
      failedPairKeys,
    )
    set({
      hintCredits: nextHintCredits,
      revealedHintRecipeIds: nextRevealedHints,
      activeHintRecipeId: recipe.id,
    })
  },

  resetProgress: () => {
    saveProgress(starterElementIds, [], 3, [], [])
    set({
      discoveredIds: [...starterElementIds],
      discoveredRecipeIds: [],
      hintCredits: 3,
      revealedHintRecipeIds: [],
      activeHintRecipeId: null,
      failedPairKeys: [],
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },
}))