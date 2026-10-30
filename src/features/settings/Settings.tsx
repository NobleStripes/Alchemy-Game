import { X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { MAX_SAVE_BYTES } from '../../game/state/persistence'
import type { SavePreview } from '../../game/state/saveManagement'
import { useGameStore } from '../../game/state/useGameStore'

interface SettingsProps {
  onClose: () => void
  hasActiveChallenge?: boolean
  onReload?: () => void
}

export function Settings({ onClose, hasActiveChallenge = false, onReload = () => window.location.reload() }: SettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nativeModal = useRef(false)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const toggleSound = useGameStore((state) => state.toggleSound)
  const persistenceError = useGameStore((state) => state.persistenceError)
  const saveFormat = useGameStore((state) => state.saveFormat)
  const reloadRequired = useGameStore((state) => state.reloadRequired)
  const [preview, setPreview] = useState<SavePreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const previewHeading = useRef<HTMLHeadingElement>(null)
  const previewTrigger = useRef<HTMLElement | null>(null)
  const reloadButton = useRef<HTMLButtonElement>(null)
  const locked = busy || reloadRequired

  useEffect(() => {
    if (reloadRequired) reloadButton.current?.focus()
    else if (preview) previewHeading.current?.focus()
    else if (previewTrigger.current) {
      previewTrigger.current.focus()
      previewTrigger.current = null
    }
  }, [preview, reloadRequired])

  async function run(operation: () => Promise<void>) {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await operation()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  function importFile(file: File, trigger: HTMLInputElement) {
    previewTrigger.current = trigger
    void run(async () => {
      if (file.size > MAX_SAVE_BYTES) throw new Error('Save exceeds the 1 MiB size limit.')
      const raw = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string'
          ? resolve(reader.result) : reject(new Error('Save file could not be read.'))
        reader.onerror = () => reject(new Error('Save file could not be read.'))
        reader.onabort = () => reject(new Error('Save file reading was cancelled.'))
        reader.readAsText(file)
      })
      setPreview(await useGameStore.previewImport(raw))
    })
  }

  function exportSave() {
    void run(async () => {
      const raw = await useGameStore.exportSave()
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
      const link = document.createElement('a')
      try {
        link.href = url
        link.download = 'unwritten-atlas-save.json'
        document.body.append(link)
        link.click()
        setNotice('Stored save exported. Unsaved changes after a save error are not included.')
      } finally {
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 0)
      }
    })
  }

  function confirmReplacement() {
    if (!preview) return
    void run(async () => {
      await useGameStore.confirmSaveReplacement(preview)
      onReload()
    })
  }

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
      if (!locked) onClose()
    }
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
      'button, input, a[href], [tabindex="0"]',
    )].filter((control) => !control.matches(':disabled'))
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
        if (!locked) onClose()
      }}
      onKeyDown={handleFallbackKeys}
    >
      <div className="dialog-heading">
        <h2 id="settings-title">Settings</h2>
        <button type="button" className="icon-button" aria-label="Close settings" title="Close settings" disabled={locked} onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <label className="sound-preference">
        <input type="checkbox" checked={soundEnabled} disabled={locked || preview !== null} onChange={toggleSound} />
        Sound
      </label>
      {persistenceError && <p className="save-error" role="alert">{persistenceError}</p>}
      {error && <p className="save-error" role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {reloadRequired ? (
        <section aria-labelledby="reload-title">
          <h3 id="reload-title">Save updated; reload required</h3>
          <p>The current session is paused to prevent it from overwriting the new save. Reload clears prepared slots, transient hints and any unfinished challenge run.</p>
          <button ref={reloadButton} type="button" onClick={onReload}>Reload game</button>
        </section>
      ) : (
        <>
          <fieldset className="settings-controls" disabled={busy || preview !== null}>
            <legend>Save backup and restore</legend>
            <p>Current format: {saveFormat === 'archive' ? 'legacy archive (base game only)' : 'v7'}. Exports include all stored inactive records. Unsaved in-memory changes after an error are not included.</p>
            <button type="button" onClick={exportSave}>Export saved progress</button>
            <label className="save-file-label">
              Import save file (legacy v1-7 or module archive; up to 1 MiB)
              <input type="file" accept=".json,application/json" disabled={persistenceError !== null} onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) importFile(file, event.currentTarget)
              }} />
            </label>
            <p>Import first shows a validated preview. Nothing is replaced until you explicitly confirm.</p>
          </fieldset>
          {preview && (
            <section className="save-preview" aria-labelledby="save-preview-title">
              <h3 id="save-preview-title" tabIndex={-1} ref={previewHeading}>
                Review save replacement
              </h3>
              <p>New format: {preview.format === 'archive' ? 'legacy archive (base game only)' : 'v7'}</p>
              <dl>
                <dt>Total discoveries</dt><dd>{preview.totalDiscoveries}</dd>
                <dt>Visible discoveries</dt><dd>{preview.activeDiscoveries}</dd>
                <dt>Dormant discoveries (preserved)</dt><dd>{preview.dormantDiscoveries}</dd>
                <dt>Performed recipes</dt><dd>{preview.performedRecipes}</dd>
                <dt>Favorites / reading marks</dt><dd>{preview.favorites} / {preview.readingMarks}</dd>
                <dt>Reward receipts / stored experiments</dt><dd>{preview.rewardReceipts} / {preview.experiments}</dd>
              </dl>
              {preview.warnings.map((warning) => <p key={warning}>{warning}</p>)}
              <p>Export a backup before continuing. Reload clears prepared ingredients and transient challenge state; persisted Open Leads and dormant records in the resulting save are preserved.</p>
              {hasActiveChallenge && <p className="save-error">A challenge run is open. Reload discards it, including any result not explicitly saved.</p>}
              <div className="settings-actions">
                <button type="button" disabled={busy} onClick={exportSave}>Export backup before replacing</button>
                <button type="button" disabled={busy} onClick={() => setPreview(null)}>Cancel replacement</button>
                <button type="button" disabled={busy} onClick={confirmReplacement}>
                  Replace all progress and reload
                </button>
              </div>
            </section>
          )}
        </>
      )}
      {busy && <p role="status">Validating or saving progress. Please wait.</p>}
    </dialog>
  )
}