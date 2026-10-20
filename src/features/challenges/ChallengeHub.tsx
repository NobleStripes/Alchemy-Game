import { FlaskConical, Trophy } from 'lucide-react'
import type { ChallengeDefinition } from '../../game/content/challenges'
import { useGameStore } from '../../game/state/useGameStore'

interface ChallengeHubProps {
  onChallengeSelected: (challenge: ChallengeDefinition, trigger: HTMLButtonElement) => void
}

export function ChallengeHub({ onChallengeSelected }: ChallengeHubProps) {
  const { elementsById, challenges } = useGameStore((state) => state.catalog)
  const records = useGameStore((state) => state.challengeRecords)

  return (
    <section className="challenge-hub" aria-labelledby="challenges-title">
      <h1 id="challenges-title" tabIndex={-1}>Challenges</h1>
      <p>{challenges.length === 12 ? 'Play Rainmaker or explore eleven Learning Labs' : `Explore ${challenges.length} isolated challenges`}, available from any campaign age. Runs use supplied elements and do not change campaign discoveries or formulas.</p>
      <p>No Insight cost, facts quiz or reading requirement. Each saved first completion earns +1 Insight up to the three-credit cap. Switching sections keeps your current run; reloading does not.</p>
      <div className="challenge-cards">
        {challenges.map((challenge) => {
          const record = records.find((candidate) => candidate.challengeId === challenge.id)
          const target = elementsById.get(challenge.targetId)!
          return (
            <article className="challenge-card" key={challenge.id} aria-labelledby={`challenge-card-${challenge.id}`}>
              <span className="challenge-kind">
                {challenge.education ? <FlaskConical size={18} aria-hidden="true" /> : <Trophy size={18} aria-hidden="true" />}
                {challenge.education ? 'Learning Lab' : 'Replay challenge'}
              </span>
              <h2 id={`challenge-card-${challenge.id}`}>{challenge.name}</h2>
              <p>Target: <strong>{target.name}</strong></p>
              <p className="challenge-starters">Starting elements: {challenge.starterIds.map((id) => elementsById.get(id)!.name).join(', ')}.</p>
              <p className="challenge-card-record">{record?.completed ? 'Completed' : 'Not completed'}</p>
              {record && <p>Best: <strong>{record.bestAttemptCount} attempts</strong></p>}
              <button type="button" onClick={(event) => onChallengeSelected(challenge, event.currentTarget)}>
                Play {challenge.name}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
