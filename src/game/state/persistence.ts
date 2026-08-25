import { z } from 'zod'

const SAVE_KEY = 'unwritten-atlas-progress'

const progressSchema = z.object({
  version: z.literal(1),
  discoveredIds: z.array(z.string()),
})

export interface SavedProgress {
  version: 1
  discoveredIds: string[]
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const rawProgress = window.localStorage.getItem(SAVE_KEY)
    return rawProgress ? progressSchema.parse(JSON.parse(rawProgress)) : null
  } catch {
    return null
  }
}

export function saveProgress(discoveredIds: string[]) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, discoveredIds }),
    )
    return true
  } catch {
    return false
  }
}