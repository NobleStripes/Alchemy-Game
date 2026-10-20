import { z } from 'zod'
import {
  collectionsSchema, elementsSchema, recipesSchema,
  historicalSourceSchema, historicalEntrySchema, recipeReviewEntrySchema,
} from '../content/schema.ts'

const id = z.string().regex(/^[a-z][a-z0-9-]*$/)
const version = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
const uniqueIds = z.array(id).refine(
  (ids) => new Set(ids).size === ids.length,
  'IDs must be unique.',
)

export const regionalChallengeSchema = z.strictObject({
  id,
  name: z.string().trim().min(1),
  starterIds: z.array(id).min(1).refine((ids) => new Set(ids).size === ids.length),
  targetId: id,
  allowedResultEraIds: z.array(id).min(1).refine((ids) => new Set(ids).size === ids.length),
  minimumAttempts: z.number().int().positive(),
  education: z.strictObject({
    overview: z.string().trim().min(1),
    sourceIds: uniqueIds,
  }).optional(),
})

/**
 * Metadata for a trusted, bundled, data-only historical expansion.
 * Ages are owned exclusively by the core game.
 */
export const regionalModuleManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id,
  version,
  minimumCoreVersion: version,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  regions: z.array(z.string().trim().min(1)).nonempty(),
  historicalPeriod: z.string().trim().min(1),
  targetEraIds: uniqueIds.min(1),
  dependencies: uniqueIds,
}).superRefine((manifest, ctx) => {
  if (manifest.dependencies.includes(manifest.id)) {
    ctx.addIssue({
      code: 'custom',
      path: ['dependencies'],
      message: 'A regional module cannot depend on itself.',
    })
  }
})

/**
 * Initial registry payload: gameplay-only definitions. Historical records,
 * cited recipe reviews, and challenges must gain their own validated
 * composition before any module is made playable through the UI.
 */
export const regionalModuleSchema = z.strictObject({
  manifest: regionalModuleManifestSchema,
  elements: elementsSchema,
  recipes: recipesSchema,
  collections: collectionsSchema,
  research: z.strictObject({
    sources: z.array(historicalSourceSchema),
    records: z.array(historicalEntrySchema),
  }).default({ sources: [], records: [] }),
  reviews: z.array(recipeReviewEntrySchema).default([]),
  challenges: z.array(regionalChallengeSchema).default([]),
}).superRefine((pack, ctx) => {
  const prefix = `${pack.manifest.id}-`
  const ownedElementIds = new Set(pack.elements.map((element) => element.id))

  for (const [field, definitions] of [
    ['elements', pack.elements],
    ['recipes', pack.recipes],
    ['collections', pack.collections],
  ] as const) {
    definitions.forEach((definition, index) => {
      if (!definition.id.startsWith(prefix)) {
        ctx.addIssue({
          code: 'custom',
          path: [field, index, 'id'],
          message: `Module-owned IDs must begin with ${prefix}.`,
        })
      }
    })
  }

  pack.elements.forEach((element, index) => {
    if (element.starter) {
      ctx.addIssue({
        code: 'custom',
        path: ['elements', index, 'starter'],
        message: 'Optional modules cannot add starting essences.',
      })
    }
    if (!pack.manifest.targetEraIds.includes(element.era)) {
      ctx.addIssue({
        code: 'custom',
        path: ['elements', index, 'era'],
        message: 'Element age must be declared in the module manifest.',
      })
    }
  })

  pack.recipes.forEach((recipe, index) => {
    if (!ownedElementIds.has(recipe.result)) {
      ctx.addIssue({
        code: 'custom',
        path: ['recipes', index, 'result'],
        message: 'Initial regional recipes must produce module-owned discoveries.',
      })
    }
  })

  pack.collections.forEach((collection, index) => {
    if (!pack.manifest.targetEraIds.includes(collection.era)) {
      ctx.addIssue({
        code: 'custom',
        path: ['collections', index, 'era'],
        message: 'Collection age must be declared in the module manifest.',
      })
    }
    if (!collection.elementIds.some((elementId) => ownedElementIds.has(elementId))) {
      ctx.addIssue({
        code: 'custom',
        path: ['collections', index, 'elementIds'],
        message: 'Regional collections must include a module-owned discovery.',
      })
    }
  })

  const ownedRecipeIds = new Set(pack.recipes.map((recipe) => recipe.id))
  pack.research.sources.forEach((source, index) => {
    if (!source.id.startsWith(prefix)) {
      ctx.addIssue({
        code: 'custom',
        path: ['research', 'sources', index, 'id'],
        message: 'Regional source IDs must use the module prefix.',
      })
    }
  })
  pack.research.records.forEach((record, index) => {
    if (!ownedElementIds.has(record.elementId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['research', 'records', index, 'elementId'],
        message: 'Regional histories must describe module-owned discoveries.',
      })
    }
  })
  pack.reviews.forEach((review, index) => {
    if (!ownedRecipeIds.has(review.recipeId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['reviews', index, 'recipeId'],
        message: 'Regional recipe reviews must describe module-owned formulas.',
      })
    }
  })
  pack.challenges.forEach((challenge, index) => {
    if (!challenge.id.startsWith(prefix)) {
      ctx.addIssue({
        code: 'custom',
        path: ['challenges', index, 'id'],
        message: 'Regional challenge IDs must use the module prefix.',
      })
    }
  })
})

export type RegionalModuleManifest = z.infer<typeof regionalModuleManifestSchema>
export type RegionalModule = z.infer<typeof regionalModuleSchema>
