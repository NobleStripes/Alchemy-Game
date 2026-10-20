import type { ModuleOwnership } from '../state/moduleProgress.ts'
import { installedRegionalModules } from './installed.ts'
import type { RegionalModule } from './schema.ts'

/**
 * Derive ownership exclusively from vetted bundled definitions, not from
 * archive claims. A missing module's archived ownership must remain dormant.
 */
export function ownershipForPack(pack: RegionalModule): ModuleOwnership {
  return {
    moduleId: pack.manifest.id,
    version: pack.manifest.version,
    elementIds: pack.elements.map((item) => item.id),
    recipeIds: pack.recipes.map((item) => item.id),
    collectionIds: pack.collections.map((item) => item.id),
    challengeIds: pack.challenges.map((item) => item.id),
    researchElementIds: pack.research.records.map((item) => item.elementId),
  }
}

export const installedModuleOwnership: readonly ModuleOwnership[] =
  installedRegionalModules.map(ownershipForPack)
