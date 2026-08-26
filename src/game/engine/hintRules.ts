import type { RecipeDefinition } from '../domain/types'

export const HINT_FAILURE_UNLOCK_COUNT = 3

export function areHintsUnlocked(
  discoveredIds: string[],
  failedPairKeys: string[],
  discoveryGoal: number,
  keystoneId: string,
) {
  return (
    (discoveredIds.length >= discoveryGoal &&
      discoveredIds.includes(keystoneId)) ||
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