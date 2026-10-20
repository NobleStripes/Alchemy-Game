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
import { parseModuleSaveEnvelope } from './game/state/moduleProgress'

afterEach(cleanup)

it('plays all three pilot formulas, reads their full histories, saves the lab explicitly, and restores receipts after switching', async () => {
  const pack = installedRegionalModules[0]
  localStorage.setItem(SAVE_KEY, exportProgress({
    ...freshProgress(),
    discoveredIds: [...new Set([...core.starterElementIds, ...pack.recipes.flatMap((recipe) => recipe.inputs)])],
    unlockedEraIds: core.eras.map((era) => era.id),
    activeEraId: 'classical-antiquity', insightCredits: 1,
  }))
  let store = createGameStore()
  await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
  store = createGameStore()
  setTestGameStore(store)
  const coreCount = store.getState().discoveredIds.length
  const coreAgeCount = core.elements.filter((element) =>
    element.era === 'classical-antiquity' && store.getState().discoveredIds.includes(element.id)).length
  const user = userEvent.setup()
  let view = render(<App />)
  const worktable = screen.getByRole('main', { name: 'What will you make?' })
  const shelf = within(screen.getByRole('region', { name: 'Matching discovered elements' }))
  const discoveryProgress = screen.getByRole('region', { name: 'Core and regional discovery progress' })
  expect(discoveryProgress).toHaveTextContent(`Core discoveries: ${coreCount}/225`)
  expect(discoveryProgress).toHaveTextContent(`${pack.manifest.title}: 0/3`)
  for (const recipe of pack.recipes) {
    act(() => { store.getState().clearAllSlots() })
    for (const id of recipe.inputs) {
      await user.click(shelf.getByRole('button', { name: core.elementsById.get(id)!.name }))
    }
    await user.click(within(worktable).getByRole('button', { name: 'Combine' }))
    const element = store.getState().catalog.elementsById.get(recipe.result)!
    expect(worktable).toHaveTextContent(`Discovered ${element.name}`)
    expect(worktable.querySelector('img.element-photo-icon'))
      .toHaveAttribute('src', `${import.meta.env.BASE_URL}${element.image!.thumbnailSrc ?? element.image!.src}`)
    await user.click(shelf.getByRole('button', { name: `Favorite ${element.name}` }))
  }
  expect(discoveryProgress).toHaveTextContent(`${pack.manifest.title}: 3/3`)
  expect(discoveryProgress).toHaveTextContent(`Core discoveries: ${coreCount}/225`)
  expect(screen.getByRole('region', { name: 'Classical Antiquity challenge' }))
    .toHaveTextContent(`Catalogue ${coreAgeCount}/6`)
  const collection = within(screen.getByRole('list', { name: 'Collection goals' }))
    .getByText('Imperial Connections').closest('li')!
  expect(collection).toHaveTextContent('3/3')
  expect(collection).toHaveTextContent('+1 Insight reward earned')
  expect(store.getState().rewardedCollectionIds).toContain('achaemenid-connections')

  const readingCredits = store.getState().insightCredits
  await user.click(screen.getByRole('button', { name: 'Atlas' }))
  for (const record of pack.research.records) {
    await user.click(screen.getByRole('button', { name: `Open historical entry for ${record.elementName}` }))
    const article = within(screen.getByRole('article', { name: record.elementName }))
    const image = pack.elements.find((element) => element.id === record.elementId)!.image!
    const figure = within(article.getByRole('figure', { name: `${record.elementName} image and credit` }))
    expect(figure.getByRole('img', { name: image.description })).toBeVisible()
    expect(figure.getByRole('link', { name: image.license })).toHaveAttribute('href', image.licenseUrl)
    expect(article.getByRole('heading', { name: 'Sources and references' })).toBeVisible()
    expect(article.getByText(record.historicalOverview.text)).toBeVisible()
    expect(article.getByText(record.manufactureOrUse.text)).toBeVisible()
    for (const id of record.historicalOverview.sourceIds) {
      const source = store.getState().catalog.sources.find((entry) => entry.id === id)!
      expect(article.getByRole('link', { name: source.title })).toBeVisible()
    }
    await user.click(article.getByRole('button', { name: `Mark ${record.elementName} as read` }))
  }
  expect(store.getState().insightCredits).toBe(readingCredits)
  await act(async () => { await store.flushProgress() })
  await user.click(screen.getByRole('button', { name: 'Challenges' }))
  await user.click(screen.getByRole('button', { name: 'Play Imperial Communications' }))
  const beforeRun = snapshotProgress(store.getState())
  const storedBeforeRun = localStorage.getItem(SAVE_KEY)
  await user.click(screen.getByRole('button', { name: 'Challenge Road Network' }))
  await user.click(screen.getByRole('button', { name: 'Challenge Imperial Bureaucracy' }))
  await user.click(screen.getByRole('button', { name: 'Combine challenge elements' }))
  const labImages = screen.getByRole('region', { name: 'Imperial Communications' }).querySelectorAll('img.element-photo-icon')
  expect(labImages).toHaveLength(2)
  for (const image of labImages) {
    expect(image).toHaveAttribute('src', `${import.meta.env.BASE_URL}images/achaemenid/royal-road.jpg`)
  }
  expect(snapshotProgress(store.getState())).toEqual(beforeRun)
  expect(localStorage.getItem(SAVE_KEY)).toBe(storedBeforeRun)
  await user.click(screen.getByRole('button', { name: 'Save result' }))
  await act(async () => { await store.flushProgress() })
  expect(store.getState().challengeRecords).toEqual([{
    challengeId: 'achaemenid-courier-lab', completed: true, bestAttemptCount: 1,
  }])
  const complete = parseModuleSaveEnvelope(localStorage.getItem(SAVE_KEY)!)!.progress
  view.unmount()

  await store.confirmSaveReplacement(await store.previewModules([]))
  expect(parseModuleSaveEnvelope(localStorage.getItem(SAVE_KEY)!)!.progress).toEqual(complete)
  store = createGameStore()
  setTestGameStore(store)
  view = render(<App />)
  expect(screen.queryByRole('combobox', { name: 'Region' })).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Core and regional discovery progress' })).not.toBeInTheDocument()
  for (const element of pack.elements) {
    expect(screen.queryByRole('button', { name: element.name })).not.toBeInTheDocument()
  }
  await user.click(screen.getByRole('button', { name: 'Challenges' }))
  expect(screen.queryByRole('button', { name: 'Play Imperial Communications' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Atlas' }))
  for (const element of pack.elements) {
    expect(screen.queryByRole('button', { name: `Open historical entry for ${element.name}` })).not.toBeInTheDocument()
  }
  view.unmount()

  await store.confirmSaveReplacement(await store.previewModules(['achaemenid']))
  expect(parseModuleSaveEnvelope(localStorage.getItem(SAVE_KEY)!)!.progress).toEqual(complete)
  store = createGameStore()
  setTestGameStore(store)
  view = render(<App />)
  expect(store.getState().favoriteIds).toEqual(pack.elements.map((element) => element.id))
  expect(store.getState().readHistoricalElementIds).toEqual(pack.elements.map((element) => element.id))
  expect(snapshotProgress(store.getState())).toEqual(snapshotProgress(complete))
  expect(screen.getByRole('list', { name: 'Collection goals' })).toHaveTextContent('+1 Insight reward earned')
  await user.click(screen.getByRole('button', { name: 'Challenges' }))
  const card = screen.getByRole('article', { name: 'Imperial Communications' })
  expect(card).toHaveTextContent('Completed')
  expect(card).toHaveTextContent(/Best.*1/)
  expect(await store.getState().recordChallengeCompletion('achaemenid-courier-lab', 1))
    .toMatchObject({ saved: true, firstCompletion: false, insightEarned: 0 })
  view.unmount()
}, 15000)

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
