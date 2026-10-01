// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { collections, elements, elementsById, eras, recipes } from '../../game/content'
import { freshProgress, parseProgress } from '../../game/state/persistence'
import { createGameStore, snapshotProgress, useGameStore } from '../../game/state/useGameStore'
import { Journal } from './Journal'

const props = { eraId: 'first-light', challengeName: 'Origins', discoveryGoal: 18, landmarkIds: [] }
let realPrepareCombination = useGameStore.getState().prepareCombination

beforeEach(() => {
  localStorage.clear()
  realPrepareCombination = useGameStore.getState().prepareCombination
  useGameStore.setState({ prepareCombination: realPrepareCombination })
  useGameStore.getState().resetProgress()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  useGameStore.setState({ prepareCombination: realPrepareCombination })
})

describe('Guide preparation', () => {
  it('archives a formula after its attempt is evicted and reloaded, without saving on preparation', async () => {
    useGameStore.getState().transmuteWith('ember', 'tide')
    for (let index = 0; index < 55; index += 1) useGameStore.getState().transmuteWith('gale', 'tide')
    const reloaded = createGameStore().getState()
    expect(reloaded.experimentHistory).toHaveLength(50)
    expect(reloaded.experimentHistory.some((entry) => entry.recipeId === 'first-vapor')).toBe(false)
    useGameStore.setState(snapshotProgress(reloaded))
    const callback = vi.fn()
    render(<Journal {...props} onCombinationPrepared={callback} />)
    const summary = screen.getByText('Recorded Formulas (1)')
    const archive = summary.parentElement!
    expect(archive).not.toHaveAttribute('open')
    const user = userEvent.setup()
    await user.click(summary)
    await user.type(within(archive).getByRole('searchbox', { name: 'Search formulas' }), 'STEAM')
    expect(within(archive).getByText('Fire + Water → Steam')).toBeInTheDocument()
    const progress = snapshotProgress(useGameStore.getState())
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.tab()
    expect(within(archive).getByRole('button', { name: 'Prepare Fire + Water' })).toHaveFocus()
    await user.keyboard('[Enter]')
    expect(useGameStore.getState()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'tide' })
    expect(snapshotProgress(useGameStore.getState())).toEqual(progress)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
    expect(callback).toHaveBeenCalledOnce()
  })

  it.each([1, 2, 3, 4, 5, 6])('browses legacy v%i formula records without inventing attempt history', async (version) => {
    const progress = parseProgress(JSON.stringify({
      ...freshProgress(), version, discoveredIds: ['steam'], discoveredRecipeIds: ['first-vapor'], hintCredits: 3,
    }))!
    useGameStore.setState(snapshotProgress(progress))
    expect(progress.experimentHistory).toEqual([])
    render(<Journal {...props} />)
    const summary = screen.getByText(`Recorded Formulas (${version === 1 ? 0 : 1})`)
    await userEvent.setup().click(summary)
    if (version === 1) {
      expect(within(summary.parentElement!).getByText('No formulas recorded in this age yet.')).toBeInTheDocument()
    } else {
      expect(within(summary.parentElement!).getByText('Fire + Water → Steam')).toBeInTheDocument()
    }
  })

  it('filters by active age and ingredient or result name, keeping alternate performed formulas', async () => {
    const formulas = recipes.filter((recipe) => recipe.result === 'village')
    expect(formulas.length).toBeGreaterThan(1)
    useGameStore.setState({
      discoveredIds: elements.map((element) => element.id), unlockedEraIds: eras.map((era) => era.id),
      discoveredRecipeIds: ['first-vapor', ...formulas.map((recipe) => recipe.id)],
    })
    render(<Journal {...props} eraId="stone-age" />)
    const summary = screen.getByText(`Recorded Formulas (${formulas.length})`)
    const user = userEvent.setup()
    await user.click(summary)
    const archive = within(summary.parentElement!)
    expect(archive.getAllByRole('listitem')).toHaveLength(formulas.length)
    expect(archive.queryByText('Fire + Water → Steam')).toBeNull()
    const search = archive.getByRole('searchbox', { name: 'Search formulas' })
    await user.type(search, 'Village')
    expect(archive.getAllByRole('listitem')).toHaveLength(formulas.length)
    await user.clear(search)
    await user.type(search, 'not-an-element')
    expect(archive.getByText('No matching formulas.')).toBeInTheDocument()
    expect(archive.queryByRole('button')).toBeNull()
    await user.clear(search)
    await user.type(search, elementsById.get(formulas[0].inputs[0])!.name)
    expect(archive.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('prepares a recorded formula without performing it or changing progress', async () => {
    useGameStore.setState({ discoveredIds: ['ember', 'tide', 'stone', 'gale', 'steam'], discoveredRecipeIds: ['first-vapor'] })
    const callback = vi.fn()
    render(<Journal {...props} onCombinationPrepared={callback} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Inspect Steam' }))
    const research = within(screen.getByText('Recorded formulas').closest('section')!)
    expect(research.getByText('Fire + Water → Steam')).toBeInTheDocument()
    const progress = useGameStore.getState()
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.click(research.getByRole('button', { name: 'Prepare Fire + Water' }))
    expect(useGameStore.getState()).toMatchObject({ firstSlotId: 'ember', secondSlotId: 'tide', lastAttempt: null })
    expect(useGameStore.getState().experimentHistory).toBe(progress.experimentHistory)
    expect(useGameStore.getState().discoveredIds).toBe(progress.discoveredIds)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('keeps a locked lead anonymous and disabled until its age unlocks', async () => {
    const recipe = recipes.find((entry) => elementsById.get(entry.result)?.era === 'stone-age')!
    useGameStore.setState({ discoveredIds: [...new Set(['ember', 'tide', 'stone', 'gale', ...recipe.inputs])], revealedHintRecipeIds: [recipe.id] })
    render(<Journal {...props} />)
    const leads = screen.getByText('Open leads').parentElement!
    expect(within(leads).queryByText(elementsById.get(recipe.result)!.name)).not.toBeInTheDocument()
    expect(within(leads).getByText(`Requires ${eras.find((era) => era.id === 'stone-age')!.name}`)).toBeInTheDocument()
    expect(within(leads).getByRole('button')).toBeDisabled()
    useGameStore.setState({ unlockedEraIds: ['first-light', 'stone-age'] })
    await userEvent.setup().click(within(leads).getByRole('button'))
    expect(useGameStore.getState().firstSlotId).toBe(recipe.inputs[0])
  })

  it('disables unknown inputs and never notifies after rejected preparation', async () => {
    useGameStore.setState({ revealedHintRecipeIds: ['first-vapor'] })
    const callback = vi.fn()
    const prepare = vi.spyOn(useGameStore.getState(), 'prepareCombination').mockReturnValue(false)
    const view = render(<Journal {...props} onCombinationPrepared={callback} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Prepare Fire + Water' }))
    expect(prepare).toHaveBeenCalledWith('ember', 'tide')
    expect(callback).not.toHaveBeenCalled()
    view.unmount()
    useGameStore.setState({ discoveredIds: ['ember', 'stone', 'gale'] })
    render(<Journal {...props} onCombinationPrepared={callback} />)
    expect(screen.getByRole('button', { name: 'Prepare Fire + Water' })).toBeDisabled()
  })

  it('renders newest-first outcomes in a collapsed disclosure and gates locked history', async () => {
    useGameStore.setState({ experimentHistory: [
      { id: 1, inputs: ['ember', 'tide'], outcome: 'discovery', resultId: 'steam', recipeId: 'first-vapor' },
      { id: 2, inputs: ['ember', 'ember'], outcome: 'known', resultId: 'heat' },
      { id: 3, inputs: ['tide', 'gale'], outcome: 'no-reaction' },
      { id: 4, inputs: ['ember', 'stone'], outcome: 'locked', lockedEraId: 'stone-age', resultId: 'metal' },
    ] })
    render(<Journal {...props} />)
    const summary = screen.getByText('Recent Experiments')
    expect(summary.parentElement).not.toHaveAttribute('open')
    const user = userEvent.setup()
    await user.click(summary)
    const experiments = summary.parentElement!.querySelectorAll('.experiment-row')
    expect(experiments).toHaveLength(4)
    expect(experiments[0]).toHaveTextContent('Requires')
    expect(experiments[0]).not.toHaveTextContent('Metal')
    expect(experiments[1]).toHaveTextContent('No reaction')
    expect(experiments[2]).toHaveTextContent('Known: Heat')
    expect(experiments[3]).toHaveTextContent('Discovery: Steam')
    expect(within(experiments[0] as HTMLElement).getByRole('button')).toBeDisabled()
    await user.click(within(experiments[1] as HTMLElement).getByRole('button'))
    expect(useGameStore.getState()).toMatchObject({ firstSlotId: 'tide', secondSlotId: 'gale' })
  })

  it('only shows active-age goals, anonymous unknown members and one-time reward status', () => {
    const collection = collections.find((entry) => entry.era === props.eraId)!
    useGameStore.setState({ discoveredIds: ['ember', 'tide', 'stone', 'gale', collection.elementIds[0]], insightCredits: 3, rewardedCollectionIds: [collection.id] })
    render(<Journal {...props} />)
    const goals = screen.getByRole('list', { name: 'Collection goals' })
    expect(within(goals).getByText(collection.name)).toBeInTheDocument()
    expect(within(goals).getByText(`1/${collection.elementIds.length}`)).toBeInTheDocument()
    expect(within(goals).getByText(elementsById.get(collection.elementIds[0])!.name)).toBeInTheDocument()
    expect(within(goals).getAllByText('Unknown element')).toHaveLength(collection.elementIds.length - 1)
    expect(within(goals).getByText('+1 Insight reward earned')).toBeInTheDocument()
    for (const other of collections.filter((entry) => entry.era !== props.eraId)) {
      expect(within(goals).queryByText(other.name)).not.toBeInTheDocument()
    }
  })

  it('shows the earned reward for a complete collection even with a full wallet', () => {
    const collection = collections.find((entry) => entry.era === props.eraId)!
    useGameStore.setState({ discoveredIds: ['ember', 'tide', 'stone', 'gale', ...collection.elementIds], insightCredits: 3, rewardedCollectionIds: [collection.id] })
    render(<Journal {...props} />)
    const goals = screen.getByRole('list', { name: 'Collection goals' })
    expect(within(goals).getByText(`${collection.elementIds.length}/${collection.elementIds.length}`)).toBeInTheDocument()
    expect(within(goals).getByText('+1 Insight reward earned')).toBeInTheDocument()
    expect(within(goals).queryByText('+1 Insight on completion')).not.toBeInTheDocument()
    expect(useGameStore.getState().insightCredits).toBe(3)
  })
})