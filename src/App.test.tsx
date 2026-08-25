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
    await user.click(screen.getByRole('button', { name: /Transmute/i }))

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
    expect(screen.getByText('2 formulas remain undeciphered.')).toBeInTheDocument()
  })

  it('allows the same element to fill both vessels', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('Discovered Heat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Heat' })).toBeInTheDocument()
  })

  it('explains why an empty table cannot transmute', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('The circle waits')).toBeInTheDocument()
    expect(screen.getByText('Two essences are required.')).toBeInTheDocument()
  })

  it('clears both vessels after an unsuccessful combination', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Air' }))
    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('No resonance')).toBeInTheDocument()
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
  })
})