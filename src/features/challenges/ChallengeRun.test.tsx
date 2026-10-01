// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { soundEngine } from '../../game/audio/audioEngine'
import { snapshotProgress, useGameStore } from '../../game/state/useGameStore'
import { ChallengeRun } from './ChallengeRun'

const storageKey = 'unwritten-atlas-progress'

function campaignSnapshot() {
  const state = useGameStore.getState()
  return {
    ...snapshotProgress(state),
    firstSlotId: state.firstSlotId,
    secondSlotId: state.secondSlotId,
    lastAttempt: state.lastAttempt,
  }
}

async function combine(user: ReturnType<typeof userEvent.setup>, first: string, second: string) {
  await user.click(screen.getByRole('button', { name: `Challenge ${first}` }))
  await user.click(screen.getByRole('button', { name: `Challenge ${second}` }))
  await user.click(screen.getByRole('button', { name: 'Combine challenge elements' }))
}

async function win(user: ReturnType<typeof userEvent.setup>) {
  for (const [first, second] of [['Water', 'Water'], ['Sea', 'Air'], ['Mist', 'Air'], ['Cloud', 'Water']]) {
    await combine(user, first, second)
  }
}

describe('ChallengeRun', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useGameStore.getState().resetProgress()
    useGameStore.getState().toggleSound()
    useGameStore.getState().prepareCombination('ember', 'stone')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('waits for confirmation, disables duplicate saves and navigation, then rewards once', async () => {
    useGameStore.setState({ insightCredits: 0 })
    const user = userEvent.setup()
    render(<ChallengeRun onExit={vi.fn()} />)
    await win(user)
    let release: (() => void) | undefined
    vi.spyOn(navigator.locks, 'request').mockImplementation((_name, _options, callback) =>
      new Promise((resolve) => { release = () => resolve(callback!(null)) }))
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(screen.getByRole('button', { name: 'Saving result' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Return to Atlas' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled()
    expect(useGameStore.getState().challengeRecords).toEqual([])
    expect(useGameStore.getState().insightCredits).toBe(0)
    release!()
    await waitFor(() => expect(screen.getByText(/First reward: \+1 Insight/)).toBeInTheDocument())
    expect(useGameStore.getState().insightCredits).toBe(1)
    expect(screen.getByRole('button', { name: 'Save result' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Return to Atlas' })).toBeEnabled()
  })

  it('runs immediately and completes without changing campaign memory or storage, even in StrictMode', async () => {
    const user = userEvent.setup()
    const before = campaignSnapshot()
    const disk = window.localStorage.getItem(storageKey)
    render(<StrictMode><ChallengeRun onExit={vi.fn()} /></StrictMode>)
    expect(screen.getByRole('heading', { name: 'Rainmaker' })).toBeInTheDocument()
    expect(screen.getByText('Target: Rain')).toBeInTheDocument()
    await win(user)
    expect(screen.getByText('Rain in 4 attempts')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Challenge Water' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Combine challenge elements' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear challenge slots' })).toBeDisabled()
    expect(campaignSnapshot()).toEqual(before)
    expect(window.localStorage.getItem(storageKey)).toBe(disk)
  })

  it.each([0, 3])('explicit save only changes completion records and capped credits (wallet %i)', async (credits) => {
    const user = userEvent.setup()
    useGameStore.setState({ insightCredits: credits })
    const before = campaignSnapshot()
    const beforeDisk = JSON.parse(window.localStorage.getItem(storageKey)!)
    const write = vi.spyOn(Storage.prototype, 'setItem')
    render(<StrictMode><ChallengeRun onExit={vi.fn()} /></StrictMode>)
    await win(user)
    expect(write).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    const challengeRecords = [{ challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 }]
    expect(campaignSnapshot()).toEqual({ ...before, challengeRecords, insightCredits: Math.min(3, credits + 1) })
    expect(JSON.parse(window.localStorage.getItem(storageKey)!)).toEqual({ ...beforeDisk, challengeRecords, insightCredits: Math.min(3, credits + 1) })
    expect(screen.getByText(credits === 3 ? /First reward claimed; Insight wallet is full/ : /First reward: \+1 Insight/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(write).toHaveBeenCalledTimes(1)
  })

  it('improves the best score on retry but never grants a second reward', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ insightCredits: 0 })
    render(<ChallengeRun onExit={vi.fn()} />)
    await combine(user, 'Water', 'Water')
    await win(user)
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(useGameStore.getState().challengeRecords[0].bestAttemptCount).toBe(5)
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    await win(user)
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(screen.getByText('4 attempts')).toBeInTheDocument()
    expect(useGameStore.getState().challengeRecords[0].bestAttemptCount).toBe(4)
    expect(useGameStore.getState().insightCredits).toBe(1)
    expect(screen.getByText(/No additional reward/)).toBeInTheDocument()
  })

  it('retries a failed result save without partial progress or reward', async () => {
    const user = userEvent.setup()
    useGameStore.setState({ insightCredits: 0 })
    const before = campaignSnapshot()
    const disk = window.localStorage.getItem(storageKey)
    render(<ChallengeRun onExit={vi.fn()} />)
    await win(user)
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Progress could not be saved.')
    expect(screen.getByRole('button', { name: 'Save result' })).toBeEnabled()
    expect(campaignSnapshot()).toEqual(before)
    expect(window.localStorage.getItem(storageKey)).toBe(disk)
    write.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(useGameStore.getState().insightCredits).toBe(1)
    expect(useGameStore.getState().persistenceError).toBeNull()
  })

  it('confirms abandoning or retrying a failed run and preserves campaign slots and discoveries', async () => {
    const user = userEvent.setup()
    const before = campaignSnapshot()
    const disk = window.localStorage.getItem(storageKey)
    const exit = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ChallengeRun onExit={exit} />)
    await combine(user, 'Water', 'Air')
    expect(screen.getByText('No reaction')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove challenge Water from slot 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Return to Atlas' }))
    expect(exit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getByText('No reaction')).toBeInTheDocument()
    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
    expect(screen.queryByText('No reaction')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Challenge Water' }))
    await user.click(screen.getByRole('button', { name: 'Return to Atlas' }))
    expect(exit).toHaveBeenCalledTimes(1)
    expect(campaignSnapshot()).toEqual(before)
    expect(window.localStorage.getItem(storageKey)).toBe(disk)
  })

  it('confirms discarding an unsaved completion for both Return and Retry', async () => {
    const user = userEvent.setup()
    const before = campaignSnapshot()
    const disk = window.localStorage.getItem(storageKey)
    const exit = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ChallengeRun onExit={exit} />)
    await win(user)
    await user.click(screen.getByRole('button', { name: 'Return to Atlas' }))
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining('has not been saved'))
    expect(exit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getByText('Rainmaker complete')).toBeInTheDocument()
    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.queryByRole('button', { name: 'Save result' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Challenge Rain' })).not.toBeInTheDocument()
    expect(campaignSnapshot()).toEqual(before)
    expect(window.localStorage.getItem(storageKey)).toBe(disk)
  })

  it('returns a saved completion without confirmation', async () => {
    const user = userEvent.setup()
    const exit = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    render(<ChallengeRun onExit={exit} />)
    await win(user)
    await user.click(screen.getByRole('button', { name: 'Save result' }))
    await user.click(screen.getByRole('button', { name: 'Return to Atlas' }))
    expect(exit).toHaveBeenCalledTimes(1)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('supports native keyboard selection, individual removal, clear-all, and campaign sound preference', async () => {
    const user = userEvent.setup()
    const selectSound = vi.spyOn(soundEngine, 'playSelect').mockImplementation(() => {})
    const before = campaignSnapshot()
    render(<ChallengeRun onExit={vi.fn()} />)
    screen.getByRole('button', { name: 'Challenge Water' }).focus()
    await user.keyboard('{Enter}{Enter}')
    expect(screen.getByRole('button', { name: 'Remove challenge Water from slot 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove challenge Water from slot 2' })).toBeInTheDocument()
    expect(selectSound).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Remove challenge Water from slot 2' }))
    await user.click(screen.getByRole('button', { name: 'Clear challenge slots' }))
    expect(screen.getAllByText('Empty vessel')).toHaveLength(2)
    expect(campaignSnapshot()).toEqual(before)
  })
})