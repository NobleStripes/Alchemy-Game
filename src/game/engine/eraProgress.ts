import type { ElementDefinition, EraDefinition } from '../domain/types'

export interface EraProgress {
  discoveredIds: string[]
  unlockedEraIds: string[]
}

export function reconcileEraProgress(
  discoveredIds: string[],
  unlockedEraIds: string[],
  elements: ElementDefinition[],
  eras: EraDefinition[],
): EraProgress {
  const discovered = new Set(discoveredIds)
  const unlocked = new Set([eras[0]?.id, ...unlockedEraIds].filter(Boolean))
  let changed = true

  while (changed) {
    changed = false

    for (const era of eras) {
      const hasLegacyDiscovery = elements.some(
        (element) => element.era === era.id && discovered.has(element.id),
      )
      const meetsRequirements = era.unlockRequires.every((elementId) =>
        discovered.has(elementId),
      )

      if (!unlocked.has(era.id) && (hasLegacyDiscovery || meetsRequirements)) {
        unlocked.add(era.id)
        changed = true
      }

      if (unlocked.has(era.id)) {
        for (const grantedId of era.grants) {
          if (!discovered.has(grantedId)) {
            discovered.add(grantedId)
            changed = true
          }
        }
      }
    }
  }

  return {
    discoveredIds: [...discovered],
    unlockedEraIds: eras
      .map((era) => era.id)
      .filter((eraId) => unlocked.has(eraId)),
  }
}