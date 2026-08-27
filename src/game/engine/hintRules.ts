import type {
  ElementDefinition,
  EraDefinition,
  RecipeDefinition,
} from '../domain/types'

export const HINT_FAILURE_UNLOCK_COUNT = 3

export function areHintsUnlocked(
  discoveredIds: string[],
  failedPairKeys: string[],
  discoveryGoal: number,
  landmarkIds: string[],
) {
  return (
    (discoveredIds.length >= discoveryGoal &&
      landmarkIds.every((elementId) => discoveredIds.includes(elementId))) ||
    failedPairKeys.length >= HINT_FAILURE_UNLOCK_COUNT
  )
}

export function selectHintRecipe(
  recipes: RecipeDefinition[],
  discoveredIds: string[],
  discoveredRecipeIds: string[],
  revealedHintRecipeIds: string[],
) {
  const eligibleRecipes = recipes.filter(
    (recipe) =>
      !discoveredRecipeIds.includes(recipe.id) &&
      !revealedHintRecipeIds.includes(recipe.id) &&
      recipe.inputs.every((inputId) => discoveredIds.includes(inputId)),
  )

  return (
    eligibleRecipes.find(
      (recipe) =>
        recipe.inputs[0] !== recipe.inputs[1] &&
        !discoveredIds.includes(recipe.result),
    ) ??
    eligibleRecipes.find(
      (recipe) => !discoveredIds.includes(recipe.result),
    ) ??
    eligibleRecipes.find((recipe) => recipe.inputs[0] !== recipe.inputs[1]) ??
    eligibleRecipes[0] ??
    null
  )
}

export function areGlobalHintsUnlocked(
  discoveredIds: string[],
  failedPairKeys: string[],
  elements: ElementDefinition[],
  origins: EraDefinition,
) {
  const originsDiscoveryCount = elements.filter(
    (element) =>
      element.era === origins.id && discoveredIds.includes(element.id),
  ).length

  return (
    (originsDiscoveryCount >= origins.discoveryGoal &&
      origins.landmarkIds.every((elementId) =>
        discoveredIds.includes(elementId),
      )) ||
    failedPairKeys.length >= HINT_FAILURE_UNLOCK_COUNT
  )
}