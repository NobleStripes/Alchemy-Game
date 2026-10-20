import type { ElementDefinition, RecipeDefinition } from '../domain/types.ts'

export function getExhaustedElements(
  recipes: readonly RecipeDefinition[],
  unlockedElements: Set<string>,
): Set<string> {
  const ingredients = new Set(recipes.flatMap((recipe) => recipe.inputs))
  return new Set(recipes
    .map((recipe) => recipe.result)
    .filter((id) => unlockedElements.has(id) && !ingredients.has(id)))
}

export function getTemporarilyExhaustedElements(
  recipes: readonly RecipeDefinition[],
  discoveredElements: Set<string>,
  performedRecipes: Set<string>,
  unlockedEras: Set<string>,
  elementEras: ReadonlyMap<string, string>,
): Set<string> {
  const outgoing = new Map<string, RecipeDefinition[]>()
  for (const recipe of recipes) {
    if (!unlockedEras.has(elementEras.get(recipe.result) ?? '')) continue
    for (const id of new Set(recipe.inputs)) {
      if (!discoveredElements.has(id)) continue
      const uses = outgoing.get(id) ?? []
      uses.push(recipe)
      outgoing.set(id, uses)
    }
  }
  return new Set([...outgoing]
    .filter(([, uses]) => uses.every((recipe) => performedRecipes.has(recipe.id)))
    .map(([id]) => id))
}

export function getGraphMetrics(elements: ElementDefinition[], recipes: RecipeDefinition[]) {
  const ingredients = new Set(recipes.flatMap((recipe) => recipe.inputs))
  const terminal = getExhaustedElements(recipes, new Set(elements.map((element) => element.id)))
  return {
    total: elements.length,
    ingredients: elements.filter((element) => ingredients.has(element.id)).length,
    terminal: terminal.size,
    unused: elements.filter((element) => !ingredients.has(element.id) && !terminal.has(element.id)).length,
  }
}
