import { MAX_SAVE_BYTES, SAVE_KEY, parseProgress, type SavedProgress } from './persistence.ts'
import { createModuleSaveEnvelope, parseModuleSaveEnvelope, projectModuleProgress, type ModuleOwnership, type ModuleSaveEnvelope } from './moduleProgress.ts'
import { prepareModuleArchive, rebaseActiveModuleProgress, clearModuleArchiveProgress } from './moduleArchiveRules.ts'

export type DurableLoad =
  | { status: 'missing'; raw: null; archive: null }
  | { status: 'loaded'; raw: string; archive: ModuleSaveEnvelope; legacy: boolean }
  | { status: 'failed'; reason: 'invalid' | 'unavailable' }

export function readDurableModuleSave(): DurableLoad {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (raw === null) return { status: 'missing', raw: null, archive: null }
    const archive = parseModuleSaveEnvelope(raw)
    if (archive) return { status: 'loaded', raw, archive, legacy: false }
    const legacy = parseProgress(raw)
    if (legacy) return {
      status: 'loaded', raw, archive: createModuleSaveEnvelope(legacy, []), legacy: true,
    }
    return { status: 'failed', reason: 'invalid' }
  } catch {
    return { status: 'failed', reason: 'unavailable' }
  }
}

export const DURABLE_CONFLICT = 'Saved progress changed externally; the archive was not overwritten.'
export const DURABLE_INVALID = 'Existing save is invalid, unreadable, or from an unsupported version.'
export const DURABLE_LOCK = 'Web Locks are required for safe module progress writing.'

/**
 * Internal durable transaction manager. Production core-only sessions keep
 * the v7 writer; regional sessions use this service exclusively.
 * A successful migration replaces the same storage key only inside its lock,
 * after comparing the original raw bytes.
 */
export function createDurableModulePersistence(ownership: readonly ModuleOwnership[] = []) {
  const loaded = readDurableModuleSave()
  let baseline = loaded.status === 'loaded' ? loaded.raw : null
  let archive = loaded.status === 'loaded' ? loaded.archive : null
  let error: string | null = loaded.status === 'failed' ? DURABLE_INVALID : null
  let blocked = loaded.status === 'failed'
  const pending = new Set<Promise<boolean>>()
  let notify = (_error: string | null) => { void _error }

  function report(message: string | null) {
    error = message
    notify(error)
  }

  async function transact(next: (current: ModuleSaveEnvelope) => ModuleSaveEnvelope, commit?: () => void): Promise<boolean> {
    if (blocked) return false
    if (typeof navigator === 'undefined' || !navigator.locks?.request) {
      report(DURABLE_LOCK)
      blocked = true
      return false
    }
    const job = Promise.resolve().then(() => navigator.locks.request(
      SAVE_KEY + ':write', { mode: 'exclusive' }, () => {
        if (blocked) return false
        const disk = readDurableModuleSave()
        if (disk.status === 'failed') {
          blocked = true
          report(DURABLE_INVALID)
          return false
        }
        if (disk.raw !== baseline) {
          blocked = true
          report(DURABLE_CONFLICT)
          return false
        }
        try {
          const current = prepareModuleArchive(
            disk.status === 'loaded' ? disk.archive :
              createModuleSaveEnvelope(parseProgress(JSON.stringify({ version: 1, discoveredIds: [] }))!, []),
            ownership,
          )
          const candidate = next(current)
          const verified = prepareModuleArchive(candidate, ownership)
          const raw = JSON.stringify(verified)
          if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) {
            report('Module save exceeds the storage size limit.')
            return false
          }
          window.localStorage.setItem(SAVE_KEY, raw)
          archive = verified
          baseline = raw
          report(null)
          commit?.()
          return true
        } catch {
          report('Module progress could not be validated or saved.')
          return false
        }
      },
    )).catch(() => {
      blocked = true
      report(DURABLE_LOCK)
      return false
    })
    pending.add(job)
    void job.then(() => pending.delete(job))
    return job
  }

  async function writeActive(progress: SavedProgress, enabledIds: readonly string[], commit?: () => void) {
    return transact((current) => rebaseActiveModuleProgress(current, progress, enabledIds), commit)
  }

  async function resetAll(fresh: SavedProgress, commit?: () => void) {
    return transact((current) => clearModuleArchiveProgress(current, fresh), commit)
  }

  function synchronize(): ModuleSaveEnvelope | null {
    if (blocked) return null
    const disk = readDurableModuleSave()
    if (disk.status === 'failed') {
      blocked = true
      report(DURABLE_INVALID)
      return null
    }
    if (disk.raw === baseline) return null
    // External modifications are reported, not automatically merged with
    // potentially unsaved local changes.
    blocked = true
    report(DURABLE_CONFLICT)
    return null
  }

  async function flush() {
    while (pending.size > 0) await Promise.all([...pending])
  }

  return {
    get initial() { return archive },
    get error() { return error },
    get blocked() { return blocked },
    get raw() { return baseline },
    get active() { return archive ? projectModuleProgress(archive, ownership.map((owner) => owner.moduleId)).progress : null },
    onError(listener: (error: string | null) => void) { notify = listener },
    writeActive, resetAll, synchronize, flush,
  }
}
