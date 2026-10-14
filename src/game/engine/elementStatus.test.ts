import { describe, expect, it } from 'vitest'
import { collections, elements, eras, recipes } from '../content'
import type { RecipeDefinition } from '../domain/types'
import { getExhaustedElements, getGraphMetrics, getTemporarilyExhaustedElements } from './elementStatus'
import { validateContent } from './validateContent'

const routes: RecipeDefinition[] = [
  { id: 'first', inputs: ['starter', 'starter'], result: 'middle', flavor: 'fixture' },
  { id: 'second', inputs: ['middle', 'starter'], result: 'end', flavor: 'fixture' },
  { id: 'alternate', inputs: ['middle', 'middle'], result: 'end', flavor: 'fixture' },
  { id: 'future', inputs: ['middle', 'grant'], result: 'later', flavor: 'fixture' },
]
const available = new Set(['starter', 'middle', 'end', 'grant'])
const elementEras = new Map([['middle', 'early'], ['end', 'early'], ['later', 'late']])
const temporary = (performed: string[], unlocked = ['early']) => getTemporarilyExhaustedElements(
  routes, available, new Set(performed), new Set(unlocked), elementEras,
)

describe('graph-derived element status', () => {
  it('finds only available produced nodes with no outgoing use anywhere', () => {
    expect(getExhaustedElements(routes, available)).toEqual(new Set(['end']))
    expect(getExhaustedElements(routes, new Set(['middle', 'later']))).toEqual(new Set(['later']))
    expect(getExhaustedElements([], available)).toEqual(new Set())
    expect(getExhaustedElements([...routes].reverse(), available)).toEqual(new Set(['end']))
  })

  it('does not confuse partial use, known results or hints with performed formulas', () => {
    expect(temporary([])).toEqual(new Set())
    expect(temporary(['first', 'second'])).toEqual(new Set(['starter']))
    expect(temporary(['first', 'second', 'alternate'])).toEqual(new Set(['starter', 'middle']))
  })

  it('reactivates ingredients when another age exposes an unperformed use', () => {
    expect(temporary(['second', 'alternate']).has('middle')).toBe(true)
    expect(temporary(['second', 'alternate'], ['early', 'late']).has('middle')).toBe(false)
    expect(temporary(['second', 'alternate', 'future'], ['early', 'late']).has('middle')).toBe(true)
  })

  it('does not exhaust grants whose only use is locked, or include undiscovered inputs', () => {
    expect(temporary([]).has('grant')).toBe(false)
    expect(temporary(['future'], ['early', 'late']).has('grant')).toBe(true)
    expect(getTemporarilyExhaustedElements(routes, new Set(['end']), new Set(routes.map((r) => r.id)),
      new Set(['early', 'late']), elementEras)).toEqual(new Set())
  })

  it('reports the current graph and distinguishes unused non-produced nodes', () => {
    expect(getGraphMetrics(elements, recipes)).toEqual({ total: 178, ingredients: 135, terminal: 43, unused: 0 })
    expect(getGraphMetrics([...elements, { ...elements[0], id: 'unused' }], recipes).unused).toBe(1)
    expect(getExhaustedElements(recipes, new Set(elements.map((e) => e.id)))).toContain('lathe')
  })

  it.each(['ember', 'tool', 'stone-tool', 'bronze-tool', 'iron-tool'])('rejects accidental loss of outgoing uses for %s', (id) => {
    expect(validateContent(elements, recipes.filter((r) => !r.inputs.includes(id)), eras, collections))
      .toContain(`Protected ingredient ${id} must have an outgoing recipe.`)
  })

  it('accepts existing legitimate terminal tools without requiring new recipes', () => {
    expect(validateContent(elements, recipes, eras, collections)).toEqual([])
  })
})
