import { elements, recipes, eras, collections } from '../content/index.ts'
import { historicalResearch } from '../content/research.ts'
import { recipeReviews } from '../content/recipeReviews.ts'
import { challenges } from '../content/challenges.ts'
import { createRecipeIndex } from '../engine/resolveCombination.ts'
import type { ElementDefinition, RecipeDefinition, EraDefinition, CollectionDefinition } from '../domain/types.ts'
import type { HistoricalResearchRecord, HistoricalResearchSource } from '../content/schema.ts'
import type { ChallengeDefinition } from '../content/challenges.ts'

export interface RuntimeCatalog {
  elements: readonly ElementDefinition[]
  recipes: readonly RecipeDefinition[]
  eras: readonly EraDefinition[]
  collections: readonly CollectionDefinition[]
  sources: readonly HistoricalResearchSource[]
  histories: readonly HistoricalResearchRecord[]
  recipeReviews: readonly (typeof recipeReviews.reviews)[number][]
  challenges: readonly ChallengeDefinition[]
  elementsById: ReadonlyMap<string, ElementDefinition>
  researchByElementId: ReadonlyMap<string, HistoricalResearchRecord>
  challengesById: ReadonlyMap<string, ChallengeDefinition>
  reviewsByRecipeId: ReadonlyMap<string, (typeof recipeReviews.reviews)[number]>
  recipeIndex: ReadonlyMap<string, RecipeDefinition>
  starterElementIds: readonly string[]
}

/** A single immutable snapshot of all gameplay and educational content. */
export function createRuntimeCatalog(input: Pick<RuntimeCatalog,
  'elements' | 'recipes' | 'eras' | 'collections' | 'sources' | 'histories' | 'recipeReviews' | 'challenges'>,
): RuntimeCatalog {
  return {
    ...input,
    elementsById: new Map(input.elements.map((item) => [item.id, item])),
    researchByElementId: new Map(input.histories.map((item) => [item.elementId, item])),
    challengesById: new Map(input.challenges.map((item) => [item.id, item])),
    reviewsByRecipeId: new Map(input.recipeReviews.map((item) => [item.recipeId, item])),
    recipeIndex: createRecipeIndex([...input.recipes]),
    starterElementIds: input.elements.filter((item) => item.starter).map((item) => item.id),
  }
}

/**
 * Phase 10D begins with core-only equivalence. Activation must stay disabled
 * until the durable archive writer replaces every v7 store write path.
 */
export const runtimeCatalog = createRuntimeCatalog({
  elements, recipes, eras, collections,
  sources: historicalResearch.sources,
  histories: historicalResearch.records,
  recipeReviews: recipeReviews.reviews,
  challenges,
})
