// @vitest-environment jsdom

import { setTestGameStore } from '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportProgress, freshProgress, loadProgress, MAX_SAVE_BYTES, SAVE_KEY } from '../../game/state/persistence'
import { createGameStore, useGameStore } from '../../game/state/useGameStore'
import { parseModuleSaveEnvelope } from '../../game/state/moduleProgress'
import { legacyArchive } from '../../game/state/legacyArchiveFixture'
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
  it('offers base-game settings and validated manual save controls without changing progress', () => {
    useGameStore.getState().transmuteWith('ember', 'tide')
    useGameStore.getState().toggleFavorite('steam')
    const saved = localStorage.getItem('unwritten-atlas-progress')
    render(<Settings onClose={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'Sound' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Export saved progress' })).toBeVisible()
    expect(screen.getByLabelText(/Import save file/)).toHaveAttribute('type', 'file')
    expect(screen.queryByRole('group', { name: 'Regional Modules' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Image credits and licenses' })).toBeNull()
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
    expect(screen.getByLabelText(/Import save file/)).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('previews archive imports, warns about an open challenge, supports cancellation and reloads only after confirmation', async () => {
    const onReload = vi.fn()
    const onClose = vi.fn()
    const original = localStorage.getItem(SAVE_KEY)
    render(<Settings onClose={onClose} onReload={onReload} hasActiveChallenge />)
    const user = userEvent.setup()
    const file = new File([JSON.stringify(legacyArchive())], 'archive.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/Import save file/), file)
    const heading = await screen.findByRole('heading', { name: 'Review save replacement' })
    expect(heading).toHaveFocus()
    expect(screen.getByText(/remain inactive/)).toBeVisible()
    expect(screen.getByText(/A challenge run is open/)).toBeVisible()
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
    expect(onReload).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancel replacement' }))
    expect(screen.getByLabelText(/Import save file/)).toHaveFocus()
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
    await user.upload(screen.getByLabelText(/Import save file/), file)
    await screen.findByRole('heading', { name: 'Review save replacement' })
    await user.click(screen.getByRole('button', { name: 'Replace all progress and reload' }))
    await waitFor(() => expect(onReload).toHaveBeenCalledOnce())
    expect(parseModuleSaveEnvelope(localStorage.getItem(SAVE_KEY)!)?.enabledModuleIds).toEqual([])
    expect(screen.getByRole('button', { name: 'Reload game' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Close settings' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
    expect(createGameStore().getState().catalog.elements).toHaveLength(225)
  })

  it('previews file imports without writing and requires explicit all-progress replacement', async () => {
    const onReload = vi.fn()
    const user = userEvent.setup()
    const imported = { ...freshProgress(), soundEnabled: false, favoriteIds: ['ember'] }
    const original = localStorage.getItem(SAVE_KEY)
    render(<Settings onClose={vi.fn()} onReload={onReload} />)
    const file = new File([exportProgress(imported)], 'backup.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/Import save file/), file)
    await screen.findByRole('heading', { name: 'Review save replacement' })
    expect(screen.getByText(/Import replaces ALL current progress/)).toBeVisible()
    expect(screen.getByText('Visible discoveries')).toBeVisible()
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
    expect(onReload).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancel replacement' }))
    expect(screen.queryByRole('heading', { name: 'Review save replacement' })).not.toBeInTheDocument()
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
    expect(onReload).not.toHaveBeenCalled()
    await user.upload(screen.getByLabelText(/Import save file/), file)
    await screen.findByRole('heading', { name: 'Review save replacement' })
    await user.click(screen.getByRole('button', { name: 'Replace all progress and reload' }))
    await waitFor(() => expect(onReload).toHaveBeenCalledOnce())
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(imported)
  })

  it('exports the exact stored save as a downloadable file without altering progress', async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:save-backup')
    const revokeObjectURL = vi.fn()
    const originalCreate = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    const originalRevoke = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    try {
      const original = localStorage.getItem(SAVE_KEY)
      render(<Settings onClose={vi.fn()} />)
      await userEvent.setup().click(screen.getByRole('button', { name: 'Export saved progress' }))
      await waitFor(() => expect(click).toHaveBeenCalledOnce())
      expect(click.mock.instances[0]).toHaveAttribute('download', 'unwritten-atlas-save.json')
      const blob = createObjectURL.mock.calls[0][0]
      const exported = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsText(blob)
      })
      expect(exported).toBe(original)
      expect(localStorage.getItem(SAVE_KEY)).toBe(original)
      await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:save-backup'))
    } finally {
      if (originalCreate) Object.defineProperty(URL, 'createObjectURL', originalCreate)
      else Reflect.deleteProperty(URL, 'createObjectURL')
      if (originalRevoke) Object.defineProperty(URL, 'revokeObjectURL', originalRevoke)
      else Reflect.deleteProperty(URL, 'revokeObjectURL')
    }
  })

  it('reports malformed and oversized file imports without replacing the existing save', async () => {
    const original = localStorage.getItem(SAVE_KEY)
    render(<Settings onClose={vi.fn()} />)
    const user = userEvent.setup()
    await user.upload(screen.getByLabelText(/Import save file/), new File(['{"version":99}'], 'future.json', { type: 'application/json' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid|unsupported/)
    expect(screen.queryByRole('heading', { name: 'Review save replacement' })).toBeNull()
    await user.upload(screen.getByLabelText(/Import save file/), new File(['x'.repeat(MAX_SAVE_BYTES + 1)], 'large.json', { type: 'application/json' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('1 MiB')
    expect(localStorage.getItem(SAVE_KEY)).toBe(original)
  })

  it('describes legacy archive backups without offering DLC activation', () => {
    const archive = legacyArchive()
    localStorage.setItem(SAVE_KEY, JSON.stringify(archive))
    setTestGameStore(createGameStore())
    render(<Settings onClose={vi.fn()} />)
    expect(screen.getByText(/legacy archive \(base game only\)/)).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Regional Modules' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Enable|Disable/ })).toBeNull()
    expect(localStorage.getItem(SAVE_KEY)).toBe(JSON.stringify(archive))
  })
})