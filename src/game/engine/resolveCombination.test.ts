import { describe, expect, it } from 'vitest'
import { elements, eras, recipes } from '../content'
import {
  createRecipeIndex,
  resolveCombination,
} from './resolveCombination'
import { validateContent } from './validateContent'

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
    expect(resolveCombination('dust', 'steam', recipeIndex)?.result).toBe('soil')
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
})