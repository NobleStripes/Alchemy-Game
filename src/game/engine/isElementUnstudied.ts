import type { RecipeDefinition } from '../domain/types'

export function isElementUnstudied(
  elementId: string,
  recipes: RecipeDefinition[],
  discoveredRecipeIds: string[],
) {
  const outgoingRecipes = recipes.filter((recipe) =>
    recipe.inputs.includes(elementId),
  )

  return (
    outgoingRecipes.length > 0 &&
    outgoingRecipes.every(
      (recipe) => !discoveredRecipeIds.includes(recipe.id),
    )
  )
}