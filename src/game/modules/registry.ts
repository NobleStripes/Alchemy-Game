import type {
  CollectionDefinition,
  ElementDefinition,
  EraDefinition,
  RecipeDefinition,
} from '../domain/types.ts'
import { validateContent } from '../engine/validateContent.ts'
import { regionalModuleSchema, type RegionalModule } from './schema.ts'

export interface CoreCatalog {
  elements: readonly ElementDefinition[]
  recipes: readonly RecipeDefinition[]
  eras: readonly EraDefinition[]
  collections: readonly CollectionDefinition[]
}

export interface ResolvedCatalog {
  elements: ElementDefinition[]
  recipes: RecipeDefinition[]
  eras: EraDefinition[]
  collections: CollectionDefinition[]
  activeModuleIds: string[]
}

export type Resolution =
  | { ok: true; catalog: ResolvedCatalog }
  | { ok: false; errors: string[] }

const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

function versionAtLeast(installed: string, required: string): boolean {
  const left = installed.split('.').map((part) => BigInt(part))
  const right = required.split('.').map((part) => BigInt(part))
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index]
  }
  return true
}

/**
 * Pure Phase 10A registry. It does NOT activate modules in the running game or
 * normalize saves. Do not expose an enable/disable control until module-aware
 * research, challenge resolution, and durable save preservation are implemented.
 *
 * Fail closed: rejected packs never return a partially composed catalog.
 */
export function resolveRegionalCatalog(
  core: CoreCatalog,
  rawModules: readonly unknown[],
  enabledModuleIds: readonly string[],
  coreVersion: string,
): Resolution {
  const errors: string[] = []
  if (!versionPattern.test(coreVersion)) {
    return { ok: false, errors: ['Invalid core application version.'] }
  }

  const installed = new Map<string, RegionalModule>()
  rawModules.forEach((rawModule, index) => {
    const parsed = regionalModuleSchema.safeParse(rawModule)
    if (!parsed.success) {
      errors.push(`Invalid module at index ${index}: ${parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ).join('; ')}`)
      return
    }
    const pack = parsed.data
    if (installed.has(pack.manifest.id)) {
      errors.push(`Duplicate installed module ID: ${pack.manifest.id}.`)
    } else {
      installed.set(pack.manifest.id, pack)
    }
  })

  const enabled = new Set(enabledModuleIds)
  if (enabled.size !== enabledModuleIds.length) {
    errors.push('Enabled module IDs must be unique.')
  }
  for (const id of enabled) {
    if (!installed.has(id)) errors.push(`Enabled module ${id} is not installed.`)
  }

  const order: RegionalModule[] = []
  const state = new Map<string, 'visiting' | 'visited'>()
  const visit = (id: string) => {
    const pack = installed.get(id)
    if (!pack) return
    if (state.get(id) === 'visiting') {
      errors.push(`Module dependency cycle involving ${id}.`)
      return
    }
    if (state.get(id) === 'visited') return
    state.set(id, 'visiting')
    for (const dependency of pack.manifest.dependencies) {
      if (!installed.has(dependency)) {
        errors.push(`Module ${id} requires missing module ${dependency}.`)
      } else if (!enabled.has(dependency)) {
        errors.push(`Module ${id} requires disabled module ${dependency}.`)
      } else {
        visit(dependency)
      }
    }
    state.set(id, 'visited')
    order.push(pack)
  }
  // Identical active sets produce identical catalogs regardless of input order.
  for (const id of [...enabled].sort()) visit(id)

  const eraIds = new Set(core.eras.map((era) => era.id))
  const owners = new Map(core.elements.map((element) => [element.id, 'core']))
  for (const pack of order) {
    const manifest = pack.manifest
    if (!versionAtLeast(coreVersion, manifest.minimumCoreVersion)) {
      errors.push(`Module ${manifest.id} needs core version ${manifest.minimumCoreVersion}.`)
    }
    for (const eraId of manifest.targetEraIds) {
      if (!eraIds.has(eraId)) {
        errors.push(`Module ${manifest.id} references missing core era ${eraId}.`)
      }
    }
    for (const element of pack.elements) {
      const prior = owners.get(element.id)
      if (prior) {
        errors.push(`Module ${manifest.id} element ${element.id} conflicts with ${prior}.`)
      } else {
        owners.set(element.id, manifest.id)
      }
    }
  }

  for (const pack of order) {
    const manifest = pack.manifest
    for (const recipe of pack.recipes) {
      for (const inputId of recipe.inputs) {
        const owner = owners.get(inputId)
        if (owner && owner !== 'core' && owner !== manifest.id &&
          !manifest.dependencies.includes(owner)) {
          errors.push(`Module ${manifest.id} recipe ${recipe.id} references ${owner} without declaring a dependency.`)
        }
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  const catalog: ResolvedCatalog = {
    elements: [...core.elements, ...order.flatMap((pack) => pack.elements)],
    recipes: [...core.recipes, ...order.flatMap((pack) => pack.recipes)],
    eras: [...core.eras],
    collections: [...core.collections, ...order.flatMap((pack) => pack.collections)],
    activeModuleIds: order.map((pack) => pack.manifest.id),
  }
  errors.push(...validateContent(
    catalog.elements, catalog.recipes, catalog.eras, catalog.collections,
  ))
  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, catalog }
}
