import { describe, expect, it } from 'vitest'
import rawCollections from './collections.json'
import { collections, elements, eras, recipes } from '.'
import { challenges } from './challenges'
import { collectionSchema } from './schema'
import { isCollectionComplete, getNewlyCompletedCollectionIds } from '../engine/collectionRules'
import { isEraChallengeComplete } from '../engine/insightRules'
import { validateContent } from '../engine/validateContent'

const landmarks = collections.filter((collection) => collection.landmarkId)
async function fingerprint(value: unknown) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('optional landmark track', () => {
  it('preserves every existing recipe, element, age, collection and challenge definition', async () => {
    expect(await fingerprint(elements.slice(0, 194))).toBe('614fb1e9530e12890529f7535c852bfe7ed6d7f5f9cb8b03ae54952dd71b454d')
    expect(await fingerprint(recipes.slice(0, 232))).toBe('a256d0c092ae8e36a317f69828b9819f628757becca57e073da0880a9de35e71')
    expect(await fingerprint(eras)).toBe('3d526226733e65e43b32c5bea4722fc0ab3629b90a152164b04f59edb4c63884')
    expect(await fingerprint(rawCollections.slice(0, 10))).toBe('89b13151a4b723ed531fbb533b4df300258a2bbe1e9f8bbcce4ea05b17344c5a')
    expect(await fingerprint(challenges.slice(0, 8))).toBe('02150dd7bff0dcb4d96dd7f084d1bcf111d1a30b172157cbf24f25c7dde08aa2')
  })

  it('uses four independent discovery objectives without changing core completion', () => {
    expect(landmarks.map((collection) => collection.landmarkId)).toEqual(['agora', 'library', 'aqueduct', 'mint'])
    const age = eras[4]
    expect(isEraChallengeComplete(age, [...age.landmarkIds, 'observation'], elements)).toBe(true)
    expect(landmarks.every((collection) => !isCollectionComplete(collection, [...age.landmarkIds, 'observation']))).toBe(true)
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
  })

  it.each(landmarks)('requires all $name supporting discoveries and rewards once', (collection) => {
    for (const id of collection.elementIds) {
      expect(isCollectionComplete(collection, collection.elementIds.filter((member) => member !== id))).toBe(false)
    }
    expect(isCollectionComplete(collection, collection.elementIds)).toBe(true)
    expect(getNewlyCompletedCollectionIds(landmarks, collection.elementIds, [])).toEqual([collection.id])
    expect(getNewlyCompletedCollectionIds(landmarks, collection.elementIds, [collection.id])).toEqual([])
  })

  it('keeps the Iron Age aqueduct usable without prematurely completing an Age V objective', () => {
    const earlier = elements.filter((element) => element.era !== 'classical-antiquity').map((element) => element.id)
    expect(earlier).toContain('aqueduct')
    expect(elements.find((element) => element.id === 'aqueduct')?.era).toBe('iron-age')
    expect(getNewlyCompletedCollectionIds(landmarks, earlier, [])).toEqual([])
  })

  it('rejects missing landmark membership and objectives with no discovery from their own era', () => {
    const invalid = { ...landmarks[0], landmarkId: 'library' }
    expect(collectionSchema.safeParse(invalid).success).toBe(false)
    expect(validateContent(elements, recipes, eras, [invalid])).toContain('Collection agora-landmark must include its landmark library.')
    const earlierOnly = { ...landmarks[2], elementIds: ['masonry', 'aqueduct'] }
    expect(validateContent(elements, recipes, eras, [earlierOnly]))
      .toContain('Landmark collection aqueduct-landmark must include a discovery from its own era.')
  })
})
