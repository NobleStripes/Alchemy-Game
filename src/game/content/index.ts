import rawElements from './elements.json'
import rawEras from './eras.json'
import rawRecipes from './recipes.json'
import rawCollections from './collections.json'
import { collectionsSchema, elementsSchema, erasSchema, recipesSchema } from './schema'

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