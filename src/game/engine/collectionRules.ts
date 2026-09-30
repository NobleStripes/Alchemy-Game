import type { CollectionDefinition } from '../domain/types'

export function isCollectionComplete(
  collection: Pick<CollectionDefinition, 'elementIds'>,
  discoveredIds: readonly string[],
): boolean {
  const discovered = new Set(discoveredIds)
  return collection.elementIds.length > 0 &&
    collection.elementIds.every((elementId) => discovered.has(elementId))
}

export function getNewlyCompletedCollectionIds<
  Collection extends Pick<CollectionDefinition, 'id' | 'elementIds'>,
>(
  collections: readonly Collection[],
  discoveredIds: readonly string[],
  rewardedIds: readonly string[],
): string[] {
  const rewarded = new Set(rewardedIds)
  return collections.filter((collection) => {
    if (rewarded.has(collection.id) || !isCollectionComplete(collection, discoveredIds)) {
      return false
    }
    rewarded.add(collection.id)
    return true
  }).map((collection) => collection.id)
}