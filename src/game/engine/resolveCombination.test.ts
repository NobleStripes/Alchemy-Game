import { describe, expect, it } from 'vitest'
import { elements, eras, recipes } from '../content'
import {
  createRecipeIndex,
  resolveCombination,
} from './resolveCombination'
import { validateContent } from './validateContent'
import { isElementUnstudied } from './isElementUnstudied'
import {
  areGlobalHintsUnlocked,
  areHintsUnlocked,
  selectHintRecipe,
} from './hintRules'
import { reconcileEraProgress } from './eraProgress'

const recipeIndex = createRecipeIndex(recipes)

describe('resolveCombination', () => {
  it('resolves recipes regardless of input order', () => {
    expect(resolveCombination('ember', 'tide', recipeIndex)?.result).toBe(
      'steam',
    )
    expect(resolveCombination('tide', 'ember', recipeIndex)?.result).toBe(
      'steam',
    )
  })

  it('resolves same-element recipes', () => {
    expect(resolveCombination('ember', 'ember', recipeIndex)?.result).toBe(
      'heat',
    )
    expect(resolveCombination('tide', 'tide', recipeIndex)?.result).toBe('sea')
    expect(resolveCombination('stone', 'stone', recipeIndex)?.result).toBe(
      'land',
    )
    expect(resolveCombination('gale', 'gale', recipeIndex)?.result).toBe('wind')
  })

  it('returns null for an unknown pair', () => {
    expect(resolveCombination('heat', 'heat', recipeIndex)).toBeNull()
  })

  it('supports alternate routes to one discovery', () => {
    expect(resolveCombination('dust', 'tide', recipeIndex)?.result).toBe('soil')
    expect(resolveCombination('dust', 'steam', recipeIndex)?.result).toBe('mud')
    expect(resolveCombination('land', 'tide', recipeIndex)?.result).toBe('soil')
  })
})

describe('first-era content', () => {
  it('has no conflicting, dangling, or unreachable content', () => {
    expect(validateContent(elements, recipes, eras)).toEqual([])
  })

  it('reaches life through the authored progression chain', () => {
    expect(resolveCombination('stone', 'sea', recipeIndex)?.result).toBe(
      'primordial-soup',
    )
    expect(
      resolveCombination('primordial-soup', 'heat', recipeIndex)?.result,
    ).toBe('life')
    expect(resolveCombination('life', 'stone', recipeIndex)?.result).toBe(
      'plant',
    )
  })

  it('builds a civilization from repeated bricks', () => {
    expect(resolveCombination('brick', 'brick', recipeIndex)?.result).toBe(
      'wall',
    )
    expect(resolveCombination('wall', 'wall', recipeIndex)?.result).toBe(
      'house',
    )
    expect(resolveCombination('house', 'house', recipeIndex)?.result).toBe(
      'village',
    )
    expect(resolveCombination('house', 'field', recipeIndex)?.result).toBe(
      'village',
    )
    expect(resolveCombination('city', 'map', recipeIndex)?.result).toBe(
      'nation',
    )
  })

  it('offers alternate life routes and reaches the Map capstone', () => {
    expect(resolveCombination('sea', 'heat', recipeIndex)?.result).toBe(
      'primordial-soup',
    )
    expect(resolveCombination('ash', 'soil', recipeIndex)?.result).toBe(
      'bloom',
    )
    expect(resolveCombination('bloom', 'wind', recipeIndex)?.result).toBe(
      'seed',
    )
    expect(resolveCombination('reed', 'tool', recipeIndex)?.result).toBe(
      'papyrus',
    )
    expect(resolveCombination('papyrus', 'charcoal', recipeIndex)?.result).toBe(
      'map',
    )
  })

  it('opens weather, material, and agriculture branches', () => {
    expect(resolveCombination('sea', 'gale', recipeIndex)?.result).toBe('mist')
    expect(resolveCombination('mist', 'gale', recipeIndex)?.result).toBe(
      'cloud',
    )
    expect(resolveCombination('cloud', 'tide', recipeIndex)?.result).toBe(
      'rain',
    )
    expect(resolveCombination('dust', 'sea', recipeIndex)?.result).toBe('sand')
    expect(resolveCombination('sand', 'heat', recipeIndex)?.result).toBe(
      'glass',
    )
    expect(resolveCombination('stone-tool', 'land', recipeIndex)?.result).toBe(
      'field',
    )
    expect(resolveCombination('field', 'seed', recipeIndex)?.result).toBe(
      'crop',
    )
    expect(resolveCombination('crop', 'tool', recipeIndex)?.result).toBe(
      'flour',
    )
    expect(resolveCombination('flour', 'tide', recipeIndex)?.result).toBe(
      'dough',
    )
    expect(resolveCombination('dough', 'heat', recipeIndex)?.result).toBe(
      'bread',
    )
    expect(
      recipes.filter((recipe) => recipe.result === 'bread').map((recipe) => recipe.id),
    ).toEqual(['baked-dough'])
    expect(resolveCombination('spear', 'animal', recipeIndex)?.result).toBe(
      'hunt',
    )
    expect(resolveCombination('shelter', 'hearth', recipeIndex)?.result).toBe(
      'home',
    )
    expect(resolveCombination('basket', 'crop', recipeIndex)?.result).toBe(
      'storage',
    )
    expect(resolveCombination('pottery', 'food', recipeIndex)?.result).toBe(
      'meal',
    )
    expect(resolveCombination('art', 'rock', recipeIndex)?.result).toBe(
      'cave-painting',
    )
  })
})

describe('journal guidance', () => {
  it('marks only elements with undiscovered outgoing uses as unstudied', () => {
    expect(isElementUnstudied('ember', recipes, [])).toBe(true)
    expect(
      isElementUnstudied('ember', recipes, ['concentrated-flame']),
    ).toBe(false)
    expect(isElementUnstudied('bread', recipes, [])).toBe(false)
  })

  it('locks hints until the challenge or three failures', () => {
    expect(areHintsUnlocked(['ember', 'tide'], [], 12, ['beacon'])).toBe(false)
    expect(
      areHintsUnlocked(
        ['ember', 'tide'],
        ['a::b', 'a::c', 'a::d'],
        12,
        ['beacon'],
      ),
    ).toBe(true)
    expect(
      areHintsUnlocked(
        ['beacon', ...Array.from({ length: 11 }, (_, index) => `e${index}`)],
        [],
        12,
        ['beacon'],
      ),
    ).toBe(true)
  })

  it('prefers mixed unknown-result hints over obvious self-pairs', () => {
    expect(
      selectHintRecipe(
        recipes,
        ['ember', 'tide', 'stone', 'gale'],
        [],
        [],
      )?.id,
    ).toBe('first-vapor')
  })

  it('does not count Stone Age grants toward Origins hint access', () => {
    const origins = eras[0]
    const remainingOrigins = elements
      .filter(
        (element) =>
          element.era === origins.id &&
          !origins.landmarkIds.includes(element.id),
      )
      .slice(0, 17 - origins.landmarkIds.length)
      .map((element) => element.id)
    const withLandmarksAndHuman = [
      ...origins.landmarkIds,
      ...remainingOrigins,
      'human',
    ]

    expect(
      areGlobalHintsUnlocked(
        withLandmarksAndHuman,
        [],
        elements,
        origins,
      ),
    ).toBe(false)
  })
})

describe('era progression', () => {
  it('unlocks Stone Age and grants Human when Origins landmarks are known', () => {
    const progress = reconcileEraProgress(
      ['life', 'land', 'tree', 'rock', 'animal'],
      ['first-light'],
      elements,
      eras,
    )

    expect(progress.unlockedEraIds).toEqual(['first-light', 'stone-age'])
    expect(progress.discoveredIds).toContain('human')
  })

  it('retroactively unlocks an era represented in an older save', () => {
    const progress = reconcileEraProgress(
      ['ember', 'brick'],
      ['first-light'],
      elements,
      eras,
    )

    expect(progress.unlockedEraIds).toContain('stone-age')
    expect(progress.discoveredIds).toContain('human')
  })

  it('rejects circular era gates even when the gated era grants an input', () => {
    const circularEras = eras.map((era) =>
      era.id === 'stone-age'
        ? { ...era, unlockRequires: ['human'] }
        : era,
    )

    expect(validateContent(elements, recipes, circularEras)).toContain(
      'Era stone-age is unreachable from prior era content.',
    )
  })
})