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

  it('validates the initial ten records and source registry', () => {
    expect(schema.parse(historicalResearch)).toEqual(historicalResearch)
    expect(historicalResearch.records.map((record) => record.elementId))
      .toEqual(priorityIds)
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'verified',
    )).toHaveLength(22)
    expect(historicalResearch.sources.filter(
      (source) => source.verification.status === 'pending',
    )).toHaveLength(1)
  })

  it.each(priorityIds)('links %s research to its current name and stable ID', (elementId) => {
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

  it('keeps gameplay totals, the four ages and fictional Origins unchanged', () => {
    expect(elements).toHaveLength(144)
    expect(recipes).toHaveLength(178)
    expect(eras).toHaveLength(4)
    expect(eras[0].dateRange).toBeUndefined()
    expect(researchByElementId.get('metal')?.approximateDates[0]).toMatchObject({
      dateType: 'undated',
      precision: 'undated',
      regions: [],
      sourceIds: [],
    })
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
