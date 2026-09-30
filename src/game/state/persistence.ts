import { z } from 'zod'
import { collections, elements, elementsById, eras, recipes, starterElementIds } from '../content'
import { isCollectionComplete } from '../engine/collectionRules'
import { reconcileEraProgress } from '../engine/eraProgress'
import { isEraChallengeComplete } from '../engine/insightRules'
import { pairKey } from '../engine/resolveCombination'

const SAVE_KEY = 'unwritten-atlas-progress'
const validRecipePairKeys = new Set(
  recipes.map((recipe) => pairKey(...recipe.inputs)),
)

function removeNowValidFailures(failedPairKeys: string[]) {
  return failedPairKeys.filter((key) => !validRecipePairKeys.has(key))
}

const versionOneProgressSchema = z.object({
  version: z.literal(1),
  discoveredIds: z.array(z.string()),
})

const versionTwoProgressSchema = z.object({
  version: z.literal(2),
  discoveredIds: z.array(z.string()),
  discoveredRecipeIds: z.array(z.string()),
})

const versionThreeProgressSchema = z.object({
  version: z.literal(3),
  discoveredIds: z.array(z.string()),
  discoveredRecipeIds: z.array(z.string()),
  hintCredits: z.number().int().nonnegative(),
  revealedHintRecipeIds: z.array(z.string()),
})

const versionFourProgressSchema = z.object({
  version: z.literal(4),
  discoveredIds: z.array(z.string()),
  discoveredRecipeIds: z.array(z.string()),
  hintCredits: z.number().int().nonnegative(),
  revealedHintRecipeIds: z.array(z.string()),
  failedPairKeys: z.array(z.string()),
})

const versionFiveProgressSchema = versionFourProgressSchema.extend({
  version: z.literal(5),
  unlockedEraIds: z.array(z.string()),
  activeEraId: z.string(),
})

const versionSixProgressSchema = versionFiveProgressSchema.omit({
  version: true,
  hintCredits: true,
}).extend({
  version: z.literal(6),
  insightCredits: z.number().int().nonnegative(),
  insightFailureProgress: z.number().int().min(0).max(4),
  rewardedChallengeEraIds: z.array(z.string()),
})

export const MAX_SAVE_BYTES = 1048576
export const MAX_EXPERIMENT_HISTORY = 50

export interface ExperimentEntry {
  id: number
  inputs: [string, string]
  outcome: 'discovery' | 'known' | 'no-reaction' | 'locked'
  resultId?: string
  recipeId?: string
  lockedEraId?: string
}

export interface ChallengeRecord {
  challengeId: string
  completed: boolean
  bestAttemptCount: number
}

const experimentSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  inputs: z.tuple([z.string(), z.string()]),
  outcome: z.enum(['discovery', 'known', 'no-reaction', 'locked']),
  resultId: z.string().optional(),
  recipeId: z.string().optional(),
  lockedEraId: z.string().optional(),
})

const progressSchema = versionSixProgressSchema.extend({
  version: z.literal(7),
  insightCredits: z.number().int().min(0).max(3),
  favoriteIds: z.array(z.string()),
  soundEnabled: z.boolean(),
  experimentHistory: z.array(experimentSchema),
  rewardedCollectionIds: z.array(z.string()),
  challengeRecords: z.array(z.object({
    challengeId: z.string(),
    completed: z.boolean(),
    bestAttemptCount: z.number().int().min(4).max(Number.MAX_SAFE_INTEGER),
  })),
})

export interface SavedProgress {
  version: 7
  discoveredIds: string[]
  discoveredRecipeIds: string[]
  insightCredits: number
  insightFailureProgress: number
  rewardedChallengeEraIds: string[]
  revealedHintRecipeIds: string[]
  failedPairKeys: string[]
  unlockedEraIds: string[]
  activeEraId: string
  favoriteIds: string[]
  soundEnabled: boolean
  experimentHistory: ExperimentEntry[]
  rewardedCollectionIds: string[]
  challengeRecords: ChallengeRecord[]
}

function normalizeProgress(progress: SavedProgress, legacy: boolean): SavedProgress {
  const knownIds = (ids: string[]) => [...new Set(ids)].filter((id) => elementsById.has(id))
  const eraIds = new Set(eras.map((era) => era.id))
  const eraProgress = reconcileEraProgress(
    knownIds([...starterElementIds, ...progress.discoveredIds]),
    [...new Set(progress.unlockedEraIds)].filter((id) => eraIds.has(id)),
    elements,
    eras,
  )
  const discovered = new Set(eraProgress.discoveredIds)
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const recipesByPair = new Map(recipes.map((recipe) => [pairKey(...recipe.inputs), recipe]))
  const recipeIds = (ids: string[], performed: boolean) => [...new Set(ids)].filter((id) => {
    const recipe = recipesById.get(id)
    return recipe && recipe.inputs.every((input) => discovered.has(input)) &&
      (!performed || discovered.has(recipe.result))
  })
  const failedPairKeys = [...new Set(progress.failedPairKeys.flatMap((key) => {
    const inputs = key.split('::')
    return inputs.length === 2 && inputs.every((id) => discovered.has(id))
      ? [pairKey(inputs[0], inputs[1])] : []
  }))]
  const seenHistoryIds = new Set<number>()
  const experimentHistory = progress.experimentHistory.filter((entry) => {
    if (seenHistoryIds.has(entry.id) || !entry.inputs.every((id) => discovered.has(id))) return false
    const recipe = entry.recipeId ? recipesById.get(entry.recipeId) : undefined
    const pairRecipe = recipesByPair.get(pairKey(...entry.inputs))
    const valid = entry.outcome === 'no-reaction'
      ? !entry.resultId && !entry.recipeId && !entry.lockedEraId
      : entry.outcome === 'locked'
        ? !!entry.lockedEraId && eraIds.has(entry.lockedEraId) && !entry.resultId && !entry.recipeId &&
          !!pairRecipe && elementsById.get(pairRecipe.result)?.era === entry.lockedEraId
        : !!recipe && recipe.result === entry.resultId && discovered.has(recipe.result) &&
          pairKey(...recipe.inputs) === pairKey(...entry.inputs) && !entry.lockedEraId
    if (valid) seenHistoryIds.add(entry.id)
    return valid
  }).sort((first, second) => first.id - second.id).slice(-MAX_EXPERIMENT_HISTORY)
  const collectionIds = new Set(collections.map((collection) => collection.id))
  const challengeRecords: ChallengeRecord[] = []
  for (const record of progress.challengeRecords) {
    if (record.challengeId !== 'rainmaker') continue
    const existing = challengeRecords.find((candidate) => candidate.challengeId === record.challengeId)
    if (existing) {
      existing.completed ||= record.completed
      existing.bestAttemptCount = Math.min(existing.bestAttemptCount, record.bestAttemptCount)
    } else challengeRecords.push({ ...record })
  }
  return {
    ...progress,
    ...eraProgress,
    activeEraId: eraProgress.unlockedEraIds.includes(progress.activeEraId)
      ? progress.activeEraId : eraProgress.unlockedEraIds.at(-1) ?? eras[0].id,
    discoveredRecipeIds: recipeIds(progress.discoveredRecipeIds, true),
    revealedHintRecipeIds: recipeIds(progress.revealedHintRecipeIds, false),
    failedPairKeys: removeNowValidFailures(failedPairKeys),
    insightCredits: Math.min(3, progress.insightCredits),
    rewardedChallengeEraIds: [...new Set(progress.rewardedChallengeEraIds)].filter((id) => eraIds.has(id)),
    favoriteIds: knownIds(progress.favoriteIds).filter((id) => discovered.has(id)),
    experimentHistory,
    rewardedCollectionIds: legacy
      ? collections.filter((collection) => isCollectionComplete(collection, eraProgress.discoveredIds)).map((collection) => collection.id)
      : [...new Set(progress.rewardedCollectionIds)].filter((id) => collectionIds.has(id)),
    challengeRecords,
  }
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const rawProgress = window.localStorage.getItem(SAVE_KEY)
    if (!rawProgress) return null

    return parseProgress(rawProgress)
  } catch {
    return null
  }
}

export function parseProgress(rawProgress: string): SavedProgress | null {
  try {
    if (rawProgress.length > MAX_SAVE_BYTES || new TextEncoder().encode(rawProgress).byteLength > MAX_SAVE_BYTES) return null
    const parsedProgress: unknown = JSON.parse(rawProgress)
    const currentProgress = progressSchema.safeParse(parsedProgress)
    if (currentProgress.success) {
      return normalizeProgress(currentProgress.data, false)
    }

    const versionSixProgress = versionSixProgressSchema.safeParse(parsedProgress)
    if (versionSixProgress.success) return normalizeProgress({
      ...versionSixProgress.data,
      version: 7,
      favoriteIds: [], soundEnabled: true, experimentHistory: [],
      rewardedCollectionIds: [], challengeRecords: [],
    }, true)

    const versionFiveProgress = versionFiveProgressSchema.safeParse(parsedProgress)
    if (versionFiveProgress.success) {
      const rewardedChallengeEraIds = eras
        .filter((era) =>
          isEraChallengeComplete(
            era,
            versionFiveProgress.data.discoveredIds,
            elements,
          ),
        )
        .map((era) => era.id)

      return normalizeProgress({
        version: 7,
        favoriteIds: [], soundEnabled: true, experimentHistory: [],
        rewardedCollectionIds: [], challengeRecords: [],
        discoveredIds: versionFiveProgress.data.discoveredIds,
        discoveredRecipeIds: versionFiveProgress.data.discoveredRecipeIds,
        insightCredits: versionFiveProgress.data.hintCredits,
        insightFailureProgress: 0,
        rewardedChallengeEraIds,
        revealedHintRecipeIds: versionFiveProgress.data.revealedHintRecipeIds,
        failedPairKeys: removeNowValidFailures(
          versionFiveProgress.data.failedPairKeys,
        ),
        unlockedEraIds: versionFiveProgress.data.unlockedEraIds,
        activeEraId: versionFiveProgress.data.activeEraId,
      }, true)
    }

    const versionFourProgress = versionFourProgressSchema.safeParse(parsedProgress)
    if (versionFourProgress.success) {
      return normalizeProgress({
        version: 7,
        favoriteIds: [], soundEnabled: true, experimentHistory: [],
        rewardedCollectionIds: [], challengeRecords: [],
        discoveredIds: versionFourProgress.data.discoveredIds,
        discoveredRecipeIds: versionFourProgress.data.discoveredRecipeIds,
        insightCredits: versionFourProgress.data.hintCredits,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: versionFourProgress.data.revealedHintRecipeIds,
        failedPairKeys: removeNowValidFailures(
          versionFourProgress.data.failedPairKeys,
        ),
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }, true)
    }

    const versionThreeProgress = versionThreeProgressSchema.safeParse(parsedProgress)
    if (versionThreeProgress.success) {
      return normalizeProgress({
        version: 7,
        favoriteIds: [], soundEnabled: true, experimentHistory: [],
        rewardedCollectionIds: [], challengeRecords: [],
        discoveredIds: versionThreeProgress.data.discoveredIds,
        discoveredRecipeIds: versionThreeProgress.data.discoveredRecipeIds,
        insightCredits: versionThreeProgress.data.hintCredits,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: versionThreeProgress.data.revealedHintRecipeIds,
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }, true)
    }

    const versionTwoProgress = versionTwoProgressSchema.safeParse(parsedProgress)
    if (versionTwoProgress.success) {
      return normalizeProgress({
        version: 7,
        favoriteIds: [], soundEnabled: true, experimentHistory: [],
        rewardedCollectionIds: [], challengeRecords: [],
        discoveredIds: versionTwoProgress.data.discoveredIds,
        discoveredRecipeIds: versionTwoProgress.data.discoveredRecipeIds,
        insightCredits: 3,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: [],
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }, true)
    }

    const versionOneProgress = versionOneProgressSchema.safeParse(parsedProgress)
    if (versionOneProgress.success) {
      return normalizeProgress({
        version: 7,
        favoriteIds: [], soundEnabled: true, experimentHistory: [],
        rewardedCollectionIds: [], challengeRecords: [],
        discoveredIds: versionOneProgress.data.discoveredIds,
        discoveredRecipeIds: [],
        insightCredits: 3,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: [],
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }, true)
    }

    return null
  } catch {
    return null
  }
}

export function exportProgress(progress: Omit<SavedProgress, 'version'>): string {
  return JSON.stringify({
    version: 7,
    discoveredIds: progress.discoveredIds,
    discoveredRecipeIds: progress.discoveredRecipeIds,
    insightCredits: progress.insightCredits,
    insightFailureProgress: progress.insightFailureProgress,
    rewardedChallengeEraIds: progress.rewardedChallengeEraIds,
    revealedHintRecipeIds: progress.revealedHintRecipeIds,
    failedPairKeys: progress.failedPairKeys,
    unlockedEraIds: progress.unlockedEraIds,
    activeEraId: progress.activeEraId,
    favoriteIds: progress.favoriteIds ?? [],
    soundEnabled: progress.soundEnabled ?? true,
    experimentHistory: progress.experimentHistory ?? [],
    rewardedCollectionIds: progress.rewardedCollectionIds ?? [],
    challengeRecords: progress.challengeRecords ?? [],
  })
}

type LegacySaveInput = Omit<SavedProgress, 'version' | 'favoriteIds' | 'soundEnabled' | 'experimentHistory' | 'rewardedCollectionIds' | 'challengeRecords'> &
  Partial<Pick<SavedProgress, 'favoriteIds' | 'soundEnabled' | 'experimentHistory' | 'rewardedCollectionIds' | 'challengeRecords'>>

export function saveProgress(progress: LegacySaveInput): boolean {
  if (typeof window === 'undefined') return false

  try {
    const serialized = exportProgress({
      ...progress,
      favoriteIds: progress.favoriteIds ?? [],
      soundEnabled: progress.soundEnabled ?? true,
      experimentHistory: progress.experimentHistory ?? [],
      rewardedCollectionIds: progress.rewardedCollectionIds ?? [],
      challengeRecords: progress.challengeRecords ?? [],
    })
    if (new TextEncoder().encode(serialized).byteLength > MAX_SAVE_BYTES) return false
    window.localStorage.setItem(SAVE_KEY, serialized)
    return true
  } catch {
    return false
  }
}