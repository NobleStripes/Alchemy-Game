import { create } from 'zustand'
import { soundEngine } from '../audio/audioEngine'
import { collections, elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { getNewlyCompletedCollectionIds } from '../engine/collectionRules'
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
import { triggerConfetti } from '../fx/confetti'
import { createProgressPersistence, SAVE_KEY, MAX_EXPERIMENT_HISTORY, type ExperimentEntry, type SavedProgress } from './persistence'

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
  persistenceError: string | null
  prepareCombination: (firstId: string, secondId: string) => boolean
  recordChallengeCompletion: (challengeId: string, attemptCount: number) => Promise<ChallengeSaveReceipt>
  toggleSound: () => void
  toggleFavorite: (elementId: string) => void
  selectElement: (elementId: string) => void
  placeElement: (slot: SlotName, elementId: string) => void
  clearSlot: (slot: SlotName) => void
  clearAllSlots: () => void
  transmute: () => void
  transmuteWith: (firstId: string, secondId: string) => void
  requestHint: () => void
  setActiveEra: (eraId: string) => void
  resetProgress: () => void
}

interface ChallengeSaveReceipt {
  saved: boolean
  firstCompletion: boolean
  insightEarned: number
}

const recipeIndex = createRecipeIndex(recipes)

export function snapshotProgress(state: PersistedState): PersistedState {
  return {
    discoveredIds: state.discoveredIds,
    discoveredRecipeIds: state.discoveredRecipeIds,
    insightCredits: state.insightCredits,
    insightFailureProgress: state.insightFailureProgress,
    rewardedChallengeEraIds: state.rewardedChallengeEraIds,
    revealedHintRecipeIds: state.revealedHintRecipeIds,
    failedPairKeys: state.failedPairKeys,
    unlockedEraIds: state.unlockedEraIds,
    activeEraId: state.activeEraId,
    favoriteIds: state.favoriteIds,
    soundEnabled: state.soundEnabled,
    experimentHistory: state.experimentHistory,
    rewardedCollectionIds: state.rewardedCollectionIds,
    challengeRecords: state.challengeRecords,
  }
}

function appendExperiment(state: PersistedState, entry: Omit<ExperimentEntry, 'id'>): ExperimentEntry[] {
  const maximumId = Math.max(0, ...state.experimentHistory.map((experiment) => experiment.id))
  const history = maximumId >= Number.MAX_SAFE_INTEGER
    ? state.experimentHistory.map((experiment, index) => ({ ...experiment, id: index + 1 }))
    : state.experimentHistory
  const id = Math.max(0, ...history.map((experiment) => experiment.id)) + 1
  return [...history, { ...entry, id }].slice(-MAX_EXPERIMENT_HISTORY)
}

export function createGameStore() {
  const persistence = createProgressPersistence()
  let challengePending = false
  const savedProgress = snapshotProgress(persistence.initial)
  soundEngine.setEnabled(savedProgress.soundEnabled)
  function writeProgress(state: PersistedState): string | null {
    void persistence.write(snapshotProgress(state))
    return persistence.error
  }

  const store = create<GameState>((set, read) => {
    const get = () => {
      synchronizeProgress()
      return read()
    }
    return ({
  ...savedProgress,
  firstSlotId: null,
  secondSlotId: null,
  lastAttempt: null,
  persistenceError: persistence.error,

  prepareCombination: (firstId, secondId) => {
    const state = get()
    if (![firstId, secondId].every((id) => elementsById.has(id) && state.discoveredIds.includes(id))) return false
    set({ firstSlotId: firstId, secondSlotId: secondId, lastAttempt: null })
    return true
  },

  recordChallengeCompletion: async (challengeId, attemptCount) => {
    const failure = { saved: false, firstCompletion: false, insightEarned: 0 }
    if (challengePending || challengeId !== 'rainmaker' || !Number.isSafeInteger(attemptCount) || attemptCount < 4) return failure
    challengePending = true
    await persistence.flush()
    challengePending = false
    const state = get()
    challengePending = true
    const previous = state.challengeRecords.find((record) => record.challengeId === challengeId)
    const record = {
      challengeId, completed: true,
      bestAttemptCount: Math.min(previous?.bestAttemptCount ?? attemptCount, attemptCount),
    }
    const challengeRecords = [...state.challengeRecords.filter((entry) => entry.challengeId !== challengeId), record]
    const insightCredits = previous?.completed ? state.insightCredits : awardInsight({ credits: state.insightCredits, failureProgress: state.insightFailureProgress }).credits
    try {
      const saved = await persistence.write(snapshotProgress({ ...state, challengeRecords, insightCredits }), () => {
        set({ challengeRecords, insightCredits, persistenceError: null })
      })
      return saved ? { saved, firstCompletion: !previous?.completed, insightEarned: insightCredits - state.insightCredits } : failure
    } finally {
      challengePending = false
    }
  },

  toggleSound: () => {
    if (challengePending) return
    const next = !get().soundEnabled
    soundEngine.setEnabled(next)
    const persistenceError = writeProgress({ ...get(), soundEnabled: next })
    set({ soundEnabled: next, persistenceError })
  },

  toggleFavorite: (elementId: string) => {
    if (challengePending) return
    const state = get()
    if (!elementsById.has(elementId) || !state.discoveredIds.includes(elementId)) return
    const { favoriteIds } = state
    const next = favoriteIds.includes(elementId)
      ? favoriteIds.filter((id) => id !== elementId)
      : [...favoriteIds, elementId]
    const persistenceError = writeProgress({ ...state, favoriteIds: next })
    set({ favoriteIds: next, persistenceError })
  },

  selectElement: (elementId) => {
    soundEngine.playSelect()
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
    soundEngine.playSelect()
    set({
      [slot === 'first' ? 'firstSlotId' : 'secondSlotId']: elementId,
      lastAttempt: null,
    })
  },

  clearSlot: (slot) => {
    soundEngine.playClear()
    set({
      [slot === 'first' ? 'firstSlotId' : 'secondSlotId']: null,
      lastAttempt: null,
    })
  },

  clearAllSlots: () => {
    soundEngine.playClear()
    set({
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },

  transmuteWith: (firstId: string, secondId: string) => {
    if (challengePending) return
    set({ firstSlotId: firstId, secondSlotId: secondId })
    get().transmute()
  },

  transmute: () => {
    if (challengePending) return
    const state = get()
    const { firstSlotId, secondSlotId } = state
    if (!firstSlotId || !secondSlotId) {
      soundEngine.playFailure()
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
      soundEngine.playFailure()
      const lockedEra = eras.find((era) => era.id === result.era)
      const nextOpenLeads = state.revealedHintRecipeIds.includes(recipe!.id)
        ? state.revealedHintRecipeIds
        : [...state.revealedHintRecipeIds, recipe!.id]
      const experimentHistory = appendExperiment(state, {
        inputs: [firstSlotId, secondSlotId], outcome: 'locked', lockedEraId: result.era,
      })
      const progress = { ...state, revealedHintRecipeIds: nextOpenLeads, experimentHistory }
      const persistenceError = writeProgress(progress)
      set({
        experimentHistory,
        persistenceError,
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
      soundEngine.playFailure()
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
        experimentHistory: appendExperiment(state, { inputs: [firstSlotId, secondSlotId], outcome: 'no-reaction' }),
        failedPairKeys: nextFailedPairs,
        insightCredits: insight.credits,
        insightFailureProgress: insight.failureProgress,
      }
      const persistenceError = writeProgress(progress)
      set({
        experimentHistory: progress.experimentHistory,
        persistenceError,
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

    const newlyCompletedCollectionIds = getNewlyCompletedCollectionIds(
      collections, nextEraProgress.discoveredIds, state.rewardedCollectionIds,
    )
    for (let index = 0; index < newlyCompletedCollectionIds.length; index += 1) {
      insight = awardInsight(insight)
    }

    const progress: PersistedState = {
      ...snapshotProgress(state),
      experimentHistory: appendExperiment(state, {
        inputs: [firstSlotId, secondSlotId], outcome: isNew ? 'discovery' : 'known', resultId: result.id, recipeId: recipe.id,
      }),
      rewardedCollectionIds: [...state.rewardedCollectionIds, ...newlyCompletedCollectionIds],
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
    const persistenceError = writeProgress(progress)

    if (isNew || unlockedEraId) {
      soundEngine.playNewDiscovery()
      triggerConfetti()
    } else {
      soundEngine.playMerge()
    }

    if (unlockedEraId) {
      soundEngine.playUnlock()
    }

    set({
      ...progress,
      persistenceError,
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
    if (challengePending) return
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

    soundEngine.playHint()

    const progress = {
      ...state,
      insightCredits: state.insightCredits - 1,
      revealedHintRecipeIds: [...state.revealedHintRecipeIds, recipe.id],
    }
    const persistenceError = writeProgress(progress)
    set({
      persistenceError,
      insightCredits: progress.insightCredits,
      revealedHintRecipeIds: progress.revealedHintRecipeIds,
    })
  },

  setActiveEra: (eraId) => {
    if (challengePending) return
    const state = get()
    if (!state.unlockedEraIds.includes(eraId)) return

    const persistenceError = writeProgress({ ...state, activeEraId: eraId })
    set({ activeEraId: eraId, persistenceError })
  },

  resetProgress: () => {
    if (challengePending) return
    const progress: PersistedState = {
      favoriteIds: [],
      soundEnabled: get().soundEnabled,
      experimentHistory: [],
      rewardedCollectionIds: [],
      challengeRecords: [],
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
    const persistenceError = writeProgress(progress)
    soundEngine.setEnabled(progress.soundEnabled)
    set({
      ...progress,
      persistenceError,
      firstSlotId: null,
      secondSlotId: null,
      lastAttempt: null,
    })
  },
    })
  })
  persistence.onError((persistenceError) => store.setState({ persistenceError }))

  function synchronizeProgress() {
    if (challengePending) return
    const current = store.getState()
    const next = persistence.synchronize(snapshotProgress(current))
    if (!next) return
    soundEngine.setEnabled(next.soundEnabled)
    store.setState({
      ...snapshotProgress(next),
      firstSlotId: current.firstSlotId && next.discoveredIds.includes(current.firstSlotId) ? current.firstSlotId : null,
      secondSlotId: current.secondSlotId && next.discoveredIds.includes(current.secondSlotId) ? current.secondSlotId : null,
      lastAttempt: null,
      persistenceError: null,
    })
  }

  function connectProgress() {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== SAVE_KEY) return
      if (event.storageArea !== null) {
        try { if (event.storageArea !== window.localStorage) return } catch { return }
      }
      synchronizeProgress()
    }
    const onVisible = () => { if (document.visibilityState === 'visible') synchronizeProgress() }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', synchronizeProgress)
    document.addEventListener('visibilitychange', onVisible)
    synchronizeProgress()
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', synchronizeProgress)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }

  return Object.assign(store, { synchronizeProgress, connectProgress, flushProgress: persistence.flush })
}

export const useGameStore = createGameStore()