import { z } from 'zod'

const SAVE_KEY = 'unwritten-atlas-progress'

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

const progressSchema = z.object({
  version: z.literal(4),
  discoveredIds: z.array(z.string()),
  discoveredRecipeIds: z.array(z.string()),
  hintCredits: z.number().int().nonnegative(),
  revealedHintRecipeIds: z.array(z.string()),
  failedPairKeys: z.array(z.string()),
})

export interface SavedProgress {
  version: 4
  discoveredIds: string[]
  discoveredRecipeIds: string[]
  hintCredits: number
  revealedHintRecipeIds: string[]
  failedPairKeys: string[]
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const rawProgress = window.localStorage.getItem(SAVE_KEY)
    if (!rawProgress) return null

    const parsedProgress: unknown = JSON.parse(rawProgress)
    const currentProgress = progressSchema.safeParse(parsedProgress)
    if (currentProgress.success) return currentProgress.data

    const versionThreeProgress = versionThreeProgressSchema.safeParse(parsedProgress)
    if (versionThreeProgress.success) {
      return {
        ...versionThreeProgress.data,
        version: 4,
        failedPairKeys: [],
      }
    }

    const versionTwoProgress = versionTwoProgressSchema.safeParse(parsedProgress)
    if (versionTwoProgress.success) {
      return {
        version: 4,
        discoveredIds: versionTwoProgress.data.discoveredIds,
        discoveredRecipeIds: versionTwoProgress.data.discoveredRecipeIds,
        hintCredits: 3,
        revealedHintRecipeIds: [],
        failedPairKeys: [],
      }
    }

    const versionOneProgress = versionOneProgressSchema.safeParse(parsedProgress)
    if (versionOneProgress.success) {
      return {
        version: 4,
        discoveredIds: versionOneProgress.data.discoveredIds,
        discoveredRecipeIds: [],
        hintCredits: 3,
        revealedHintRecipeIds: [],
        failedPairKeys: [],
      }
    }

    return null
  } catch {
    return null
  }
}

export function saveProgress(
  discoveredIds: string[],
  discoveredRecipeIds: string[],
  hintCredits: number,
  revealedHintRecipeIds: string[],
  failedPairKeys: string[],
) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 4,
        discoveredIds,
        discoveredRecipeIds,
        hintCredits,
        revealedHintRecipeIds,
        failedPairKeys,
      }),
    )
    return true
  } catch {
    return false
  }
}