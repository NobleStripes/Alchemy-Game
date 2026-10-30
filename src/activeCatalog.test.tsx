// @vitest-environment jsdom
import { setTestGameStore } from './game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import App from './App'
import { coreRuntimeCatalog as core } from './game/content/runtimeCatalog'
import { legacyArchive, legacyOwnership } from './game/state/legacyArchiveFixture'
import { SAVE_KEY } from './game/state/persistence'
import { createGameStore, snapshotProgress } from './game/state/useGameStore'
import { parseModuleSaveEnvelope } from './game/state/moduleProgress'

afterEach(cleanup)

it('keeps every UI surface base-only when an older save selected DLC, without writing on navigation', async () => {
  const archived = JSON.stringify(legacyArchive())
  localStorage.setItem(SAVE_KEY, archived)
  const store = createGameStore()
  setTestGameStore(store)
  const before = snapshotProgress(store.getState())
  const user = userEvent.setup()
  render(<App />)
  expect(store.getState().catalog).toBe(core)
  expect(screen.queryByRole('combobox', { name: 'Region' })).toBeNull()
  expect(screen.queryByRole('region', { name: 'Core and regional discovery progress' })).toBeNull()
  expect(screen.queryByText('Achaemenid Royal Road')).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Challenges' }))
  expect(screen.getByRole('button', { name: 'Play Rainmaker' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Play Imperial Communications' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Atlas' }))
  expect(screen.getByRole('button', { name: 'Open historical entry for Fire (read)' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Open historical entry for Achaemenid Royal Road' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Open settings' }))
  const settings = within(screen.getByRole('dialog', { name: 'Settings' }))
  expect(settings.getByRole('button', { name: 'Export saved progress' })).toBeVisible()
  expect(settings.queryByRole('group', { name: 'Regional Modules' })).toBeNull()
  expect(settings.queryByRole('button', { name: /Enable|Disable/ })).toBeNull()
  await user.click(settings.getByRole('button', { name: 'Close settings' }))
  expect(snapshotProgress(store.getState())).toEqual(before)
  expect(localStorage.getItem(SAVE_KEY)).toBe(archived)
}, 10000)

it('plays and reloads core combinations while preserving legacy records and reward receipts', async () => {
  const archive = legacyArchive()
  localStorage.setItem(SAVE_KEY, JSON.stringify(archive))
  const store = createGameStore()
  setTestGameStore(store)
  const user = userEvent.setup()
  render(<App />)
  act(() => { store.getState().prepareCombination('ember', 'tide') })
  await user.click(within(screen.getByRole('main', { name: 'What will you make?' })).getByRole('button', { name: 'Combine' }))
  await act(async () => { await store.flushProgress() })
  expect(store.getState().lastAttempt?.kind).toBe('known')
  const saved = parseModuleSaveEnvelope(localStorage.getItem(SAVE_KEY)!)!
  for (const id of legacyOwnership.elementIds) expect(saved.progress.discoveredIds).toContain(id)
  expect(saved.progress.challengeRecords).toEqual(archive.progress.challengeRecords)
  expect(saved.progress.rewardedCollectionIds).toEqual(archive.progress.rewardedCollectionIds)
  expect(createGameStore().getState().catalog).toBe(core)
  expect(createGameStore().getState().challengeRecords).toEqual([archive.progress.challengeRecords[0]])
})
