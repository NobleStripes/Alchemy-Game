import type {
  ElementDefinition,
  EraDefinition,
  RecipeDefinition,
} from '../domain/types'
import { pairKey } from './resolveCombination'

export function validateContent(
  elements: ElementDefinition[],
  recipes: RecipeDefinition[],
  eras: EraDefinition[],
) {
  const errors: string[] = []
  const elementIds = new Set(elements.map((element) => element.id))
  const eraIds = new Set(eras.map((era) => era.id))
  const recipePairs = new Map<string, string>()

  for (const element of elements) {
    if (!eraIds.has(element.era)) {
      errors.push(`Element ${element.id} references missing era ${element.era}.`)
    }
  }

  for (const recipe of recipes) {
    const key = pairKey(...recipe.inputs)
    const existing = recipePairs.get(key)

    if (existing) {
      errors.push(`Recipes ${existing} and ${recipe.id} share pair ${key}.`)
    }
    recipePairs.set(key, recipe.id)

    for (const input of recipe.inputs) {
      if (!elementIds.has(input)) {
        errors.push(`Recipe ${recipe.id} references missing input ${input}.`)
      }
    }
    if (!elementIds.has(recipe.result)) {
      errors.push(`Recipe ${recipe.id} references missing result ${recipe.result}.`)
    }
  }

  for (const era of eras) {
    if (!elementIds.has(era.keystone)) {
      errors.push(`Era ${era.id} references missing keystone ${era.keystone}.`)
    }
  }

  const reachable = new Set(
    elements.filter((element) => element.starter).map((element) => element.id),
  )
  let changed = true

  while (changed) {
    changed = false
    for (const recipe of recipes) {
      if (
        recipe.inputs.every((input) => reachable.has(input)) &&
        !reachable.has(recipe.result)
      ) {
        reachable.add(recipe.result)
        changed = true
      }
    }
  }

  for (const element of elements) {
    if (!reachable.has(element.id)) {
      errors.push(`Element ${element.id} is unreachable from starter elements.`)
    }
  }

  return errors
}