import { create } from 'zustand'
import { elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { reconcileEraProgress } from '../engine/eraProgress'
import { areGlobalHintsUnlocked, selectHintRecipe } from '../engine/hintRules'
import {
  awardInsight,
  isEraChallengeComplete,
  recordUniqueFailure,
  resetInsightProgress,
} from '../engine/insightRules'
import {
  createRecipeIndex,
  pairKey,
  resolveCombination,
} from '../engine/resolveCombination'
import { loadProgress, saveProgress, type SavedProgress } from './persistence'

type SlotName = 'first' | 'second'
type PersistedState = Omit<SavedProgress, 'version'>

interface AttemptResult {
  kind: 'discovery' | 'known' | 'failure'
  title: string
  detail: string
  resultId?: string
  unlockedEra?: {
    name: string
    grantNames: string[]
  }
  insightEarned?: number
}

interface GameState extends PersistedState {
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

function writeProgress(state: PersistedState) {
  saveProgress(state)
}

function initialProgress(): PersistedState {
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
    insightCredits: savedProgress?.insightCredits ?? 3,
    insightFailureProgress: savedProgress?.insightFailureProgress ?? 0,
    rewardedChallengeEraIds:
      savedProgress?.rewardedChallengeEraIds ?? [],
    revealedHintRecipeIds: (savedProgress?.revealedHintRecipeIds ?? []).filter(
      (recipeId) => recipes.some((recipe) => recipe.id === recipeId),
    ),
    failedPairKeys: savedProgress?.failedPairKeys ?? [],
    unlockedEraIds: eraProgress.unlockedEraIds,
    activeEraId,
  }
}

const savedProgress = initialProgress()

export const useGameStore = create<GameState>((set, get) => ({
  ...savedProgress,
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
      const progress = { ...state, revealedHintRecipeIds: nextOpenLeads }
      writeProgress(progress)
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
      const isUniqueFailure = !state.failedPairKeys.includes(failedKey)
      const nextFailedPairs = isUniqueFailure
        ? [...state.failedPairKeys, failedKey]
        : state.failedPairKeys
      const insight = recordUniqueFailure(
        {
          credits: state.insightCredits,
          failureProgress: state.insightFailureProgress,
        },
        isUniqueFailure,
      )
      const progress = {
        ...state,
        failedPairKeys: nextFailedPairs,
        insightCredits: insight.credits,
        insightFailureProgress: insight.failureProgress,
      }
      writeProgress(progress)
      set({
        failedPairKeys: nextFailedPairs,
        insightCredits: insight.credits,
        insightFailureProgress: insight.failureProgress,
        secondSlotId: null,
        lastAttempt: {
          kind: 'failure',
          title: 'No resonance',
          detail: isUniqueFailure
            ? 'No reaction. The experiment has been recorded.'
            : 'No reaction. This pairing was already tested.',
          insightEarned: insight.credits - state.insightCredits,
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

    let insight = resetInsightProgress(
      {
        credits: state.insightCredits,
        failureProgress: state.insightFailureProgress,
      },
      isNew,
    )
    if (unlockedEraId) insight = awardInsight(insight)

    const newlyCompletedEraIds = eras
      .filter(
        (era) =>
          !state.rewardedChallengeEraIds.includes(era.id) &&
          isEraChallengeComplete(
            era,
            nextEraProgress.discoveredIds,
            elements,
          ),
      )
      .map((era) => era.id)
    for (let index = 0; index < newlyCompletedEraIds.length; index += 1) {
      insight = awardInsight(insight)
    }
    const nextRewardedChallengeEraIds = [
      ...state.rewardedChallengeEraIds,
      ...newlyCompletedEraIds,
    ]

    const progress: PersistedState = {
      discoveredIds: nextEraProgress.discoveredIds,
      discoveredRecipeIds: nextRecipeIds,
      insightCredits: insight.credits,
      insightFailureProgress: insight.failureProgress,
      rewardedChallengeEraIds: nextRewardedChallengeEraIds,
      revealedHintRecipeIds: state.revealedHintRecipeIds,
      failedPairKeys: nextFailedPairKeys,
      unlockedEraIds: nextEraProgress.unlockedEraIds,
      activeEraId: nextActiveEraId,
    }
    writeProgress(progress)
    set({
      ...progress,
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
        insightEarned: insight.credits - state.insightCredits,
      },
    })
  },

  requestHint: () => {
    const state = get()
    const origins = eras[0]
    if (
      state.insightCredits === 0 ||
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
      elements,
      state.activeEraId,
    )
    if (!recipe) return

    const progress = {
      ...state,
      insightCredits: state.insightCredits - 1,
      revealedHintRecipeIds: [...state.revealedHintRecipeIds, recipe.id],
    }
    writeProgress(progress)
    set({
      insightCredits: progress.insightCredits,
      revealedHintRecipeIds: progress.revealedHintRecipeIds,
    })
  },

  setActiveEra: (eraId) => {
    const state = get()
    if (!state.unlockedEraIds.includes(eraId)) return

    writeProgress({ ...state, activeEraId: eraId })
    set({ activeEraId: eraId })
  },

  resetProgress: () => {
    const progress: PersistedState = {
      discoveredIds: [...starterElementIds],
      discoveredRecipeIds: [],
      insightCredits: 3,
      insightFailureProgress: 0,
      rewardedChallengeEraIds: [],
      revealedHintRecipeIds: [],
      failedPairKeys: [],
      unlockedEraIds: ['first-light'],
      activeEraId: 'first-light',
    }
    writeProgress(progress)
    set({
      ...progress,
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },
}))