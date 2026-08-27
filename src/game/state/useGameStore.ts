import { create } from 'zustand'
import { elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { reconcileEraProgress } from '../engine/eraProgress'
import { areGlobalHintsUnlocked, selectHintRecipe } from '../engine/hintRules'
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
  unlockedEra?: {
    name: string
    grantNames: string[]
  }
}

interface GameState {
  discoveredIds: string[]
  discoveredRecipeIds: string[]
  hintCredits: number
  revealedHintRecipeIds: string[]
  activeHintRecipeId: string | null
  failedPairKeys: string[]
  unlockedEraIds: string[]
  activeEraId: string
  firstSlotId: string | null
  secondSlotId: string | null
  lastAttempt: AttemptResult | null
  selectElement: (elementId: string) => void
  placeElement: (slot: SlotName, elementId: string) => void
  clearSlot: (slot: SlotName) => void
  transmute: () => void
  requestHint: () => void
  setActiveEra: (eraId: string) => void
  resetProgress: () => void
}

const recipeIndex = createRecipeIndex(recipes)

function initialProgress() {
  const savedProgress = loadProgress()
  const eraProgress = reconcileEraProgress(
    [
      ...starterElementIds,
      ...(savedProgress?.discoveredIds ?? []).filter((elementId) =>
        elementsById.has(elementId),
      ),
    ],
    savedProgress?.unlockedEraIds ?? ['first-light'],
    elements,
    eras,
  )
  const savedActiveEraId = savedProgress?.activeEraId ?? ''
  const activeEraId = eraProgress.unlockedEraIds.includes(savedActiveEraId)
    ? savedActiveEraId
    : eraProgress.unlockedEraIds.at(-1) ?? eras[0].id

  return {
    discoveredIds: eraProgress.discoveredIds,
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
    unlockedEraIds: eraProgress.unlockedEraIds,
    activeEraId,
  }
}

const savedProgress = initialProgress()

export const useGameStore = create<GameState>((set, get) => ({
  ...savedProgress,
  activeHintRecipeId: savedProgress.revealedHintRecipeIds.at(-1) ?? null,
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
    const state = get()
    const { firstSlotId, secondSlotId } = state
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
    const result = recipe ? elementsById.get(recipe.result) : null
    if (result && !state.unlockedEraIds.includes(result.era)) {
      const lockedEra = eras.find((era) => era.id === result.era)
      const nextOpenLeads = state.revealedHintRecipeIds.includes(recipe!.id)
        ? state.revealedHintRecipeIds
        : [...state.revealedHintRecipeIds, recipe!.id]
      saveProgress(
        state.discoveredIds,
        state.discoveredRecipeIds,
        state.hintCredits,
        nextOpenLeads,
        state.failedPairKeys,
        state.unlockedEraIds,
        state.activeEraId,
      )
      set({
        revealedHintRecipeIds: nextOpenLeads,
        secondSlotId: null,
        lastAttempt: {
          kind: 'failure',
          title: 'A later page',
          detail: `${lockedEra?.name ?? 'Another age'} must be unlocked first. Recorded as an open lead.`,
        },
      })
      return
    }

    if (!recipe || !result) {
      const failedKey = pairKey(firstSlotId, secondSlotId)
      const nextFailedPairs = state.failedPairKeys.includes(failedKey)
        ? state.failedPairKeys
        : [...state.failedPairKeys, failedKey]
      saveProgress(
        state.discoveredIds,
        state.discoveredRecipeIds,
        state.hintCredits,
        state.revealedHintRecipeIds,
        nextFailedPairs,
        state.unlockedEraIds,
        state.activeEraId,
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

    const isNew = !state.discoveredIds.includes(result.id)
    const nextDiscoveries = isNew
      ? [...state.discoveredIds, result.id]
      : state.discoveredIds
    const nextRecipeIds = state.discoveredRecipeIds.includes(recipe.id)
      ? state.discoveredRecipeIds
      : [...state.discoveredRecipeIds, recipe.id]
    const successfulPairKey = pairKey(firstSlotId, secondSlotId)
    const nextFailedPairKeys = state.failedPairKeys.filter(
      (key) => key !== successfulPairKey,
    )
    const nextEraProgress = reconcileEraProgress(
      nextDiscoveries,
      state.unlockedEraIds,
      elements,
      eras,
    )
    const unlockedEraId = nextEraProgress.unlockedEraIds.find(
      (eraId) => !state.unlockedEraIds.includes(eraId),
    )
    const nextActiveEraId = unlockedEraId ?? state.activeEraId
    const unlockedEra = unlockedEraId
      ? eras.find((era) => era.id === unlockedEraId)
      : undefined

    saveProgress(
      nextEraProgress.discoveredIds,
      nextRecipeIds,
      state.hintCredits,
      state.revealedHintRecipeIds,
      nextFailedPairKeys,
      nextEraProgress.unlockedEraIds,
      nextActiveEraId,
    )
    set({
      discoveredIds: nextEraProgress.discoveredIds,
      discoveredRecipeIds: nextRecipeIds,
      failedPairKeys: nextFailedPairKeys,
      unlockedEraIds: nextEraProgress.unlockedEraIds,
      activeEraId: nextActiveEraId,
      activeHintRecipeId:
        state.activeHintRecipeId === recipe.id
          ? null
          : state.activeHintRecipeId,
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: {
        kind: isNew ? 'discovery' : 'known',
        title: isNew ? `Discovered ${result.name}` : result.name,
        detail: recipe.flavor,
        resultId: result.id,
        unlockedEra: unlockedEra
          ? {
              name: unlockedEra.name,
              grantNames: unlockedEra.grants
                .map((elementId) => elementsById.get(elementId)?.name)
                .filter((name) => name !== undefined),
            }
          : undefined,
      },
    })
  },

  requestHint: () => {
    const state = get()
    const origins = eras[0]
    if (
      state.hintCredits === 0 ||
      !areGlobalHintsUnlocked(
        state.discoveredIds,
        state.failedPairKeys,
        elements,
        origins,
      )
    ) {
      return
    }

    const unlockedRecipes = recipes.filter((recipe) => {
      const result = elementsById.get(recipe.result)
      return result && state.unlockedEraIds.includes(result.era)
    })
    const recipe = selectHintRecipe(
      unlockedRecipes,
      state.discoveredIds,
      state.discoveredRecipeIds,
      state.revealedHintRecipeIds,
    )
    if (!recipe) return

    const nextHintCredits = state.hintCredits - 1
    const nextRevealedHints = [...state.revealedHintRecipeIds, recipe.id]
    saveProgress(
      state.discoveredIds,
      state.discoveredRecipeIds,
      nextHintCredits,
      nextRevealedHints,
      state.failedPairKeys,
      state.unlockedEraIds,
      state.activeEraId,
    )
    set({
      hintCredits: nextHintCredits,
      revealedHintRecipeIds: nextRevealedHints,
      activeHintRecipeId: recipe.id,
    })
  },

  setActiveEra: (eraId) => {
    const state = get()
    if (!state.unlockedEraIds.includes(eraId)) return

    saveProgress(
      state.discoveredIds,
      state.discoveredRecipeIds,
      state.hintCredits,
      state.revealedHintRecipeIds,
      state.failedPairKeys,
      state.unlockedEraIds,
      eraId,
    )
    set({ activeEraId: eraId })
  },

  resetProgress: () => {
    saveProgress(
      starterElementIds,
      [],
      3,
      [],
      [],
      ['first-light'],
      'first-light',
    )
    set({
      discoveredIds: [...starterElementIds],
      discoveredRecipeIds: [],
      hintCredits: 3,
      revealedHintRecipeIds: [],
      activeHintRecipeId: null,
      failedPairKeys: [],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },
}))