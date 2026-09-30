// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportProgress, MAX_SAVE_BYTES, parseProgress } from '../../game/state/persistence'
import { useGameStore } from '../../game/state/useGameStore'
import { SaveSettings } from './SaveSettings'

const callbacks = () => ({ onClose: vi.fn(), onImported: vi.fn() })
const validRaw = JSON.stringify({ version: 1, discoveredIds: ['steam'] })
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetProgress()
  useGameStore.setState({ soundEnabled: true })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:save')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
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

async function upload(raw = validRaw) {
  await userEvent.setup().upload(screen.getByLabelText('Import save'), new File([raw], 'atlas.json', { type: 'application/json' }))
}

describe('save settings', () => {
  it('previews without mutation, then imports only on explicit replacement', async () => {
    const props = callbacks()
    const importSpy = vi.spyOn(useGameStore.getState(), 'importProgress')
    render(<SaveSettings {...props} />)
    const before = exportProgress(useGameStore.getState())
    await upload()
    expect(await screen.findByText('5 discoveries')).toBeInTheDocument()
    expect(screen.getByText('Current age: Origins')).toBeInTheDocument()
    expect(importSpy).not.toHaveBeenCalled()
    expect(exportProgress(useGameStore.getState())).toBe(before)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Replace progress' }))
    expect(importSpy).toHaveBeenCalledOnce()
    expect(useGameStore.getState().discoveredIds).toContain('steam')
    expect(props.onImported).toHaveBeenCalledOnce()
    expect(props.onClose).toHaveBeenCalledOnce()
  })

  it('cancels a preview and an empty file selection without changing progress', async () => {
    render(<SaveSettings {...callbacks()} />)
    const before = exportProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    await upload()
    await screen.findByText('5 discoveries')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel import' }))
    fireEvent.change(screen.getByLabelText('Import save'), { target: { files: [] } })
    expect(screen.queryByRole('button', { name: 'Replace progress' })).not.toBeInTheDocument()
    expect(exportProgress(useGameStore.getState())).toBe(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
  })

  it.each(['not json', JSON.stringify({ version: 100, discoveredIds: [] }), JSON.stringify({ version: 7 })])('rejects invalid or unsupported saves: %s', async (raw) => {
    render(<SaveSettings {...callbacks()} />)
    const before = exportProgress(useGameStore.getState())
    await upload(raw)
    expect(await screen.findByRole('alert')).toHaveTextContent('invalid, unsupported, or larger than 1 MiB')
    expect(screen.queryByRole('button', { name: 'Replace progress' })).not.toBeInTheDocument()
    expect(exportProgress(useGameStore.getState())).toBe(before)
  })

  it('rejects oversized saves before reading them', async () => {
    render(<SaveSettings {...callbacks()} />)
    const file = new File(['{}'], 'atlas.json', { type: 'application/json' })
    Object.defineProperty(file, 'size', { value: MAX_SAVE_BYTES + 1 })
    const text = vi.fn().mockResolvedValue(validRaw)
    Object.defineProperty(file, 'text', { value: text })
    await userEvent.setup().upload(screen.getByLabelText('Import save'), file)
    expect(await screen.findByRole('alert')).toHaveTextContent('larger than 1 MiB')
    expect(text).not.toHaveBeenCalled()
  })

  it('reads File.text when available and reports read failures', async () => {
    render(<SaveSettings {...callbacks()} />)
    const file = new File([''], 'atlas.json', { type: 'application/json' })
    const text = vi.fn().mockResolvedValue(validRaw)
    Object.defineProperty(file, 'text', { value: text })
    await userEvent.setup().upload(screen.getByLabelText('Import save'), file)
    await screen.findByText('5 discoveries')
    expect(text).toHaveBeenCalledOnce()
    text.mockRejectedValue(new Error('denied'))
    await userEvent.setup().upload(screen.getByLabelText('Import save'), file)
    expect(await screen.findByRole('alert')).toHaveTextContent('invalid, unsupported')
  })

  it('keeps preview and progress intact when storage rejects replacement', async () => {
    const props = callbacks()
    render(<SaveSettings {...props} />)
    const before = exportProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    await upload()
    await screen.findByText('5 discoveries')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Replace progress' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Progress could not be saved')
    expect(exportProgress(useGameStore.getState())).toBe(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
    expect(screen.getByRole('button', { name: 'Replace progress' })).toBeEnabled()
    expect(props.onClose).not.toHaveBeenCalled()
    expect(props.onImported).not.toHaveBeenCalled()
  })

  it('exports the explicit campaign snapshot and releases the download URL', async () => {
    useGameStore.setState({ firstSlotId: 'ember', experimentHistory: [{ id: 1, inputs: ['tide', 'gale'], outcome: 'no-reaction' }] })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<SaveSettings {...callbacks()} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Export save' }))
    expect(click).toHaveBeenCalledOnce()
    const link = click.mock.instances[0] as HTMLAnchorElement
    expect(link.download).toBe('unwritten-atlas-save.json')
    expect(link.href).toBe('blob:save')
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    const raw = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(blob)
    })
    expect(parseProgress(raw)?.experimentHistory).toHaveLength(1)
    expect(JSON.parse(raw)).not.toHaveProperty('firstSlotId')
    expect(JSON.parse(raw)).not.toHaveProperty('prepareCombination')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:save')
    expect(link).not.toBeInTheDocument()
  })

  it('reports export failures and still revokes created URLs', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { throw new Error('blocked') })
    render(<SaveSettings {...callbacks()} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Export save' }))
    expect(screen.getByRole('alert')).toHaveTextContent('could not be exported')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:save')
  })

  it('disables unsupported downloads and persists the sound checkbox', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => '')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: undefined })
    render(<SaveSettings {...callbacks()} />)
    expect(screen.getByRole('button', { name: 'Export save' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('unavailable')
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Sound' }))
    expect(useGameStore.getState().soundEnabled).toBe(false)
    expect(JSON.parse(localStorage.getItem('unwritten-atlas-progress')!).soundEnabled).toBe(false)
  })

  it('opens a native modal, handles cancel, and restores focus on unmount', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.setAttribute('open', '') })
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(() => {})
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const props = callbacks()
    const view = render(<SaveSettings {...props} />)
    expect(showModal).toHaveBeenCalledOnce()
    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveFocus()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(props.onClose).toHaveBeenCalledOnce()
    view.unmount()
    expect(close).toHaveBeenCalledOnce()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('contains fallback keyboard focus and handles Escape', async () => {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(() => { throw new Error('Not implemented') })
    const props = callbacks()
    render(<SaveSettings {...props} />)
    const user = userEvent.setup()
    await user.tab({ shift: true })
    expect(screen.getByLabelText('Import save')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close settings' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('open'))
  })
})