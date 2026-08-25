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

    await user.click(screen.getByRole('button', { name: /Fire/i }))
    await user.click(screen.getByRole('button', { name: /Water/i }))
    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('Discovered Steam')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Steam/i }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'steam',
    )
  })

  it('allows the same element to fill both vessels', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('Discovered Heat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Heat/i })).toBeInTheDocument()
  })

  it('explains why an empty table cannot transmute', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Transmute/i }))

    expect(screen.getByText('The circle waits')).toBeInTheDocument()
    expect(screen.getByText('Two essences are required.')).toBeInTheDocument()
  })
})