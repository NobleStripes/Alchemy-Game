import { bench, describe } from 'vitest'
import { collections, elements, eras, recipes } from '.'
import { getTemporarilyExhaustedElements } from '../engine/elementStatus'
import { selectHintRecipe } from '../engine/hintRules'
import { createRecipeIndex, resolveCombination } from '../engine/resolveCombination'
import { validateContent } from '../engine/validateContent'
import { installedRegionalModules, resolveInstalledRegions } from '../modules/installed'
import { installedModuleOwnership } from '../modules/ownership'
import { createModuleSaveEnvelope, projectModuleProgress } from '../state/moduleProgress'
import { previewModuleChange } from '../state/saveManagement'
import { freshProgress } from '../state/persistence'

const options = { time: 200, warmupTime: 100, iterations: 50 }

for (const [name, elementCount, recipeCount] of [
  ['215 elements / 270 recipes', 215, 270],
  ['225 elements / 291 recipes', 225, 291],
] as const) {
  const catalog = elements.slice(0, elementCount)
  const graph = recipes.slice(0, recipeCount)
  const index = createRecipeIndex(graph)
  const discoveredIds = catalog.map((element) => element.id)
  const performedIds = graph.slice(0, Math.floor(graph.length / 2)).map((recipe) => recipe.id)
  const discovered = new Set(discoveredIds)
  const performed = new Set(performedIds)
  const unlocked = new Set(eras.map((era) => era.id))
  const elementEras = new Map(catalog.map((element) => [element.id, element.era]))

  describe(name, () => {
    bench('build pair index', () => { createRecipeIndex(graph) }, options)
    bench('resolve one existing pair', () => { resolveCombination('stone-tool', 'tree', index) }, options)
    bench('validate gated reachability', () => { validateContent(catalog, graph, eras, collections) }, options)
    bench('compute Hide Mastered status', () => {
      getTemporarilyExhaustedElements(graph, discovered, performed, unlocked, elementEras)
    }, options)
    bench('select contextual hint', () => {
      selectHintRecipe(graph, discoveredIds, performedIds, [], catalog, 'classical-antiquity')
    }, options)
  })
}

const pilot = installedRegionalModules[0]
const complete = createModuleSaveEnvelope({
  ...freshProgress(),
  discoveredIds: [...elements, ...pilot.elements].map((element) => element.id),
  discoveredRecipeIds: [...recipes, ...pilot.recipes].map((recipe) => recipe.id),
  unlockedEraIds: eras.map((era) => era.id),
  activeEraId: 'classical-antiquity',
  rewardedChallengeEraIds: eras.map((era) => era.id),
  rewardedCollectionIds: [...collections, ...pilot.collections].map((collection) => collection.id),
}, installedModuleOwnership, ['achaemenid'])
const dormant = { ...complete, enabledModuleIds: [] }
const activeRaw = JSON.stringify(complete)
const dormantRaw = JSON.stringify(dormant)
const dormantProgress = projectModuleProgress(dormant, []).progress

describe('regional activation / complete archive', () => {
  bench('resolve core-only catalog', () => { resolveInstalledRegions([]) }, options)
  bench('resolve enabled pilot catalog', () => { resolveInstalledRegions(['achaemenid']) }, options)
  bench('validate disable preview', () => {
    previewModuleChange(activeRaw, complete.progress, ['achaemenid'], [])
  }, options)
  bench('validate reactivation preview', () => {
    previewModuleChange(dormantRaw, dormantProgress, [], ['achaemenid'])
  }, options)
})
