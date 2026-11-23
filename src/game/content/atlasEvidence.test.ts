import { describe, expect, it } from 'vitest'
import { atlasDescriptionCorrections } from './elementBaseline'
import { elements } from './index'
import { historicalResearch, researchByElementId } from './research'

const examples = [
  ['papyrus', 'earliest surviving written papyri'],
  ['pigment', 'no painted surface'],
  ['cave-painting', 'minimum age'],
  ['granary', 'predates domesticated cereals'],
  ['house', 'not successive inventions'],
  ['sickle', 'not earlier iron sickles'],
  ['basket', 'not the first basket'],
  ['ink', 'Roman-period measurements'],
  ['anchor', 'evidence of immersion'],
  ['harbor', 'findspot is not the route described'],
  ['canal', 'older dissolved carbon'],
  ['cart', 'do not show who copied whom'],
  ['law', 'need not be written'],
  ['map', 'do not show a charcoal drawing stage'],
  ['chariot', 'Wheel count alone is not decisive'],
] as const

describe('historical Atlas evidence batch', () => {
  it.each(examples)('preserves the evidence distinction for %s', (id, distinction) => {
    const record = researchByElementId.get(id)
    expect(record).toBeDefined()
    expect(record!.approximateDates.length).toBeGreaterThan(0)
    expect(record!.archaeologicalEvidence.length).toBeGreaterThan(0)
    expect(record!.independentDevelopments).toEqual([])
    expect(JSON.stringify(record)).toContain(distinction)
  })

  it('appends exactly the requested histories and applies only the approved short-description exceptions', () => {
    expect(historicalResearch.records.slice(167).map((record) => record.elementId).sort())
      .toEqual(examples.map(([id]) => id).sort())
    expect(Object.fromEntries(elements
      .filter(({ id }) => Object.hasOwn(atlasDescriptionCorrections, id))
      .map(({ id, description }) => [id, description])))
      .toEqual(Object.fromEntries(Object.entries(atlasDescriptionCorrections).map(([id, [, description]]) => [id, description])))
  })

  it('keeps papyrus, ink and rock-art dates attached to different evidence', () => {
    expect(researchByElementId.get('papyrus')!.approximateDates.map(({ dateRange }) => dateRange))
      .toEqual([expect.stringContaining('blank Hemaka roll'), expect.stringContaining('written Wadi el-Jarf papyri')])
    expect(researchByElementId.get('ink')!.approximateDates.map(({ sourceIds }) => sourceIds))
      .toEqual([['met-scribe-palette'], ['tebtunis-ink-analysis']])
    expect(researchByElementId.get('cave-painting')!.approximateDates.map(({ dateRange }) => dateRange))
      .toEqual([expect.stringContaining('At least 39,900'), expect.stringContaining('At least 35,400'), expect.stringContaining('At least 51,200')])
  })
})
