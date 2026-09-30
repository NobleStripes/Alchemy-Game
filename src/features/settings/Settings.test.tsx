// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadProgress } from '../../game/state/persistence'
import { useGameStore } from '../../game/state/useGameStore'
import { Settings } from './Settings'

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({ soundEnabled: true })
  useGameStore.getState().resetProgress()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', '') }),
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  if (originalShowModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

describe('settings', () => {
  it('contains no manual save controls and leaves progress unchanged', () => {
    useGameStore.getState().transmuteWith('ember', 'tide')
    useGameStore.getState().toggleFavorite('steam')
    const saved = localStorage.getItem('unwritten-atlas-progress')
    const view = render(<Settings onClose={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'Sound' })).toBeChecked()
    expect(screen.queryByRole('button', { name: /export|import|replace/i })).toBeNull()
    expect(view.container.querySelector('input[type="file"]')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
    expect(loadProgress()?.discoveredIds).toContain('steam')
    expect(loadProgress()?.favoriteIds).toContain('steam')
  })

  it('persists sound changes without changing campaign discoveries', async () => {
    useGameStore.getState().transmuteWith('ember', 'tide')
    const discoveries = [...useGameStore.getState().discoveredIds]
    render(<Settings onClose={vi.fn()} />)
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Sound' }))
    expect(screen.getByRole('checkbox', { name: 'Sound' })).not.toBeChecked()
    expect(loadProgress()?.soundEnabled).toBe(false)
    expect(loadProgress()?.discoveredIds).toEqual(discoveries)
  })

  it('reports local storage failures', async () => {
    render(<Settings onClose={vi.fn()} />)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Sound' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Progress could not be saved')
  })

  it('opens a modal, handles cancellation, and restores focus', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.setAttribute('open', '') })
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(() => {})
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const onClose = vi.fn()
    const view = render(<Settings onClose={onClose} />)
    expect(showModal).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveFocus()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledOnce()
    view.unmount()
    expect(close).toHaveBeenCalledOnce()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('contains fallback keyboard focus and handles Escape', async () => {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(() => { throw new Error('unsupported') })
    const onClose = vi.fn()
    render(<Settings onClose={onClose} />)
    const user = userEvent.setup()
    await user.tab({ shift: true })
    expect(screen.getByRole('checkbox', { name: 'Sound' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})