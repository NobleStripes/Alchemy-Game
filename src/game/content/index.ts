import rawElements from './elements.json' with { type: 'json' }
import rawEras from './eras.json' with { type: 'json' }
import rawRecipes from './recipes.json' with { type: 'json' }
import rawCollections from './collections.json' with { type: 'json' }
import { collectionsSchema, elementsSchema, erasSchema, recipesSchema } from './schema.ts'

export const elements = elementsSchema.parse(rawElements)
export const recipes = recipesSchema.parse(rawRecipes)
export const eras = erasSchema.parse(rawEras)
export const collections = collectionsSchema.parse(rawCollections)

export const elementsById = new Map(
  elements.map((element) => [element.id, element]),
)

export const starterElementIds = elements
  .filter((element) => element.starter)
  .map((element) => element.id)