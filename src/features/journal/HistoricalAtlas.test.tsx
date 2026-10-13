// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { elements, starterElementIds } from '../../game/content'
import { historicalResearch, researchByElementId } from '../../game/content/research'
import { historicalEntrySchema } from '../../game/content/schema'
import { SAVE_KEY } from '../../game/state/persistence'
import { createGameStore, snapshotProgress, useGameStore } from '../../game/state/useGameStore'
import { HistoricalAtlas } from './HistoricalAtlas'

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetProgress()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function discover(...ids: string[]) {
  useGameStore.setState({ discoveredIds: [...starterElementIds, ...ids] })
}

async function openAtlas() {
  const user = userEvent.setup()
  render(<HistoricalAtlas />)
  await user.click(screen.getByText('Historical Encyclopedia'))
  return user
}

async function selectEntry(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: `Open historical entry for ${name}` }))
  return screen.getByRole('article', { name })
}

describe('Historical Encyclopedia', () => {
  it.each([
    ['Mesopotamia', 'Writing'],
    ['cuneiform', 'Writing'],
    ['3200 BCE', 'Writing'],
    ['Ottaviano', 'Writing'],
    ['Metaphors Invention', 'Writing'],
    ['cRyStAl', 'Lens'],
  ])('finds %s in discovered research, not just element names', async (query, name) => {
    discover('writing', 'lens')
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem(SAVE_KEY)
    const user = await openAtlas()
    const search = screen.getByRole('searchbox', { name: 'Search discovered historical entries' })
    expect(search).toHaveAccessibleDescription(/Only discovered entries and their visible research/)
    await user.type(search, query)
    const index = screen.getByRole('navigation', { name: 'Discovered historical entries' })
    expect(within(index).getByRole('button', { name: `Open historical entry for ${name}` })).toBeVisible()
    expect(within(index).queryByRole('button', { name: /Writing Reed/ })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/discovered entr(y|ies) found/)
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem(SAVE_KEY)).toBe(disk)
  })

  it('searches visible related context and citations only after discovering that related entry', async () => {
    discover('metal')
    const originalGet = researchByElementId.get.bind(researchByElementId)
    const record = originalGet('metal')!
    const source = historicalResearch.sources.find((entry) => entry.id === 'met-barley-account')!
    vi.spyOn(researchByElementId, 'get').mockImplementation((id) => id === 'metal' ? {
      ...record,
      relatedDiscoveries: [{
        elementId: 'writing', relationship: 'documented',
        explanation: 'Hiddenregionalcontext', sourceIds: [source.id],
      }],
    } : originalGet(id))
    const user = await openAtlas()
    const search = screen.getByRole('searchbox')
    for (const query of ['Hiddenregionalcontext', source.title]) {
      await user.clear(search)
      await user.type(search, query)
      expect(screen.getByText('No matching discovered entries.')).toBeVisible()
      expect(screen.getByRole('status')).toHaveTextContent('0 discovered entries found.')
    }
    act(() => { discover('metal', 'writing') })
    await user.clear(search)
    await user.type(search, 'Hiddenregionalcontext')
    expect(screen.getByRole('button', { name: 'Open historical entry for Metal' })).toBeVisible()
  })

  it('shows absent optional chronology and geography without a fabricated date or empty region label', async () => {
    discover('metal')
    const originalGet = researchByElementId.get.bind(researchByElementId)
    const entry = historicalEntrySchema.parse({
      ...originalGet('metal'), approximateDates: undefined, associatedRegions: undefined,
      independentDevelopments: [],
    })
    vi.spyOn(researchByElementId, 'get').mockImplementation((id) => id === 'metal' ? entry : originalGet(id))
    const user = await openAtlas()
    const article = await selectEntry(user, 'Metal')
    expect(within(article).getByText('No sourced dates are recorded for this entry.')).toBeVisible()
    expect(within(article).getByText('No geographical associations are recorded for this entry.')).toBeVisible()
    expect(within(article).queryByText(/^Regions:/)).not.toBeInTheDocument()
    expect(within(article).getByText('Historical overview')).toBeVisible()
    expect(within(article).getAllByRole('link').length).toBeGreaterThan(0)
  })

  it('supports keyboard expansion, searching, selecting, reading controls and citation navigation', async () => {
    discover('writing')
    render(<HistoricalAtlas />)
    const user = userEvent.setup()
    await user.tab()
    expect(screen.getByText('Historical Encyclopedia')).toHaveFocus()
    await user.keyboard('[Enter]')
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await user.keyboard('mesopotamia')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Open historical entry for Writing' })).toHaveFocus()
    await user.keyboard('[Enter]')
    expect(screen.getByRole('heading', { name: 'Writing', level: 3 })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Mark Writing as read' })).toHaveFocus()
    await user.tab()
    const citation = screen.getAllByRole('link', { name: /^Reference / })[0]
    expect(citation).toHaveFocus()
    expect(citation).toHaveAccessibleName(/^Reference /)
    const target = document.getElementById(citation.getAttribute('href')!.slice(1))!
    expect(target).toHaveAttribute('tabindex', '-1')
    expect(within(target).getByRole('link', { name: 'Metaphors and the Invention of Writing' }))
      .toHaveAttribute('target', '_blank')
    expect(useGameStore.getState().readHistoricalElementIds).toEqual([])
  })

  it('marks reading only on explicit request, for free, without changing rewards or worktable progress', async () => {
    useGameStore.getState().transmuteWith('stone', 'ember')
    useGameStore.setState({ insightCredits: 0 })
    const user = await openAtlas()
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem(SAVE_KEY)
    await selectEntry(user, 'Metal')
    expect(useGameStore.getState().readHistoricalElementIds).toEqual([])
    expect(localStorage.getItem(SAVE_KEY)).toBe(disk)
    expect(screen.getByText(/0\/1 discovered researched entries/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Mark Metal as read' }))
    expect(snapshotProgress(useGameStore.getState())).toEqual({ ...before, readHistoricalElementIds: ['metal'] })
    expect(createGameStore().getState().readHistoricalElementIds).toEqual(['metal'])
    expect(screen.getByRole('button', { name: 'Open historical entry for Metal (read)' })).toBeVisible()
    expect(screen.getByText(/1\/1 discovered researched entries/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Mark Metal as unread' }))
    expect(createGameStore().getState().readHistoricalElementIds).toEqual([])
    await selectEntry(user, 'Fire')
    expect(screen.queryByRole('button', { name: /Mark .* as read/ })).not.toBeInTheDocument()
  })

  it('is optional and hides undiscovered entries even when searched', async () => {
    render(<HistoricalAtlas />)
    expect(screen.getByText(/Optional historical notes/)).not.toBeVisible()
    const user = userEvent.setup()
    await user.click(screen.getByText('Historical Encyclopedia'))
    expect(screen.queryByRole('button', { name: /historical entry for Writing$/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Historical overview')).not.toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'writing')
    expect(screen.getByText('No matching discovered entries.')).toBeVisible()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('unlocks notes on discovery and removes the selected entry immediately on reset', async () => {
    const user = await openAtlas()
    expect(screen.queryByRole('button', { name: /historical entry for Metal$/ })).not.toBeInTheDocument()
    act(() => { useGameStore.getState().transmuteWith('stone', 'ember') })
    const entry = await selectEntry(user, 'Metal')
    expect(within(entry).getByText('Fictional, undated prologue')).toBeVisible()
    expect(within(entry).getByText(/Origins recipe is explicitly symbolic/)).toBeVisible()
    act(() => { useGameStore.getState().resetProgress() })
    expect(screen.queryByRole('article', { name: 'Metal' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /historical entry for Metal$/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Select a discovered entry/)).toBeVisible()
  })

  it('shows regional writing dates, independent origins, supported claims and bibliographic references', async () => {
    discover('writing')
    const user = await openAtlas()
    const entry = await selectEntry(user, 'Writing')
    expect(within(entry).getByText('c. 3300-2900 BCE')).toBeVisible()
    expect(within(entry).getByText('Around 3200 BCE')).toBeVisible()
    expect(within(entry).getByText('c. 1250-1046 BCE')).toBeVisible()
    expect(within(entry).getByText('Mesoamerica', { selector: 'strong' })).toBeVisible()
    expect(within(entry).getByText(/Three-Age System reflects particular/)).toBeVisible()
    expect(within(entry).getByText('Manufacture and use')).toBeVisible()
    expect(within(entry).getByText('Why it mattered')).toBeVisible()
    expect(within(entry).getByText('Contested interpretation · interpretation')).toBeVisible()
    expect(within(entry).getByRole('link', { name: 'Metaphors and the Invention of Writing' }))
      .toHaveAttribute('href', 'https://doi.org/10.1111/tops.12768')
    expect(within(entry).getByText(/Ludovica Ottaviano/)).toHaveTextContent('Published 2024-11-25')
    for (const citation of within(entry).getAllByRole('link', { name: /^Reference / })) {
      expect(document.getElementById(citation.getAttribute('href')!.slice(1))).not.toBeNull()
    }
    expect(within(entry).queryByText('Related discoveries')).not.toBeInTheDocument()
    expect(within(entry).queryByText(/Papyrus \+ Pigment/)).not.toBeInTheDocument()
    expect(within(entry).queryByRole('button', { name: /Prepare/ })).not.toBeInTheDocument()
  })

  it('shows only discovered related topics and distinguishes documented relationships from gameplay associations', async () => {
    discover('writing', 'clay', 'papyrus')
    const user = await openAtlas()
    const entry = await selectEntry(user, 'Writing')
    expect(within(entry).getByRole('button', { name: 'Read history of Clay' })).toBeVisible()
    expect(within(entry).getByRole('button', { name: 'Read history of Papyrus' })).toBeVisible()
    expect(within(entry).getByText('Documented relationship')).toBeVisible()
    expect(within(entry).getByText('Gameplay association')).toBeVisible()
    expect(within(entry).queryByRole('button', { name: 'Read history of Writing Reed' })).not.toBeInTheDocument()
    expect(within(entry).queryByText(/plant-material pen is an example/)).not.toBeInTheDocument()
    expect(within(entry).queryByRole('link', { name: 'Reed pen' })).not.toBeInTheDocument()
    await user.click(within(entry).getByRole('button', { name: 'Read history of Clay' }))
    expect(screen.getByRole('article', { name: 'Clay' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Historical notes not yet researched' })).toBeVisible()
  })

  it('browses related entries across ages, supports revisiting, and changes no slots, progress, rewards or saved data', async () => {
    discover('writing', 'quill', 'glass', 'lens')
    useGameStore.setState({ firstSlotId: 'ember', secondSlotId: 'tide' })
    const progress = snapshotProgress(useGameStore.getState())
    const saved = localStorage.getItem(SAVE_KEY)
    const user = await openAtlas()
    let entry = await selectEntry(user, 'Glass')
    await user.click(within(entry).getByRole('button', { name: 'Read history of Lens' }))
    entry = screen.getByRole('article', { name: 'Lens' })
    expect(within(entry).getByText('Iron Age · craft')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Lens', level: 3 })).toHaveFocus()
    await user.click(within(entry).getByRole('button', { name: 'Read history of Glass' }))
    await selectEntry(user, 'Writing')
    await selectEntry(user, 'Glass')
    expect(snapshotProgress(useGameStore.getState())).toEqual(progress)
    expect(useGameStore.getState()).toMatchObject({
      firstSlotId: 'ember', secondSlotId: 'tide', activeEraId: 'first-light',
    })
    expect(localStorage.getItem(SAVE_KEY)).toBe(saved)
  })

  it('retains access through reloaded discoveries without persisting the reading selection', async () => {
    useGameStore.getState().transmuteWith('stone', 'ember')
    const first = render(<HistoricalAtlas />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Historical Encyclopedia'))
    await selectEntry(user, 'Metal')
    const saved = localStorage.getItem(SAVE_KEY)
    first.unmount()
    useGameStore.setState(snapshotProgress(createGameStore().getState()))
    await openAtlas()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    await selectEntry(user, 'Metal')
    expect(screen.getByRole('article', { name: 'Metal' })).toBeVisible()
    expect(localStorage.getItem(SAVE_KEY)).toBe(saved)
  })

  it('distinguishes disputed optics, earlier agricultural precedents and abstract-only research', async () => {
    discover('lens', 'plow', 'road')
    const user = await openAtlas()
    let entry = await selectEntry(user, 'Lens')
    expect(within(entry).getByText('Contested interpretation · interpretation')).toBeVisible()
    expect(within(entry).getByText(/decorative inlay more likely/)).toBeVisible()
    entry = await selectEntry(user, 'Ard')
    expect(within(entry).getByText('Predates its gameplay age: earlier precedents')).toBeVisible()
    expect(within(entry).getByText('Abstract only; full paper not reviewed')).toBeVisible()
    entry = await selectEntry(user, 'Road')
    expect(within(entry).getByText(/3838 and 3806 BCE/)).toBeVisible()
    expect(within(entry).getByText(/not invention dates for all roads/)).toBeVisible()
  })

  it('does not present pending research as a reference or fabricate history for unresearched discoveries', async () => {
    discover('quill')
    const user = await openAtlas()
    const entry = await selectEntry(user, 'Writing Reed')
    const pending = historicalResearch.sources.find((source) => source.verification.status === 'pending')!
    expect(within(entry).queryByRole('link', { name: pending.title })).not.toBeInTheDocument()
    expect(entry.querySelector(`a[href="${pending.url}"]`)).toBeNull()
    const fallback = await selectEntry(user, 'Fire')
    expect(within(fallback).getByText(/No verified historical record is available/)).toBeVisible()
    expect(within(fallback).getByText(/Atlas description \(gameplay, not verified history\)/)).toBeVisible()
    expect(within(fallback).queryByRole('link')).not.toBeInTheDocument()
    expect(within(fallback).queryByText('Historical dates and geography')).not.toBeInTheDocument()
  })

  it('supports case-insensitive keyboard search and focuses the selected entry heading', async () => {
    discover('metal')
    const user = await openAtlas()
    await user.click(screen.getByRole('searchbox'))
    await user.keyboard('mEtAl')
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(1)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Open historical entry for Metal' })).toHaveFocus()
    await user.keyboard('[Enter]')
    expect(screen.getByRole('heading', { name: 'Metal', level: 3 })).toHaveFocus()
  })

  it.each(historicalResearch.records)('renders complete sourced notes for $elementName without formula controls', async (record) => {
    discover(record.elementId)
    const user = await openAtlas()
    const entry = await selectEntry(user, record.elementName)
    expect(within(entry).getByText('Historical overview')).toBeVisible()
    expect(within(entry).getByText('Manufacture and use')).toBeVisible()
    expect(within(entry).getByText('Historical uncertainty')).toBeVisible()
    expect(within(entry).getByText('Symbolic combinations: gameplay abstractions')).toBeVisible()
    expect(within(entry).getAllByRole('link').length).toBeGreaterThan(0)
    expect(within(entry).getAllByRole('button')).toHaveLength(1)
    expect(within(entry).getByRole('button', { name: `Mark ${record.elementName} as read` })).toBeVisible()
    expect(within(entry).queryByRole('button', { name: /Prepare|Insight/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Open historical entry for ${record.elementName}` }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(elements.find((element) => element.id === record.elementId)).toBeDefined()
  })
})
