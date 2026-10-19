import { z } from 'zod'
import { collectionsSchema, elementsSchema, recipesSchema } from '../content/schema.ts'

const id = z.string().regex(/^[a-z][a-z0-9-]*$/)
const version = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
const uniqueIds = z.array(id).refine(
  (ids) => new Set(ids).size === ids.length,
  'IDs must be unique.',
)

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
})

export type RegionalModuleManifest = z.infer<typeof regionalModuleManifestSchema>
export type RegionalModule = z.infer<typeof regionalModuleSchema>
