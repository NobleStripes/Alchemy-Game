// @vitest-environment jsdom

import './game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { collections, elements, eras, recipes, starterElementIds } from './game/content'
import { historicalResearch } from './game/content/research'
import { exportProgress, SAVE_KEY, type SavedProgress } from './game/state/persistence'
import { createGameStore, snapshotProgress, useGameStore } from './game/state/useGameStore'

describe('alchemy worktable', () => {
  it('defaults to Play and separates two top-level sections from the three gameplay tabs', async () => {
    const user = userEvent.setup()
    render(<App />)
    const navigation = within(screen.getByRole('navigation', { name: 'Main navigation' }))
    expect(navigation.getAllByRole('button')).toHaveLength(2)
    expect(navigation.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'true')
    expect(navigation.getByRole('button', { name: 'Atlas' })).toHaveAttribute('aria-controls', 'atlas-section')
    expect(screen.getByRole('main', { name: 'Play' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Historical Encyclopedia' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Game panels' })).getAllByRole('button')).toHaveLength(3)
    await user.click(navigation.getByRole('button', { name: 'Atlas' }))
    expect(navigation.getByRole('button', { name: 'Atlas' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('main', { name: 'Atlas' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Historical Encyclopedia' })).toBeVisible()
    expect(screen.queryByRole('navigation', { name: 'Game panels' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Combine' })).not.toBeInTheDocument()
    expect(screen.getByText('The Unwritten Atlas')).toBeVisible()
  })

  it('focuses the active section heading and skips inactive controls during keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Play' })).toHaveFocus()
    await user.tab()
    const atlas = screen.getByRole('button', { name: 'Atlas' })
    expect(atlas).toHaveFocus()
    await user.keyboard('[Enter]')
    expect(atlas).toHaveAttribute('aria-pressed', 'true')
    expect(atlas).toHaveAccessibleDescription(/Historical Encyclopedia.*Reading is free/)
    expect(screen.getByRole('heading', { level: 1, name: 'Atlas' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('searchbox', { name: 'Search discovered historical entries' })).toHaveFocus()
    const play = screen.getByRole('button', { name: 'Play' })
    act(() => play.focus())
    await user.keyboard(' ')
    expect(play).toHaveAttribute('aria-pressed', 'true')
    expect(play).toHaveAccessibleDescription('Gameplay: Elements, Combine, and Guide.')
    expect(screen.getByRole('heading', { name: 'What will you make?' })).toHaveFocus()
    expect(screen.getByRole('main', { name: 'Play' })).toBeVisible()
    for (let step = 0; step < 20; step += 1) {
      await user.tab()
      expect(document.activeElement?.closest('#atlas-section')).toBeNull()
    }
  })

  it.each([
    ['Elements', 'Element shelf'],
    ['Guide', 'Discoveries'],
  ])('restores focus to the remembered %s gameplay panel without stealing mobile-tab focus', async (panel, heading) => {
    const user = userEvent.setup()
    render(<App />)
    const panelButton = screen.getByRole('button', { name: `Show ${panel} panel` })
    await user.click(panelButton)
    expect(panelButton).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Atlas' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(panelButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: heading })).toHaveFocus()
  })

  it('restores gameplay filters, Guide selection, mobile tab and prepared slots without saving on navigation', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ discoveredIds: [...useGameStore.getState().discoveredIds, 'metal'] })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search discovered elements' }), 'fire')
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    await user.click(screen.getByRole('button', { name: 'Inspect Metal' }))
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search discovered historical entries' }), 'smelting')
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Metal' }))
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('searchbox', { name: 'Search discovered elements' })).toHaveValue('fire')
    expect(screen.getByRole('heading', { name: 'Metal' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Show Guide panel' })).toHaveAttribute('aria-pressed', 'true')
    expect(useGameStore.getState()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'tide' })
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('searchbox', { name: 'Search discovered historical entries' })).toHaveValue('smelting')
    expect(screen.getByRole('article', { name: 'Metal' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(screen.getByRole('button', { name: 'Show Combine panel' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))
    expect(screen.getByText('Discovered Steam')).toBeInTheDocument()
  })

  it('reads discovered history from another age with shared free reading progress', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: [...useGameStore.getState().discoveredIds, 'writing'],
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'],
      activeEraId: 'stone-age',
      insightCredits: 0,
    })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.queryByRole('navigation', { name: 'Play ages' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Writing' }))
    expect(screen.getByRole('article', { name: 'Writing' })).toBeVisible()
    expect(useGameStore.getState().activeEraId).toBe('stone-age')
    await user.click(screen.getByRole('button', { name: 'Mark Writing as read' }))
    expect(useGameStore.getState()).toMatchObject({
      activeEraId: 'stone-age', insightCredits: 0, readHistoricalElementIds: ['writing'],
    })
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(within(screen.getByRole('navigation', { name: 'Play ages' })).getByRole('button', { name: /Stone Age/ }))
      .toHaveAttribute('aria-current', 'page')
    expect(JSON.parse(localStorage.getItem('unwritten-atlas-progress')!).readHistoricalElementIds).toEqual(['writing'])
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    await user.click(screen.getByRole('button', { name: 'Mark Writing as unread' }))
    expect(useGameStore.getState()).toMatchObject({
      activeEraId: 'stone-age', insightCredits: 0, readHistoricalElementIds: [],
    })
  })

  it('preserves unsaved Zustand state and mounted views without reconnecting or rewriting saves', async () => {
    const user = userEvent.setup()
    const connection = vi.spyOn(useGameStore, 'connectProgress')
    render(<App />)
    act(() => { useGameStore.getState().transmuteWith('stone', 'ember') })
    await useGameStore.flushProgress()
    act(() => {
      useGameStore.setState({
        unlockedEraIds: ['first-light', 'stone-age'],
        activeEraId: 'stone-age',
        firstSlotId: 'ember',
        secondSlotId: 'tide',
      })
    })
    const state = useGameStore.getState()
    const saved = localStorage.getItem('unwritten-atlas-progress')
    expect(JSON.parse(saved!).activeEraId).toBe('first-light')
    expect(state.lastAttempt).not.toBeNull()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const play = screen.getByRole('main', { name: 'Play' })
    const worktableControl = screen.getByRole('button', { name: 'Combine' })
    let atlas: HTMLElement | undefined
    for (let visit = 0; visit < 2; visit += 1) {
      await user.click(screen.getByRole('button', { name: 'Atlas' }))
      const currentAtlas = screen.getByRole('main', { name: 'Atlas' })
      if (atlas) expect(currentAtlas).toBe(atlas)
      atlas = currentAtlas
      expect(play).toBeInTheDocument()
      expect(play).not.toBeVisible()
      expect(worktableControl).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Open historical entry for Metal' }))
      expect(useGameStore.getState()).toBe(state)
      await user.click(screen.getByRole('button', { name: 'Play' }))
      expect(screen.getByRole('main', { name: 'Play' })).toBe(play)
      expect(screen.getByRole('button', { name: 'Combine' })).toBe(worktableControl)
      expect(screen.getByText('Discovered Metal')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Remove Fire' })).toBeVisible()
      expect(screen.getByRole('button', { name: 'Remove Water' })).toBeVisible()
      expect(useGameStore.getState()).toBe(state)
    }
    expect(connection).toHaveBeenCalledTimes(1)
    expect(writes).not.toHaveBeenCalled()
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
  })

  it('keeps gameplay research and all gameplay Guide surfaces separate from historical reading', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ revealedHintRecipeIds: ['first-vapor'] })
    render(<App />)
    const guide = screen.getByRole('complementary', { name: 'Discoveries' })
    const contents = within(guide)
    expect(contents.getByRole('region', { name: /Hints/ })).toBeVisible()
    expect(contents.getByText('Open leads')).toBeVisible()
    expect(contents.getByRole('region', { name: 'Origins challenge' })).toBeVisible()
    expect(contents.getByRole('list', { name: 'Collection goals' })).toBeVisible()
    for (const title of ['Collections', 'Recorded Formulas (0)', 'Recent Experiments', 'Element research', 'Learning Challenges']) {
      expect(contents.getByText(title, { selector: 'summary' })).toBeInTheDocument()
    }
    expect(contents.queryByRole('heading', { name: 'Historical Encyclopedia', hidden: true })).not.toBeInTheDocument()
    await user.click(contents.getByRole('button', { name: 'Inspect Fire' }))
    expect(contents.getByRole('heading', { name: 'Recorded formulas' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    const atlas = within(screen.getByRole('main', { name: 'Atlas' }))
    expect(atlas.getByRole('heading', { name: 'Atlas', level: 1 })).toBeVisible()
    expect(atlas.queryByRole('button', { name: /Reveal lead|Prepare / })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(contents.getByRole('heading', { name: 'Fire' })).toBeVisible()
  })

  it('loads an existing complete v7 campaign, preserves its fields, and persists only explicit reading and reset actions', async () => {
    await useGameStore.flushProgress()
    const progress: SavedProgress = {
      version: 7,
      ...snapshotProgress(useGameStore.getState()),
      discoveredIds: [...new Set([...starterElementIds, ...elements.map((element) => element.id)])],
      discoveredRecipeIds: recipes.map((recipe) => recipe.id),
      unlockedEraIds: eras.map((era) => era.id),
      activeEraId: 'bronze-age',
      favoriteIds: ['metal', 'writing'],
      insightCredits: 1,
      insightFailureProgress: 2,
      rewardedChallengeEraIds: ['first-light'],
      revealedHintRecipeIds: ['first-vapor'],
      failedPairKeys: ['gale::tide'],
      soundEnabled: false,
      experimentHistory: [{ id: 1, inputs: ['ember', 'tide'], outcome: 'discovery', resultId: 'steam', recipeId: 'first-vapor' }],
      rewardedCollectionIds: collections.map((collection) => collection.id),
      challengeRecords: [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 }],
      readHistoricalElementIds: ['metal', 'writing'],
    }
    const raw = exportProgress(progress)
    localStorage.setItem(SAVE_KEY, raw)
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const researchBefore = structuredClone(historicalResearch)
    const { version, ...expected } = progress
    expect(version).toBe(7)
    expect(snapshotProgress(createGameStore().getState())).toEqual(expected)

    const user = userEvent.setup()
    render(<App />)
    expect(snapshotProgress(useGameStore.getState())).toEqual(expected)
    const mainNavigation = within(screen.getByRole('navigation', { name: 'Main navigation' }))
    await user.click(mainNavigation.getByRole('button', { name: 'Atlas' }))
    const atlasContents = within(screen.getByRole('main', { name: 'Atlas' }))
    const entryNavigation = within(atlasContents.getByRole('navigation', { name: 'Discovered historical entries' }))
    const entries = entryNavigation.getAllByRole('button')
    expect(entries.map((entry) => entry.getAttribute('aria-label')).sort()).toEqual(elements.map((element) =>
      `Open historical entry for ${element.name}${progress.readHistoricalElementIds.includes(element.id) ? ' (read)' : ''}`,
    ).sort())
    await user.click(entryNavigation.getByRole('button', { name: 'Open historical entry for Writing (read)' }))
    const article = atlasContents.getByRole('article', { name: 'Writing' })
    expect(article).toBeVisible()
    expect(snapshotProgress(useGameStore.getState())).toEqual(expected)
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw)
    expect(writes).not.toHaveBeenCalled()

    await user.click(within(article).getByRole('button', { name: 'Mark Writing as unread' }))
    await useGameStore.flushProgress()
    const unread = { ...expected, readHistoricalElementIds: ['metal'] }
    expect(snapshotProgress(createGameStore().getState())).toEqual(unread)
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual({ version: 7, ...unread })
    await user.click(within(article).getByRole('button', { name: 'Mark Writing as read' }))
    await useGameStore.flushProgress()
    expect(snapshotProgress(createGameStore().getState())).toEqual(expected)
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(progress)

    await user.click(mainNavigation.getByRole('button', { name: 'Play' }))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(within(screen.getByRole('banner')).getByRole('button', { name: 'Reset journal' }))
    await useGameStore.flushProgress()
    expect(createGameStore().getState()).toMatchObject({
      discoveredIds: starterElementIds,
      discoveredRecipeIds: [],
      readHistoricalElementIds: [],
      favoriteIds: [],
      rewardedCollectionIds: [],
      challengeRecords: [],
      activeEraId: 'first-light',
      soundEnabled: false,
    })
    await user.click(mainNavigation.getByRole('button', { name: 'Atlas' }))
    expect(atlasContents.queryByRole('article')).not.toBeInTheDocument()
    expect(entryNavigation.queryByRole('button', { name: /Open historical entry for Writing/ })).not.toBeInTheDocument()
    expect(entryNavigation.getAllByRole('button'))
      .toHaveLength(starterElementIds.length)
    expect(historicalResearch).toEqual(researchBefore)
  }, 10000)

  it.each([1, 2, 3, 4, 5, 6])('reveals previously discovered history from a v%s save without rewriting it on navigation', async (version) => {
    await useGameStore.flushProgress()
    const raw = JSON.stringify({
      ...snapshotProgress(useGameStore.getState()),
      version,
      discoveredIds: [...starterElementIds, 'metal', 'writing'],
      discoveredRecipeIds: [recipes.find((recipe) => recipe.result === 'metal')!.id],
      hintCredits: 1,
      insightCredits: 1,
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'],
      activeEraId: 'bronze-age',
    })
    localStorage.setItem(SAVE_KEY, raw)
    const expected = snapshotProgress(createGameStore().getState())
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()
    render(<App />)
    expect(snapshotProgress(useGameStore.getState())).toEqual(expected)
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('button', { name: 'Open historical entry for Metal' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Writing' }))
    expect(screen.getByRole('article', { name: 'Writing' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Mark Writing as read' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(snapshotProgress(useGameStore.getState())).toEqual(expected)
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw)
    expect(writes).not.toHaveBeenCalled()
  })

  it('keeps failed reading-marker writes visible in both sections without retrying or overwriting on navigation', async () => {
    act(() => useGameStore.getState().transmuteWith('stone', 'ember'))
    await useGameStore.flushProgress()
    const raw = localStorage.getItem(SAVE_KEY)
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Metal' }))
    const writes = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await user.click(screen.getByRole('button', { name: 'Mark Metal as read' }))
    await useGameStore.flushProgress()
    const error = useGameStore.getState().persistenceError
    expect(error).not.toBeNull()
    expect(screen.getByRole('alert').textContent).toBe(error)
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw)
    writes.mockClear()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('alert').textContent).toBe(error)
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('alert').textContent).toBe(error)
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw)
    expect(writes).not.toHaveBeenCalled()
  })

  it('opens history directly at zero Insight, clears stale searches and restores the Guide and worktable', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: [...useGameStore.getState().discoveredIds, 'metal', 'writing'],
      unlockedEraIds: ['first-light', 'stone-age', 'bronze-age'],
      insightCredits: 0,
    })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    await user.click(screen.getByRole('button', { name: 'Inspect Metal' }))
    const shortcut = screen.getByRole('button', { name: 'View history of Metal' })
    const before = useGameStore.getState()
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.click(shortcut)
    expect(screen.getByRole('article', { name: 'Metal' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Metal', level: 3 })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Mark Metal as read' })).toBeVisible()
    expect(useGameStore.getState()).toBe(before)
    await user.type(screen.getByRole('searchbox', { name: 'Search discovered historical entries' }), 'cuneiform')
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Writing' }))
    expect(screen.getByRole('article', { name: 'Writing' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(shortcut).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Show Guide panel' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(shortcut)
    expect(screen.getByRole('searchbox', { name: 'Search discovered historical entries' })).toHaveValue('')
    expect(screen.getByRole('article', { name: 'Metal' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(shortcut)
    expect(screen.getByRole('heading', { name: 'Metal', level: 3 })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(shortcut).toHaveFocus()
    expect(useGameStore.getState()).toBe(before)
    expect(before).toMatchObject({
      firstSlotId: 'ember', secondSlotId: 'tide', activeEraId: 'first-light',
      insightCredits: 0, readHistoricalElementIds: [],
    })
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
    await user.click(screen.getByRole('button', { name: 'Show Combine panel' }))
    expect(screen.getByRole('button', { name: 'Remove Fire' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove Water' })).toBeVisible()
  })

  it('opens a starting essence history from the Guide without spending Insight or marking reading', async () => {
    useGameStore.setState({ insightCredits: 0 })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    await user.click(screen.getByRole('button', { name: 'Inspect Fire' }))
    const before = snapshotProgress(useGameStore.getState())
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'View history of Fire' }))
    const article = within(screen.getByRole('article', { name: 'Fire' }))
    expect(article.getByText('Historical overview')).toBeVisible()
    expect(article.getByRole('button', { name: 'Mark Fire as read' })).toBeVisible()
    expect(article.queryByRole('button', { name: /^Prepare / })).not.toBeInTheDocument()
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
  })

  it('opens the unresearched-entry message from a discovered gameplay element without marking it read', async () => {
    useGameStore.getState().transmuteWith('ember', 'ember')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    await user.click(screen.getByRole('button', { name: 'Inspect Heat' }))
    const before = useGameStore.getState()
    await user.click(screen.getByRole('button', { name: 'View history of Heat' }))
    const article = within(screen.getByRole('article', { name: 'Heat' }))
    expect(article.getByText('Historical notes not yet researched')).toBeVisible()
    expect(article.getByText(/No verified historical record is available/)).toBeVisible()
    expect(article.getByText('Origins · essence')).toBeVisible()
    expect(article.queryByRole('button', { name: /Mark .* as read/ })).not.toBeInTheDocument()
    expect(article.queryByRole('button', { name: /^Prepare / })).not.toBeInTheDocument()
    expect(useGameStore.getState()).toBe(before)
  })

  it('starts on Play again after remount without persisting the section or changing progress', async () => {
    const user = userEvent.setup()
    const view = render(<App />)
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    view.unmount()
    render(<App />)
    expect(screen.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'true')
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
  })

  it('keeps the header and an isolated challenge available across section switches', async () => {
    const user = userEvent.setup()
    render(<App />)
    const before = snapshotProgress(useGameStore.getState())
    await user.click(screen.getByRole('button', { name: 'Play Rainmaker challenge' }))
    await user.click(screen.getByRole('button', { name: 'Challenge Water' }))
    expect(screen.getByRole('button', { name: 'Reset journal' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('heading', { name: 'Historical Encyclopedia' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Remove challenge Water from slot 1' })).toBeVisible()
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
  })

  it('lets a fresh player discover Metal, read free history and resume a prepared combination', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ insightCredits: 0 })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Earth' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))
    expect(screen.getByText('Discovered Metal')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByText('Discovered Metal')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search discovered historical entries' }), 'smelting')
    await user.click(screen.getByRole('button', { name: 'Open historical entry for Metal' }))
    const article = within(screen.getByRole('article', { name: 'Metal' }))
    expect(article.getByText(/extracting metal from ore/)).toBeVisible()
    expect(article.getByText(/an alchemical idea, not a historical event/)).toBeVisible()
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
    expect(useGameStore.getState().insightCredits).toBe(0)
    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))
    expect(screen.getByText('Discovered Steam')).toBeInTheDocument()
  })

  it('launches a learning lab from any age and restores focus to its Guide trigger', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    const before = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Play Bronze Lab' }))
    expect(screen.getByRole('heading', { name: 'Bronze Lab' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Return to Play' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Return to Play' }))
    expect(screen.getByRole('button', { name: 'Play Bronze Lab' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Show Guide panel' })).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(before)
  })

  it('keeps one save-protection warning visible across sections and during an isolated challenge', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ persistenceError: 'Autosaving is paused; this session is not saved.' })
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('Autosaving is paused')
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Autosaving is paused')
    await user.click(screen.getByRole('button', { name: 'Play' }))
    await user.click(screen.getByRole('button', { name: 'Play Rainmaker challenge' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Autosaving is paused')
  })
  it('opens settings and restores focus to its trigger', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close settings' }))
    expect(screen.getByRole('button', { name: 'Open settings' })).toHaveFocus()
  })

  it('preserves campaign slots and saves when entering and leaving Rainmaker', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Play Rainmaker challenge' }))
    expect(screen.getByRole('button', { name: 'Return to Play' })).toHaveFocus()
    expect(screen.queryByRole('navigation', { name: 'Play ages' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Atlas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Atlas' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Return to Play' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Return to Play' }))
    expect(screen.getByRole('button', { name: 'Play Rainmaker challenge' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Remove Fire' })).toBeInTheDocument()
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
  })

  it('returns to Combine when a revealed formula is prepared without performing it', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ revealedHintRecipeIds: ['first-vapor'] })
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Show Guide panel' }))
    await user.click(screen.getByRole('button', { name: 'Prepare Fire + Water' }))
    expect(screen.getByRole('button', { name: 'Show Combine panel' })).toHaveAttribute('aria-pressed', 'true')
    expect(useGameStore.getState().discoveredIds).not.toContain('steam')
    expect(useGameStore.getState().experimentHistory).toEqual([])
  })

  beforeEach(() => {
    window.localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  afterEach(cleanup)

  it('shows approximate date ranges for historical ages but not Origins', () => {
    render(<App />)

    const ageSwitcher = within(
      screen.getByRole('navigation', { name: 'Play ages' }),
    )
    expect(
      ageSwitcher.getByRole('button', { name: /Stone Age/ }),
    ).toHaveTextContent('c. 3.3 million years ago–c. 3300 BCE')
    expect(
      ageSwitcher.getByRole('button', { name: /Bronze Age/ }),
    ).toHaveTextContent('c. 3300 BCE–c. 1200 BCE')
    expect(
      ageSwitcher.getByRole('button', { name: /Iron Age/ }),
    ).toHaveTextContent('From c. 1200 BCE; regional end dates vary')
    expect(
      ageSwitcher.getByRole('button', { name: 'Origins' }),
    ).not.toHaveTextContent(/BCE|CE/)
    expect(ageSwitcher.getByRole('button', { name: 'Origins' })).toHaveAttribute(
      'title', 'An undated prologue inspired by the four classical elements of ancient Greek natural philosophy.',
    )
    const ageButtons = ageSwitcher.getAllByRole('button')
    expect(ageButtons).toHaveLength(5)
    expect(ageButtons[4]).toHaveTextContent('Classical Antiquity')
    expect(ageButtons[4]).toBeDisabled()
    expect(ageButtons[4]).toHaveAttribute(
      'title', 'A Mediterranean chapter of overlapping regional histories, not a universal successor to the Iron Age.',
    )
  })

  it('selects Age V by keyboard and updates its Guide and global counters without requiring optional branches', async () => {
    const user = userEvent.setup()
    const age = eras[4]
    useGameStore.setState({
      discoveredIds: [...starterElementIds, ...age.landmarkIds, 'observation'],
      unlockedEraIds: eras.map((entry) => entry.id),
    })
    render(<App />)
    const selector = within(screen.getByRole('navigation', { name: 'Play ages' }))
    const fifthAge = selector.getByRole('button', { name: 'Classical Antiquity' })
    fifthAge.focus()
    await user.keyboard('{Enter}')
    expect(fifthAge).toHaveFocus()
    expect(fifthAge).toHaveAttribute('aria-current', 'page')
    expect(selector.getByRole('button', { name: 'Origins' })).not.toHaveAttribute('aria-current')
    expect(useGameStore.getState().activeEraId).toBe(age.id)
    expect(screen.getByLabelText('6% discovered')).toHaveTextContent('10 / 173')
    const challenge = within(screen.getByRole('region', { name: 'Classical Antiquity challenge' }))
    expect(challenge.getByText(/Catalogue 6\/6.*Landmarks 5\/5/)).toBeVisible()
    expect(challenge.getByText(/This page's landmarks are recorded/)).toBeVisible()
    expect(within(screen.getByLabelText('Discovery record')).getAllByRole('button')).toHaveLength(6)
    const goals = within(screen.getByRole('list', { name: 'Collection goals' }))
    for (const collection of collections.filter((entry) => entry.era === age.id)) {
      expect(goals.getByText(collection.name)).toBeVisible()
    }
    expect(useGameStore.getState().discoveredIds).not.toContain('library')
    expect(useGameStore.getState().discoveredIds).not.toContain('aqueduct')
  })

  it('discovers and persists an element through tap controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('Discovered Steam')).toBeInTheDocument()
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: 'Steam' }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'steam',
    )
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'first-vapor',
    )

    await user.click(screen.getByRole('button', { name: 'Inspect Steam' }))
    expect(within(screen.getByText('Recorded formulas').closest('section')!).getByText('Fire + Water → Steam')).toBeInTheDocument()
    expect(screen.getByText('3 formulas remain undeciphered.')).toBeInTheDocument()
  })

  it('allows the same element to fill both vessels', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Use Fire again' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('Discovered Heat')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Heat' })).toBeInTheDocument()
  })

  it('explains why an empty table cannot transmute', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('The circle waits')).toBeInTheDocument()
    expect(screen.getByText('Two essences are required.')).toBeInTheDocument()
  })

  it('retains slot I and records an unsuccessful combination', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Water' }))
    await user.click(screen.getByRole('button', { name: 'Air' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('No resonance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Water' })).toBeInTheDocument()
    expect(screen.getAllByText('Empty vessel')).toHaveLength(1)
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'gale::tide',
    )

    await user.click(screen.getByRole('button', { name: 'Inspect Water' }))
    expect(screen.getByText('Tested, no reaction')).toBeInTheDocument()
    expect(screen.getByText('Air — no reaction')).toBeInTheDocument()
  })

  it('spends an Insight to reveal a viable combination', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      failedPairKeys: ['gale::tide', 'ember::heat', 'stone::steam'],
      insightFailureProgress: 3,
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))

    expect(screen.getByText('Fire + Water')).toBeInTheDocument()
    expect(screen.getByText('2 available')).toBeInTheDocument()
    expect(window.localStorage.getItem('unwritten-atlas-progress')).toContain(
      'first-vapor',
    )
  })

  it('keeps every revealed, unperformed hint visible', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      failedPairKeys: ['gale::tide', 'ember::heat', 'stone::steam'],
      insightFailureProgress: 3,
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))
    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))
    await user.click(screen.getByRole('button', { name: 'Reveal lead' }))

    expect(screen.getByText('Fire + Water')).toBeInTheDocument()
    expect(screen.getByText('Earth + Air')).toBeInTheDocument()
    expect(screen.getByText('Fire + Air')).toBeInTheDocument()
    expect(screen.getByText('0 available')).toBeInTheDocument()
  })

  it('locks Insights before Origins or three failures', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Insights locked' })).toBeDisabled()
    expect(
      screen.getByText('Insights unlock after Origins or 3 recorded failures.'),
    ).toBeInTheDocument()
  })

  it('earns Insight from five unique failures and resets on discovery', () => {
    useGameStore.setState({
      insightCredits: 1,
      insightFailureProgress: 4,
      failedPairKeys: ['a::b', 'a::c', 'a::d', 'a::e'],
      firstSlotId: 'tide',
      secondSlotId: 'gale',
    })

    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 2,
      insightFailureProgress: 0,
    })

    useGameStore.setState({
      insightFailureProgress: 3,
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })
    useGameStore.getState().transmute()
    expect(useGameStore.getState().insightFailureProgress).toBe(0)
  })

  it('gates later recipes until Stone Age unlocks', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale', 'clay'],
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Clay' }))
    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Combine' }))

    expect(screen.getByText('A later page')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Stone Age must be unlocked first. Recorded as an open lead.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Clay + Fire')).toBeInTheDocument()
  })

  it('unlocks Stone Age and grants Human from Origins landmarks', () => {
    useGameStore.setState({
      discoveredIds: [
        'ember',
        'tide',
        'stone',
        'gale',
        'life',
        'land',
        'tree',
        'rock',
      ],
      firstSlotId: 'life',
      secondSlotId: 'land',
      insightCredits: 1,
    })

    useGameStore.getState().transmute()
    render(<App />)

    expect(screen.getByRole('button', { name: 'Human' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Stone Age/ })).toBeEnabled()
    expect(screen.getByText(/Stone Age unlocked/)).toBeInTheDocument()
    expect(useGameStore.getState().insightCredits).toBe(2)
  })

  it('awards a completed challenge once and keeps known formulas neutral', () => {
    const origins = [
      'life',
      'land',
      'tree',
      'rock',
      'animal',
      'ember',
      'tide',
      'stone',
      'gale',
      'heat',
      'sea',
      'wind',
      'steam',
      'dust',
      'spark',
      'clay',
      'metal',
      'soil',
    ]
    useGameStore.setState({
      discoveredIds: origins,
      discoveredRecipeIds: ['first-vapor'],
      insightCredits: 1,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: [],
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })

    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 3,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: ['first-light'],
    })

    useGameStore.setState({ firstSlotId: 'ember', secondSlotId: 'tide' })
    useGameStore.getState().transmute()
    expect(useGameStore.getState()).toMatchObject({
      insightCredits: 3,
      insightFailureProgress: 3,
      rewardedChallengeEraIds: ['first-light'],
    })
  })

  it('filters Guide entries to the active era while keeping the Codex global', () => {
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale', 'human', 'brick'],
      unlockedEraIds: ['first-light', 'stone-age'],
      activeEraId: 'stone-age',
    })
    render(<App />)

    expect(screen.getByRole('button', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Inspect Fire' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Inspect Human' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inspect Mud Brick' })).toBeInTheDocument()
  })

  it('unlocks Bronze Age and grants Copper Ore', () => {
    useGameStore.setState({
      discoveredIds: [
        'ember',
        'tide',
        'stone',
        'gale',
        'metal',
        'human',
        'stone-tool',
        'village',
        'pottery',
      ],
      unlockedEraIds: ['first-light', 'stone-age'],
      activeEraId: 'stone-age',
      firstSlotId: 'stone',
      secondSlotId: 'stone-tool',
      insightCredits: 1,
    })

    useGameStore.getState().transmute()
    render(<App />)

    expect(screen.getByRole('button', { name: 'Copper Ore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bronze Age/ })).toBeEnabled()
    expect(screen.getByText(/Bronze Age unlocked/)).toBeInTheDocument()
    expect(useGameStore.getState().insightCredits).toBe(2)
  })

  it('removes stale failure history when a pair succeeds', () => {
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale'],
      failedPairKeys: ['ember::tide'],
      firstSlotId: 'ember',
      secondSlotId: 'tide',
    })

    useGameStore.getState().transmute()

    expect(useGameStore.getState().failedPairKeys).not.toContain('ember::tide')
  })

  it('shows category progress and marks only elements with outgoing uses unstudied', () => {
    render(<App />)

    expect(screen.getByLabelText('Essence: 4 of 6')).toBeInTheDocument()
    expect(screen.getByLabelText('Weather: 0 of 8')).toBeInTheDocument()

    expect(screen.getAllByText('Unstudied').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Inspect Fire' }),
    ).toHaveTextContent('Unstudied')
  })

  it('returns to Combine after selecting an element from the mobile panel', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Show Elements panel' }),
    )
    expect(
      screen.getByRole('button', { name: 'Show Elements panel' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Fire' }))

    expect(
      screen.getByRole('button', { name: 'Show Combine panel' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Slot 1')).toBeInTheDocument()
  })

  it('searches discovered elements by category', async () => {
    const user = userEvent.setup()
    useGameStore.setState({
      discoveredIds: ['ember', 'tide', 'stone', 'gale', 'clay'],
    })
    render(<App />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Search discovered elements' }),
      'matter',
    )

    expect(await screen.findByRole('button', { name: 'Clay' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Fire' })).toBeNull()
    })
  })

  it('marks the selected era as the current page', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Origins' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('toggles sound mute setting from the header', async () => {
    const user = userEvent.setup()
    render(<App />)

    const soundBtn = screen.getByRole('button', { name: 'Mute sound' })
    expect(soundBtn).toBeInTheDocument()

    await user.click(soundBtn)
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Unmute sound' }))
    expect(screen.getByRole('button', { name: 'Mute sound' })).toBeInTheDocument()
  })

  it('clears both slots when the Clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))
    await user.click(screen.getByRole('button', { name: 'Water' }))

    const clearBtn = screen.getByRole('button', { name: 'Clear table' })
    expect(clearBtn).toBeInTheDocument()

    await user.click(clearBtn)
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
  })

  it('filters elements by category tab and starred favorites', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Star Fire
    const starFireBtn = screen.getByRole('button', { name: 'Favorite Fire' })
    await user.click(starFireBtn)

    await user.click(screen.getByRole('button', { name: 'Starred' }))
    expect(screen.getByRole('button', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Water' })).toBeNull()

    await user.click(screen.getByRole('tab', { name: /All/ }))
    expect(screen.queryByRole('button', { name: 'Water' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Starred' }))
    expect(screen.getByRole('button', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Water' })).toBeInTheDocument()
  })
})