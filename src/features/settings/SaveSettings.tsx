import { Download, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { eras } from '../../game/content'
import { exportProgress, MAX_SAVE_BYTES, parseProgress, type SavedProgress } from '../../game/state/persistence'
import { useGameStore } from '../../game/state/useGameStore'

interface SaveSettingsProps {
  onClose: () => void
  onImported: () => void
}

const invalidSaveError = 'This save is invalid, unsupported, or larger than 1 MiB.'

function readSaveFile(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Unreadable save'))
    reader.onerror = () => reject(new Error('Unreadable save'))
    reader.onabort = () => reject(new Error('Read cancelled'))
    reader.readAsText(file)
  })
}

export function SaveSettings({ onClose, onImported }: SaveSettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const nativeModal = useRef(false)
  const readSequence = useRef(0)
  const [preview, setPreview] = useState<SavedProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const toggleSound = useGameStore((state) => state.toggleSound)
  const persistenceError = useGameStore((state) => state.persistenceError)
  const downloadSupported = typeof Blob === 'function' &&
    typeof URL.createObjectURL === 'function' && typeof URL.revokeObjectURL === 'function'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    try {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
        nativeModal.current = true
      } else {
        dialog.setAttribute('open', '')
      }
    } catch {
      dialog.setAttribute('open', '')
    }
    dialog.querySelector<HTMLButtonElement>('button')?.focus()
    return () => {
      readSequence.current += 1
      if (nativeModal.current && typeof dialog.close === 'function') dialog.close()
      nativeModal.current = false
      previousFocus?.focus()
    }
  }, [])

  function handleFallbackKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (nativeModal.current) return
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    )]
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  async function selectSave(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const sequence = ++readSequence.current
    setPreview(null)
    setError(null)
    if (file.size > MAX_SAVE_BYTES) {
      setReading(false)
      setError(invalidSaveError)
      return
    }
    setReading(true)
    try {
      const progress = parseProgress(await readSaveFile(file))
      if (sequence !== readSequence.current) return
      if (!progress) setError(invalidSaveError)
      else setPreview(progress)
    } catch {
      if (sequence === readSequence.current) setError(invalidSaveError)
    } finally {
      if (sequence === readSequence.current) {
        setReading(false)
        if (fileRef.current) fileRef.current.value = ''
      }
    }
  }

  function cancelImport() {
    readSequence.current += 1
    setReading(false)
    setPreview(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function confirmImport() {
    if (!preview || reading) return
    try {
      if (!useGameStore.getState().importProgress(preview)) {
        setError(useGameStore.getState().persistenceError ?? 'Progress could not be replaced.')
        return
      }
    } catch {
      setError('Progress could not be replaced.')
      return
    }
    onImported()
    onClose()
  }

  function downloadSave() {
    setError(null)
    let objectUrl: string | undefined
    let link: HTMLAnchorElement | undefined
    try {
      if (!downloadSupported) throw new Error('Downloads unavailable')
      const blob = new Blob([exportProgress(useGameStore.getState())], { type: 'application/json;charset=utf-8' })
      objectUrl = URL.createObjectURL(blob)
      link = document.createElement('a')
      link.href = objectUrl
      link.download = 'unwritten-atlas-save.json'
      document.body.append(link)
      link.click()
    } catch {
      setError('The save could not be exported. Downloads may be unavailable in this browser.')
    } finally {
      link?.remove()
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl)
        } catch {
          setError('The save download could not be completed.')
        }
      }
    }
  }

  const visibleError = error ?? persistenceError ?? (!downloadSupported ? 'Save downloads are unavailable in this browser.' : null)

  return (
    <dialog
      ref={dialogRef}
      className="save-dialog"
      aria-labelledby="settings-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={handleFallbackKeys}
    >
      <div className="dialog-heading">
        <h2 id="settings-title">Settings</h2>
        <button type="button" className="icon-button" aria-label="Close settings" title="Close settings" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <label className="sound-preference">
        <input type="checkbox" checked={soundEnabled} onChange={toggleSound} />
        Sound
      </label>
      <div className="dialog-actions">
        <button type="button" onClick={downloadSave} disabled={!downloadSupported}>
          <Download size={16} aria-hidden="true" /> Export save
        </button>
        <label className="save-file-label" htmlFor="save-file">
          <Upload size={16} aria-hidden="true" /> Import save
        </label>
        <input ref={fileRef} id="save-file" type="file" accept=".json,application/json" onChange={selectSave} aria-describedby={visibleError ? 'save-error' : undefined} />
      </div>
      {reading && <p role="status">Reading save...</p>}
      {preview && (
        <section className="save-preview" aria-labelledby="save-preview-title" aria-live="polite">
          <h3 id="save-preview-title">Save preview</h3>
          <p>{preview.discoveredIds.length} discoveries</p>
          <p>Current age: {eras.find((era) => era.id === preview.activeEraId)?.name ?? 'Origins'}</p>
          <div className="dialog-actions">
            <button type="button" onClick={confirmImport} disabled={reading}>Replace progress</button>
            <button type="button" onClick={cancelImport}>Cancel import</button>
          </div>
        </section>
      )}
      {reading && <button type="button" onClick={cancelImport}>Cancel import</button>}
      {visibleError && <p id="save-error" className="save-error" role="alert">{visibleError}</p>}
    </dialog>
  )
}