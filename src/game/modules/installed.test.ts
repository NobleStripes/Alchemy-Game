import { describe, expect, it } from 'vitest'
import { installedRegionalModules, resolveInstalledRegions } from './installed.ts'
import { runtimeCatalog } from './runtimeCatalog.ts'
import { pairKey, resolveCombination } from '../engine/resolveCombination.ts'
import { createRecipeIndex } from '../engine/resolveCombination.ts'
import { validateContent } from '../engine/validateContent.ts'
import { createChallengeReducer, createChallengeState } from '../engine/challengeRules.ts'
import { resolveFullRuntimeCatalog } from './fullRegistry.ts'

describe('Achaemenid first-party regional pilot', () => {
  it('retains reviewed publication metadata and bounded source-inspection receipts', () => {
    const resolved = resolveInstalledRegions(['achaemenid'])
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const source = (id: string) => resolved.catalog.sources.find((entry) => entry.id === id)!
    expect(source('whe-persian-governor')).toMatchObject({
      authors: ['Joshua J. Mark'], publicationDate: '2019-11-15',
      verification: { checkedOn: '2026-10-21', accessLevel: 'selected-passages' },
    })
    expect(source('isac-fortification').publicationDate).toBeNull()
    expect(source('isac-fortification').verification).toMatchObject({
      locator: expect.stringContaining('not the full chapter'),
    })
    expect(source('achaemenid-iranica-commerce')).toMatchObject({
      authors: ['Muhammad A. Dandamayev'], publicationDate: '1992-12-15',
      verification: { locator: expect.stringContaining('not direct inspection of Herodotus') },
    })
    expect(source('achaemenid-iranica-fortification')).toMatchObject({
      publicationDate: '2017-06-09',
      authors: expect.arrayContaining(['Matthew W. Stolper', 'Wouter F. M. Henkelman']),
      verification: { locator: expect.stringContaining('not original tablets') },
    })
  })

  it.each(installedRegionalModules[0].research.records)('preserves chronology, citations and symbolic limits for $elementName', (record) => {
    const resolved = resolveInstalledRegions(['achaemenid'])
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    for (const chronology of record.approximateDates) {
      expect(chronology.regions.length).toBeGreaterThan(0)
      expect(chronology.sourceIds.length).toBeGreaterThan(0)
      for (const id of chronology.sourceIds) {
        expect(resolved.catalog.sources.find((source) => source.id === id)?.verification.status).toBe('verified')
      }
    }
    for (const related of record.relatedDiscoveries) {
      expect(resolved.catalog.elementsById.has(related.elementId)).toBe(true)
      if (related.relationship === 'documented') expect(related.sourceIds.length).toBeGreaterThan(0)
    }
    expect(record.agePlacement.status).toBe('regional-gameplay-placement')
    expect(record.gameplaySimplifications.join(' ')).toMatch(/symbolic|conceptual|symbolizes/)
    expect(record.historicalUncertainty.join(' ')).toMatch(/absent|not proof|nonexistence/)
    const recipe = installedRegionalModules[0].recipes.find((entry) => entry.result === record.elementId)!
    expect(resolved.catalog.reviewsByRecipeId.get(recipe.id)?.classification).toBe('symbolic')
  })

  it('separates literary road testimony, excavated context and the limited dated tablet corpus', () => {
    const records = installedRegionalModules[0].research.records
    const road = records.find((entry) => entry.elementId === 'achaemenid-royal-road')!
    expect(road.archaeologicalEvidence.every((entry) => entry.evidenceType === 'textual-evidence')).toBe(true)
    expect(road.archaeologicalEvidence[0].text).toContain('not an excavation report')
    expect(road.approximateDates[0].note).toContain('not a construction date')
    const tablets = records.find((entry) => entry.elementId === 'achaemenid-fortification-tablets')!
    expect(tablets.approximateDates).toEqual([expect.objectContaining({
      dateRange: 'c. 509–493 BCE', dateType: 'dated-evidence',
      sourceIds: ['achaemenid-iranica-fortification'],
    })])
    expect(tablets.historicalOverview.text).toContain('1933')
    expect(tablets.historicalOverview.text).toContain('not the whole empire')
    expect(tablets.manufactureOrUse.text).toContain('perishable records')
    expect(tablets.archaeologicalEvidence.some((entry) => entry.evidenceType === 'excavated-context')).toBe(true)
  })

  it.each([
    ['achaemenid-satrapy', 'provincial-government', 'empire'],
    ['achaemenid-royal-road', 'road-network', 'imperial-bureaucracy'],
    ['achaemenid-fortification-tablets', 'clay-tablet', 'imperial-bureaucracy'],
  ])('preserves the reviewed symbolic formula for %s in either input order', (id, first, second) => {
    const resolved = resolveInstalledRegions(['achaemenid'])
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const catalog = resolved.catalog
    const recipe = catalog.recipes.find((entry) => entry.result === id)!
    expect(recipe.inputs).toEqual([first, second])
    expect(resolveCombination(first, second, catalog.recipeIndex)).toEqual(recipe)
    expect(resolveCombination(second, first, catalog.recipeIndex)).toEqual(recipe)
    expect(catalog.reviewsByRecipeId.get(recipe.id)?.classification).toBe('symbolic')
    expect(catalog.elementsById.get(id)).toMatchObject({ era: 'classical-antiquity', starter: false })
    expect(runtimeCatalog.elementsById.has(id)).toBe(false)
    expect(runtimeCatalog.eras.flatMap((era) => [...era.unlockRequires, ...era.landmarkIds, ...era.grants])).not.toContain(id)
  })

  it('proves unique unordered pairs and campaign reachability without adding ages or requirements', () => {
    const resolved = resolveInstalledRegions(['achaemenid'])
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const catalog = resolved.catalog
    const pairs = catalog.recipes.map((recipe) => pairKey(...recipe.inputs))
    expect(new Set(pairs).size).toBe(pairs.length)
    expect(validateContent([...catalog.elements], [...catalog.recipes], [...catalog.eras], [...catalog.collections])).toEqual([])
    expect(catalog.eras).toEqual(runtimeCatalog.eras)
    expect(resolveInstalledRegions([])).toMatchObject({ ok: true, catalog: { regions: [] } })
    expect(catalog.regions).toEqual([{
      id: 'achaemenid', title: installedRegionalModules[0].manifest.title,
      elementIds: installedRegionalModules[0].elements.map((element) => element.id),
    }])
    expect(catalog.collections.find((collection) => collection.id === 'achaemenid-connections')?.elementIds)
      .toEqual(catalog.regions[0].elementIds)
  })

  it('proves Imperial Communications has an actual shortest solution of exactly one attempt', () => {
    const resolved = resolveInstalledRegions(['achaemenid'])
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const catalog = resolved.catalog
    const challenge = catalog.challengesById.get('achaemenid-courier-lab')!
    expect(challenge.starterIds).not.toContain(challenge.targetId)
    const oneStep = catalog.recipes.filter((recipe) =>
      challenge.allowedResultEraIds.includes(catalog.elementsById.get(recipe.result)!.era) &&
      recipe.inputs.every((id) => challenge.starterIds.includes(id)))
    const solution = oneStep.find((recipe) => recipe.result === challenge.targetId)!
    expect(solution.id).toBe('achaemenid-royal-road-combination')
    const reduce = createChallengeReducer(challenge, catalog)
    let run = createChallengeState(challenge)
    run = reduce(run, { type: 'place', slot: 'first', elementId: solution.inputs[0] })
    run = reduce(run, { type: 'place', slot: 'second', elementId: solution.inputs[1] })
    run = reduce(run, { type: 'combine' })
    expect(run.completed).toBe(true)
    expect(run.attemptCount).toBe(1)
    expect(challenge.minimumAttempts).toBe(run.attemptCount)
  })

  it('preserves the original core-only game', () => {
    const result = resolveInstalledRegions([])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toEqual(runtimeCatalog.elements)
    expect(result.catalog.recipes).toEqual(runtimeCatalog.recipes)
    expect(result.catalog.eras).toEqual(runtimeCatalog.eras)
    expect(result.catalog.collections).toEqual(runtimeCatalog.collections)
    expect(result.catalog.histories).toEqual(runtimeCatalog.histories)
    expect(result.catalog.challenges).toEqual(runtimeCatalog.challenges)
    expect(result.activeModuleIds).toEqual([])
  })

  it('validates all optional discoveries, sources, reviews and challenges together', () => {
    const result = resolveInstalledRegions(['achaemenid'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.elements).toHaveLength(runtimeCatalog.elements.length + 3)
    expect(result.catalog.recipes).toHaveLength(runtimeCatalog.recipes.length + 3)
    expect(result.catalog.challenges).toHaveLength(runtimeCatalog.challenges.length + 1)
    expect(result.catalog.histories).toHaveLength(runtimeCatalog.histories.length + 3)
    for (const element of installedRegionalModules[0].elements) {
      expect(result.catalog.researchByElementId.has(element.id)).toBe(true)
      expect(result.catalog.elementsById.get(element.id)).toEqual(element)
    }
    for (const recipe of installedRegionalModules[0].recipes) {
      expect(result.catalog.reviewsByRecipeId.has(recipe.id)).toBe(true)
      expect(resolveCombination(...recipe.inputs, createRecipeIndex([...result.catalog.recipes]))?.result).toBe(recipe.result)
    }
    expect(result.catalog.challengesById.has('achaemenid-courier-lab')).toBe(true)
  })

  it('does not change existing ages, requirements or original recipe definitions', () => {
    const result = resolveInstalledRegions(['achaemenid'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.catalog.eras).toEqual(runtimeCatalog.eras)
    expect(result.catalog.recipes.slice(0, runtimeCatalog.recipes.length)).toEqual(runtimeCatalog.recipes)
    expect(result.catalog.collections.slice(0, runtimeCatalog.collections.length)).toEqual(runtimeCatalog.collections)
  })

  it('rejects an unavailable historical pack without activating it', () => {
    const result = resolveInstalledRegions(['not-installed'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/not installed/)
  })

  it('rejects an unsatisfied pilot dependency before publishing any active content', () => {
    const pack = structuredClone(installedRegionalModules[0])
    pack.manifest.dependencies = ['missing-region']
    const result = resolveFullRuntimeCatalog([pack], ['achaemenid'], '0.0.0')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.join(' ')).toMatch(/missing module missing-region/)
      expect(result).not.toHaveProperty('catalog')
    }
    expect(runtimeCatalog.elements).toHaveLength(225)
    expect(runtimeCatalog.recipes).toHaveLength(291)
  })
})
