import rawResearch from './research.json'
import { elements } from './index'
import { historicalDatabaseSchema, type HistoricalResearchSource } from './schema'

export type {
  HistoricalResearchSource,
  HistoricalResearchRecord,
  HistoricalResearchDatabase,
} from './schema'

export function createResearchDatabaseSchema(
  catalog: readonly { id: string; name: string; era: string }[],
) {
  return historicalDatabaseSchema.superRefine((database, ctx) => {
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
      checkSources(record.manufactureOrUse.sourceIds, ['manufactureOrUse'])
      checkSources(record.historicalSignificance.sourceIds, ['historicalSignificance'])
      checkSources(record.agePlacement.sourceIds, ['agePlacement'])
      if (record.agePlacement.status === 'fictional-prologue') {
        if (element && element.era !== 'first-light') {
          ctx.addIssue({
            code: 'custom',
            path: [...path, 'agePlacement', 'status'],
            message: 'Only Origins discoveries belong to the fictional prologue.',
          })
        }
      } else if (record.agePlacement.sourceIds.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: [...path, 'agePlacement', 'sourceIds'],
          message: 'Historical age-placement context requires verified sources.',
        })
      }
      record.relatedDiscoveries.forEach((link, linkIndex) => {
        const linkPath = ['relatedDiscoveries', linkIndex]
        if (!catalogById.has(link.elementId) || link.elementId === record.elementId) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, ...linkPath, 'elementId'],
            message: 'Related discoveries must reference another catalog element.',
          })
        }
        checkSources(link.sourceIds, linkPath)
        if (link.relationship === 'documented' && link.sourceIds.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, ...linkPath, 'sourceIds'],
            message: 'Documented relationships require verified sources.',
          })
        }
      })
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

// Historical metadata stays separate from recipes, progression and save data.
export const historicalResearch = createResearchDatabaseSchema(elements).parse(rawResearch)
export const researchByElementId = new Map(
  historicalResearch.records.map((record) => [record.elementId, record]),
)
