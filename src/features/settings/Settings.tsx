import { X } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nativeModal = useRef(false)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const toggleSound = useGameStore((state) => state.toggleSound)
  const persistenceError = useGameStore((state) => state.persistenceError)

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
      {persistenceError && <p className="save-error" role="alert">{persistenceError}</p>}
    </dialog>
  )
}