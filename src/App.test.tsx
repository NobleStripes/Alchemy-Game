// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { useGameStore } from './game/state/useGameStore'

describe('alchemy worktable', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  afterEach(cleanup)

  it('discovers and persists an element through tap controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('Discovered Steam')).toBeInTheDocument()
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: 'Steam' }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'steam',
    )
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'first-vapor',
    )

    await user.click(screen.getByRole('button', { name: 'Inspect Steam' }))
    expect(screen.getByText('Fire + Water → Steam')).toBeInTheDocument()
    expect(screen.getByText('3 formulas remain undeciphered.')).toBeInTheDocument()
  })

  it('allows the same element to fill both vessels', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Use Fire again' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('Discovered Heat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Heat' })).toBeInTheDocument()
  })

  it('explains why an empty table cannot transmute', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('The circle waits')).toBeInTheDocument()
    expect(screen.getByText('Two essences are required.')).toBeInTheDocument()
  })

  it('retains slot I and records an unsuccessful combination', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Air' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('No resonance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Water' })).toBeInTheDocument()
    expect(screen.getAllByText('Empty vessel')).toHaveLength(1)
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'gale::tide',
    )

    await user.click(screen.getByRole('button', { name: 'Inspect Water' }))
    expect(screen.getByText('Tested, no reaction')).toBeInTheDocument()
    expect(screen.getByText('Air — no reaction')).toBeInTheDocument()
  })

  it('spends an Insight to reveal a viable combination', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      failedPairKeys: ['gale::tide', 'ember::heat', 'stone::steam'],
      insightFailureProgress: 3,
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))

    expect(screen.getByText('Fire + Water')).toBeInTheDocument()
    expect(screen.getByText('2 available')).toBeInTheDocument()
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'first-vapor',
    )
  })

  it('keeps every revealed, unperformed hint visible', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      failedPairKeys: ['gale::tide', 'ember::heat', 'stone::steam'],
      insightFailureProgress: 3,
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))
    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))
    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))

    expect(screen.getByText('Fire + Water')).toBeInTheDocument()
    expect(screen.getByText('Earth + Air')).toBeInTheDocument()
    expect(screen.getByText('Fire + Air')).toBeInTheDocument()
    expect(screen.getByText('0 available')).toBeInTheDocument()
  })

  it('locks Insights before Origins or three failures', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Insights locked' })).toBeDisabled()
    expect(
      screen.getByText('Insights unlock after Origins or 3 recorded failures.'),
    ).toBeInTheDocument()
  })

  it('earns Insight from five unique failures and resets on discovery', () => {
    useGameStore.setState({
      insightCredits: 1,
      insightFailureProgress: 4,
      failedPairKeys: ['a::b', 'a::c', 'a::d', 'a::e'],
      firstSlotId: 'tide',
      secondSlotId: 'gale',
    })

    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 2,
      insightFailureProgress: 0,
    })

    useGameStore.setState({
      insightFailureProgress: 3,
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })
    useGameStore.getState().transmute()
    expect(useGameStore.getState().insightFailureProgress).toBe(0)
  })

  it('gates later recipes until Stone Age unlocks', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale', 'clay'],
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Clay' }))
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('A later page')).toBeInTheDocument()
    expect(
      screen.getByText(
        'The Stone Age must be unlocked first. Recorded as an open lead.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Clay + Fire')).toBeInTheDocument()
  })

  it('unlocks Stone Age and grants Human from Origins landmarks', () => {
    useGameStore.setState({
      discoveredIds: [
        'ember',
        'tide',
        'stone',
        'gale',
        'life',
        'land',
        'tree',
        'rock',
      ],
      firstSlotId: 'life',
      secondSlotId: 'land',
      insightCredits: 1,
    })

    useGameStore.getState().transmute()
    render(<App />)

    expect(screen.getByRole('button', { name: 'Human' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'The Stone Age' })).toBeEnabled()
    expect(screen.getByText(/The Stone Age unlocked/)).toBeInTheDocument()
    expect(useGameStore.getState().insightCredits).toBe(2)
  })

  it('awards a completed challenge once and keeps known formulas neutral', () => {
    const origins = [
      'life',
      'land',
      'tree',
      'rock',
      'animal',
      'ember',
      'tide',
      'stone',
      'gale',
      'heat',
      'sea',
      'wind',
      'steam',
      'dust',
      'spark',
      'clay',
      'metal',
      'soil',
    ]
    useGameStore.setState({
      discoveredIds: origins,
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 1,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: [],
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })

    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 3,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: ['first-light'],
    })

    useGameStore.setState({ firstSlotId: 'ember', secondSlotId: 'tide' })
    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 3,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: ['first-light'],
    })
  })

  it('filters Guide entries to the active era while keeping the Codex global', () => {
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale', 'human', 'brick'],
      unlockedEraIds: ['first-light', 'stone-age'],
      activeEraId: 'stone-age',
    })
    render(<App />)

    expect(screen.getByRole('button', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Inspect Fire' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Inspect Human' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inspect Brick' })).toBeInTheDocument()
  })

  it('removes stale failure history when a pair succeeds', () => {
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale'],
      failedPairKeys: ['ember::tide'],
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })

    useGameStore.getState().transmute()

    expect(useGameStore.getState().failedPairKeys).not.toContain('ember::tide')
  })

  it('shows category progress and marks only elements with outgoing uses unstudied', () => {
    render(<App />)

    expect(screen.getByLabelText('Essence: 4 of 6')).toBeInTheDocument()
    expect(screen.getByLabelText('Weather: 0 of 8')).toBeInTheDocument()

    expect(screen.getAllByText('Unstudied').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Inspect Fire' }),
    ).toHaveTextContent('Unstudied')
  })
})