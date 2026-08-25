import { z } from 'zod'

const SAVE_KEY = 'unwritten-atlas-progress'

const versionOneProgressSchema = z.object({
  version: z.literal(1),
  discoveredIds: z.array(z.string()),
})

const progressSchema = z.object({
  version: z.literal(2),
  discoveredIds: z.array(z.string()),
  discoveredRecipeIds: z.array(z.string()),
})

export interface SavedProgress {
  version: 2
  discoveredIds: string[]
  discoveredRecipeIds: string[]
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const rawProgress = window.localStorage.getItem(SAVE_KEY)
    if (!rawProgress) return null

    const parsedProgress: unknown = JSON.parse(rawProgress)
    const currentProgress = progressSchema.safeParse(parsedProgress)
    if (currentProgress.success) return currentProgress.data

    const versionOneProgress = versionOneProgressSchema.safeParse(parsedProgress)
    if (versionOneProgress.success) {
      return {
        version: 2,
        discoveredIds: versionOneProgress.data.discoveredIds,
        discoveredRecipeIds: [],
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
) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 2, discoveredIds, discoveredRecipeIds }),
    )
    return true
  } catch {
    return false
  }
}