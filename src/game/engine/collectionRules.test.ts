import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '../content'
import { collectionSchema } from '../content/schema'
import { getNewlyCompletedCollectionIds, isCollectionComplete } from './collectionRules'
import { awardInsight } from './insightRules'
import { validateContent } from './validateContent'

describe('collection completion', () => {
  it.each(collections)('requires every member of $name', (collection) => {
    expect(isCollectionComplete(collection, [])).toBe(false)
    expect(isCollectionComplete(collection, collection.elementIds.slice(1))).toBe(false)
    expect(isCollectionComplete(collection, [...collection.elementIds, 'ember'])).toBe(true)
  })

  it('does not count repeated or unrelated discoveries as progress', () => {
    expect(isCollectionComplete(collections[0], ['mist', 'mist', 'ember'])).toBe(false)
    expect(isCollectionComplete({ elementIds: [] }, ['ember'])).toBe(false)
  })

  it('returns only complete, unrewarded collections in authored order', () => {
    const discovered = collections.flatMap((collection) => collection.elementIds)
    expect(getNewlyCompletedCollectionIds(collections, [], [])).toEqual([])
    expect(getNewlyCompletedCollectionIds(collections, discovered, ['stormwatch'])).toEqual([
      'harvest-table', 'ironworkers',
    ])
    expect(getNewlyCompletedCollectionIds(collections, discovered, collections.map((collection) => collection.id))).toEqual([])
  })

  it('supports minimal generic definitions without mutating caller arrays', () => {
    const definitions = [{ id: 'test', elementIds: ['mist'], custom: true }]
    const discovered = ['mist']
    const rewarded: string[] = []
    expect(getNewlyCompletedCollectionIds([...definitions, ...definitions], discovered, rewarded)).toEqual(['test'])
    expect(definitions).toEqual([{ id: 'test', elementIds: ['mist'], custom: true }])
    expect(discovered).toEqual(['mist'])
    expect(rewarded).toEqual([])
  })

  it('consumes eligibility once even when the Insight wallet is capped', () => {
    const discovered = collections.flatMap((collection) => collection.elementIds)
    const newlyCompleted = getNewlyCompletedCollectionIds(collections, discovered, [])
    const wallet = newlyCompleted.reduce((state) => awardInsight(state), { credits: 2, failureProgress: 0 })
    expect(wallet.credits).toBe(3)
    expect(newlyCompleted).toHaveLength(3)
    expect(getNewlyCompletedCollectionIds(collections, discovered, newlyCompleted)).toEqual([])
  })
})

describe('collection contracts', () => {
  it('validates the complete authored graph including collections', () => {
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
  })

  it.each([
    ['id', 'Invalid Id'],
    ['name', ''],
    ['era', ''],
    ['elementIds', []],
    ['elementIds', ['mist', 'mist']],
    ['elementIds', ['']],
  ])('rejects malformed schema field %s: %j', (field, value) => {
    expect(collectionSchema.safeParse({ ...collections[0], [field]: value }).success).toBe(false)
  })

  it('rejects duplicate collection IDs', () => {
    expect(validateContent(elements, recipes, eras, [...collections, collections[0]])).toContain(
      'Duplicate collection id stormwatch.',
    )
  })

  it('rejects missing eras and elements, empty membership, and duplicate members', () => {
    const invalid = [
      { id: 'missing', name: 'Missing', era: 'unknown', elementIds: ['unknown', 'unknown'] },
      { id: 'empty', name: 'Empty', era: 'iron-age', elementIds: [] },
    ]
    expect(validateContent(elements, recipes, eras, invalid)).toEqual(expect.arrayContaining([
      'Collection missing references missing era unknown.',
      'Collection missing references missing element unknown.',
      'Collection missing repeats member unknown.',
      'Collection empty must have at least one member.',
    ]))
  })
})