import rawAchaemenid from './achaemenid/pack.json' with { type: 'json' }
import { regionalModuleSchema } from './schema.ts'
import { resolveFullRuntimeCatalog } from './fullRegistry.ts'

/** Trusted, bundled, first-party modules only. No remote loading or code execution. */
export const installedRegionalModules = [
  regionalModuleSchema.parse(rawAchaemenid),
]

export const installedRegionalModuleIds = installedRegionalModules.map(
  (pack) => pack.manifest.id,
)

/** All module sources and histories are validated before any future activation. */
export function resolveInstalledRegions(enabledModuleIds: readonly string[]) {
  return resolveFullRuntimeCatalog(
    installedRegionalModules,
    enabledModuleIds,
    '0.0.0',
  )
}
