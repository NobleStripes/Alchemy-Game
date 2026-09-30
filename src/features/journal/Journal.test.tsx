// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { collections, elementsById, eras, recipes } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'
import { Journal } from './Journal'

const props = { eraId: 'first-light', challengeName: 'Origins', discoveryGoal: 18, landmarkIds: [] }
const realPrepareCombination = useGameStore.getState().prepareCombination

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({ prepareCombination: realPrepareCombination })
  useGameStore.getState().resetProgress()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  useGameStore.setState({ prepareCombination: realPrepareCombination })
})

describe('Guide preparation', () => {
  it('prepares a recorded formula without performing it or changing progress', async () => {
    useGameStore.setState({ discoveredIds: ['ember', 'tide', 'stone', 'gale', 'steam'], discoveredRecipeIds: ['first-vapor'] })
    const callback = vi.fn()
    render(<Journal {...props} onCombinationPrepared={callback} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Inspect Steam' }))
    expect(screen.getByText('Fire + Water → Steam')).toBeInTheDocument()
    const progress = useGameStore.getState()
    const saved = localStorage.getItem('unwritten-atlas-progress')
    await user.click(screen.getByRole('button', { name: 'Prepare Fire + Water' }))
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