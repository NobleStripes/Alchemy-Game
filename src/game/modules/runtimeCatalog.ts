import { elements, recipes, eras, collections } from '../content/index.ts'
import { historicalResearch } from '../content/research.ts'
import { recipeReviews } from '../content/recipeReviews.ts'
import { challenges } from '../content/challenges.ts'
import { createRecipeIndex } from '../engine/resolveCombination.ts'
import type { ElementDefinition, RecipeDefinition, EraDefinition, CollectionDefinition } from '../domain/types.ts'
import type { HistoricalResearchRecord, HistoricalResearchSource } from '../content/schema.ts'
import type { ChallengeDefinition } from '../content/challenges.ts'

export interface RuntimeCatalog {
  readonly elements: readonly ElementDefinition[]
  readonly recipes: readonly RecipeDefinition[]
  readonly eras: readonly EraDefinition[]
  readonly collections: readonly CollectionDefinition[]
  readonly sources: readonly HistoricalResearchSource[]
  readonly histories: readonly HistoricalResearchRecord[]
  readonly recipeReviews: readonly (typeof recipeReviews.reviews)[number][]
  readonly challenges: readonly ChallengeDefinition[]
  readonly regions: readonly {
    id: string
    title: string
    elementIds: readonly string[]
  }[]
  readonly elementsById: ReadonlyMap<string, ElementDefinition>
  readonly researchByElementId: ReadonlyMap<string, HistoricalResearchRecord>
  readonly challengesById: ReadonlyMap<string, ChallengeDefinition>
  readonly reviewsByRecipeId: ReadonlyMap<string, (typeof recipeReviews.reviews)[number]>
  readonly recipeIndex: ReadonlyMap<string, RecipeDefinition>
  readonly starterElementIds: readonly string[]
}

/** A single immutable snapshot of all gameplay and educational content. */
export function createRuntimeCatalog(input: Pick<RuntimeCatalog,
  'elements' | 'recipes' | 'eras' | 'collections' | 'sources' | 'histories' | 'recipeReviews' | 'challenges'>
  & { regions?: RuntimeCatalog['regions'] },
): RuntimeCatalog {
  return {
    elements: input.elements,
    recipes: input.recipes,
    eras: input.eras,
    collections: input.collections,
    sources: input.sources,
    histories: input.histories,
    recipeReviews: input.recipeReviews,
    challenges: input.challenges,
    regions: input.regions ?? [],
    elementsById: new Map(input.elements.map((item) => [item.id, item])),
    researchByElementId: new Map(input.histories.map((item) => [item.elementId, item])),
    challengesById: new Map(input.challenges.map((item) => [item.id, item])),
    reviewsByRecipeId: new Map(input.recipeReviews.map((item) => [item.recipeId, item])),
    recipeIndex: createRecipeIndex(input.recipes),
    starterElementIds: input.elements.filter((item) => item.starter).map((item) => item.id),
  }
}

export const coreRuntimeCatalog = createRuntimeCatalog({
  elements, recipes, eras, collections,
  sources: historicalResearch.sources,
  histories: historicalResearch.records,
  recipeReviews: recipeReviews.reviews,
  challenges,
})

/** Core-only compatibility API. Live consumers use their store's catalog. */
export const runtimeCatalog = coreRuntimeCatalog
