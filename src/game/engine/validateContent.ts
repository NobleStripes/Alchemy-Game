import type {
  CollectionDefinition,
  ElementDefinition,
  EraDefinition,
  RecipeDefinition,
} from '../domain/types.ts'
import { pairKey } from './resolveCombination.ts'
import { getExhaustedElements } from './elementStatus.ts'

export function validateContent(
  elements: ElementDefinition[],
  recipes: RecipeDefinition[],
  eras: EraDefinition[],
  collections: CollectionDefinition[] = [],
) {
  const errors: string[] = []
  const elementIds = new Set(elements.map((element) => element.id))
  const eraIds = new Set(eras.map((era) => era.id))
  const recipePairs = new Map<string, string>()
  const elementNames = new Map<string, string>()
  const eraIndexById = new Map(eras.map((era, index) => [era.id, index]))
  const terminalIds = getExhaustedElements(recipes, elementIds)
  const ingredients = new Set(recipes.flatMap((recipe) => recipe.inputs))
  const protectedTools = new Set(['tool', 'stone-tool', 'bronze-tool', 'iron-tool'])
  for (const element of elements) {
    if ((element.starter || protectedTools.has(element.id)) &&
      (terminalIds.has(element.id) || !ingredients.has(element.id))) {
      errors.push(`Protected ingredient ${element.id} must have an outgoing recipe.`)
    }
  }

  for (const [kind, definitions] of [
    ['Element', elements],
    ['Recipe', recipes],
    ['Era', eras],
    ['Collection', collections],
  ] as const) {
    const ids = new Set<string>()
    for (const definition of definitions) {
      if (ids.has(definition.id)) {
        errors.push(`Duplicate ${kind.toLowerCase()} id ${definition.id}.`)
      }
      ids.add(definition.id)
    }
  }

  for (const collection of collections) {
    if (!eraIds.has(collection.era)) {
      errors.push(`Collection ${collection.id} references missing era ${collection.era}.`)
    }
    if (collection.elementIds.length === 0) {
      errors.push(`Collection ${collection.id} must have at least one member.`)
    }
    if (collection.landmarkId && !collection.elementIds.includes(collection.landmarkId)) {
      errors.push(`Collection ${collection.id} must include its landmark ${collection.landmarkId}.`)
    }
    if (collection.landmarkId && !collection.elementIds.some((id) =>
      elements.some((element) => element.id === id && element.era === collection.era))) {
      errors.push(`Landmark collection ${collection.id} must include a discovery from its own era.`)
    }
    const members = new Set<string>()
    for (const elementId of collection.elementIds) {
      if (members.has(elementId)) {
        errors.push(`Collection ${collection.id} repeats member ${elementId}.`)
      }
      members.add(elementId)
      if (!elementIds.has(elementId)) {
        errors.push(`Collection ${collection.id} references missing element ${elementId}.`)
      }
    }
  }

  for (const element of elements) {
    const normalizedName = element.name.trim().replace(/\s+/g, ' ').toLowerCase()
    const existingName = elementNames.get(normalizedName)
    if (existingName && existingName !== element.id) {
      errors.push(`Elements ${existingName} and ${element.id} share name ${normalizedName}.`)
    }
    elementNames.set(normalizedName, element.id)
    if (!eraIds.has(element.era)) {
      errors.push(`Element ${element.id} references missing era ${element.era}.`)
    }
    if (element.starter && element.era !== eras[0]?.id) {
      errors.push(`Starter ${element.id} must belong to the first era.`)
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
    for (const field of ['unlockRequires', 'grants', 'landmarkIds'] as const) {
      const seen = new Set<string>()
      for (const id of era[field]) {
        if (seen.has(id)) {
          errors.push(`Era ${era.id} repeats ${field} element ${id}.`)
        }
        seen.add(id)
        const elementEra = elements.find((element) => element.id === id)?.era
        if (field !== 'unlockRequires' && elementEra &&
          (eraIndexById.get(elementEra) ?? -1) > (eraIndexById.get(era.id) ?? -1)) {
          errors.push(`Era ${era.id} ${field} references later-era element ${id}.`)
        }
      }
    }
    for (const elementId of [
      ...era.unlockRequires,
      ...era.grants,
      ...era.landmarkIds,
    ]) {
      if (!elementIds.has(elementId)) {
        errors.push(`Era ${era.id} references missing element ${elementId}.`)
      }
    }
  }

  const elementEraById = new Map(
    elements.map((element) => [element.id, element.era]),
  )
  const reachable = new Set(
    elements.filter((element) => element.starter).map((element) => element.id),
  )
  const unlockedEras = new Set([eras[0]?.id].filter(Boolean))
  if (eras.length === 0) errors.push('Content must define at least one era.')
  if (reachable.size === 0) errors.push('Content must define at least one starter element.')
  let changed = true

  while (changed) {
    changed = false

    for (const era of eras) {
      if (
        !unlockedEras.has(era.id) &&
        era.unlockRequires.every((elementId) => reachable.has(elementId))
      ) {
        unlockedEras.add(era.id)
        changed = true
      }

      if (unlockedEras.has(era.id)) {
        for (const grantedId of era.grants) {
          if (!reachable.has(grantedId)) {
            reachable.add(grantedId)
            changed = true
          }
        }
      }
    }

    for (const recipe of recipes) {
      if (
        unlockedEras.has(elementEraById.get(recipe.result) ?? '') &&
        recipe.inputs.every((input) => reachable.has(input)) &&
        !reachable.has(recipe.result)
      ) {
        reachable.add(recipe.result)
        changed = true
      }
    }
  }

  for (const era of eras) {
    if (!unlockedEras.has(era.id)) {
      errors.push(`Era ${era.id} is unreachable from prior era content.`)
    }
    const reachableCount = new Set(
      elements
        .filter((element) => element.era === era.id && reachable.has(element.id))
        .map((element) => element.id),
    ).size
    if (
      !Number.isInteger(era.discoveryGoal) ||
      era.discoveryGoal <= 0 ||
      era.discoveryGoal > reachableCount
    ) {
      errors.push(`Era ${era.id} has impossible discovery goal ${era.discoveryGoal} with ${reachableCount} reachable elements.`)
    }
  }

  for (const element of elements) {
    if (!reachable.has(element.id)) {
      errors.push(`Element ${element.id} is unreachable from starter elements.`)
    }
  }

  return errors
}