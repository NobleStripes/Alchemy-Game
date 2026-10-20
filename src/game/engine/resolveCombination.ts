import type { RecipeDefinition } from '../domain/types.ts'

export function pairKey(firstId: string, secondId: string) {
  return [firstId, secondId].sort().join('::')
}

export function createRecipeIndex(recipes: readonly RecipeDefinition[]) {
  return new Map(
    recipes.map((recipe) => [pairKey(...recipe.inputs), recipe]),
  )
}

export function resolveCombination(
  firstId: string,
  secondId: string,
  recipeIndex: ReadonlyMap<string, RecipeDefinition>,
) {
  return recipeIndex.get(pairKey(firstId, secondId)) ?? null
}