// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { collections, elements, elementsById, eras, recipes } from '../../game/content'
import { reviewsByRecipeId } from '../../game/content/recipeReviews'
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
  it('separates optional landmark status, supporting discoveries and rewards from core page completion', () => {
    const age = eras[4]
    useGameStore.setState({
      discoveredIds: [...age.landmarkIds, 'observation'],
      unlockedEraIds: eras.map((era) => era.id),
    })
    const view = render(<Journal eraId={age.id} challengeName={age.name}
      discoveryGoal={age.discoveryGoal} landmarkIds={age.landmarkIds} />)
    expect(screen.getByText(/This page's landmarks are recorded/)).toBeVisible()
    const goals = screen.getByLabelText('Optional landmark goals')
    expect(within(goals).getAllByRole('listitem').filter((item) => item.className === 'collection-goal')).toHaveLength(4)
    expect(within(goals).getByText('Landmark discovered; supporting discoveries remain')).toBeVisible()
    expect(within(goals).getAllByText('Landmark not yet discovered')).toHaveLength(3)
    expect(within(goals).queryByText('Landmark objective complete')).not.toBeInTheDocument()
    act(() => useGameStore.setState({ discoveredIds: [...age.landmarkIds, 'observation', 'trade', 'city'] }))
    expect(within(goals).getByText('Landmark objective complete')).toBeVisible()
    expect(within(goals).getByText('+1 Insight on next successful campaign combination')).toBeVisible()
    act(() => useGameStore.setState({ rewardedCollectionIds: ['agora-landmark'] }))
    expect(within(goals).getByText('+1 Insight reward earned')).toBeVisible()
    expect(screen.queryByText('Trade + City → Agora')).not.toBeInTheDocument()
    view.rerender(<Journal {...props} />)
    expect(screen.queryByLabelText('Optional landmark goals')).not.toBeInTheDocument()
  })

  it('keeps a hidden terminal discovery inspectable with its history and recorded origin', async () => {
    const user = userEvent.setup()
    const viewHistory = vi.fn()
    useGameStore.setState({
      discoveredIds: elements.map((element) => element.id),
      unlockedEraIds: eras.map((era) => era.id),
      discoveredRecipeIds: ['interpreted-text'],
      hideFinalElements: true,
      collapsedShelves: ['classical-antiquity'],
    })
    render(<Journal {...props} eraId="classical-antiquity" onViewHistory={viewHistory} />)
    await user.click(screen.getByRole('button', { name: 'Inspect Commentary' }))
    expect(screen.getByText(/Terminal: no authored recipe/)).toBeVisible()
    const history = screen.getByRole('button', { name: 'View history of Commentary' })
    await user.click(history)
    expect(viewHistory).toHaveBeenCalledWith('commentary', history)
    const prepare = screen.getAllByRole('button', { name: 'Prepare Scroll + Logic' })[0]
    await user.click(prepare)
    expect(useGameStore.getState()).toMatchObject({ firstSlotId: 'scroll', secondSlotId: 'logic' })
  })

  it('offers history only for an inspected discovery and passes its originating control without changing gameplay', async () => {
    useGameStore.getState().transmuteWith('stone', 'ember')
    const callback = vi.fn()
    const user = userEvent.setup()
    render(<Journal {...props} onViewHistory={callback} />)
    expect(screen.queryByRole('heading', { name: 'Historical Encyclopedia', hidden: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox', { name: 'Search discovered historical entries', hidden: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^View history of / })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Inspect Metal' }))
    const button = screen.getByRole('button', { name: 'View history of Metal' })
    const before = useGameStore.getState()
    await user.click(button)
    expect(callback).toHaveBeenCalledExactlyOnceWith('metal', button)
    expect(useGameStore.getState()).toBe(before)
  })

  it('labels discovered earlier materials without revealing unknown collection members', async () => {
    useGameStore.setState({ discoveredIds: ['clay', 'reed', 'hearth', 'charcoal'] })
    render(<Journal {...props} eraId="bronze-age" />)
    const objectives = screen.getByText('Collections').parentElement!
    expect(within(objectives).getAllByText('Optional historical discovery objective')).toHaveLength(2)
    expect(within(objectives).getByText('Earlier gameplay page: Stone Age')).toBeVisible()
    expect(within(objectives).getAllByText('Earlier gameplay page: Origins')).toHaveLength(3)
    expect(within(objectives).getAllByText('Unknown element')).toHaveLength(8)
    expect(within(objectives).queryByText('Writing Reed')).not.toBeInTheDocument()
    expect(within(objectives).queryByText('Bronze Tool')).not.toBeInTheDocument()
  })

  it('counts every Age V discovery and only performed formulas, including alternate Agora routes', async () => {
    const user = userEvent.setup()
    const age = eras[4]
    const ageElements = elements.filter((element) => element.era === age.id)
    const agoraRoutes = recipes.filter((recipe) => recipe.result === 'agora')
    expect(agoraRoutes).toHaveLength(2)
    useGameStore.setState({
      discoveredIds: elements.map((element) => element.id),
      unlockedEraIds: eras.map((entry) => entry.id),
      activeEraId: age.id,
      discoveredRecipeIds: [agoraRoutes[0].id],
    })
    const { rerender } = render(<Journal {...props} eraId={age.id} challengeName={age.name}
      discoveryGoal={age.discoveryGoal} landmarkIds={age.landmarkIds} />)
    expect(screen.getByText('48', { selector: '.progress-summary strong' })).toBeVisible()
    expect(ageElements).toHaveLength(48)
    for (const category of new Set(ageElements.map((element) => element.category))) {
      const count = ageElements.filter((element) => element.category === category).length
      const label = category[0].toUpperCase() + category.slice(1)
      expect(screen.getByLabelText(`${label}: ${count} of ${count}`)).toBeVisible()
    }
    const archive = screen.getByText('Recorded Formulas (1)').parentElement!
    await user.click(within(archive).getByText('Recorded Formulas (1)'))
    const formula = (inputs: string[]) => `${inputs.map((id) => elementsById.get(id)!.name).join(' + ')} → Agora`
    expect(within(archive).getByText(formula(agoraRoutes[0].inputs))).toBeVisible()
    expect(within(archive).queryByText(formula(agoraRoutes[1].inputs))).not.toBeInTheDocument()
    act(() => useGameStore.setState({ discoveredRecipeIds: agoraRoutes.map((recipe) => recipe.id) }))
    rerender(<Journal {...props} eraId={age.id} challengeName={age.name}
      discoveryGoal={age.discoveryGoal} landmarkIds={age.landmarkIds} />)
    expect(within(archive).getByText('Recorded Formulas (2)')).toBeVisible()
    expect(within(archive).getByText(formula(agoraRoutes[1].inputs))).toBeVisible()
    expect(within(screen.getByLabelText('Discovery record')).getAllByRole('button')).toHaveLength(48)
  })

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
      expect(within(summary.parentElement!).getByText('Historical context: Material process')).toBeInTheDocument()
    }
    expect(useGameStore.getState().experimentHistory).toEqual([])
  })

  describe('performed formula historical context', () => {
    it.each([
      ['stitched-woven-clothing', 'tied-hide', 'stone-age'],
      ['domed-bath-space', 'vaulted-bath-space', 'classical-antiquity'],
      ['dugout-voyage', 'paddled-voyage', 'bronze-age'],
      ['crucible-copper', 'smelted-copper', 'bronze-age'],
      ['aligned-masonry-wall', 'first-wall', 'stone-age'],
    ])('records %s independently without removing its previously performed alternate', async (id, previousId, eraId) => {
      const recipe = recipes.find((entry) => entry.id === id)!
      useGameStore.setState({
        discoveredIds: elements.map((element) => element.id),
        unlockedEraIds: eras.map((era) => era.id),
        activeEraId: eraId,
        discoveredRecipeIds: [previousId],
      })
      const view = render(<Journal {...props} eraId={eraId} />)
      expect(screen.queryByText(reviewsByRecipeId.get(id)!.caution)).not.toBeInTheDocument()
      view.unmount()
      useGameStore.getState().transmuteWith(...recipe.inputs)
      expect(useGameStore.getState().lastAttempt?.kind).toBe('known')
      render(<Journal {...props} eraId={eraId} />)
      await userEvent.setup().click(screen.getByText('Recorded Formulas (2)'))
      const archive = within(screen.getByRole('list', { name: 'Recorded formula archive' }))
      expect(archive.getByText(reviewsByRecipeId.get(id)!.caution)).toBeInTheDocument()
      expect(archive.getByText(reviewsByRecipeId.get(previousId)!.caution)).toBeInTheDocument()
      expect(useGameStore.getState().discoveredRecipeIds).toEqual([previousId, id])
      expect(snapshotProgress(createGameStore().getState())).toEqual(snapshotProgress(useGameStore.getState()))
    })

    it('keeps the new alphabetic manuscript caution hidden until that alternate route is performed', async () => {
      useGameStore.setState({
        discoveredIds: elements.map((element) => element.id),
        unlockedEraIds: eras.map((era) => era.id),
        activeEraId: 'iron-age',
        discoveredRecipeIds: ['copied-manuscript'],
      })
      const view = render(<Journal {...props} eraId="iron-age" />)
      const caution = reviewsByRecipeId.get('alphabetic-manuscript')!.caution
      expect(screen.queryByText(caution)).not.toBeInTheDocument()
      view.unmount()
      useGameStore.getState().transmuteWith('alphabet', 'papyrus')
      render(<Journal {...props} eraId="iron-age" />)
      await userEvent.setup().click(screen.getByText('Recorded Formulas (2)'))
      expect(screen.getByText(caution)).toBeInTheDocument()
    })

    it('keeps notes out of unperformed leads and locked or unsuccessful experiments', () => {
      useGameStore.setState({
        discoveredIds: elements.map((element) => element.id),
        revealedHintRecipeIds: ['first-vapor'],
        discoveredRecipeIds: [],
        experimentHistory: [
          { id: 1, inputs: ['ember', 'tide'], outcome: 'no-reaction' },
          { id: 2, inputs: ['clay', 'hearth'], outcome: 'locked', lockedEraId: 'stone-age', recipeId: 'shaped-clay' },
        ],
      })
      render(<Journal {...props} />)
      expect(screen.queryByText(/Historical context:/)).toBeNull()
      expect(screen.queryByText(reviewsByRecipeId.get('first-vapor')!.caution)).toBeNull()
      expect(screen.queryByText(reviewsByRecipeId.get('shaped-clay')!.caution)).toBeNull()
    })

    it('unlocks each alternate formula separately even when its result is discovered', async () => {
      useGameStore.setState({
        discoveredIds: ['ember', 'tide', 'stone', 'gale', 'heat', 'steam'],
        discoveredRecipeIds: ['first-vapor'],
        revealedHintRecipeIds: ['heated-water'],
      })
      const view = render(<Journal {...props} />)
      await userEvent.setup().click(screen.getByRole('button', { name: 'Inspect Steam' }))
      const research = within(screen.getByText('Recorded formulas').closest('section')!)
      expect(research.getByText(reviewsByRecipeId.get('first-vapor')!.caution)).toBeInTheDocument()
      expect(research.queryByText(reviewsByRecipeId.get('heated-water')!.caution)).toBeNull()
      view.unmount()
      useGameStore.getState().transmuteWith('heat', 'tide')
      render(<Journal {...props} />)
      await userEvent.setup().click(screen.getByText('Recorded Formulas (2)'))
      const archive = within(screen.getByRole('list', { name: 'Recorded formula archive' }))
      expect(archive.getByText(reviewsByRecipeId.get('first-vapor')!.caution)).toBeInTheDocument()
      expect(archive.getByText(reviewsByRecipeId.get('heated-water')!.caution)).toBeInTheDocument()
    })

    it('makes reading optional and preserves slots, progress, rewards and storage', async () => {
      useGameStore.getState().transmuteWith('ember', 'tide')
      useGameStore.getState().prepareCombination('ember', 'tide')
      const before = useGameStore.getState()
      const saved = localStorage.getItem('unwritten-atlas-progress')
      render(<Journal {...props} />)
      const user = userEvent.setup()
      await user.click(screen.getByText('Recorded Formulas (1)'))
      const disclosure = screen.getByText('Historical context: Material process')
      expect(disclosure.parentElement).not.toHaveAttribute('open')
      await user.click(disclosure)
      expect(disclosure.parentElement).toHaveAttribute('open')
      expect(screen.getByText(/No supporting reference attached/)).toBeInTheDocument()
      await user.click(disclosure)
      expect(useGameStore.getState()).toBe(before)
      expect(localStorage.getItem('unwritten-atlas-progress')).toBe(saved)
    })

    it('shows original references and access limits only for performed formulas', async () => {
      useGameStore.setState({
        discoveredIds: elements.map((element) => element.id),
        unlockedEraIds: eras.map((era) => era.id),
      })
      useGameStore.getState().transmuteWith('clay', 'hearth')
      render(<Journal {...props} eraId="stone-age" />)
      const user = userEvent.setup()
      await user.click(screen.getByText('Recorded Formulas (1)'))
      await user.click(screen.getByText('Historical context: Simplified process'))
      const archive = within(screen.getByRole('list', { name: 'Recorded formula archive' }))
      expect(archive.getByText(reviewsByRecipeId.get('shaped-clay')!.caution)).toBeInTheDocument()
      expect(archive.getByRole('link', { name: 'Early pottery at 20,000 years ago in Xianrendong Cave, China' }))
        .toHaveAttribute('href', 'https://doi.org/10.1126/science.1218643')
      expect(archive.getByText('Abstract only; full paper not reviewed')).toBeInTheDocument()
      expect(archive.queryByRole('link', { name: 'Stone Tools' })).toBeNull()
      await user.click(archive.getByText('Abstract only; full paper not reviewed'))
      expect(archive.getByText(/Mobile foragers produced pottery before agriculture/)).toBeInTheDocument()
      expect(archive.getByText(/not this exact two-input combination/)).toBeInTheDocument()
    })

    it('hides recipe context again after progress is reset', async () => {
      useGameStore.getState().transmuteWith('ember', 'tide')
      const view = render(<Journal {...props} />)
      expect(screen.getByText('Historical context: Material process')).toBeInTheDocument()
      view.unmount()
      useGameStore.getState().resetProgress()
      render(<Journal {...props} />)
      expect(screen.queryByText(/Historical context:/)).toBeNull()
    })
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