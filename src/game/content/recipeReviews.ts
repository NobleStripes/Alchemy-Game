import { z } from 'zod'
import { recipes } from './index'
import { historicalResearch, type HistoricalResearchSource } from './research'
import rawReviews from './recipeReviews.json'

const id = z.string().regex(/^[a-z][a-z0-9-]*$/)
const reviewSchema = z.strictObject({
  recipeId: id,
  classification: z.enum(['material-process', 'simplified-process', 'symbolic']),
  caution: z.string().trim().min(1),
  sourceIds: z.array(id).refine(
    (ids) => new Set(ids).size === ids.length,
    'Source references must be unique.',
  ),
})

export function createRecipeReviewsSchema(
  catalog: readonly { id: string }[],
  sources: readonly HistoricalResearchSource[],
) {
  const recipeIds = new Set(catalog.map((recipe) => recipe.id))
  const sourcesById = new Map(sources.map((source) => [source.id, source]))
  return z.strictObject({
    schemaVersion: z.literal(1),
    reviews: z.array(reviewSchema),
  }).superRefine((database, ctx) => {
    const seen = new Set<string>()
    database.reviews.forEach((review, index) => {
      if (!recipeIds.has(review.recipeId) || seen.has(review.recipeId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['reviews', index, 'recipeId'],
          message: `Unknown or duplicate reviewed recipe: ${review.recipeId}.`,
        })
      }
      seen.add(review.recipeId)
      review.sourceIds.forEach((sourceId, sourceIndex) => {
        if (sourcesById.get(sourceId)?.verification.status !== 'verified') {
          ctx.addIssue({
            code: 'custom',
            path: ['reviews', index, 'sourceIds', sourceIndex],
            message: `A reviewed recipe requires a verified source: ${sourceId}.`,
          })
        }
      })
    })
    for (const recipeId of recipeIds) {
      if (!seen.has(recipeId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['reviews'],
          message: `Missing review for recipe: ${recipeId}.`,
        })
      }
    }
  })
}

export const recipeReviews = createRecipeReviewsSchema(recipes, historicalResearch.sources).parse(rawReviews)
export const reviewsByRecipeId = new Map(
  recipeReviews.reviews.map((review) => [review.recipeId, review]),
)
