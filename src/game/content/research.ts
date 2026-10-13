import { z } from 'zod'
import rawResearch from './research.json'
import { elements } from './index'

const text = z.string().trim().min(1)
const id = text.regex(/^[a-z][a-z0-9-]*$/)
const webUrl = z.url({ protocol: /^https?$/ })
const uniqueIds = z.array(id).refine(
  (ids) => new Set(ids).size === ids.length,
  'Source references must be unique.',
)
const sourceIds = uniqueIds.nonempty()
const regions = z.array(text).nonempty().refine(
  (values) => new Set(values).size === values.length,
  'Regions must be unique.',
)
const citedText = z.strictObject({ text, sourceIds })

const sourceSchema = z.strictObject({
  id,
  title: text,
  authors: z.array(text),
  institution: text,
  sourceType: z.enum([
    'museum-collection',
    'museum-essay',
    'archaeology-institution',
    'peer-reviewed-study',
    'reference-encyclopedia',
  ]),
  url: webUrl,
  publicationDate: z.iso.date().nullable(),
  verification: z.discriminatedUnion('status', [
    z.strictObject({
      status: z.literal('verified'),
      checkedOn: z.iso.date(),
      accessedUrl: webUrl,
      accessLevel: z.enum([
        'collection-record',
        'selected-passages',
        'abstract-only',
      ]),
      locator: text,
    }),
    z.strictObject({
      status: z.literal('pending'),
      attemptedOn: z.iso.date(),
      reason: text,
    }),
  ]),
})

const chronologySchema = z.strictObject({
  dateRange: text,
  dateType: z.enum([
    'dated-evidence',
    'earliest-known-evidence',
    'regional-development',
    'widespread-adoption',
    'undated',
  ]),
  precision: z.enum(['approximate', 'year-resolved', 'undated']),
  regions: z.array(text),
  sourceIds: uniqueIds,
  note: text,
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

const recordSchema = z.strictObject({
  elementId: id,
  elementName: text,
  historicalOverview: citedText,
  approximateDates: z.array(chronologySchema).nonempty(),
  associatedRegions: regions,
  archaeologicalEvidence: z.array(z.strictObject({
    text,
    evidenceType: z.enum(['artifact', 'excavated-context', 'textual-evidence', 'interpretation']),
    interpretation: z.enum(['attested', 'hypothesis', 'disputed']),
    sourceIds,
  })),
  historicalSignificance: citedText,
  independentDevelopments: z.array(z.strictObject({
    regions,
    text,
    sourceIds,
  })),
  historicalUncertainty: z.array(text).nonempty(),
  gameplaySimplifications: z.array(text).nonempty(),
  furtherResearch: z.array(z.strictObject({
    question: text,
    sourceIds: uniqueIds,
  })),
})

const databaseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  sources: z.array(sourceSchema).nonempty(),
  records: z.array(recordSchema).nonempty(),
})

export type HistoricalResearchSource = z.infer<typeof sourceSchema>
export type HistoricalResearchRecord = z.infer<typeof recordSchema>
export type HistoricalResearchDatabase = z.infer<typeof databaseSchema>

export function createResearchDatabaseSchema(
  catalog: readonly { id: string; name: string }[],
) {
  return databaseSchema.superRefine((database, ctx) => {
    const catalogById = new Map(catalog.map((element) => [element.id, element]))
    const sourcesById = new Map<string, HistoricalResearchSource>()
    database.sources.forEach((source, index) => {
      if (sourcesById.has(source.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['sources', index, 'id'],
          message: `Duplicate research source: ${source.id}.`,
        })
      }
      sourcesById.set(source.id, source)
    })

    const seenElements = new Set<string>()
    database.records.forEach((record, index) => {
      const path = ['records', index]
      const element = catalogById.get(record.elementId)
      if (!element) {
        ctx.addIssue({
          code: 'custom',
          path: [...path, 'elementId'],
          message: `Unknown research element: ${record.elementId}.`,
        })
      } else if (element.name !== record.elementName) {
        ctx.addIssue({
          code: 'custom',
          path: [...path, 'elementName'],
          message: `Research name must match the catalog: ${element.name}.`,
        })
      }
      if (seenElements.has(record.elementId)) {
        ctx.addIssue({
          code: 'custom',
          path: [...path, 'elementId'],
          message: `Duplicate research record: ${record.elementId}.`,
        })
      }
      seenElements.add(record.elementId)

      function checkSources(
        ids: string[],
        fieldPath: (string | number)[],
        requireVerified = true,
      ) {
        ids.forEach((sourceId, sourceIndex) => {
          const source = sourcesById.get(sourceId)
          if (!source || (requireVerified && source.verification.status !== 'verified')) {
            ctx.addIssue({
              code: 'custom',
              path: [...path, ...fieldPath, 'sourceIds', sourceIndex],
              message: source
                ? `Unverified source cannot support a claim: ${sourceId}.`
                : `Unknown research source: ${sourceId}.`,
            })
          }
        })
      }

      checkSources(record.historicalOverview.sourceIds, ['historicalOverview'])
      checkSources(record.historicalSignificance.sourceIds, ['historicalSignificance'])
      for (const field of [
        'approximateDates', 'archaeologicalEvidence', 'independentDevelopments',
      ] as const) {
        record[field].forEach((entry, entryIndex) => {
          checkSources(entry.sourceIds, [field, entryIndex])
          if ('regions' in entry) {
            entry.regions.forEach((region, regionIndex) => {
              if (!record.associatedRegions.includes(region)) {
                ctx.addIssue({
                  code: 'custom',
                  path: [...path, field, entryIndex, 'regions', regionIndex],
                  message: `Region must appear in associatedRegions: ${region}.`,
                })
              }
            })
          }
        })
      }
      record.furtherResearch.forEach((entry, entryIndex) => {
        checkSources(entry.sourceIds, ['furtherResearch', entryIndex], false)
      })
    })
  })
}

// Authoring-only: do not import this dataset into the gameplay content barrel.
export const historicalResearch = createResearchDatabaseSchema(elements).parse(rawResearch)
export const researchByElementId = new Map(
  historicalResearch.records.map((record) => [record.elementId, record]),
)
