import { z } from 'zod'
import { elements, eras, recipes } from '../content'
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

const progressSchema = versionFiveProgressSchema.omit({
  version: true,
  hintCredits: true,
}).extend({
  version: z.literal(6),
  insightCredits: z.number().int().min(0).max(3),
  insightFailureProgress: z.number().int().min(0).max(4),
  rewardedChallengeEraIds: z.array(z.string()),
})

export interface SavedProgress {
  version: 6
  discoveredIds: string[]
  discoveredRecipeIds: string[]
  insightCredits: number
  insightFailureProgress: number
  rewardedChallengeEraIds: string[]
  revealedHintRecipeIds: string[]
  failedPairKeys: string[]
  unlockedEraIds: string[]
  activeEraId: string
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const rawProgress = window.localStorage.getItem(SAVE_KEY)
    if (!rawProgress) return null

    const parsedProgress: unknown = JSON.parse(rawProgress)
    const currentProgress = progressSchema.safeParse(parsedProgress)
    if (currentProgress.success) {
      return {
        ...currentProgress.data,
        failedPairKeys: removeNowValidFailures(
          currentProgress.data.failedPairKeys,
        ),
      }
    }

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

      return {
        version: 6,
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
      }
    }

    const versionFourProgress = versionFourProgressSchema.safeParse(parsedProgress)
    if (versionFourProgress.success) {
      return {
        version: 6,
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
      }
    }

    const versionThreeProgress = versionThreeProgressSchema.safeParse(parsedProgress)
    if (versionThreeProgress.success) {
      return {
        version: 6,
        discoveredIds: versionThreeProgress.data.discoveredIds,
        discoveredRecipeIds: versionThreeProgress.data.discoveredRecipeIds,
        insightCredits: versionThreeProgress.data.hintCredits,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: versionThreeProgress.data.revealedHintRecipeIds,
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }
    }

    const versionTwoProgress = versionTwoProgressSchema.safeParse(parsedProgress)
    if (versionTwoProgress.success) {
      return {
        version: 6,
        discoveredIds: versionTwoProgress.data.discoveredIds,
        discoveredRecipeIds: versionTwoProgress.data.discoveredRecipeIds,
        insightCredits: 3,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: [],
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }
    }

    const versionOneProgress = versionOneProgressSchema.safeParse(parsedProgress)
    if (versionOneProgress.success) {
      return {
        version: 6,
        discoveredIds: versionOneProgress.data.discoveredIds,
        discoveredRecipeIds: [],
        insightCredits: 3,
        insightFailureProgress: 0,
        rewardedChallengeEraIds: [],
        revealedHintRecipeIds: [],
        failedPairKeys: [],
        unlockedEraIds: ['first-light'],
        activeEraId: 'first-light',
      }
    }

    return null
  } catch {
    return null
  }
}

export function saveProgress(progress: Omit<SavedProgress, 'version'>) {
  if (typeof window === 'undefined') return false

  try {
    const {
      discoveredIds,
      discoveredRecipeIds,
      insightCredits,
      insightFailureProgress,
      rewardedChallengeEraIds,
      revealedHintRecipeIds,
      failedPairKeys,
      unlockedEraIds,
      activeEraId,
    } = progress
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 6,
        discoveredIds,
        discoveredRecipeIds,
        insightCredits,
        insightFailureProgress,
        rewardedChallengeEraIds,
        revealedHintRecipeIds,
        failedPairKeys,
        unlockedEraIds,
        activeEraId,
      }),
    )
    return true
  } catch {
    return false
  }
}