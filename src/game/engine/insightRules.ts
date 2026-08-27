import type { ElementDefinition, EraDefinition } from '../domain/types'

export const MAX_INSIGHT_CREDITS = 3
export const FAILURES_PER_INSIGHT = 5

export interface InsightState {
  credits: number
  failureProgress: number
}

export function recordUniqueFailure(
  state: InsightState,
  isUniqueFailure: boolean,
): InsightState {
  if (!isUniqueFailure) return state

  if (state.credits >= MAX_INSIGHT_CREDITS) {
    return {
      credits: MAX_INSIGHT_CREDITS,
      failureProgress: Math.min(
        state.failureProgress + 1,
        FAILURES_PER_INSIGHT - 1,
      ),
    }
  }

  const nextProgress = state.failureProgress + 1
  if (nextProgress >= FAILURES_PER_INSIGHT) {
    return {
      credits: Math.min(state.credits + 1, MAX_INSIGHT_CREDITS),
      failureProgress: 0,
    }
  }

  return { ...state, failureProgress: nextProgress }
}

export function resetInsightProgress(
  state: InsightState,
  isNewDiscovery: boolean,
): InsightState {
  return isNewDiscovery ? { ...state, failureProgress: 0 } : state
}

export function awardInsight(state: InsightState): InsightState {
  return {
    ...state,
    credits: Math.min(state.credits + 1, MAX_INSIGHT_CREDITS),
  }
}

export function isEraChallengeComplete(
  era: EraDefinition,
  discoveredIds: string[],
  elements: ElementDefinition[],
) {
  const eraDiscoveryCount = elements.filter(
    (element) =>
      element.era === era.id && discoveredIds.includes(element.id),
  ).length

  return (
    eraDiscoveryCount >= era.discoveryGoal &&
    era.landmarkIds.every((elementId) => discoveredIds.includes(elementId))
  )
}