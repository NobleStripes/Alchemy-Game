// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { elements, eras, recipes, starterElementIds } from '../../game/content'
import { snapshotProgress, useGameStore } from '../../game/state/useGameStore'
import { Codex } from './Codex'

afterEach(cleanup)

const results = () => within(screen.getByRole('region', { name: 'Matching discovered elements' }))
const counter = () => screen.getByRole('status', { name: 'Element filter results' })
const craftForAge = (index: number) => elements.find((element) => element.era === eras[index].id && element.category === 'craft')!

function renderShelf(onElementSelected?: () => void) {
  return render(<ShelfHarness onElementSelected={onElementSelected} />)
}

function ShelfHarness({ onElementSelected }: { onElementSelected?: () => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )
  return <DndContext sensors={sensors}><Codex onElementSelected={onElementSelected} /></DndContext>
}

describe('element shelf', () => {
  it('groups eras chronologically, keeps completion counts stable and remembers collapsed drawers', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ discoveredIds: [...starterElementIds, 'bread'], unlockedEraIds: eras.slice(0, 2).map((era) => era.id) })
    const view = renderShelf()
    const origins = screen.getByRole('button', { name: /Origins 4\/43 discovered/ })
    expect(origins).toHaveAttribute('aria-expanded', 'true')
    await user.click(origins)
    expect(origins).toHaveAttribute('aria-expanded', 'false')
    expect(results().queryByRole('button', { name: 'Fire' })).not.toBeInTheDocument()
    expect(counter()).toHaveTextContent('5 of 5 discovered elements')
    expect(results().getByRole('button', { name: 'Bread' })).toBeVisible()
    view.unmount()
    renderShelf()
    expect(screen.getByRole('button', { name: /Origins 4\/43 discovered/ })).toHaveAttribute('aria-expanded', 'false')
    expect(useGameStore.getState().collapsedShelves).toEqual(['first-light'])
  })

  it('temporarily reveals searched terminals across all filters without rewriting preferences', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: [...starterElementIds, 'bread'],
      hideFinalElements: true, collapsedShelves: ['stone-age'],
    })
    renderShelf()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'first-light')
    await user.click(screen.getByRole('tab', { name: /^Essence/ }))
    expect(results().queryByRole('button', { name: 'Bread' })).not.toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'bread')
    const bread = results().getByRole('button', { name: 'Bread' })
    expect(bread).toHaveAccessibleDescription(/Terminal/)
    expect(screen.getByRole('button', { name: /Stone Age/ })).toHaveAttribute('aria-expanded', 'true')
    await user.click(bread)
    expect(useGameStore.getState().firstSlotId).toBe('bread')
    expect(useGameStore.getState()).toMatchObject({ hideFinalElements: true, collapsedShelves: ['stone-age'] })
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(results().queryByRole('button', { name: 'Bread' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Starred' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('combobox', { name: 'Age' })).toHaveValue('first-light')
    await user.click(screen.getByRole('button', { name: 'Use recent ingredient Bread' }))
    expect(useGameStore.getState().secondSlotId).toBe('bread')
  })

  it('updates exhaustion after the last performed formula, not a disclosed lead, then reactivates on unlock', async () => {
    const user = userEvent.setup()
    const earlyUses = recipes.filter((recipe) => recipe.inputs.includes('archive') &&
      elements.find((element) => element.id === recipe.result)!.era !== 'classical-antiquity')
    expect(earlyUses.length).toBeGreaterThan(0)
    useGameStore.setState({
      discoveredIds: [...starterElementIds, 'archive'],
      unlockedEraIds: eras.slice(0, 4).map((era) => era.id),
      discoveredRecipeIds: earlyUses.slice(0, -1).map((recipe) => recipe.id),
      revealedHintRecipeIds: [earlyUses.at(-1)!.id],
    })
    renderShelf()
    expect(results().getByRole('button', { name: 'Archive' })).not.toHaveAccessibleDescription(/Exhausted/)
    act(() => useGameStore.setState({ discoveredRecipeIds: earlyUses.map((recipe) => recipe.id) }))
    expect(results().getByRole('button', { name: 'Archive' })).toHaveAccessibleDescription(/Exhausted for now/)
    await user.click(screen.getByRole('button', { name: 'Hide Mastered' }))
    expect(results().queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
    act(() => useGameStore.setState({ unlockedEraIds: eras.map((era) => era.id) }))
    expect(results().getByRole('button', { name: 'Archive' })).toBeVisible()
  })

  it('returns focused tile controls to a surviving header on external collapse', () => {
    renderShelf()
    results().getByRole('button', { name: 'Favorite Fire' }).focus()
    act(() => useGameStore.setState({ collapsedShelves: ['first-light'] }))
    expect(screen.getByRole('button', { name: /Origins 4\/43 discovered/ })).toHaveFocus()
  })

  it('returns focus to the shelf heading when a whole focused drawer disappears', () => {
    useGameStore.setState({ discoveredIds: [...starterElementIds, 'bread'] })
    renderShelf()
    results().getByRole('button', { name: 'Bread' }).focus()
    act(() => useGameStore.setState({ hideFinalElements: true }))
    expect(screen.getByRole('heading', { name: 'Element shelf' })).toHaveFocus()
  })

  it('retains a terminal drag source through hiding and removes it after drag cancellation', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ discoveredIds: [...starterElementIds, 'bread'] })
    renderShelf()
    const bread = results().getByRole('button', { name: 'Bread' })
    bread.focus()
    await user.keyboard('[Space]')
    expect(bread).toHaveAttribute('data-dragging', 'true')
    act(() => useGameStore.setState({ hideFinalElements: true }))
    expect(results().getByRole('button', { name: 'Bread' })).toBeVisible()
    await user.keyboard('[Escape]')
    expect(results().queryByRole('button', { name: 'Bread' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Element shelf' })).toHaveFocus()
  })

  it('hides an ingredient immediately after actually performing its final outgoing formula', () => {
    const outgoing = recipes.filter((recipe) => recipe.inputs.includes('archive'))
    const last = outgoing.at(-1)!
    useGameStore.setState({
      discoveredIds: elements.map((element) => element.id),
      unlockedEraIds: eras.map((era) => era.id),
      discoveredRecipeIds: outgoing.slice(0, -1).map((recipe) => recipe.id),
      hideFinalElements: true,
    })
    renderShelf()
    expect(results().getByRole('button', { name: 'Archive' })).toBeVisible()
    act(() => useGameStore.getState().transmuteWith(...last.inputs))
    expect(useGameStore.getState().discoveredRecipeIds).toContain(last.id)
    expect(results().queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('starts on All Ages independently of the playable age and hides undiscovered elements', () => {
    const craft = craftForAge(1)
    useGameStore.setState({
      discoveredIds: [...starterElementIds, craft.id],
      unlockedEraIds: eras.slice(0, 2).map((era) => era.id),
      activeEraId: eras[1].id,
    })
    renderShelf()
    expect(screen.getByRole('combobox', { name: 'Age' })).toHaveValue('all')
    expect(within(screen.getByRole('combobox', { name: 'Age' })).getAllByRole('option').map((option) => option.textContent))
      .toEqual(['All Ages', 'Origins', 'Stone Age', 'Bronze Age', 'Iron Age', 'Classical Antiquity'])
    expect(results().getByRole('button', { name: 'Fire' })).toBeVisible()
    expect(results().getByRole('button', { name: craft.name })).toBeVisible()
    expect(results().queryByRole('button', { name: 'Metal' })).not.toBeInTheDocument()
    expect(counter()).toHaveTextContent('5 of 5 discovered elements')
  })

  it('combines age, category, search and Starred without altering gameplay or saving', async () => {
    const user = userEvent.setup()
    const crafts = [craftForAge(1), craftForAge(2), craftForAge(3)]
    useGameStore.setState({
      discoveredIds: [...starterElementIds, ...crafts.map((element) => element.id)],
      favoriteIds: ['ember', ...crafts.map((element) => element.id)],
    })
    const before = snapshotProgress(useGameStore.getState())
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    renderShelf()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.click(screen.getByRole('tab', { name: /^Craft/ }))
    expect(counter()).toHaveTextContent('3 of 7 discovered elements')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), eras[1].id)
    expect(counter()).toHaveTextContent('1 of 7 discovered elements')
    expect(results().getByRole('button', { name: crafts[0].name })).toBeVisible()
    expect(results().queryByRole('button', { name: crafts[1].name })).not.toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), crafts[0].name.toUpperCase())
    expect(counter()).toHaveTextContent('1 of 7 discovered elements')
    await user.click(screen.getByRole('tab', { name: /^All/ }))
    expect(screen.getByRole('button', { name: 'Starred' })).toHaveAttribute('aria-pressed', 'true')
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(writes).not.toHaveBeenCalled()
  })

  it('reports zero matches and clears every filter while retaining sort and compact layout', async () => {
    const user = userEvent.setup()
    renderShelf()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), eras[3].id)
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.click(screen.getByRole('tab', { name: /^Essence/ }))
    await user.type(screen.getByRole('searchbox'), 'writing')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort elements' }), 'recent')
    await user.click(screen.getByRole('button', { name: 'Compact layout' }))
    expect(counter()).toHaveTextContent('0 of 4 discovered elements')
    expect(results().queryByRole('button', { name: 'Writing' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Age' })).toHaveValue('all')
    expect(screen.getByRole('tab', { name: /^All/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Starred' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('combobox', { name: 'Sort elements' })).toHaveValue('recent')
    expect(screen.getByRole('button', { name: 'Compact layout' })).toHaveAttribute('aria-pressed', 'true')
    expect(counter()).toHaveTextContent('4 of 4 discovered elements')
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  it('recalls ingredients across filters, moves repeated inputs first and preserves discovery sorting', async () => {
    const user = userEvent.setup()
    const onSelected = vi.fn()
    renderShelf(onSelected)
    await user.click(results().getByRole('button', { name: 'Fire' }))
    await user.click(results().getByRole('button', { name: 'Water' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort elements' }), 'recent')
    const names = () => results().getAllByRole('button').filter((button) => button.classList.contains('element-tile')).map((button) => button.getAttribute('aria-label'))
    const discoveryOrder = [...starterElementIds].reverse().map((id) => elements.find((element) => element.id === id)!.name)
    expect(names()).toEqual(discoveryOrder)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), eras[3].id)
    expect(counter()).toHaveTextContent('0 of 4 discovered elements')
    const recentRegion = within(screen.getByRole('region', { name: /Recently used/ }))
    expect(recentRegion.getAllByRole('button').map((button) => button.getAttribute('aria-label')))
      .toEqual(['Use recent ingredient Water', 'Use recent ingredient Fire'])
    await user.click(recentRegion.getByRole('button', { name: 'Use recent ingredient Fire' }))
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: 'ember', secondSlotId: 'ember', recentIngredientIds: ['ember', 'tide'],
    })
    expect(onSelected).toHaveBeenCalledTimes(3)
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(names()).toEqual(discoveryOrder)
  })

  it('filters the four new discoveries and keeps their recent shortcuts available across filters', async () => {
    const user = userEvent.setup()
    const additions = elements.filter((element) =>
      ['fossil', 'bird', 'amphora', 'quicklime'].includes(element.id),
    )
    useGameStore.setState({
      discoveredIds: [...starterElementIds, ...additions.map((element) => element.id)],
      favoriteIds: additions.map((element) => element.id),
      firstSlotId: null,
      secondSlotId: null,
      recentIngredientIds: [],
    })
    renderShelf()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'stone-age')
    await user.click(screen.getByRole('tab', { name: /^Matter/ }))
    expect(results().getByRole('button', { name: 'Fossil' })).toBeVisible()
    const quicklime = results().getByRole('button', { name: 'Quicklime' })
    expect(quicklime).toBeVisible()
    await user.click(quicklime)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'bronze-age')
    await user.click(screen.getByRole('tab', { name: /^Transport/ }))
    expect(results().getByRole('button', { name: 'Amphora' })).toBeVisible()
    expect(results().queryByRole('button', { name: 'Quicklime' })).not.toBeInTheDocument()
    const recentRegion = within(screen.getByRole('region', { name: /Recently used/ }))
    await user.click(recentRegion.getByRole('button', { name: 'Use recent ingredient Quicklime' }))
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: 'quicklime',
      secondSlotId: 'quicklime',
      recentIngredientIds: ['quicklime'],
    })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'first-light')
    await user.click(screen.getByRole('tab', { name: /^Life/ }))
    expect(results().getByRole('button', { name: 'Bird' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    expect(results().getByRole('button', { name: 'Bird' })).toBeVisible()
  })

  it.each([
    ['agora', 'Agora', /^Society/],
    ['citizenship', 'Citizenship', /^Society/],
    ['mathematical-astronomy', 'Mathematical Astronomy', /^Knowledge/],
    ['clinical-observation', 'Clinical Observation', /^Knowledge/],
    ['logic', 'Logic', /^Knowledge/],
    ['natural-classification', 'Natural Classification', /^Knowledge/],
    ['concrete', 'Concrete', /^Craft/],
    ['road-network', 'Road Network', /^Transport/],
    ['public-bath', 'Public Bath', /^Society/],
  ] as const)('filters starred Age V %s while retaining its Recently Used shortcut', async (id, name, category) => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: [...starterElementIds, id, 'observation'],
      favoriteIds: [id],
      firstSlotId: null,
      secondSlotId: null,
      recentIngredientIds: [],
    })
    renderShelf()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'classical-antiquity')
    expect(results().getByRole('button', { name })).toBeVisible()
    expect(results().getByRole('button', { name: 'Observation' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.click(screen.getByRole('tab', { name: category }))
    expect(results().queryByRole('button', { name: 'Observation' })).not.toBeInTheDocument()
    await user.click(results().getByRole('button', { name }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'first-light')
    expect(results().queryByRole('button', { name })).not.toBeInTheDocument()
    const recentRegion = within(screen.getByRole('region', { name: /Recently used/ }))
    const recent = recentRegion.getByRole('button', { name: `Use recent ingredient ${name}` })
    expect(recent).toBeVisible()
    await user.click(recent)
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: id,
      secondSlotId: id,
      recentIngredientIds: [id],
    })
  })

  it('shows optional Age V branches without moving earlier Scroll and Aqueduct discoveries', async () => {
    const user = userEvent.setup()
    const expansion = elements.slice(158).filter((element) => element.era === 'classical-antiquity')
    useGameStore.setState({
      discoveredIds: [...starterElementIds, 'scroll', 'aqueduct', ...expansion.map((element) => element.id)],
      favoriteIds: ['mint', 'bird-inquiry'],
      firstSlotId: null,
      secondSlotId: null,
      recentIngredientIds: [],
    })
    renderShelf()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'classical-antiquity')
    for (const element of expansion) {
      expect(results().getByRole('button', { name: element.name })).toBeVisible()
    }
    expect(results().queryByRole('button', { name: 'Scroll' })).not.toBeInTheDocument()
    expect(results().queryByRole('button', { name: 'Aqueduct' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.click(screen.getByRole('tab', { name: /^Craft/ }))
    expect(results().getByRole('button', { name: 'Mint' })).toBeVisible()
    expect(results().queryByRole('button', { name: 'Bird Inquiry' })).not.toBeInTheDocument()
    await user.click(results().getByRole('button', { name: 'Mint' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'iron-age')
    await user.click(within(screen.getByRole('region', { name: /Recently used/ }))
      .getByRole('button', { name: 'Use recent ingredient Mint' }))
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: 'mint', secondSlotId: 'mint', recentIngredientIds: ['mint'],
    })
  })

  it.each([
    ['slaked-lime', 'Slaked Lime', 'stone-age', /^Matter/],
    ['lime-mortar', 'Lime Mortar', 'stone-age', /^Craft/],
    ['volcanic-ash', 'Volcanic Ash', 'first-light', /^Matter/],
  ] as const)('keeps %s in its earlier-age filters and Recently Used shortcuts', async (id, name, era, category) => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: [...starterElementIds, id],
      favoriteIds: [id], firstSlotId: null, secondSlotId: null, recentIngredientIds: [],
    })
    renderShelf()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), era)
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    await user.click(screen.getByRole('tab', { name: category }))
    await user.click(results().getByRole('button', { name }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Age' }), 'classical-antiquity')
    expect(results().queryByRole('button', { name })).not.toBeInTheDocument()
    await user.click(within(screen.getByRole('region', { name: /Recently used/ }))
      .getByRole('button', { name: `Use recent ingredient ${name}` }))
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: id, secondSlotId: id, recentIngredientIds: [id],
    })
  })

  it('keeps keyboard selection and favorites working in compact rows without selecting on favorite activation', async () => {
    const user = userEvent.setup()
    const onSelected = vi.fn()
    renderShelf(onSelected)
    await user.click(screen.getByRole('button', { name: 'Compact layout' }))
    const fire = results().getByRole('button', { name: 'Fire' })
    expect(fire.parentElement).toHaveAttribute('data-layout', 'compact')
    fire.focus()
    await user.keyboard('{Enter}')
    expect(useGameStore.getState().firstSlotId).toBe('ember')
    expect(onSelected).toHaveBeenCalledTimes(1)
    expect(fire).toHaveAttribute('aria-pressed', 'true')
    const favorite = results().getByRole('button', { name: 'Favorite Fire' })
    favorite.focus()
    await user.keyboard('{Enter}')
    expect(useGameStore.getState().favoriteIds).toEqual(['ember'])
    expect(useGameStore.getState().secondSlotId).toBeNull()
    expect(onSelected).toHaveBeenCalledTimes(1)
  })

  it('keeps stationary controls outside the independently scrollable, keyboard-focusable results', () => {
    renderShelf()
    const region = screen.getByRole('region', { name: 'Matching discovered elements' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).not.toContainElement(screen.getByRole('searchbox'))
    expect(region).not.toContainElement(screen.getByRole('combobox', { name: 'Age' }))
    expect(region).not.toContainElement(screen.getByRole('tablist'))
    expect(region).not.toContainElement(screen.getByRole('button', { name: 'Compact layout' }))
  })

  it('makes the horizontal category filter scroller keyboard-focusable without changing progress', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ discoveredIds: elements.map((element) => element.id) })
    renderShelf()
    const filters = screen.getByRole('tablist', { name: 'Element categories' })
    expect(filters).toHaveAttribute('tabindex', '0')
    expect(within(filters).getAllByRole('tab')).toHaveLength(9)
    const before = snapshotProgress(useGameStore.getState())
    act(() => filters.focus())
    expect(filters).toHaveFocus()
    await user.tab()
    expect(within(filters).getByRole('tab', { name: /^All/ })).toHaveFocus()
    act(() => within(filters).getByRole('tab', { name: /^Transport/ }).focus())
    await user.keyboard('{Enter}')
    expect(within(filters).getByRole('tab', { name: /^Transport/ })).toHaveAttribute('aria-selected', 'true')
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
  })

  it('preserves Space keyboard dragging and does not select an ingredient when completing or cancelling a drag', async () => {
    const user = userEvent.setup()
    const onSelected = vi.fn()
    renderShelf(onSelected)
    const fire = results().getByRole('button', { name: 'Fire' })
    fire.focus()
    await user.keyboard('[Space]')
    expect(fire).toHaveAttribute('data-dragging', 'true')
    await user.keyboard('[Enter]')
    expect(fire).toHaveAttribute('data-dragging', 'false')
    await user.keyboard('[Space]')
    expect(fire).toHaveAttribute('data-dragging', 'true')
    await user.keyboard('[Escape]')
    expect(fire).toHaveAttribute('data-dragging', 'false')
    expect(useGameStore.getState().firstSlotId).toBeNull()
    expect(useGameStore.getState().recentIngredientIds).toEqual([])
    expect(onSelected).not.toHaveBeenCalled()
  })

  it('refreshes recent shortcuts after prepared formulas and hides removed discoveries', () => {
    renderShelf()
    act(() => { useGameStore.getState().prepareCombination('ember', 'tide') })
    expect(screen.getByRole('button', { name: 'Use recent ingredient Water' })).toBeVisible()
    act(() => { useGameStore.setState({ discoveredIds: ['ember'] }) })
    expect(screen.queryByRole('button', { name: 'Use recent ingredient Water' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Use recent ingredient Fire' }))
    expect(useGameStore.getState().recentIngredientIds).toEqual(['ember'])
  })
})
