import { createResearchDatabaseSchema } from '../content/research.ts'
import { createRecipeReviewsSchema } from '../content/recipeReviews.ts'
import type { ChallengeDefinition } from '../content/challenges.ts'
import type { HistoricalResearchRecord } from '../content/schema.ts'
import { resolveRegionalCatalog } from './registry.ts'
import { createRuntimeCatalog, runtimeCatalog, type RuntimeCatalog } from './runtimeCatalog.ts'
import { regionalModuleSchema, type RegionalModule } from './schema.ts'

export type FullCatalogResolution =
  | { ok: true; catalog: RuntimeCatalog; activeModuleIds: string[] }
  | { ok: false; errors: string[] }

type SourceOwner = Map<string, string>
type ElementOwner = Map<string, string>

function collectSourceIds(record: HistoricalResearchRecord): string[] {
  return [
    ...record.historicalOverview.sourceIds,
    ...record.manufactureOrUse.sourceIds,
    ...record.agePlacement.sourceIds,
    ...record.historicalSignificance.sourceIds,
    ...record.relatedDiscoveries.flatMap((link) => link.sourceIds),
    ...record.approximateDates.flatMap((date) => date.sourceIds),
    ...record.archaeologicalEvidence.flatMap((evidence) => evidence.sourceIds),
    ...record.independentDevelopments.flatMap((entry) => entry.sourceIds),
    ...record.furtherResearch.flatMap((entry) => entry.sourceIds),
  ]
}

function checkDependency(
  pack: RegionalModule,
  value: string,
  kind: string,
  owners: Map<string, string>,
  errors: string[],
) {
  const owner = owners.get(value)
  if (owner && owner !== pack.manifest.id &&
    !pack.manifest.dependencies.includes(owner)) {
    errors.push(
      'Module ' + pack.manifest.id + ' references ' + kind + ' ' +
      value + ' from ' + owner + ' without declaring a dependency.',
    )
  }
}

function validateModuleReferences(
  pack: RegionalModule,
  sourceOwners: SourceOwner,
  elementOwners: ElementOwner,
  errors: string[],
) {
  for (const record of pack.research.records) {
    for (const id of collectSourceIds(record)) {
      checkDependency(pack, id, 'source', sourceOwners, errors)
    }
    for (const link of record.relatedDiscoveries) {
      checkDependency(pack, link.elementId, 'related discovery', elementOwners, errors)
    }
  }
  for (const review of pack.reviews) {
    for (const id of review.sourceIds) {
      checkDependency(pack, id, 'review source', sourceOwners, errors)
    }
  }
  for (const challenge of pack.challenges) {
    for (const id of [...challenge.starterIds, challenge.targetId]) {
      checkDependency(pack, id, 'challenge discovery', elementOwners, errors)
    }
    for (const id of challenge.education?.sourceIds ?? []) {
      checkDependency(pack, id, 'challenge source', sourceOwners, errors)
    }
  }
  for (const collection of pack.collections) {
    for (const id of collection.elementIds) {
      checkDependency(pack, id, 'collection discovery', elementOwners, errors)
    }
  }
}

function validateChallenge(
  challenge: ChallengeDefinition,
  catalog: RuntimeCatalog,
  verifiedSources: ReadonlySet<string>,
): string[] {
  const errors: string[] = []
  for (const id of [...challenge.starterIds, challenge.targetId]) {
    if (!catalog.elementsById.has(id)) {
      errors.push('Challenge ' + challenge.id + ' references missing element ' + id + '.')
    }
  }
  const eras = new Set(catalog.eras.map((era) => era.id))
  for (const id of challenge.allowedResultEraIds) {
    if (!eras.has(id)) {
      errors.push('Challenge ' + challenge.id + ' references missing era ' + id + '.')
    }
  }
  for (const id of challenge.education?.sourceIds ?? []) {
    if (!verifiedSources.has(id)) {
      errors.push('Challenge ' + challenge.id + ' lacks a verified source ' + id + '.')
    }
  }
  if (errors.length) return errors
  const reached = new Set(challenge.starterIds)
  let changed = true
  while (changed) {
    changed = false
    for (const recipe of catalog.recipes) {
      const result = catalog.elementsById.get(recipe.result)
      if (result && challenge.allowedResultEraIds.includes(result.era) &&
        recipe.inputs.every((id) => reached.has(id)) && !reached.has(recipe.result)) {
        reached.add(recipe.result)
        changed = true
      }
    }
  }
  if (!reached.has(challenge.targetId)) {
    errors.push('Challenge ' + challenge.id + ' has an unreachable target ' + challenge.targetId + '.')
  }
  return errors
}

/**
 * Validate the entire selected first-party pack set, including educational
 * metadata. No module is enabled in the current app by calling this function.
 * Historical citation shape and provenance are checked; historical truth is
 * still a separate human editorial requirement.
 */
export function resolveFullRuntimeCatalog(
  rawModules: readonly unknown[],
  enabledModuleIds: readonly string[],
  coreVersion: string,
): FullCatalogResolution {
  const result = resolveRegionalCatalog(runtimeCatalog, rawModules, enabledModuleIds, coreVersion)
  if (!result.ok) return result

  const packs = new Map<string, RegionalModule>()
  for (const raw of rawModules) {
    const parsed = regionalModuleSchema.safeParse(raw)
    if (parsed.success) packs.set(parsed.data.manifest.id, parsed.data)
  }
  const enabled = result.catalog.activeModuleIds.map((id) => packs.get(id)!)
  const errors: string[] = []
  const sourceOwners: SourceOwner = new Map()
  const elementOwners: ElementOwner = new Map()
  for (const pack of enabled) {
    const owner = pack.manifest.id
    for (const source of pack.research.sources) sourceOwners.set(source.id, owner)
    for (const element of pack.elements) elementOwners.set(element.id, owner)
  }

  for (const pack of enabled) {
    for (const element of pack.elements) {
      if (!pack.research.records.some((entry) => entry.elementId === element.id)) {
        errors.push('Module ' + pack.manifest.id + ' lacks history for ' + element.id + '.')
      }
    }
    for (const recipe of pack.recipes) {
      if (!pack.reviews.some((review) => review.recipeId === recipe.id)) {
        errors.push('Module ' + pack.manifest.id + ' lacks recipe review for ' + recipe.id + '.')
      }
    }
    validateModuleReferences(pack, sourceOwners, elementOwners, errors)
  }

  const sources = [
    ...runtimeCatalog.sources,
    ...enabled.flatMap((pack) => pack.research.sources),
  ]
  const histories = [
    ...runtimeCatalog.histories,
    ...enabled.flatMap((pack) => pack.research.records),
  ]
  const reviews = [
    ...runtimeCatalog.recipeReviews,
    ...enabled.flatMap((pack) => pack.reviews),
  ]
  const challenges = [
    ...runtimeCatalog.challenges,
    ...enabled.flatMap((pack) => pack.challenges),
  ]
  const researchCheck = createResearchDatabaseSchema(result.catalog.elements).safeParse({
    schemaVersion: 2, sources, records: histories,
  })
  if (!researchCheck.success) {
    errors.push(...researchCheck.error.issues.map((issue) =>
      'Research: ' + issue.path.join('.') + ': ' + issue.message,
    ))
  }
  const recipeCheck = createRecipeReviewsSchema(result.catalog.recipes, sources).safeParse({
    schemaVersion: 1, reviews,
  })
  if (!recipeCheck.success) {
    errors.push(...recipeCheck.error.issues.map((issue) =>
      'Recipe review: ' + issue.path.join('.') + ': ' + issue.message,
    ))
  }

  const seenChallengeIds = new Set<string>()
  for (const challenge of challenges) {
    if (seenChallengeIds.has(challenge.id)) {
      errors.push('Duplicate challenge ID ' + challenge.id + '.')
    }
    seenChallengeIds.add(challenge.id)
  }

  if (errors.length) return { ok: false, errors }
  const catalog = createRuntimeCatalog({
    ...result.catalog, sources, histories, recipeReviews: reviews, challenges,
  })
  const verifiedSources = new Set(
    sources.filter((source) => source.verification.status === 'verified').map((source) => source.id),
  )
  for (const challenge of enabled.flatMap((pack) => pack.challenges)) {
    errors.push(...validateChallenge(challenge, catalog, verifiedSources))
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, catalog, activeModuleIds: result.catalog.activeModuleIds }
}
