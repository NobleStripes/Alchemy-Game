import { describe, expect, it } from 'vitest'
import { elements, eras, recipes } from './index'
import { historicalChronologySchema, historicalDatabaseSchema, historicalEntrySchema, historicalSourceSchema } from './schema'
import {
  createResearchDatabaseSchema,
  historicalResearch,
  researchByElementId,
} from './research'

const schema = createResearchDatabaseSchema(elements)
const fixture = () => structuredClone(historicalResearch)
const priorityIds = [
  'compass', 'lens', 'nation', 'metal', 'quill',
  'writing', 'road', 'market', 'plow', 'glass',
]
const expansionIds = ['rotary-quern', 'lathe', 'alphabet']
const newDiscoveryIds = ['fossil', 'bird', 'amphora', 'quicklime']
const classicalIds = ['ember', 'tide', 'stone', 'gale']
const antiquityIds = [
  'agora', 'academy', 'lyceum', 'observation',
  'natural-philosophy', 'fossil-collection', 'fossil-inquiry',
]
const classicalExpansionIds = [
  'knowledge', 'natural-inquiry', 'forum', 'senate', 'republic', 'rhetoric',
  'arch', 'stoa', 'amphitheater', 'coinage', 'mint', 'maritime-trade',
  'library', 'geometry', 'bird-inquiry',
]
const reusedTechnologyIds = ['aqueduct', 'scroll', 'coin']
const naturalMaterialIds = ['clay', 'rock', 'sand', 'limestone', 'copper-ore', 'iron-ore']
const intellectualIds = ['mathematical-astronomy', 'clinical-observation', 'logic', 'natural-classification']
const engineeringIds = ['slaked-lime', 'lime-mortar', 'volcanic-ash', 'concrete', 'road-network', 'public-bath']
const commerceIds = ['merchant-network', 'customs-duty']
const scholarshipIds = ['historical-writing', 'cartography', 'commentary']
const regionalIds = ['imperial-bureaucracy', 'provincial-government', 'diplomatic-mission', 'caravan-route', 'cultural-exchange']
const naturalResourceIds = ['salt', 'bone', 'tree', 'timber', 'soil', 'mud', 'sea', 'steam', 'mist', 'cloud', 'rain', 'lightning']
const foundationIds = ['grinding-stone', 'spindle', 'yarn', 'kiln', 'fired-brick', 'tin-ore']
const foundationBacklogIds = ['flour', 'fibre', 'loom', 'textile', 'tin', 'brick']
const craftExpansionIds = [
  'smelting-furnace', 'clay-tablet', 'sealed-tablet', 'weight-standard',
  'axe', 'adze', 'wedge', 'fishhook', 'fishing-weir',
  'iron-chisel', 'gouge', 'wax-tablet', 'pulley', 'water-screw', 'vault',
]
const craftBacklogIds = [
  'copper', 'bronze', 'forge', 'seal', 'scribe', 'archive', 'balance', 'bronze-tool',
  'masonry', 'irrigation', 'bellows', 'bloomery', 'iron', 'iron-tool', 'blacksmith',
]

describe('historical research database', () => {
  it('distinguishes regional ancient intellectual practices from modern scientific methods', () => {
    const astronomy = researchByElementId.get('mathematical-astronomy')!
    expect(astronomy.associatedRegions).toEqual([
      'Babylon and Uruk, Mesopotamia', 'Alexandria, Egypt', 'South Asia',
    ])
    expect(astronomy.manufactureOrUse.text).toContain("predictive success does not establish")
    expect(astronomy.approximateDates.find((date) => date.precision === 'year-resolved')?.note)
      .toContain('not the beginning of Indian astronomy')
    const clinical = researchByElementId.get('clinical-observation')!
    expect(clinical.agePlacement.status).toBe('earlier-precedents')
    expect(clinical.manufactureOrUse.text).toContain('not a controlled trial')
    expect(clinical.manufactureOrUse.text).toContain('no medical advice')
    const logic = researchByElementId.get('logic')!
    expect(logic.associatedRegions).toContain('China')
    expect(logic.manufactureOrUse.text).toContain('does not by itself guarantee true premises')
    expect(logic.historicalOverview.text).toContain('different conceptual setting')
    const classification = researchByElementId.get('natural-classification')!
    expect(classification.historicalOverview.text).toContain('not be read as modern Linnaean ranks')
    expect(classification.manufactureOrUse.text).toContain("not contained in Aristotle's animal groupings")
    expect(classification.relatedDiscoveries.some((link) => link.elementId === 'bird')).toBe(true)
    expect(recipes.find((recipe) => recipe.result === 'fossil-inquiry')?.inputs)
      .toEqual(['fossil', 'observation'])
    expect(elements.some((element) => ['reason', 'argument', 'philosophy', 'ancient-fossil-interpretation'].includes(element.id))).toBe(false)
  })

  it('exposes historical structural schemas from the shared content schema module', () => {
    expect(historicalSourceSchema.parse(historicalResearch.sources[0])).toEqual(historicalResearch.sources[0])
    expect(historicalChronologySchema.parse(historicalResearch.records[0].approximateDates[0]))
      .toEqual(historicalResearch.records[0].approximateDates[0])
    expect(historicalEntrySchema.parse(historicalResearch.records[0])).toEqual(historicalResearch.records[0])
    expect(historicalDatabaseSchema.parse(historicalResearch)).toEqual(historicalResearch)
  })
  it('allows missing chronology and geography without inventing dates or regions', () => {
    const data = fixture()
    const { approximateDates, associatedRegions, ...entry } = data.records[0]
    expect(approximateDates.length).toBeGreaterThan(0)
    expect(associatedRegions.length).toBeGreaterThan(0)
    const result = schema.parse({ ...data, records: [{ ...entry, independentDevelopments: [] }] })
    expect(result.records[0]).toEqual({
      ...entry, independentDevelopments: [], approximateDates: [], associatedRegions: [],
    })
    const missingSource = { ...entry, historicalOverview: { ...entry.historicalOverview, sourceIds: ['missing-source'] } }
    expect(schema.safeParse({ ...data, records: [{ ...missingSource, independentDevelopments: [] }] }).success).toBe(false)
  })

  it.each(['approximateDates', 'associatedRegions'] as const)('rejects invalid optional %s metadata', (field) => {
    const data = fixture()
    expect(schema.safeParse({ ...data, records: [{ ...data.records[0], [field]: null }] }).success).toBe(false)
    expect(schema.safeParse({ ...data, records: [{ ...data.records[0], [field]: [''] }] }).success).toBe(false)
  })

  it('rejects duplicate chronological regions even when all regions are associated', () => {
    const data = fixture()
    const date = data.records[0].approximateDates[1]
    date.regions = [date.regions[0], date.regions[0]]
    const result = schema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ['records', 0, 'approximateDates', 1, 'regions'],
        message: 'Regions must be unique.',
      }))
    }
  })

  it('validates the original records, Iron Age additions, classical starters and source registry', () => {
    expect(schema.parse(historicalResearch)).toEqual(historicalResearch)
    expect(historicalResearch.records.map((record) => record.elementId))
      .toEqual([...priorityIds, ...expansionIds, ...classicalIds, ...newDiscoveryIds, ...antiquityIds, ...classicalExpansionIds, ...reusedTechnologyIds, ...naturalMaterialIds, 'citizenship', ...intellectualIds.slice(0, -1), ...engineeringIds, intellectualIds.at(-1), ...commerceIds, ...scholarshipIds, ...regionalIds, ...naturalResourceIds, ...foundationIds, ...foundationBacklogIds, ...craftExpansionIds, ...craftBacklogIds])
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'verified',
    )).toHaveLength(140)
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'pending',
    )).toHaveLength(1)
  })

  it.each([...priorityIds, ...expansionIds, ...classicalIds, ...newDiscoveryIds, ...antiquityIds, ...classicalExpansionIds, ...reusedTechnologyIds, ...naturalMaterialIds, 'citizenship', ...intellectualIds, ...engineeringIds, ...commerceIds, ...scholarshipIds, ...regionalIds])('links %s research to its current name and stable ID', (elementId) => {
    const record = researchByElementId.get(elementId)
    expect(record?.elementName).toBe(
      elements.find((element) => element.id === elementId)?.name,
    )
    expect(record?.historicalOverview.text).toBeTruthy()
    expect(record?.approximateDates.length).toBeGreaterThan(0)
    expect(record?.associatedRegions.length).toBeGreaterThan(0)
    expect(record?.historicalSignificance.text).toBeTruthy()
    expect(record?.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record?.gameplaySimplifications.length).toBeGreaterThan(0)
  })

  it('distinguishes natural material formation from manufacture without inventing geological dates', () => {
    for (const id of naturalMaterialIds) {
      const record = researchByElementId.get(id)!
      expect(record.approximateDates[0]).toMatchObject({
        dateType: 'undated', precision: 'undated', regions: [],
      })
      expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
      expect(record.manufactureOrUse.sourceIds.length).toBeGreaterThan(0)
    }
    expect(researchByElementId.get('clay')!.historicalOverview.text).toContain('both very fine particles and a family of minerals')
    expect(researchByElementId.get('clay')!.gameplaySimplifications.join(' ')).toContain('wet clay is not fired pottery')
    expect(researchByElementId.get('sand')!.historicalOverview.text).toContain('grain-size class, not a single mineral')
    expect(researchByElementId.get('sand')!.gameplaySimplifications.join(' ')).toContain('Fine dust does not automatically become sand')
    expect(researchByElementId.get('limestone')!.historicalOverview.text).toContain('not all limestone is marine remains')
    expect(researchByElementId.get('limestone')!.manufactureOrUse.text).toContain('calcium oxide and carbon dioxide')
    expect(researchByElementId.get('rock')!.manufactureOrUse.text).toContain('natural volcanic glass')
    expect(elements.some((element) => ['flint', 'obsidian'].includes(element.id))).toBe(false)
    expect(researchByElementId.get('rock')!.agePlacement.status).toBe('fictional-prologue')
    expect(researchByElementId.get('stone')!.agePlacement.status).toBe('historical-model')
    expect(elements.filter((element) => !researchByElementId.has(element.id))).toHaveLength(88)
  })

  it.each(naturalResourceIds)('fully researches existing %s without inventing archaeological evidence or a natural origin date', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.elementName).toBe(elements.find((element) => element.id === id)?.name)
    expect(record.historicalOverview.sourceIds.length).toBeGreaterThan(0)
    expect(record.manufactureOrUse.sourceIds.length).toBeGreaterThan(0)
    expect(record.historicalSignificance.sourceIds.length).toBeGreaterThan(0)
    expect(record.historicalUncertainty.length).toBeGreaterThan(0)
    expect(record.gameplaySimplifications.length).toBeGreaterThan(0)
    expect(record.furtherResearch.length).toBeGreaterThan(0)
    if (id !== 'timber') {
      expect(record.approximateDates[0]).toMatchObject({
        dateType: 'undated', precision: 'undated', regions: [],
      })
    }
    expect(record.agePlacement.status).toBe(
      id === 'timber' ? 'earlier-precedents' : id === 'bone' ? 'regional-gameplay-placement' : 'fictional-prologue',
    )
  })

  it('separates biological resources and worked materials from their much later archaeological survival', () => {
    const bone = researchByElementId.get('bone')!
    expect(bone.historicalOverview.text).toContain('collagen-rich matrix')
    expect(bone.approximateDates[1]).toMatchObject({
      dateType: 'dated-evidence', regions: ['Wyoming, North America'],
    })
    expect(bone.archaeologicalEvidence[1].interpretation).toBe('hypothesis')
    expect(bone.relatedDiscoveries.some((link) => link.elementId === 'fossil')).toBe(true)
    expect(bone.gameplaySimplifications.join(' ')).toContain('not instantaneous mineralization')
    const timber = researchByElementId.get('timber')!
    expect(timber.agePlacement.text).toContain('not the first human use')
    expect(timber.approximateDates[0]).toMatchObject({
      dateRange: '3806 BCE: Sweet Track construction', dateType: 'dated-evidence', precision: 'year-resolved',
    })
    expect(timber.gameplaySimplifications[0]).toContain('not a universal prerequisite')
    expect(researchByElementId.get('salt')!.historicalOverview.text).toContain('not every evaporite mineral')
    expect(researchByElementId.get('salt')!.manufactureOrUse.text).toContain('mining an existing deposit')
    expect(researchByElementId.get('soil')!.historicalOverview.text).toContain('not automatically a mature or fertile soil')
    expect(researchByElementId.get('mud')!.gameplaySimplifications[0]).toContain('omits cooling and sufficient liquid water')
  })

  it('explains the water cycle and atmospheric electricity without turning Rainmaker into literal science', () => {
    expect(researchByElementId.get('tide')!.manufactureOrUse.text).toContain('Solar energy and gravity')
    expect(researchByElementId.get('sea')!.gameplaySimplifications[0]).toContain('not the creation of salinity')
    expect(researchByElementId.get('steam')!.historicalOverview.text).toContain('water vapor itself is invisible')
    expect(researchByElementId.get('steam')!.historicalOverview.text).toContain('does not split H2O')
    expect(researchByElementId.get('mist')!.historicalOverview.text).toContain('inland as well as over seas')
    expect(researchByElementId.get('cloud')!.historicalOverview.text).toContain('not every cloud produces precipitation')
    expect(researchByElementId.get('rain')!.gameplaySimplifications[0]).toContain('Rainmaker remains a puzzle challenge')
    expect(researchByElementId.get('lightning')!.historicalOverview.text).toContain('electrical discharge')
    expect(researchByElementId.get('lightning')!.gameplaySimplifications[0]).toContain('adding flame does not create')
    for (const id of ['steam', 'mist', 'cloud', 'rain', 'lightning']) {
      const record = researchByElementId.get(id)!
      expect(record.approximateDates.every((date) => date.dateType === 'undated')).toBe(true)
      expect(record.archaeologicalEvidence).toEqual([])
      expect(record.associatedRegions).toEqual([])
    }
  })

  it('connects natural materials to optional manufactured and inquiry histories without adding catalog nodes', () => {
    for (const [id, related] of [
      ['clay', ['pottery', 'amphora']],
      ['limestone', ['quicklime', 'lime-mortar', 'concrete', 'fossil']],
      ['fossil', ['fossil-inquiry']],
      ['bird', ['natural-classification']],
    ] as const) {
      const links = researchByElementId.get(id)!.relatedDiscoveries.map((link) => link.elementId)
      expect(links).toEqual(expect.arrayContaining([...related]))
    }
    expect(elements.some((element) => ['wood', 'flint', 'obsidian', 'mortar'].includes(element.id))).toBe(false)
    expect(historicalResearch.records.slice(0, 85)).toHaveLength(85)
    expect(historicalResearch.records.slice(0, 85).reduce((count, record) => count + record.approximateDates.length, 0)).toBe(138)
    const study = historicalResearch.sources.find((source) => source.id === 'plos-la-prele-needles')!
    expect(study.publicationDate).toBe('2024-11-27')
    expect(study.verification).toMatchObject({ status: 'verified', accessLevel: 'selected-passages' })
  })

  it('keeps ore access grants separate from geological formation and reduction separate from melting', () => {
    for (const [id, eraId] of [['copper-ore', 'bronze-age'], ['iron-ore', 'iron-age']]) {
      expect(eras.find((era) => era.id === eraId)!.grants).toContain(id)
      expect(elements.find((element) => element.id === id)!.era).toBe(eraId)
      expect(recipes.some((recipe) => recipe.result === id)).toBe(false)
      const record = researchByElementId.get(id)!
      expect(record.agePlacement.status).toBe('regional-gameplay-placement')
      expect(record.gameplaySimplifications.join(' ')).toContain('age-unlock grant')
      expect(record.manufactureOrUse.text).toMatch(/chemical(?:ly)? reduc/)
    }
    expect(researchByElementId.get('copper-ore')!.historicalUncertainty.join(' ')).toContain('Not all copper ores are green')
    expect(researchByElementId.get('iron-ore')!.historicalUncertainty.join(' ')).toContain('not a universal ancient ore source')
  })

  it('researches every Age V discovery and separates regional developments from global firsts', () => {
    expect(elements.filter((element) => element.era === 'classical-antiquity')
      .every((element) => researchByElementId.has(element.id))).toBe(true)
    const aqueduct = researchByElementId.get('aqueduct')!
    expect(aqueduct.historicalOverview.text).toContain('Assyrian')
    expect(aqueduct.historicalOverview.text).toContain('Persian qanats')
    expect(aqueduct.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('arch')!.historicalOverview.text).toContain('Etruscan')
    const geometry = researchByElementId.get('geometry')!
    expect(geometry.associatedRegions).toEqual(expect.arrayContaining(['South Asia', 'China', 'Alexandria, Egypt']))
    expect(geometry.approximateDates.find((date) => date.precision === 'year-resolved')?.note).toContain('commentary')
    expect(researchByElementId.get('library')!.historicalUncertainty.join(' ')).toContain('single catastrophic fire')
    expect(researchByElementId.get('natural-inquiry')!.agePlacement.text).toContain('fifteenth century CE')
    expect(researchByElementId.get('bird-inquiry')!.historicalOverview.text).toContain('not modern evolutionary biology')
    expect(researchByElementId.get('republic')!.manufactureOrUse.text).toContain('not a modern universal democracy')
  })

  it('includes the Classical Antiquity chapter while preserving the four existing ages', () => {
    expect(elements.slice(0, 194)).toHaveLength(194)
    expect(recipes.slice(0, 232)).toHaveLength(232)
    expect(eras.map((era) => era.id)).toEqual([
      'first-light', 'stone-age', 'bronze-age', 'iron-age', 'classical-antiquity',
    ])
    expect(eras[4]).toMatchObject({
      id: 'classical-antiquity',
      unlockRequires: ['iron', 'iron-tool', 'road', 'market'],
      grants: [],
      landmarkIds: ['agora', 'academy', 'lyceum', 'natural-philosophy', 'fossil-inquiry'],
      discoveryGoal: 6,
    })
    expect(eras[0].dateRange).toBeUndefined()
    expect(researchByElementId.get('metal')?.approximateDates[0]).toMatchObject({
      dateType: 'undated',
      precision: 'undated',
      regions: [],
      sourceIds: [],
    })
  })

  it('distinguishes civic membership, residence and political participation without a universal origin', () => {
    const record = researchByElementId.get('citizenship')!
    expect(record.historicalOverview.text).toContain('not interchangeable systems')
    expect(record.manufactureOrUse.text).toContain('assemblies, councils and juries')
    expect(record.manufactureOrUse.text).toContain('women, enslaved people and foreigners')
    expect(record.manufactureOrUse.text).toContain('Membership, residence and equal political participation are distinct')
    expect(record.archaeologicalEvidence[0]).toMatchObject({
      evidenceType: 'textual-evidence', interpretation: 'attested',
      sourceIds: ['sep-aristotle-politics'],
    })
    expect(record.historicalUncertainty.join(' ')).toContain('not a neutral survey')
    expect(record.approximateDates.every((date) => date.dateType === 'regional-development')).toBe(true)
    expect(record.gameplaySimplifications.join(' ')).toContain('require written law')
    expect(historicalResearch.sources.find((source) => source.id === 'sep-aristotle-politics'))
      .toMatchObject({ authors: ['Fred Miller'], verification: { status: 'verified', accessLevel: 'selected-passages' } })
  })

  it('records the new discoveries without turning symbolic recipes into historical processes', () => {
    const bird = researchByElementId.get('bird')!
    expect(bird.agePlacement.status).toBe('fictional-prologue')
    expect(bird.historicalOverview.text).toContain('theropod')
    expect(bird.historicalOverview.text).toContain('surviving avian dinosaur lineage')
    expect(bird.approximateDates.map((date) => date.dateRange))
      .toEqual(['Beginning around 160 million years ago', '66 million years ago'])
    expect(bird.gameplaySimplifications.join(' ')).toContain('not universal')
    expect(JSON.stringify(bird)).not.toMatch(/Protoceratops|griffin/i)

    const quicklime = researchByElementId.get('quicklime')!
    expect(elements.find((element) => element.id === 'quicklime')?.era).toBe('stone-age')
    expect(quicklime.agePlacement.status).toBe('earlier-precedents')
    expect(quicklime.manufactureOrUse.text).toContain('CaCO₃')
    expect(quicklime.manufactureOrUse.text).toContain('CO₂')
    expect(quicklime.manufactureOrUse.text).toContain('sustained high heat')
    expect(quicklime.gameplaySimplifications.join(' ')).toContain('kiln firing')

    const fossil = researchByElementId.get('fossil')!
    expect(fossil.historicalOverview.text).toContain('long after the organisms lived')
    expect(fossil.approximateDates[0].sourceIds).toContain('nhm-fossil-formation')
    expect(fossil.gameplaySimplifications.join(' ')).toContain('geological time')

    const amphora = researchByElementId.get('amphora')!
    expect(amphora.historicalOverview.text).toContain('long before Classical Antiquity')
    expect(amphora.approximateDates[0].sourceIds).toContain('met-amphora-bronze')
  })

  it('backs each new research entry with verified primary institutional or peer-reviewed references', () => {
    const sourceIds = [
      'nhm-fossils', 'nhm-fossil-formation',
      'nhm-bird-evolution', 'nhm-first-birds', 'nhm-dinosaur-extinction', 'smithsonian-ostrich',
      'aha-amphora-trade', 'met-amphora-bronze', 'met-transport-amphora',
      'friesem-lime-plaster', 'epa-lime-manufacturing',
      'ascsa-agora', 'sep-presocratics', 'sep-aristotle',
      'herodotus-egypt-shells', 'herodotus-winged-serpents',
      'mycenae-fossil-study', 'witton-hing-griffin',
      'whe-greek-archaic', 'whe-hellenistic-period',
    ]
    for (const id of sourceIds) {
      expect(historicalResearch.sources.find((source) => source.id === id)?.verification.status)
        .toBe('verified')
    }
  })

  it.each(classicalIds)('distinguishes documented Greek philosophy from %s gameplay and modern chemistry', (id) => {
    const record = researchByElementId.get(id)!
    expect(record.historicalOverview.text).toContain('Empedocles of Acragas')
    expect(record.historicalOverview.text).toContain('fifth century BCE')
    expect(record.historicalOverview.text).toContain('Aristotle')
    expect(record.historicalOverview.text).toContain('fourth century BCE')
    expect(record.historicalOverview.text).toMatch(/superseded/)
    expect(record.agePlacement).toMatchObject({ status: 'historical-model' })
    expect(record.agePlacement.text).toContain('undated, symbolic gameplay prologue')
    expect(record.historicalSignificance.text).toContain('Chinese wuxing')
    expect(record.approximateDates.map((date) => [date.dateRange, date.dateType, date.precision]))
      .toEqual([
        ['Fifth century BCE', 'regional-development', 'approximate'],
        ['Fourth century BCE', 'regional-development', 'approximate'],
      ])
    expect(record.archaeologicalEvidence.every((evidence) => evidence.evidenceType === 'textual-evidence')).toBe(true)
    expect(record.approximateDates[1].sourceIds).toEqual(['mit-aristotle-elements', 'sep-aristotle'])
    expect(record.independentDevelopments).toEqual([])
    expect(record.gameplaySimplifications.join(' ')).toContain('symbolic')
    expect(record.relatedDiscoveries.filter((link) => classicalIds.includes(link.elementId)))
      .toHaveLength(3)
    expect(record.relatedDiscoveries.filter((link) => !classicalIds.includes(link.elementId)).map((link) => link.elementId))
      .toEqual(id === 'tide' ? ['rain', 'sea'] : [])
    expect(record.historicalOverview.text).toContain('He called them roots: enduring constituents')
    expect(record.manufactureOrUse.text).toContain("Aristotle's four qualities were hot, cold, wet (moist) and dry")
    expect(record.manufactureOrUse.text).toContain('fire is hot/dry, water cold/wet, earth cold/dry and air hot/wet')
    expect(record.manufactureOrUse.text).toContain('not modern scientific measurements')
    expect(record.historicalSignificance.text).toContain('subsequent natural philosophy')
    expect(record.historicalSignificance.text).toContain('later alchemists')
    expect(record.historicalSignificance.sourceIds).toEqual(expect.arrayContaining([
      'sep-philosophy-chemistry', 'whe-alchemy',
    ]))
  })

  it('records passage-specific reception sources without conflating publication and ancient dates', () => {
    expect(historicalResearch.sources.find((source) => source.id === 'sep-philosophy-chemistry'))
      .toMatchObject({
        authors: ['Michael Weisberg', 'Paul Needham', 'Robin Hendry'],
        publicationDate: '2011-03-14',
        verification: { status: 'verified', accessLevel: 'selected-passages' },
      })
    expect(historicalResearch.sources.find((source) => source.id === 'whe-alchemy'))
      .toMatchObject({
        authors: ['Mark Cartwright'], publicationDate: '2023-08-24',
        verification: { status: 'verified', accessLevel: 'selected-passages' },
      })
  })

  it('preserves legacy placement classifications, including symbolic Origins Metal', () => {
    expect(researchByElementId.get('metal')?.agePlacement.status).toBe('fictional-prologue')
    expect(researchByElementId.get('rotary-quern')?.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('compass')?.agePlacement.status).toBe('regional-gameplay-placement')
    expect(historicalResearch.schemaVersion).toBe(2)
  })

  it('allows a cited historical model independently of gameplay age', () => {
    const data = fixture()
    data.records[0].agePlacement.status = 'historical-model'
    expect(historicalEntrySchema.safeParse(data.records[0]).success).toBe(true)
    expect(schema.safeParse(data).success).toBe(true)
  })

  it('requires model citations even without catalog-aware validation', () => {
    const record = structuredClone(researchByElementId.get('ember')!)
    record.agePlacement.sourceIds = []
    expect(historicalEntrySchema.safeParse(record).success).toBe(false)
    expect(schema.safeParse({ ...fixture(), records: [record] }).success).toBe(false)
  })

  it.each(['missing-source', 'bm-scribal-palette'])('rejects %s as support for a historical model', (sourceId) => {
    const record = structuredClone(researchByElementId.get('ember')!)
    record.agePlacement.sourceIds = [sourceId]
    const result = schema.safeParse({ ...fixture(), records: [record] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ['records', 0, 'agePlacement', 'sourceIds', 0],
      }))
    }
  })

  it('records original scholarly authors, primary translation and modern textbook access honestly', () => {
    expect(historicalResearch.sources.find((source) => source.id === 'sep-empedocles'))
      .toMatchObject({ authors: ['K. Scarlett Kingsley', 'Richard Parry'], publicationDate: '2019-09-26' })
    expect(historicalResearch.sources.find((source) => source.id === 'mit-aristotle-elements'))
      .toMatchObject({ sourceType: 'library-collection', publicationDate: null })
    expect(historicalResearch.sources.find((source) => source.id === 'sep-aristotle'))
      .toMatchObject({
        authors: ['Christopher Shields'], publicationDate: '2008-09-25',
        sourceType: 'reference-encyclopedia',
        verification: { status: 'verified', accessLevel: 'selected-passages' },
      })
    for (const id of ['openstax-matter', 'openstax-combustion']) {
      expect(historicalResearch.sources.find((source) => source.id === id))
        .toMatchObject({
          sourceType: 'reference-textbook', publicationDate: '2019-02-14',
          verification: { status: 'verified', accessLevel: 'selected-passages' },
        })
    }
    expect(researchByElementId.get('tide')?.historicalOverview.text).toContain('compound H2O')
    expect(researchByElementId.get('gale')?.historicalOverview.text).toContain('mixture of gases')
    expect(researchByElementId.get('ember')?.historicalOverview.text).toContain('combustion as a chemical reaction')
    expect(researchByElementId.get('stone')?.historicalOverview.text).toContain('not a single modern chemical element')
  })

  it('keeps regional chronology, proposed pivots and abstract-only access explicit', () => {
    for (const id of expansionIds) {
      const record = researchByElementId.get(id)!
      expect(record.archaeologicalEvidence.length).toBeGreaterThan(0)
      expect(record.manufactureOrUse.sourceIds.length).toBeGreaterThan(0)
      expect(record.approximateDates.every((date) => date.precision === 'approximate')).toBe(true)
      expect(record.approximateDates.some((date) => date.dateType === 'widespread-adoption')).toBe(false)
    }
    expect(researchByElementId.get('rotary-quern')?.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('alphabet')?.agePlacement.status).toBe('earlier-precedents')
    expect(researchByElementId.get('lathe')?.archaeologicalEvidence[0].interpretation).toBe('hypothesis')
    expect(historicalResearch.sources.find((source) => source.id === 'sitry-lathe-pivots')?.verification)
      .toMatchObject({ status: 'verified', accessLevel: 'abstract-only' })
    expect(researchByElementId.get('alphabet')?.archaeologicalEvidence[0].text).toContain('plaster cast')
    expect(researchByElementId.get('alphabet')?.archaeologicalEvidence[1].interpretation).toBe('disputed')
    expect(elements.some((element) => element.id === 'lock')).toBe(false)
    expect(researchByElementId.has('lock')).toBe(false)
  })

  it('keeps Classical Antiquity regional, evidence-led and cautious about fossil interpretation', () => {
    for (const id of antiquityIds) {
      const entry = researchByElementId.get(id)!
      expect(entry.agePlacement.status).toBe(
        id === 'fossil-collection' ? 'earlier-precedents' : 'regional-gameplay-placement',
      )
      expect(entry.historicalUncertainty.length).toBeGreaterThan(0)
      expect(entry.gameplaySimplifications.join(' ')).toMatch(/symbolic|symbolically/)
      expect(entry.approximateDates.every((date) => date.dateRange.length > 0)).toBe(true)
    }

    const agora = researchByElementId.get('agora')!
    expect(agora.historicalOverview.text).toContain('Athens')
    expect(agora.historicalOverview.text).toContain('not a template for every Mediterranean settlement')
    expect(agora.approximateDates[0].dateType).toBe('undated')

    const fossilCollection = researchByElementId.get('fossil-collection')!
    expect(fossilCollection.approximateDates[0]).toMatchObject({
      dateRange: 'About 1230–1200 BCE',
      dateType: 'dated-evidence',
      precision: 'approximate',
    })
    expect(fossilCollection.historicalUncertainty.join(' ')).toContain('why')

    const inquiry = researchByElementId.get('fossil-inquiry')!
    expect(inquiry.historicalOverview.text).toContain('reported belief, not fossil identification')
    expect(inquiry.historicalOverview.text).toContain('not established history')
    expect(inquiry.archaeologicalEvidence.some((evidence) =>
      evidence.sourceIds.includes('witton-hing-griffin') && evidence.interpretation === 'hypothesis',
    )).toBe(true)
    expect(historicalResearch.sources.find((source) => source.id === 'witton-hing-griffin')?.verification)
      .toMatchObject({ status: 'verified', accessLevel: 'abstract-only' })
  })

  it('records independent writing traditions without inventing a Mesoamerican date', () => {
    const writing = researchByElementId.get('writing')
    expect(writing?.independentDevelopments.map((entry) => entry.regions)).toEqual([
      ['Southern Mesopotamia (present-day Iraq)'], ['Egypt'], ['China'], ['Mesoamerica'],
    ])
    expect(writing?.approximateDates.some(
      (entry) => entry.regions.includes('Mesoamerica'),
    )).toBe(false)
    expect(writing?.archaeologicalEvidence.some(
      (entry) => entry.interpretation === 'disputed',
    )).toBe(true)
  })

  it('retains disputed optical use, uncertain metallurgy and abstract-only verification', () => {
    expect(researchByElementId.get('lens')?.archaeologicalEvidence.some(
      (entry) => entry.interpretation === 'disputed',
    )).toBe(true)
    expect(researchByElementId.get('metal')?.archaeologicalEvidence.some(
      (entry) => entry.interpretation === 'hypothesis',
    )).toBe(true)
    expect(historicalResearch.sources.find(
      (source) => source.id === 'sion-ploughing',
    )?.verification).toMatchObject({
      status: 'verified',
      accessLevel: 'abstract-only',
    })
  })

  it('allows a pending source only as a further-research lead', () => {
    expect(researchByElementId.get('quill')?.furtherResearch[0].sourceIds)
      .toEqual(['bm-scribal-palette'])
    const data = fixture()
    data.records[0].historicalOverview.sourceIds = ['bm-scribal-palette']
    expect(schema.safeParse(data)).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({
        path: ['records', 0, 'historicalOverview', 'sourceIds', 0],
        message: 'Unverified source cannot support a claim: bm-scribal-palette.',
      })] },
    })
  })

  it.each([
    'historicalOverview', 'historicalSignificance',
  ] as const)('rejects unknown sources in %s', (field) => {
    const data = fixture()
    data.records[0][field].sourceIds = ['missing-source']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it.each([
    'approximateDates', 'archaeologicalEvidence', 'independentDevelopments',
  ] as const)('rejects pending sources in %s claims', (field) => {
    const data = fixture()
    const writingIndex = data.records.findIndex((record) => record.elementId === 'writing')
    data.records[writingIndex][field][0].sourceIds = ['bm-scribal-palette']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects dangling further-research references', () => {
    const data = fixture()
    data.records[0].furtherResearch[0].sourceIds = ['missing-source']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects duplicate records and duplicate source IDs', () => {
    const data = fixture()
    data.records.push(structuredClone(data.records[0]))
    data.sources.push(structuredClone(data.sources[0]))
    const result = schema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'Duplicate research record: compass.',
          `Duplicate research source: ${data.sources[0].id}.`,
        ]),
      )
    }
  })

  it('rejects unknown elements and obsolete display names', () => {
    const data = fixture()
    data.records[0].elementName = 'Compass'
    data.records[1].elementId = 'missing-element'
    expect(schema.safeParse(data).success).toBe(false)
  })

  it.each(['', '   '])('rejects blank required research text (%j)', (blank) => {
    const data = fixture()
    data.records[0].historicalOverview.text = blank
    data.records[0].historicalUncertainty = [blank]
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects missing research fields instead of supplying defaults', () => {
    const data = fixture()
    expect(schema.safeParse({
      ...data,
      records: [{ ...data.records[0], archaeologicalEvidence: undefined }],
    }).success).toBe(false)
  })

  it('rejects empty or duplicate claim references', () => {
    const data = fixture()
    data.records[0].historicalOverview.sourceIds = []
    data.records[0].historicalSignificance.sourceIds = ['rmg-compass', 'rmg-compass']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('requires bibliographic metadata and a verification locator', () => {
    const data = fixture()
    const verification = data.sources[0].verification
    expect(schema.safeParse({
      ...data,
      sources: [{
        ...data.sources[0],
        title: '',
        institution: '',
        verification: { ...verification, locator: undefined },
      }],
    }).success).toBe(false)
  })

  it('does not accept a pending verification as verified without its receipt', () => {
    const data = fixture()
    const pending = data.sources.find((source) => source.id === 'bm-scribal-palette')
    expect(schema.safeParse({
      ...data,
      sources: [{ ...pending, verification: { status: 'verified' } }],
    }).success).toBe(false)
  })

  it.each(['javascript:alert(1)', 'file:///private/source', 'not-a-url'])(
    'rejects non-web source URLs (%s)',
    (url) => {
      const data = fixture()
      data.sources[0].url = url
      expect(schema.safeParse(data).success).toBe(false)
    },
  )

  it('rejects malformed publication and verification dates', () => {
    const data = fixture()
    data.sources[0].publicationDate = '2026-02-31'
    expect(schema.safeParse(data).success).toBe(false)
    expect(schema.safeParse({
      ...fixture(),
      sources: [{
        ...data.sources[0],
        publicationDate: null,
        verification: { ...data.sources[0].verification, checkedOn: 'unknown' },
      }],
    }).success).toBe(false)
  })

  it('requires sources and regions for dated evidence', () => {
    const data = fixture()
    data.records[0].approximateDates[1].sourceIds = []
    data.records[0].approximateDates[1].regions = []
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects dated claims with undated precision and undated claims with precision', () => {
    const data = fixture()
    data.records[0].approximateDates[0].precision = 'approximate'
    data.records[0].approximateDates[1].precision = 'undated'
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('keeps exact construction years separate from invention or adoption dates', () => {
    const data = fixture()
    const road = data.records.find((record) => record.elementId === 'road')
    expect(road?.approximateDates.every(
      (entry) => entry.precision === 'year-resolved' && entry.dateType === 'dated-evidence',
    )).toBe(true)
    data.records[0].approximateDates[1].precision = 'year-resolved'
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects unlisted chronology and independent-development regions', () => {
    const data = fixture()
    data.records[0].approximateDates[1].regions = ['Unlisted region']
    const writing = data.records.find((record) => record.elementId === 'writing')
    if (!writing) throw new Error('Writing research fixture is missing.')
    writing.independentDevelopments[0].regions = ['Another unlisted region']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects unknown fields and unsupported schema versions', () => {
    expect(schema.safeParse({
      ...fixture(), schemaVersion: 3,
    }).success).toBe(false)
    expect(schema.safeParse({
      ...fixture(), accidentallyRenamedRecords: [],
    }).success).toBe(false)
  })

  it.each(['manufactureOrUse', 'agePlacement', 'relatedDiscoveries'] as const)('requires the Atlas %s field', (field) => {
    const data = fixture()
    const { [field]: omitted, ...incomplete } = data.records[0]
    expect(omitted).toBeDefined()
    expect(schema.safeParse({ ...data, records: [incomplete] }).success).toBe(false)
  })

  it.each(['manufactureOrUse', 'agePlacement'] as const)('rejects unverified Atlas claims in %s', (field) => {
    const data = fixture()
    data.records[0][field].sourceIds = ['bm-scribal-palette']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it.each(['missing-element', 'compass'])('rejects invalid related target %s', (elementId) => {
    const data = fixture()
    data.records[0].relatedDiscoveries[0].elementId = elementId
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects duplicate related targets and unsupported documented relationships', () => {
    const data = fixture()
    const link = data.records[0].relatedDiscoveries[0]
    data.records[0].relatedDiscoveries.push(structuredClone(link))
    expect(schema.safeParse(data).success).toBe(false)
    data.records[0].relatedDiscoveries.pop()
    link.relationship = 'documented'
    expect(schema.safeParse(data).success).toBe(false)
    link.sourceIds = ['bm-scribal-palette']
    expect(schema.safeParse(data).success).toBe(false)
    link.sourceIds = ['missing-source']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('requires historical placement citations and reserves the fictional prologue for Origins', () => {
    const data = fixture()
    data.records[0].agePlacement.sourceIds = []
    expect(schema.safeParse(data).success).toBe(false)
    data.records[0].agePlacement.status = 'fictional-prologue'
    expect(schema.safeParse(data).success).toBe(false)
  })
})
