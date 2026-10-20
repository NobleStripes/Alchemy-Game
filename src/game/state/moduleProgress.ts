import { z } from 'zod'
import type { SavedProgress } from './persistence.ts'
import { savedProgressSchema, MAX_SAVE_BYTES, MAX_EXPERIMENT_HISTORY } from './persistence.ts'
import { pairKey } from '../engine/resolveCombination.ts'

const id = z.string().regex(/^[a-z][a-z0-9-]*$/)
const unique = z.array(id).refine((ids) => new Set(ids).size === ids.length, 'Duplicate identifier.')
const version = z.string().regex(/^\d+\.\d+\.\d+$/)

export const moduleOwnershipSchema = z.strictObject({
  moduleId: id,
  version,
  elementIds: unique,
  recipeIds: unique,
  collectionIds: unique,
  challengeIds: unique,
  researchElementIds: unique,
})

export const moduleSaveEnvelopeSchema = z.strictObject({
  format: z.literal('unwritten-atlas-module-save'),
  envelopeVersion: z.literal(1),
  progress: savedProgressSchema,
  ownership: z.array(moduleOwnershipSchema),
  enabledModuleIds: unique.default([]),
}).refine((archive) =>
  archive.enabledModuleIds.every((moduleId) => archive.ownership.some((owner) => owner.moduleId === moduleId)),
  'Enabled modules must have archived ownership.',
)

export type ModuleSaveEnvelope = z.infer<typeof moduleSaveEnvelopeSchema>
export type ModuleOwnership = z.infer<typeof moduleOwnershipSchema>

export interface ActiveModuleProjection {
  progress: SavedProgress
  inactiveModuleIds: string[]
}

function assertOwnership(ownership: readonly ModuleOwnership[]): string[] {
  const errors: string[] = []
  const modules = new Set<string>()
  const ownerByKind = new Map<string, string>()
  for (const owner of ownership) {
    if (modules.has(owner.moduleId)) errors.push(`Duplicate module ${owner.moduleId}.`)
    modules.add(owner.moduleId)
    for (const [kind, ids] of [
      ['element', owner.elementIds],
      ['recipe', owner.recipeIds],
      ['collection', owner.collectionIds],
      ['challenge', owner.challengeIds],
      ['research', owner.researchElementIds],
    ] as const) {
      for (const value of ids) {
        const key = `${kind}:${value}`
        if (ownerByKind.has(key)) errors.push(`Conflicting ownership: ${key}.`)
        ownerByKind.set(key, owner.moduleId)
      }
    }
    for (const researchId of owner.researchElementIds) {
      if (!owner.elementIds.includes(researchId)) {
        errors.push(`Module ${owner.moduleId} research element ${researchId} is not owned by the module.`)
      }
    }
  }
  return errors
}

/**
 * Shape validation is not activation. Internal session startup also checks
 * installed ownership and active definitions. Unknown ownership stays dormant.
 */
export function parseModuleSaveEnvelope(raw: string): ModuleSaveEnvelope | null {
  try {
    if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) return null
    const result = moduleSaveEnvelopeSchema.safeParse(JSON.parse(raw))
    if (!result.success || assertOwnership(result.data.ownership).length) return null
    return result.data
  } catch {
    return null
  }
}

export function projectModuleProgress(
  archive: ModuleSaveEnvelope,
  enabledModuleIds: readonly string[],
): ActiveModuleProjection {
  const active = new Set(enabledModuleIds)
  const inactive = archive.ownership.filter((owner) => !active.has(owner.moduleId))
  const excluded = <T extends keyof ModuleOwnership>(field: T) =>
    new Set(inactive.flatMap((owner) => owner[field] as string[]))
  const inactiveElements = excluded('elementIds')
  const inactiveRecipes = excluded('recipeIds')
  const inactiveCollections = excluded('collectionIds')
  const inactiveChallenges = excluded('challengeIds')
  const inactiveResearch = excluded('researchElementIds')
  const progress = archive.progress
  const discovered = progress.discoveredIds.filter((id) => !inactiveElements.has(id))
  const discoveredIds = new Set(discovered)
  return {
    progress: {
      ...progress,
      discoveredIds: discovered,
      discoveredRecipeIds: progress.discoveredRecipeIds.filter((id) => !inactiveRecipes.has(id)),
      revealedHintRecipeIds: progress.revealedHintRecipeIds.filter((id) => !inactiveRecipes.has(id)),
      favoriteIds: progress.favoriteIds.filter((id) => discoveredIds.has(id)),
      readHistoricalElementIds: progress.readHistoricalElementIds.filter(
        (id) => discoveredIds.has(id) && !inactiveResearch.has(id),
      ),
      rewardedCollectionIds: progress.rewardedCollectionIds.filter((id) => !inactiveCollections.has(id)),
      challengeRecords: progress.challengeRecords.filter((record) => !inactiveChallenges.has(record.challengeId)),
      experimentHistory: progress.experimentHistory.filter(
        (entry) => entry.inputs.every((id) => discoveredIds.has(id)) &&
          (!entry.recipeId || !inactiveRecipes.has(entry.recipeId)) &&
          (!entry.resultId || discoveredIds.has(entry.resultId)),
      ).sort((a, b) => a.id - b.id).slice(-MAX_EXPERIMENT_HISTORY),
      failedPairKeys: progress.failedPairKeys.filter(
        (key) => {
          const inputs = key.split('::')
          return inputs.length === 2 && inputs.every((id) => discoveredIds.has(id)) &&
            key === pairKey(inputs[0], inputs[1])
        },
      ),
    },
    inactiveModuleIds: inactive.map((owner) => owner.moduleId),
  }
}

/** Build an independent archive snapshot; never mutate the source v7 save. */
export function createModuleSaveEnvelope(
  progress: SavedProgress,
  ownership: readonly ModuleOwnership[],
  enabledModuleIds: readonly string[] = [],
): ModuleSaveEnvelope {
  const archive = moduleSaveEnvelopeSchema.parse({
    format: 'unwritten-atlas-module-save',
    envelopeVersion: 1,
    progress,
    ownership,
    enabledModuleIds,
  })
  const errors = assertOwnership(archive.ownership)
  if (errors.length) throw new Error(errors.join(' '))
  return archive
}
