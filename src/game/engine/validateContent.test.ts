import { describe, expect, it } from 'vitest'
import type { ElementDefinition, EraDefinition, RecipeDefinition } from '../domain/types'
import { validateContent } from './validateContent'

function fixture() {
  const elements: ElementDefinition[] = [
    { id: 'seed', name: 'Seed', sigil: 'SE', category: 'matter', description: 'A starting resource.', starter: true, era: 'early' },
    { id: 'tool', name: 'Tool', sigil: 'TO', category: 'craft', description: 'A reusable tool.', starter: false, era: 'early' },
    { id: 'ore', name: 'Ore', sigil: 'OR', category: 'matter', description: 'A granted resource.', starter: false, era: 'late' },
    { id: 'product', name: 'Product', sigil: 'PR', category: 'craft', description: 'A terminal result.', starter: false, era: 'late' },
  ]
  const recipes: RecipeDefinition[] = [
    { id: 'make-tool', inputs: ['seed', 'seed'], result: 'tool', flavor: 'A self-pair.' },
    { id: 'make-product', inputs: ['tool', 'ore'], result: 'product', flavor: 'An earlier tool remains useful.' },
  ]
  const eras: EraDefinition[] = [
    { id: 'early', name: 'Early', subtitle: 'Early.', unlockRequires: [], grants: [], landmarkIds: ['tool'], discoveryGoal: 2 },
    { id: 'late', name: 'Late', subtitle: 'Late.', unlockRequires: ['tool'], grants: ['ore'], landmarkIds: ['product'], discoveryGoal: 2 },
  ]
  return { elements, recipes, eras }
}

describe('graph authoring validation', () => {
  it('accepts reusable self-pairs, cross-era tools, granted ore, and terminal products', () => {
    const { elements, recipes, eras } = fixture()
    expect(validateContent(elements, recipes, eras)).toEqual([])
  })

  it('rejects normalized duplicate names without conflating different names', () => {
    const { elements, recipes, eras } = fixture()
    elements[3].name = '  sEEd  '
    expect(validateContent(elements, recipes, eras)).toContain('Elements seed and product share name seed.')
  })

  it.each(['unlockRequires', 'grants', 'landmarkIds'] as const)('rejects repeated %s references', (field) => {
    const { elements, recipes, eras } = fixture()
    eras[1][field].push(eras[1][field][0])
    expect(validateContent(elements, recipes, eras)).toContain(`Era late repeats ${field} element ${eras[1][field][0]}.`)
  })

  it.each(['grants', 'landmarkIds'] as const)('rejects future %s references but allows earlier landmarks', (field) => {
    const { elements, recipes, eras } = fixture()
    eras[0][field].push('product')
    expect(validateContent(elements, recipes, eras)).toContain(`Era early ${field} references later-era element product.`)
    eras[0][field].pop()
    eras[1].landmarkIds.push('tool')
    expect(validateContent(elements, recipes, eras)).toEqual([])
  })

  it('rejects missing era references, missing recipe inputs/results, and reversed collisions', () => {
    const { elements, recipes, eras } = fixture()
    recipes.push({ ...recipes[1], id: 'reversed', inputs: ['ore', 'tool'] })
    recipes.push({ id: 'dangling', inputs: ['missing', 'seed'], result: 'absent', flavor: 'Invalid.' })
    eras[1].grants.push('unknown')
    expect(validateContent(elements, recipes, eras)).toEqual(expect.arrayContaining([
      'Recipes make-product and reversed share pair ore::tool.',
      'Recipe dangling references missing input missing.',
      'Recipe dangling references missing result absent.',
      'Era late references missing element unknown.',
    ]))
  })

  it('accepts multiple input pairs leading to the same result', () => {
    const { elements, recipes, eras } = fixture()
    recipes.push({ id: 'alternate', inputs: ['seed', 'ore'], result: 'product', flavor: 'Another route.' })
    expect(validateContent(elements, recipes, eras)).toEqual([])
  })

  it('rejects an unseeded cycle but accepts a cycle with an external entry', () => {
    const { elements, recipes, eras } = fixture()
    recipes[0].inputs = ['tool', 'tool']
    expect(validateContent(elements, recipes, eras)).toContain('Element tool is unreachable from starter elements.')
    recipes.push({ id: 'external-entry', inputs: ['seed', 'seed'], result: 'tool', flavor: 'An entry.' })
    expect(validateContent(elements, recipes, eras)).toEqual([])
  })

  it('rejects gates depending on their own grants and unavailable later ingredients', () => {
    const { elements, recipes, eras } = fixture()
    eras[1].unlockRequires = ['ore']
    expect(validateContent(elements, recipes, eras)).toContain('Era late is unreachable from prior era content.')
    eras[1].unlockRequires = ['tool']
    recipes[0].inputs = ['seed', 'ore']
    expect(validateContent(elements, recipes, eras)).toContain('Element tool is unreachable from starter elements.')
  })

  it.each([0, -1, 1.5, 3])('rejects an impossible goal of %s in a two-element era', (goal) => {
    const { elements, recipes, eras } = fixture()
    eras[1].discoveryGoal = goal
    expect(validateContent(elements, recipes, eras)).toContain(`Era late has impossible discovery goal ${goal} with 2 reachable elements.`)
  })

  it('rejects missing initial content and starters assigned to a later era', () => {
    expect(validateContent([], [], [])).toEqual(expect.arrayContaining([
      'Content must define at least one era.',
      'Content must define at least one starter element.',
    ]))
    const { elements, recipes, eras } = fixture()
    elements[0].era = 'late'
    expect(validateContent(elements, recipes, eras)).toContain('Starter seed must belong to the first era.')
  })
})
