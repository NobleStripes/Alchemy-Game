import { z } from 'zod'

const imagePath = z.string().regex(/^images\/[a-z0-9-]+\/[a-z0-9-]+\.jpg$/)
export const elementImageSchema = z.strictObject({
  src: imagePath,
  thumbnailSrc: imagePath.optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  description: z.string().trim().min(1),
  credit: z.string().trim().min(1),
  sourceUrl: z.url({ protocol: /^https$/ }),
  license: z.string().trim().min(1),
  licenseUrl: z.url({ protocol: /^https$/ }),
  licensePath: z.string().regex(/^images\/[a-z0-9-]+\/[A-Z0-9.-]+\.txt$/).optional(),
  changes: z.string().trim().min(1),
})

export const elementSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  sigil: z.string().min(1).max(3),
  icon: z.string().optional(),
  image: elementImageSchema.optional(),
  category: z.enum([
    'essence',
    'matter',
    'weather',
    'life',
    'craft',
    'society',
    'knowledge',
    'transport',
  ]),
  description: z.string().min(1),
  starter: z.boolean(),
  era: z.string().min(1),
})

export const recipeSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  inputs: z.tuple([z.string().min(1), z.string().min(1)]),
  result: z.string().min(1),
  flavor: z.string().min(1),
})

export const eraSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  dateRange: z.string().min(1).optional(),
  subtitle: z.string().min(1),
  education: z.string().trim().min(1).optional(),
  unlockRequires: z.array(z.string().min(1)),
  grants: z.array(z.string().min(1)),
  landmarkIds: z.array(z.string().min(1)),
  discoveryGoal: z.number().int().positive(),
})

export const elementsSchema = z.array(elementSchema)
export const recipesSchema = z.array(recipeSchema)
export const erasSchema = z.array(eraSchema)

export const collectionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  era: z.string().min(1),
  education: z.string().trim().min(1).optional(),
  landmarkId: z.string().regex(/^[a-z][a-z0-9-]*$/).optional(),
  elementIds: z.array(z.string().min(1)).nonempty().refine(
    (ids) => new Set(ids).size === ids.length,
    'Collection members must be unique.',
  ),
}).refine(
  (collection) => !collection.landmarkId || collection.elementIds.includes(collection.landmarkId),
  'Collection members must include the landmark.',
)

export const collectionsSchema = z.array(collectionSchema)

const historicalText = z.string().trim().min(1)
const historicalId = historicalText.regex(/^[a-z][a-z0-9-]*$/)
const historicalWebUrl = z.url({ protocol: /^https?$/ })
const historicalSourceIds = z.array(historicalId).refine(
  (ids) => new Set(ids).size === ids.length,
  'Source references must be unique.',
)
const historicalRegions = z.array(historicalText).refine(
  (regions) => new Set(regions).size === regions.length,
  'Regions must be unique.',
)
const historicalCitedText = z.strictObject({
  text: historicalText,
  sourceIds: historicalSourceIds.nonempty(),
})

export const historicalSourceSchema = z.strictObject({
  id: historicalId,
  title: historicalText,
  authors: z.array(historicalText),
  institution: historicalText,
  sourceType: z.enum([
    'museum-collection',
    'museum-essay',
    'library-collection',
    'archaeology-institution',
    'peer-reviewed-study',
    'research-preprint',
    'reference-encyclopedia',
    'reference-textbook',
  ]),
  url: historicalWebUrl,
  publicationDate: z.iso.date().nullable(),
  verification: z.discriminatedUnion('status', [
    z.strictObject({
      status: z.literal('verified'),
      checkedOn: z.iso.date(),
      accessedUrl: historicalWebUrl,
      accessLevel: z.enum([
        'collection-record',
        'selected-passages',
        'abstract-only',
      ]),
      locator: historicalText,
    }),
    z.strictObject({
      status: z.literal('pending'),
      attemptedOn: z.iso.date(),
      reason: historicalText,
    }),
  ]),
})

export const historicalChronologySchema = z.strictObject({
  dateRange: historicalText,
  dateType: z.enum([
    'dated-evidence',
    'earliest-known-evidence',
    'regional-development',
    'widespread-adoption',
    'undated',
  ]),
  precision: z.enum(['approximate', 'year-resolved', 'undated']),
  regions: historicalRegions,
  sourceIds: historicalSourceIds,
  note: historicalText,
}).superRefine((entry, ctx) => {
  if (entry.dateType === 'undated') {
    if (entry.precision !== 'undated') {
      ctx.addIssue({
        code: 'custom',
        path: ['precision'],
        message: 'Undated entries cannot claim a date precision.',
      })
    }
  } else {
    if (entry.sourceIds.length === 0 || entry.regions.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Historical dates require a region and verified sources.',
      })
    }
    if (entry.precision === 'undated') {
      ctx.addIssue({
        code: 'custom',
        path: ['precision'],
        message: 'Dated entries must specify their precision.',
      })
    }
  }
  if (entry.precision === 'year-resolved' && entry.dateType !== 'dated-evidence') {
    ctx.addIssue({
      code: 'custom',
      path: ['dateType'],
      message: 'Year-resolved dates describe a specific dated object or event, not an invention or adoption.',
    })
  }
})

export const historicalEntrySchema = z.strictObject({
  elementId: historicalId,
  elementName: historicalText,
  historicalOverview: historicalCitedText,
  manufactureOrUse: historicalCitedText,
  agePlacement: z.discriminatedUnion('status', [
    z.strictObject({
      status: z.literal('historical-model'),
      text: historicalText,
      sourceIds: historicalSourceIds.nonempty(),
    }),
    z.strictObject({
      status: z.enum(['earlier-precedents', 'regional-gameplay-placement', 'fictional-prologue']),
      text: historicalText,
      sourceIds: historicalSourceIds,
    }),
  ]),
  relatedDiscoveries: z.array(z.strictObject({
    elementId: historicalId,
    relationship: z.enum(['documented', 'gameplay-abstraction']),
    explanation: historicalText,
    sourceIds: historicalSourceIds,
  })).refine(
    (links) => new Set(links.map((link) => link.elementId)).size === links.length,
    'Related discoveries must be unique.',
  ),
  approximateDates: z.array(historicalChronologySchema).default([]),
  associatedRegions: historicalRegions.default([]),
  archaeologicalEvidence: z.array(z.strictObject({
    text: historicalText,
    evidenceType: z.enum(['artifact', 'excavated-context', 'textual-evidence', 'interpretation']),
    interpretation: z.enum(['attested', 'hypothesis', 'disputed']),
    sourceIds: historicalSourceIds.nonempty(),
  })),
  historicalSignificance: historicalCitedText,
  independentDevelopments: z.array(z.strictObject({
    regions: historicalRegions.nonempty(),
    text: historicalText,
    sourceIds: historicalSourceIds.nonempty(),
  })),
  historicalUncertainty: z.array(historicalText).nonempty(),
  gameplaySimplifications: z.array(historicalText).nonempty(),
  furtherResearch: z.array(z.strictObject({
    question: historicalText,
    sourceIds: historicalSourceIds,
  })),
})

export const recipeReviewEntrySchema = z.strictObject({
  recipeId: z.string().regex(/^[a-z][a-z0-9-]*$/),
  classification: z.enum(['material-process', 'simplified-process', 'symbolic']),
  caution: z.string().trim().min(1),
  sourceIds: historicalSourceIds,
})

export const historicalDatabaseSchema = z.strictObject({
  schemaVersion: z.literal(2),
  sources: z.array(historicalSourceSchema).nonempty(),
  records: z.array(historicalEntrySchema).nonempty(),
})

export type HistoricalResearchSource = z.infer<typeof historicalSourceSchema>
export type HistoricalResearchRecord = z.infer<typeof historicalEntrySchema>
export type HistoricalResearchDatabase = z.infer<typeof historicalDatabaseSchema>