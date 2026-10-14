import { describe, expect, it } from 'vitest'
import { collections, elements, elementsById, eras, recipes } from '../content'
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
import {
  awardInsight,
  isEraChallengeComplete,
  recordUniqueFailure,
  resetInsightProgress,
} from './insightRules'

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
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
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
        elements,
        'first-light',
      )?.id,
    ).toBe('first-vapor')
  })

  it('prefers unknown results from the active age', () => {
    const discoveredIds = [
      'ember',
      'tide',
      'stone',
      'gale',
      'human',
      'rock',
    ]

    expect(
      elementsById.get(
        selectHintRecipe(
          recipes,
          discoveredIds,
          [],
          [],
          elements,
          'stone-age',
        )?.result ?? '',
      )?.era,
    ).toBe('stone-age')
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

  it('unlocks Bronze Age and grants Copper Ore from Stone Age landmarks', () => {
    const progress = reconcileEraProgress(
      ['village', 'pottery', 'metal', 'quarry'],
      ['first-light', 'stone-age'],
      elements,
      eras,
    )

    expect(progress.unlockedEraIds).toEqual([
      'first-light',
      'stone-age',
      'bronze-age',
    ])
    expect(progress.discoveredIds).toContain('copper-ore')
  })

  it('retroactively unlocks Bronze Age for moved legacy discoveries', () => {
    const progress = reconcileEraProgress(
      ['ember', 'tool'],
      ['first-light', 'stone-age'],
      elements,
      eras,
    )

    expect(progress.unlockedEraIds).toContain('bronze-age')
    expect(progress.discoveredIds).toContain('copper-ore')
  })

  it('rejects a Bronze gate that depends on its own grant', () => {
    const circularEras = eras.map((era) =>
      era.id === 'bronze-age'
        ? { ...era, unlockRequires: ['copper-ore'] }
        : era,
    )

    expect(validateContent(elements, recipes, circularEras)).toContain(
      'Era bronze-age is unreachable from prior era content.',
    )
  })
})

describe('Bronze Age content', () => {
  it('connects metallurgy, transport, writing, and the first city', () => {
    expect(resolveCombination('copper-ore', 'ember', recipeIndex)?.result).toBe(
      'copper',
    )
    expect(resolveCombination('quarry', 'tide', recipeIndex)?.result).toBe(
      'tin',
    )
    expect(resolveCombination('copper', 'tin', recipeIndex)?.result).toBe(
      'bronze',
    )
    expect(resolveCombination('bronze', 'stone-tool', recipeIndex)?.result).toBe(
      'bronze-tool',
    )
    expect(resolveCombination('rock', 'tool', recipeIndex)?.result).toBe(
      'wheel',
    )
    expect(resolveCombination('cart', 'village', recipeIndex)?.result).toBe(
      'trade',
    )
    expect(resolveCombination('papyrus', 'pigment', recipeIndex)?.result).toBe(
      'writing',
    )
    expect(resolveCombination('writing', 'human', recipeIndex)?.result).toBe(
      'scribe',
    )
    expect(resolveCombination('town', 'brick', recipeIndex)?.result).toBe(
      'city',
    )
  })

  it.each([
    ['hearth', 'bronze-tool', 'forge'],
    ['forge', 'bronze', 'anvil'],
    ['anvil', 'clay', 'mold'],
    ['mold', 'bronze', 'sword'],
    ['bronze-tool', 'field', 'plow'],
    ['animal', 'cart', 'chariot'],
    ['field', 'plow', 'crop'],
    ['forge', 'clay', 'mold'],
    ['anvil', 'bronze-tool', 'sword'],
    ['forge', 'metal', 'tool'],
  ])('resolves metalwork recipe %s + %s -> %s', (first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)?.result).toBe(result)
    expect(resolveCombination(second, first, recipeIndex)?.result).toBe(result)
  })

  it.each([
    ['pigment', 'charcoal', 'ink'],
    ['animal', 'scribe', 'quill'],
    ['papyrus', 'cordage', 'scroll'],
    ['bronze', 'clay', 'seal'],
    ['ink', 'quill', 'writing'],
    ['scroll', 'scribe', 'archive'],
    ['scroll', 'scroll', 'archive'],
    ['town', 'writing', 'archive'],
    ['seal', 'writing', 'law'],
    ['city', 'law', 'nation'],
    ['law', 'map', 'nation'],
  ])('resolves records recipe %s + %s -> %s', (first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)?.result).toBe(result)
    expect(resolveCombination(second, first, recipeIndex)?.result).toBe(result)
  })

  it.each([
    ['cordage', 'tree', 'boat'],
    ['fibre', 'hide', 'sail'],
    ['boat', 'metal', 'anchor'],
    ['sea', 'village', 'harbor'],
    ['human', 'trade', 'merchant'],
    ['map', 'merchant', 'voyage'],
    ['boat', 'sail', 'voyage'],
    ['boat', 'compass', 'voyage'],
    ['anchor', 'village', 'harbor'],
    ['harbor', 'merchant', 'trade'],
    ['city', 'harbor', 'trade'],
    ['archive', 'voyage', 'map'],
    ['plow', 'trade', 'town'],
  ])('resolves trade recipe %s + %s -> %s', (first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)?.result).toBe(result)
    expect(resolveCombination(second, first, recipeIndex)?.result).toBe(result)
  })

  it('tracks the expanded Bronze challenge', () => {
    const bronzeElements = elements.filter(
      (element) => element.era === 'bronze-age',
    )
    const bronzeEra = eras.find((era) => era.id === 'bronze-age')

    expect(bronzeElements).toHaveLength(42)
    expect(bronzeEra?.discoveryGoal).toBe(23)
    expect(bronzeEra?.landmarkIds).toEqual([
      'bronze',
      'wheel',
      'writing',
      'city',
      'forge',
      'law',
      'voyage',
    ])
  })

  it('prioritizes a Bronze discovery when Bronze Age is active', () => {
    expect(
      selectHintRecipe(
        recipes,
        ['ember', 'tide', 'stone', 'gale', 'copper-ore'],
        [],
        [],
        elements,
        'bronze-age',
      )?.id,
    ).toBe('smelted-copper')
  })
})

describe('Iron Age content', () => {
  it.each([
    ['smelting-air', 'hide', 'gale', 'bellows'],
    ['bloomery-workshop', 'bellows', 'forge', 'bloomery'],
    ['smelted-iron', 'iron-ore', 'bloomery', 'iron'],
    ['worked-iron', 'iron', 'anvil', 'iron-tool'],
    ['harvest-edge', 'iron-tool', 'crop', 'sickle'],
    ['opened-road', 'iron-tool', 'land', 'road'],
    ['roadside-market', 'road', 'town', 'market'],
    ['carbon-tempered-iron', 'iron', 'charcoal', 'steel'],
    ['market-currency', 'bronze', 'market', 'coin'],
    ['city-waterway', 'stone', 'city', 'aqueduct'],
    ['roads-of-empire', 'nation', 'road', 'empire'],
    ['copied-manuscript', 'writing', 'scroll', 'manuscript'],
  ])('resolves %s in both orders', (id, first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)).toMatchObject({ id, result })
    expect(resolveCombination(second, first, recipeIndex)).toMatchObject({ id, result })
    expect(elementsById.get(result)?.era).toBe('iron-age')
  })

  it('contains twenty-three nonstarter elements and preserves the approved gate', () => {
    const ironElements = elements.filter((element) => element.era === 'iron-age')
    expect(ironElements).toHaveLength(23)
    expect(ironElements.every((element) => !element.starter)).toBe(true)
    expect(recipes.filter((recipe) => elementsById.get(recipe.result)?.era === 'iron-age')).toHaveLength(23)
    expect(eras.find((era) => era.id === 'iron-age')).toMatchObject({
      unlockRequires: ['bronze', 'forge', 'law', 'city'],
      grants: ['iron-ore'],
      landmarkIds: ['iron', 'iron-tool', 'road', 'market'],
      discoveryGoal: 6,
    })
  })

  it.each([
    ['rotating-grindstone', 'rock', 'wheel', 'rotary-quern'],
    ['turning-workshop', 'timber', 'wheel', 'lathe'],
    ['alphabetic-signs', 'writing', 'scribe', 'alphabet'],
    ['rotary-flour', 'rotary-quern', 'crop', 'flour'],
    ['alphabetic-manuscript', 'alphabet', 'papyrus', 'manuscript'],
  ])('appends optional route %s and resolves both orders', (id, first, second, result) => {
    expect(recipes.slice(178).some((recipe) => recipe.id === id)).toBe(true)
    expect(resolveCombination(first, second, recipeIndex)).toMatchObject({ id, result })
    expect(resolveCombination(second, first, recipeIndex)).toMatchObject({ id, result })
  })

  it('reconciles the gate, grants ore once, and preserves earlier era ordering', () => {
    const progress = reconcileEraProgress(
      ['bronze', 'forge', 'law', 'city'], ['first-light', 'stone-age', 'bronze-age'], elements, eras,
    )
    expect(progress.unlockedEraIds).toEqual(['first-light', 'stone-age', 'bronze-age', 'iron-age'])
    expect(progress.discoveredIds).toContain('iron-ore')
    expect(reconcileEraProgress(progress.discoveredIds, progress.unlockedEraIds, elements, eras)).toEqual(progress)
  })

  it.each(['bronze', 'forge', 'law', 'city'])('does not unlock before discovering %s', (missing) => {
    const progress = reconcileEraProgress(
      ['bronze', 'forge', 'law', 'city', 'hide', 'gale'].filter((id) => id !== missing),
      ['first-light', 'stone-age', 'bronze-age'], elements, eras,
    )
    expect(progress.unlockedEraIds).not.toContain('iron-age')
    expect(progress.discoveredIds).not.toContain('iron-ore')
    expect(resolveCombination('hide', 'gale', recipeIndex)?.result).toBe('bellows')
    expect(progress.unlockedEraIds).not.toContain(elementsById.get('bellows')?.era)
  })

  it('reconciles legacy Iron discoveries with their ore grant', () => {
    const progress = reconcileEraProgress(['iron'], ['first-light'], elements, eras)
    expect(progress.unlockedEraIds).toContain('iron-age')
    expect(progress.discoveredIds).toContain('iron-ore')
  })

  it('counts granted ore toward the six-discovery goal but requires every landmark', () => {
    const ironEra = eras.find((era) => era.id === 'iron-age')!
    const completed = [...ironEra.landmarkIds, 'iron-ore', 'bellows']
    expect(isEraChallengeComplete(ironEra, completed, elements)).toBe(true)
    expect(isEraChallengeComplete(ironEra, completed.filter((id) => id !== 'iron-ore'), elements)).toBe(false)
    expect(isEraChallengeComplete(ironEra, [...completed.filter((id) => id !== 'market'), 'bloomery'], elements)).toBe(false)
  })

  it('prioritizes an Iron recipe when Iron Age is active', () => {
    expect(selectHintRecipe(
      recipes, ['ember', 'tide', 'stone', 'gale', 'hide', 'iron-ore'], [], [], elements, 'iron-age',
    )?.id).toBe('smelting-air')
  })
})

describe('expanded ages', () => {
  it.each([
    ['first-light', 'rain-cut-river', 'rain', 'rock', 'river'],
    ['first-light', 'inland-lake', 'river', 'land', 'lake'],
    ['first-light', 'lake-green', 'lake', 'life', 'algae'],
    ['first-light', 'swimming-life', 'algae', 'animal', 'fish'],
    ['first-light', 'drying-sea', 'sea', 'wind', 'salt'],
    ['first-light', 'marine-stone', 'sea', 'rock', 'limestone'],
    ['stone-age', 'cleaned-bone', 'meat', 'rock', 'bone'],
    ['stone-age', 'bone-point', 'bone', 'stone-tool', 'needle'],
    ['stone-age', 'prepared-leather', 'hide', 'ash', 'leather'],
    ['stone-age', 'tied-tent', 'leather', 'cordage', 'tent'],
    ['stone-age', 'bone-melody', 'bone', 'gale', 'flute'],
    ['stone-age', 'knotted-net', 'cordage', 'reed', 'net'],
    ['bronze-age', 'watered-fields', 'river', 'field', 'irrigation'],
    ['bronze-age', 'cut-canal', 'irrigation', 'stone-tool', 'canal'],
    ['bronze-age', 'community-granary', 'storage', 'village', 'granary'],
    ['bronze-age', 'threaded-frame', 'fibre', 'tree', 'loom'],
    ['bronze-age', 'woven-textile', 'loom', 'fibre', 'textile'],
    ['bronze-age', 'balanced-pans', 'bronze', 'cordage', 'balance'],
    ['iron-age', 'iron-specialist', 'iron-tool', 'human', 'blacksmith'],
    ['iron-age', 'forged-fastener', 'iron', 'blacksmith', 'nail'],
    ['iron-age', 'toothed-steel', 'steel', 'blacksmith', 'saw'],
    ['iron-age', 'sawn-timber', 'saw', 'tree', 'timber'],
    ['iron-age', 'spanning-road', 'timber', 'road', 'bridge'],
    ['iron-age', 'reinforced-wagon', 'nail', 'cart', 'wagon'],
    ['stone-age', 'fossilized-remains', 'bone', 'rock', 'fossil'],
    ['first-light', 'avian-lineage', 'animal', 'gale', 'bird'],
    ['bronze-age', 'transport-amphora', 'pottery', 'trade', 'amphora'],
    ['stone-age', 'calcined-lime', 'limestone', 'heat', 'quicklime'],
    ['classical-antiquity', 'athenian-agora', 'city', 'market', 'agora'],
    ['classical-antiquity', 'recorded-academy', 'archive', 'scribe', 'academy'],
    ['classical-antiquity', 'lyceum-studies', 'academy', 'animal', 'lyceum'],
    ['classical-antiquity', 'attentive-cloud', 'human', 'cloud', 'observation'],
    ['classical-antiquity', 'nature-and-record', 'observation', 'scribe', 'natural-philosophy'],
    ['classical-antiquity', 'archived-fossil', 'archive', 'fossil', 'fossil-collection'],
    ['classical-antiquity', 'examined-remains', 'fossil', 'observation', 'fossil-inquiry'],
    ['classical-antiquity', 'trading-agora', 'trade', 'city', 'agora'],
    ['classical-antiquity', 'shared-learning', 'archive', 'human', 'knowledge'],
    ['classical-antiquity', 'questions-of-nature', 'observation', 'knowledge', 'natural-inquiry'],
    ['classical-antiquity', 'reasoning-about-nature', 'natural-inquiry', 'human', 'natural-philosophy'],
    ['classical-antiquity', 'roman-civic-space', 'agora', 'law', 'forum'],
    ['classical-antiquity', 'council-and-law', 'forum', 'law', 'senate'],
    ['classical-antiquity', 'republican-institutions', 'senate', 'city', 'republic'],
    ['classical-antiquity', 'public-persuasion', 'human', 'agora', 'rhetoric'],
    ['classical-antiquity', 'spanning-masonry', 'masonry', 'aqueduct', 'arch'],
    ['classical-antiquity', 'sheltered-colonnade', 'agora', 'masonry', 'stoa'],
    ['classical-antiquity', 'arena-and-arches', 'arch', 'city', 'amphitheater'],
    ['classical-antiquity', 'authorized-coins', 'coin', 'law', 'coinage'],
    ['classical-antiquity', 'coin-workshop', 'coin', 'forge', 'mint'],
    ['classical-antiquity', 'amphora-voyage', 'amphora', 'voyage', 'maritime-trade'],
    ['classical-antiquity', 'city-of-texts', 'archive', 'city', 'library'],
    ['classical-antiquity', 'observed-space', 'map', 'observation', 'geometry'],
    ['classical-antiquity', 'studied-birds', 'bird', 'natural-inquiry', 'bird-inquiry'],
    ['classical-antiquity', 'civic-membership', 'human', 'law', 'citizenship'],
    ['classical-antiquity', 'measured-heavens', 'geometry', 'observation', 'mathematical-astronomy'],
    ['classical-antiquity', 'attentive-care', 'human', 'observation', 'clinical-observation'],
    ['classical-antiquity', 'examined-argument', 'rhetoric', 'knowledge', 'logic'],
    ['classical-antiquity', 'compared-birds', 'bird', 'observation', 'natural-classification'],
  ])('resolves %s recipe %s in both orders using same-or-earlier inputs', (eraId, id, first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)).toMatchObject({ id, result })
    expect(resolveCombination(second, first, recipeIndex)).toMatchObject({ id, result })
    expect(elementsById.get(result)).toMatchObject({ era: eraId, starter: false })
    const resultEraIndex = eras.findIndex((era) => era.id === eraId)
    for (const inputId of [first, second]) {
      const inputEraIndex = eras.findIndex((era) => era.id === elementsById.get(inputId)?.era)
      expect(inputEraIndex).toBeGreaterThanOrEqual(0)
      expect(inputEraIndex).toBeLessThanOrEqual(resultEraIndex)
    }
  })

  it('adds a reachable fifth age without conflicting or changing the earlier catalog', () => {
    expect(eras.map((era) => era.id)).toEqual([
      'first-light', 'stone-age', 'bronze-age', 'iron-age', 'classical-antiquity',
    ])
    expect(elements).toHaveLength(189)
    expect(recipes).toHaveLength(227)
    expect(eras.map((era) => elements.filter((element) => element.era === era.id).length))
      .toEqual([43, 46, 42, 23, 35])
    expect(elements.filter((element) => element.starter).map((element) => element.id)).toEqual(['ember', 'tide', 'stone', 'gale'])
    expect(eras[4].unlockRequires).toEqual(['iron', 'iron-tool', 'road', 'market'])
    expect(eras[4].grants).toEqual([])
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
  })

  it.each([
    ['first-light', 18, ['life', 'land', 'tree', 'rock', 'animal']],
    ['stone-age', 16, ['stone-tool', 'hearth', 'art', 'village']],
    ['bronze-age', 23, ['bronze', 'wheel', 'writing', 'city', 'forge', 'law', 'voyage']],
    ['iron-age', 6, ['iron', 'iron-tool', 'road', 'market']],
  ])('keeps %s completable with only its original discoveries', (eraId, discoveryGoal, landmarkIds) => {
    const era = eras.find((entry) => entry.id === eraId)!
    expect(era).toMatchObject({ discoveryGoal, landmarkIds })
    const originalIds = elements.slice(0, 120)
      .filter((element) => element.era === eraId && !landmarkIds.includes(element.id))
      .map((element) => element.id)
    const completed = [...landmarkIds, ...originalIds.slice(0, discoveryGoal - landmarkIds.length)]
    expect(isEraChallengeComplete(era, completed, elements)).toBe(true)
    expect(isEraChallengeComplete(era, completed.slice(0, -1), elements)).toBe(false)
    expect(isEraChallengeComplete(era, [...completed.slice(1), originalIds.at(-1)!], elements)).toBe(false)
  })

  it('keeps the new chapter optional and its challenge goal completable', () => {
    const era = eras.find((entry) => entry.id === 'classical-antiquity')!
    const ironGate = ['iron', 'iron-tool', 'road', 'market']
    expect(era.unlockRequires).toEqual(ironGate)
    expect(era.landmarkIds).toEqual([
      'agora', 'academy', 'lyceum', 'natural-philosophy', 'fossil-inquiry',
    ])
    expect(era.discoveryGoal).toBe(6)
    expect(isEraChallengeComplete(era, [...era.landmarkIds, 'observation'], elements)).toBe(true)
    expect(isEraChallengeComplete(era, era.landmarkIds, elements)).toBe(false)
    expect(isEraChallengeComplete(era, [...era.landmarkIds.slice(1), 'observation', 'fossil-collection'], elements)).toBe(false)
    expect(eras.slice(0, 4).map((entry) => [entry.unlockRequires, entry.grants, entry.landmarkIds, entry.discoveryGoal]))
      .toEqual([
        [[], [], ['life', 'land', 'tree', 'rock', 'animal'], 18],
        [['life', 'land', 'tree', 'rock', 'animal'], ['human'], ['stone-tool', 'hearth', 'art', 'village'], 16],
        [['village', 'pottery', 'metal', 'quarry'], ['copper-ore'], ['bronze', 'wheel', 'writing', 'city', 'forge', 'law', 'voyage'], 23],
        [['bronze', 'forge', 'law', 'city'], ['iron-ore'], ['iron', 'iron-tool', 'road', 'market'], 6],
      ])
  })

  it('keeps Citizenship optional for every existing age and collection', () => {
    expect(validateContent(
      elements.filter((element) => element.id !== 'citizenship'),
      recipes.filter((recipe) => recipe.result !== 'citizenship'),
      eras, collections,
    )).toEqual([])
    expect(collections.every((collection) => !collection.elementIds.includes('citizenship'))).toBe(true)
  })

  it('keeps all four intellectual discoveries optional for existing ages and collections', () => {
    const ids = new Set(['mathematical-astronomy', 'clinical-observation', 'logic', 'natural-classification'])
    expect(validateContent(
      elements.slice(0, 186).filter((element) => !ids.has(element.id)),
      recipes.slice(0, 224).filter((recipe) => !ids.has(recipe.result)),
      eras, collections,
    )).toEqual([])
    expect(collections.every((collection) => collection.elementIds.every((id) => !ids.has(id)))).toBe(true)
  })

  it('completes every age and the inquiry collection without any expansion discovery', () => {
    const originalElements = elements.slice(0, 158)
    const originalRecipes = recipes.slice(0, 194)
    const originalCollections = collections.slice(0, 6)
    expect(validateContent(originalElements, originalRecipes, eras, originalCollections)).toEqual([])
    const expandedIds = new Set(elements.slice(158).map((element) => element.id))
    for (const era of eras) {
      expect([...era.unlockRequires, ...era.grants, ...era.landmarkIds]
        .some((id) => expandedIds.has(id))).toBe(false)
    }
    expect(originalCollections.some((collection) => collection.elementIds.some((id) => expandedIds.has(id)))).toBe(false)
    expect(elementsById.get('scroll')?.era).toBe('bronze-age')
    expect(elementsById.get('aqueduct')?.era).toBe('iron-age')
    expect(elementsById.get('coin')?.era).toBe('iron-age')
    expect(elements.filter((element) => element.name === 'Scroll')).toHaveLength(1)
    expect(elements.filter((element) => element.name === 'Aqueduct')).toHaveLength(1)
  })
})

describe('historical interpretation', () => {
  it('identifies Origins as an undated symbolic prologue, with regionally qualified historical dates', () => {
    expect(eras[0].dateRange).toBeUndefined()
    expect(eras[0]).toEqual({
      id: 'first-light',
      name: 'Origins',
      subtitle: 'An undated prologue inspired by the four classical elements of ancient Greek natural philosophy.',
      unlockRequires: [],
      grants: [],
      landmarkIds: ['life', 'land', 'tree', 'rock', 'animal'],
      discoveryGoal: 18,
    })
    expect(eras[1].dateRange).toBe('c. 3.3 million years ago–c. 3300 BCE')
    expect(eras[2].dateRange).toBe('c. 3300 BCE–c. 1200 BCE')
    expect(eras[3].dateRange).toBe('From c. 1200 BCE; regional end dates vary')
    expect(eras[4].dateRange).toBe('c. 800 BCE–c. 500 CE')
    expect(eras[4].education).toContain('not the narrower Greek Classical period or a worldwide timeline')
    expect(eras[4].education).toContain('Earlier precedents')
  })

  it.each([
    ['ember', 'Fire', 'FI', '🔥'],
    ['tide', 'Water', 'WA', '💧'],
    ['stone', 'Earth', 'EA', '🌍'],
    ['gale', 'Air', 'AI', '💨'],
  ])('preserves %s as a starting essence and separates flavor from historical context', (id, name, sigil, icon) => {
    expect(elementsById.get(id)).toMatchObject({
      id, name, sigil, icon, starter: true, category: 'essence', era: 'first-light',
    })
    expect(elementsById.get(id)?.description).toContain('Historical context:')
    expect(elementsById.get(id)?.description).not.toContain('fictional')
  })

  it.each([
    ['compass', 'Wayfinding', 'stone-age'],
    ['magnet', 'Lodestone', 'stone-age'],
    ['brick', 'Mud Brick', 'stone-age'],
    ['nation', 'Polity', 'bronze-age'],
    ['quill', 'Writing Reed', 'bronze-age'],
    ['plow', 'Ard', 'bronze-age'],
    ['lens', 'Lens', 'iron-age'],
  ])('preserves legacy ID %s for the corrected concept %s on %s', (id, name, era) => {
    expect(elementsById.get(id)).toMatchObject({ id, name, era, starter: false })
  })

  it.each([
    ['remembered-direction', 'human', 'wind', 'compass'],
    ['shaped-writing-reed', 'reed', 'scribe', 'quill'],
    ['impressed-clay', 'clay', 'reed', 'writing'],
  ])('resolves historically informed route %s in both orders', (id, first, second, result) => {
    expect(resolveCombination(first, second, recipeIndex)).toMatchObject({ id, result })
    expect(resolveCombination(second, first, recipeIndex)).toMatchObject({ id, result })
  })

  it('retains earlier map and voyage routes without optical or magnetic instruments', () => {
    expect(resolveCombination('papyrus', 'charcoal', recipeIndex)?.result).toBe('map')
    expect(resolveCombination('boat', 'sail', recipeIndex)?.result).toBe('voyage')
    expect(resolveCombination('boat', 'compass', recipeIndex)?.result).toBe('voyage')
    expect(elementsById.get('compass')?.description).toContain('long before magnetic')
    expect(elementsById.get('metal')?.description).toContain('symbolic, not historical smelting')
  })

  it.each([
    ['stone-age', ['life', 'land', 'tree', 'rock', 'animal'], ['human']],
    ['bronze-age', ['village', 'pottery', 'metal', 'quarry'], ['copper-ore']],
    ['iron-age', ['bronze', 'forge', 'law', 'city'], ['iron-ore']],
  ])('preserves the fictional %s unlock requirements and grants', (eraId, unlockRequires, grants) => {
    expect(eras.find((era) => era.id === eraId)).toMatchObject({ unlockRequires, grants })
  })
})

describe('content contracts', () => {
  it('rejects duplicate element, recipe, and era IDs', () => {
    expect(validateContent([...elements, elements[0]], [...recipes, recipes[0]], [...eras, eras[0]])).toEqual(
      expect.arrayContaining([
        'Duplicate element id ember.',
        `Duplicate recipe id ${recipes[0].id}.`,
        'Duplicate era id first-light.',
      ]),
    )
  })

  it.each([0, -1, 1.5, 24])('rejects an impossible Iron discovery goal of %s', (discoveryGoal) => {
    const invalidEras = eras.map((era) => era.id === 'iron-age' ? { ...era, discoveryGoal } : era)
    expect(validateContent(elements, recipes, invalidEras)).toContain(
      `Era iron-age has impossible discovery goal ${discoveryGoal} with 23 reachable elements.`,
    )
  })

  it('uses gated reachable discoveries, not nominal element count, to validate goals', () => {
    const disconnected = recipes.filter((recipe) => recipe.result !== 'market')
    const invalidEras = eras.map((era) => era.id === 'iron-age' ? { ...era, discoveryGoal: 22 } : era)
    expect(validateContent(elements, disconnected, invalidEras)).toContain(
      'Era iron-age has impossible discovery goal 22 with 21 reachable elements.',
    )
  })
})

describe('Insight wallet', () => {
  it('earns one credit after five unique failures', () => {
    let state = { credits: 1, failureProgress: 0 }
    for (let count = 0; count < 5; count += 1) {
      state = recordUniqueFailure(state, true)
    }

    expect(state).toEqual({ credits: 2, failureProgress: 0 })
  })

  it('ignores repeated failures and resets only for new discoveries', () => {
    const stalled = { credits: 1, failureProgress: 3 }

    expect(recordUniqueFailure(stalled, false)).toEqual(stalled)
    expect(resetInsightProgress(stalled, false)).toEqual(stalled)
    expect(resetInsightProgress(stalled, true)).toEqual({
      credits: 1,
      failureProgress: 0,
    })
  })

  it('pauses at four failures while full and pays out after a credit is spent', () => {
    const paused = recordUniqueFailure(
      { credits: 3, failureProgress: 4 },
      true,
    )
    expect(paused).toEqual({ credits: 3, failureProgress: 4 })

    expect(recordUniqueFailure({ ...paused, credits: 2 }, true)).toEqual({
      credits: 3,
      failureProgress: 0,
    })
  })

  it('caps milestone awards and recognizes completed era challenges', () => {
    expect(awardInsight({ credits: 3, failureProgress: 2 }).credits).toBe(3)
    expect(awardInsight({ credits: 1, failureProgress: 2 }).credits).toBe(2)

    const origins = eras[0]
    const completedIds = [
      ...origins.landmarkIds,
      ...elements
        .filter(
          (element) =>
            element.era === origins.id &&
            !origins.landmarkIds.includes(element.id),
        )
        .slice(0, origins.discoveryGoal - origins.landmarkIds.length)
        .map((element) => element.id),
    ]
    expect(isEraChallengeComplete(origins, completedIds, elements)).toBe(true)
  })
})