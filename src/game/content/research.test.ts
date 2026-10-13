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
const classicalIds = ['ember', 'tide', 'stone', 'gale']

describe('historical research database', () => {
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
      .toEqual([...priorityIds, ...expansionIds, ...classicalIds])
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'verified',
    )).toHaveLength(34)
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'pending',
    )).toHaveLength(1)
  })

  it.each([...priorityIds, ...expansionIds, ...classicalIds])('links %s research to its current name and stable ID', (elementId) => {
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

  it('includes the additive batch while keeping four ages and undated gameplay Origins', () => {
    expect(elements).toHaveLength(147)
    expect(recipes).toHaveLength(183)
    expect(eras).toHaveLength(4)
    expect(eras[0].dateRange).toBeUndefined()
    expect(researchByElementId.get('metal')?.approximateDates[0]).toMatchObject({
      dateType: 'undated',
      precision: 'undated',
      regions: [],
      sourceIds: [],
    })
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
    expect(record.relatedDiscoveries.every((link) => classicalIds.includes(link.elementId))).toBe(true)
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
