// @vitest-environment jsdom

import '../../game/state/testSupport'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { elementsById } from '../../game/content'
import { learningChallenges, rainmakerChallenge } from '../../game/content/challenges'
import { snapshotProgress, useGameStore } from '../../game/state/useGameStore'
import { ChallengeHub } from './ChallengeHub'

beforeEach(() => {
  localStorage.clear()
  useGameStore.getState().resetProgress()
})
afterEach(cleanup)

describe('ChallengeHub', () => {
  it('lists Rainmaker and all eleven labs with supplied elements and no campaign-age locks', async () => {
    const user = userEvent.setup()
    const launch = vi.fn()
    const before = snapshotProgress(useGameStore.getState())
    const disk = localStorage.getItem('unwritten-atlas-progress')
    render(<ChallengeHub onChallengeSelected={launch} />)
    expect(screen.getAllByRole('article')).toHaveLength(12)
    expect(screen.getAllByText('Not completed', { exact: true })).toHaveLength(12)
    expect(screen.queryByText(/^Best:/)).not.toBeInTheDocument()
    for (const challenge of [rainmakerChallenge, ...learningChallenges]) {
      const card = within(screen.getByRole('article', { name: challenge.name }))
      expect(card.getByText('Target:')).toHaveTextContent(`Target: ${elementsById.get(challenge.targetId)!.name}`)
      expect(card.getByText(`Starting elements: ${challenge.starterIds.map((id) => elementsById.get(id)!.name).join(', ')}.`)).toBeVisible()
      const button = card.getByRole('button', { name: `Play ${challenge.name}` })
      expect(button).toBeEnabled()
      await user.click(button)
      expect(launch).toHaveBeenLastCalledWith(challenge, button)
    }
    expect(snapshotProgress(useGameStore.getState())).toEqual(before)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
  })

  it('displays and updates existing completion records without awarding or saving anything', () => {
    useGameStore.setState({
      challengeRecords: [
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
        { challengeId: 'bronze-lab', completed: true, bestAttemptCount: 5 },
      ],
    })
    const disk = localStorage.getItem('unwritten-atlas-progress')
    const credits = useGameStore.getState().insightCredits
    render(<ChallengeHub onChallengeSelected={vi.fn()} />)
    const rainmaker = within(screen.getByRole('article', { name: 'Rainmaker' }))
    expect(rainmaker.getByText('Completed', { exact: true })).toBeVisible()
    expect(rainmaker.getByText('Best:')).toHaveTextContent('Best: 4 attempts')
    const bronze = within(screen.getByRole('article', { name: 'Bronze Lab' }))
    expect(bronze.getByText('Completed', { exact: true })).toBeVisible()
    expect(bronze.getByText('Best:')).toHaveTextContent('Best: 5 attempts')
    act(() => useGameStore.setState({
      challengeRecords: [
        { challengeId: 'rainmaker', completed: true, bestAttemptCount: 4 },
        { challengeId: 'bronze-lab', completed: true, bestAttemptCount: 3 },
      ],
    }))
    expect(bronze.getByText('Best:')).toHaveTextContent('Best: 3 attempts')
    expect(screen.getAllByText('Not completed', { exact: true })).toHaveLength(10)
    expect(useGameStore.getState().insightCredits).toBe(credits)
    expect(localStorage.getItem('unwritten-atlas-progress')).toBe(disk)
  })
})
