import { ArrowLeft, Check, FlaskConical, Plus, RotateCcw, Save, Trash2, Trophy, X } from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { soundEngine } from '../../game/audio/audioEngine'
import { elementsById } from '../../game/content'
import { rainmakerChallenge, type ChallengeDefinition } from '../../game/content/challenges'
import { historicalResearch } from '../../game/content/research'
import { createChallengeReducer, createChallengeState, type ChallengeAction, type ChallengeSlot } from '../../game/engine/challengeRules'
import { useGameStore } from '../../game/state/useGameStore'
import { RecipeHistory } from '../journal/RecipeHistory'
import { SourceReference } from '../journal/SourceReference'

export interface ChallengeRunProps {
  onExit: () => void
  challenge?: ChallengeDefinition
}

export function ChallengeRun({ onExit, challenge = rainmakerChallenge }: ChallengeRunProps) {
  const reducer = useMemo(() => createChallengeReducer(challenge), [challenge])
  const [run, dispatch] = useReducer(reducer, challenge, createChallengeState)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saved = useRef(false)
  const saving = useRef(false)
  const mounted = useRef(false)
  const [savePending, setSavePending] = useState(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const best = useGameStore((state) => state.challengeRecords.find((record) => record.challengeId === challenge.id)?.bestAttemptCount)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const target = elementsById.get(challenge.targetId)!
  const sources = historicalResearch.sources.filter((source) => challenge.education?.sourceIds.includes(source.id))

  function act(action: ChallengeAction) {
    const next = reducer(run, action)
    if (next === run) return
    dispatch(action)
    if (!soundEnabled) return
    if (action.type === 'combine') {
      if (next.result?.kind === 'failure') soundEngine.playFailure()
      else if (next.result?.kind === 'discovery') soundEngine.playNewDiscovery()
      else soundEngine.playMerge()
    } else if (action.type === 'select' || action.type === 'place') soundEngine.playSelect()
    else soundEngine.playClear()
  }

  function confirmDiscard() {
    if (saving.current) return false
    if (run.completed && !saved.current) return window.confirm(`Your ${challenge.name} result has not been saved. Discard it?`)
    if (!run.completed && (run.attemptCount > 0 || run.firstSlotId || run.secondSlotId)) {
      return window.confirm(`Leave this unfinished ${challenge.name} run?`)
    }
    return true
  }

  function retry() {
    if (!confirmDiscard()) return
    dispatch({ type: 'retry' })
    saved.current = false
    setSavedMessage(null)
    setSaveError(null)
  }

  async function saveResult() {
    if (!run.completed || saved.current || saving.current) return
    saving.current = true
    setSavePending(true)
    const receipt = await useGameStore.getState().recordChallengeCompletion(challenge.id, run.attemptCount)
    saving.current = false
    if (!mounted.current) return
    setSavePending(false)
    if (!receipt.saved) {
      setSaveError(useGameStore.getState().persistenceError ?? 'Result could not be saved. Try again.')
      return
    }
    saved.current = true
    setSaveError(null)
    setSavedMessage(receipt.firstCompletion
      ? receipt.insightEarned > 0 ? 'Result saved. First reward: +1 Insight.' : 'Result saved. First reward claimed; Insight wallet is full.'
      : 'Result saved. No additional reward.')
  }

  const resultElement = run.result?.resultId ? elementsById.get(run.result.resultId) : null

  return (
    <section className="challenge-run" aria-labelledby="challenge-title">
      <header className="challenge-header">
        <button type="button" disabled={savePending} onClick={() => { if (confirmDiscard()) onExit() }} aria-label="Return to Challenges" title="Return to Challenges">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <h1 id="challenge-title">{challenge.name}</h1>
          <p><span aria-hidden="true">{target.icon || target.sigil} </span>Target: {target.name}</p>
        </div>
        <div className="challenge-score">
          <p>Attempts: <strong>{run.attemptCount}</strong></p>
          <p>Best: <strong>{best === undefined ? 'Not completed' : `${best} attempts`}</strong></p>
        </div>
      </header>

      {challenge.education && (
        <section className="challenge-education history-entry" aria-label="Free historical explanation">
          <p>Experiment with the supplied elements. No facts quiz, Insight cost, or reading requirement. Only a saved first completion earns +1 Insight; lab discoveries do not unlock campaign entries.</p>
          <details>
            <summary>About this theme (free)</summary>
            <p>{challenge.education.overview}</p>
            <ol className="history-sources">
              {sources.map((source) => <li key={source.id}><SourceReference source={source} /></li>)}
            </ol>
          </details>
        </section>
      )}

      <div className="challenge-layout">
        <aside className="challenge-shelf" aria-labelledby="challenge-shelf-title">
          <h2 id="challenge-shelf-title">Elements</h2>
          <div className="challenge-elements">
            {run.discoveredIds.map((elementId) => {
              const element = elementsById.get(elementId)!
              const selected = run.firstSlotId === elementId || run.secondSlotId === elementId
              return (
                <button type="button" className="element-tile" data-category={element.category} data-selected={selected}
                  key={elementId} disabled={run.completed} aria-label={`Challenge ${element.name}`} aria-pressed={selected}
                  title={element.name} onClick={() => act({ type: 'select', elementId })}>
                  <span className="element-sigil" data-category={element.category} aria-hidden="true">{element.icon || element.sigil}</span>
                  <span className="element-copy"><strong>{element.name}</strong><small>{element.category}</small></span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="challenge-table" aria-labelledby="challenge-table-title">
          <h2 id="challenge-table-title">Combine</h2>
          <div className="challenge-slots">
            {(['first', 'second'] as ChallengeSlot[]).map((slot, index) => {
              const elementId = slot === 'first' ? run.firstSlotId : run.secondSlotId
              const element = elementId ? elementsById.get(elementId) : null
              return (
                <div className="challenge-slot" key={slot} data-category={element?.category}>
                  <span>Slot {index + 1}</span>
                  {element ? <>
                    <span aria-hidden="true">{element.icon || element.sigil}</span>
                    <strong>{element.name}</strong>
                    <button type="button" disabled={run.completed} aria-label={`Remove challenge ${element.name} from slot ${index + 1}`}
                      title={`Clear slot ${index + 1}`} onClick={() => act({ type: 'clearSlot', slot })}><X size={18} aria-hidden="true" /></button>
                  </> : <span>Empty vessel</span>}
                  {index === 0 && <Plus size={20} className="challenge-plus" aria-hidden="true" />}
                </div>
              )
            })}
          </div>

          <div className="challenge-actions">
            <button type="button" disabled={run.completed || !run.firstSlotId || !run.secondSlotId}
              onClick={() => act({ type: 'combine' })} aria-label="Combine challenge elements" title="Combine challenge elements">
              <FlaskConical size={20} aria-hidden="true" /> Combine
            </button>
            <button type="button" disabled={run.completed || (!run.firstSlotId && !run.secondSlotId)}
              onClick={() => act({ type: 'clearAll' })} aria-label="Clear challenge slots" title="Clear challenge slots">
              <Trash2 size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="challenge-result" role="status" aria-live="polite" data-outcome={run.result?.kind}>
            {run.completed ? <h2><Trophy size={22} aria-hidden="true" /> {challenge.name} complete</h2>
              : run.result?.kind === 'failure' ? <p>No reaction</p>
                : resultElement ? <p><span aria-hidden="true">{resultElement.icon || resultElement.sigil} </span>{run.result?.kind === 'known' ? 'Known' : 'Discovered'} {resultElement.name}</p>
                  : null}
            {run.completed && <p>{target.name} in {run.attemptCount} attempts</p>}
            {savedMessage && <p><Check size={18} aria-hidden="true" /> {savedMessage}</p>}
          </div>
          {run.result?.recipeId && <RecipeHistory recipeId={run.result.recipeId} />}
          {saveError && <p role="alert">{saveError}</p>}
          <div className="challenge-actions">
            {run.completed && <button type="button" disabled={savePending || Boolean(savedMessage)} onClick={saveResult} title="Save result">
              <Save size={20} aria-hidden="true" /> {savePending ? 'Saving result' : 'Save result'}
            </button>}
            <button type="button" disabled={savePending} onClick={retry} title={`Retry ${challenge.name}`}><RotateCcw size={20} aria-hidden="true" /> Retry</button>
          </div>
        </section>
      </div>
    </section>
  )
}