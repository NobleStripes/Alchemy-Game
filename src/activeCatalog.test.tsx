// @vitest-environment jsdom
import { setTestGameStore } from './game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import App from './App'
import { coreRuntimeCatalog as core } from './game/modules/runtimeCatalog'
import { installedRegionalModules } from './game/modules/installed'
import { exportProgress, freshProgress, SAVE_KEY } from './game/state/persistence'
import { createGameStore, snapshotProgress } from './game/state/useGameStore'

afterEach(cleanup)

it('uses one regional catalog across Play, formula context, Atlas, and an isolated saved challenge', async () => {
  const pack = installedRegionalModules[0]
  const recipe = pack.recipes[1]
  const element = pack.elements[1]
  localStorage.setItem(SAVE_KEY, exportProgress({
    ...freshProgress(),
    discoveredIds: [...core.starterElementIds, ...recipe.inputs],
    unlockedEraIds: core.eras.map((era) => era.id),
    activeEraId: 'classical-antiquity',
    insightCredits: 1,
  }))
  const store = createGameStore({ mode: 'internal-regional', enabledModuleIds: ['achaemenid'] })
  setTestGameStore(store)
  const expectedCount = store.getState().discoveredIds.length + 1
  const user = userEvent.setup()
  render(<App />)
  expect(screen.queryByRole('button', { name: `Inspect ${element.name}` })).not.toBeInTheDocument()
  act(() => { store.getState().prepareCombination(...recipe.inputs) })
  const worktable = screen.getByRole('main', { name: 'What will you make?' })
  expect(worktable).toHaveTextContent('Road Network')
  expect(worktable).toHaveTextContent('Imperial Bureaucracy')
  await user.click(within(worktable).getByRole('button', { name: 'Combine' }))
  await act(async () => { await store.flushProgress() })
  expect(worktable).toHaveTextContent(`Discovered ${element.name}`)
  expect(screen.getByLabelText(`${Math.round(expectedCount / 228 * 100)}% discovered`))
    .toHaveTextContent(`${expectedCount} / 228`)
  expect(screen.getByRole('button', { name: `Inspect ${element.name}` })).toBeVisible()
  expect(screen.getByRole('region', { name: 'Classical Antiquity challenge' })).toHaveTextContent('Catalogue 2/6')
  expect(screen.getByRole('button', { name: element.name })).toBeVisible()
  await user.click(screen.getByRole('button', { name: `Favorite ${element.name}` }))
  await user.click(screen.getByText('Recorded Formulas (1)', { selector: 'summary' }))
  const formulas = screen.getByRole('list', { name: 'Recorded formula archive' })
  await user.click(within(formulas).getByText('Historical context: Symbolic association'))
  expect(formulas).toHaveTextContent(pack.reviews[1].caution)
  expect(within(formulas).getByRole('link', { name: 'Commerce ii. In the Achaemenid Period' })).toBeVisible()
  expect(screen.getByRole('list', { name: 'Collection goals' })).toHaveTextContent('Imperial Connections')

  await user.click(screen.getByRole('button', { name: 'Atlas' }))
  await user.click(screen.getByRole('button', { name: `Open historical entry for ${element.name}` }))
  const article = screen.getByRole('article', { name: element.name })
  expect(article).toHaveTextContent(pack.research.records[1].historicalOverview.text)
  expect(within(article).getByRole('link', { name: 'Commerce ii. In the Achaemenid Period' })).toBeVisible()
  const credits = store.getState().insightCredits
  await user.click(within(article).getByRole('button', { name: `Mark ${element.name} as read` }))
  expect(store.getState().insightCredits).toBe(credits)
  expect(store.getState().readHistoricalElementIds).toContain(element.id)

  await user.click(screen.getByRole('button', { name: 'Challenges' }))
  expect(screen.getAllByRole('article')).toHaveLength(13)
  await user.click(screen.getByRole('button', { name: 'Play Imperial Communications' }))
  const beforeRun = snapshotProgress(store.getState())
  await user.click(screen.getByRole('button', { name: 'Challenge Road Network' }))
  await user.click(screen.getByRole('button', { name: 'Challenge Imperial Bureaucracy' }))
  await user.click(screen.getByRole('button', { name: 'Combine challenge elements' }))
  expect(screen.getByRole('status')).toHaveTextContent(element.name)
  await user.click(screen.getByRole('button', { name: 'Save result' }))
  await act(async () => { await store.flushProgress() })
  expect(screen.getByText('Result saved. First reward: +1 Insight.')).toBeVisible()
  expect(store.getState().discoveredIds).toEqual(beforeRun.discoveredIds)
  expect(store.getState().discoveredRecipeIds).toEqual(beforeRun.discoveredRecipeIds)
  expect(store.getState().persistenceError).toBeNull()
  const reloaded = createGameStore({ mode: 'internal-regional', enabledModuleIds: ['achaemenid'] })
  expect(reloaded.getState().favoriteIds).toContain(element.id)
  expect(reloaded.getState().readHistoricalElementIds).toContain(element.id)
  expect(reloaded.getState().challengeRecords).toEqual([{
    challengeId: pack.challenges[0].id, completed: true, bestAttemptCount: 1,
  }])
}, 10000)
