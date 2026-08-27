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
  elements: ElementDefinition[] = [],
  activeEraId?: string,
) {
  const eligibleRecipes = recipes.filter(
    (recipe) =>
      !discoveredRecipeIds.includes(recipe.id) &&
      !revealedHintRecipeIds.includes(recipe.id) &&
      recipe.inputs.every((inputId) => discoveredIds.includes(inputId)),
  )
  const elementEraById = new Map(
    elements.map((element) => [element.id, element.era]),
  )
  const preferMixed = (candidates: RecipeDefinition[]) =>
    candidates.find((recipe) => recipe.inputs[0] !== recipe.inputs[1]) ??
    candidates[0]
  const unknownRecipes = eligibleRecipes.filter(
    (recipe) => !discoveredIds.includes(recipe.result),
  )
  const activeEraUnknownRecipes = activeEraId
    ? unknownRecipes.filter(
        (recipe) => elementEraById.get(recipe.result) === activeEraId,
      )
    : []
  const crossEraActiveInputRecipes = activeEraId
    ? unknownRecipes.filter(
        (recipe) =>
          elementEraById.get(recipe.result) !== activeEraId &&
          recipe.inputs.some(
            (inputId) => elementEraById.get(inputId) === activeEraId,
          ),
      )
    : []

  return (
    preferMixed(activeEraUnknownRecipes) ??
    preferMixed(crossEraActiveInputRecipes) ??
    preferMixed(unknownRecipes) ??
    preferMixed(eligibleRecipes) ??
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