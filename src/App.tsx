import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  BookOpen,
  FlaskConical,
  Layers3,
  RotateCcw,
  Settings,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Codex } from './features/codex/Codex'
import { ChallengeHub } from './features/challenges/ChallengeHub'
import { ChallengeRun } from './features/challenges/ChallengeRun'
import { Journal } from './features/journal/Journal'
import { HistoricalAtlas, type HistoricalAtlasHandle } from './features/journal/HistoricalAtlas'
import { Settings as SettingsDialog } from './features/settings/Settings'
import { Worktable } from './features/worktable/Worktable'
import { elements, eras } from './game/content'
import type { ChallengeDefinition } from './game/content/challenges'
import { useGameStore } from './game/state/useGameStore'
import './Simple.css'

function App() {
  const [activeSection, setActiveSection] = useState<'play' | 'atlas' | 'challenges'>('play')
  const previousSection = useRef(activeSection)
  const [activePanel, setActivePanel] = useState<
    'combine' | 'elements' | 'guide'
  >('combine')
  const atlas = useRef<HistoricalAtlasHandle>(null)
  const historyReturnTarget = useRef<HTMLButtonElement | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDefinition | null>(null)
  const challengeReturnTarget = useRef<HTMLButtonElement | null>(null)
  const challengeSurface = useRef<HTMLDivElement>(null)
  const returningFromChallenge = useRef(false)
  useEffect(() => useGameStore.connectProgress(), [])
  useEffect(() => {
    if (previousSection.current === activeSection) return
    previousSection.current = activeSection
    if (historyReturnTarget.current) {
      if (activeSection === 'atlas') {
        document.getElementById('atlas-history-title')?.focus()
        return
      } else if (activeSection === 'play') {
        historyReturnTarget.current.focus()
        historyReturnTarget.current = null
        return
      }
    }
    if (activeSection === 'challenges' && activeChallenge) {
      challengeSurface.current?.querySelector<HTMLButtonElement>('button')?.focus()
      return
    }
    const headingId = activeSection === 'atlas' ? 'atlas-title' : activeSection === 'challenges' ? 'challenges-title' : {
      combine: 'worktable-title',
      elements: 'codex-title',
      guide: 'journal-title',
    }[activePanel]
    document.getElementById(headingId)?.focus()
  }, [activeSection, activePanel, activeChallenge])
  useEffect(() => {
    if (activeChallenge) {
      challengeSurface.current?.querySelector<HTMLButtonElement>('button')?.focus()
      returningFromChallenge.current = true
    } else if (returningFromChallenge.current) {
      challengeReturnTarget.current?.focus()
      challengeReturnTarget.current = null
      returningFromChallenge.current = false
    }
  }, [activeChallenge])
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const activeEraId = useGameStore((state) => state.activeEraId)
  const setActiveEra = useGameStore((state) => state.setActiveEra)
  const placeElement = useGameStore((state) => state.placeElement)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const toggleSound = useGameStore((state) => state.toggleSound)
  const persistenceError = useGameStore((state) => state.persistenceError)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const era = eras.find((candidate) => candidate.id === activeEraId) ?? eras[0]
  const progress = Math.round((discoveredIds.length / elements.length) * 100)

  function handleDragEnd(event: DragEndEvent) {
    const elementId = String(event.active.id).replace('element/', '')
    const slotId = event.over?.id
    if (slotId === 'slot-first' || slotId === 'slot-second') {
      placeElement(slotId === 'slot-first' ? 'first' : 'second', elementId)
    }
  }

  function handleReset() {
    if (window.confirm('Return the journal to its first four essences?')) {
      resetProgress()
    }
  }

  function launchChallenge(challenge: ChallengeDefinition, trigger: HTMLButtonElement) {
    challengeReturnTarget.current = trigger
    setActiveSection('challenges')
    setActiveChallenge(challenge)
  }

  function viewHistory(elementId: string, trigger: HTMLButtonElement) {
    historyReturnTarget.current = trigger
    atlas.current?.openEntry(elementId)
    setActiveSection('atlas')
  }

  return (
    <div className="game-shell" data-active-section={activeSection} data-challenge-active={Boolean(activeChallenge)}>
      <header className="game-header">
        <div className="header-brand">
          <span className="brand-mark" aria-hidden="true">
            <FlaskConical className="brand-icon" size={22} />
          </span>
          <span className="brand-copy">
            <small>Mix Lab</small>
            <strong className="app-name">The Unwritten Atlas</strong>
          </span>
        </div>

        <nav className="section-nav" aria-label="Main navigation">
          <button
            type="button"
            aria-controls="play-section"
            aria-describedby="play-navigation-help"
            aria-pressed={activeSection === 'play'}
            data-active={activeSection === 'play'}
            onClick={() => setActiveSection('play')}
          >
            <FlaskConical size={18} aria-hidden="true" />
            Play
          </button>
          <button
            type="button"
            aria-controls="atlas-section"
            aria-describedby="atlas-navigation-help"
            aria-pressed={activeSection === 'atlas'}
            data-active={activeSection === 'atlas'}
            onClick={() => setActiveSection('atlas')}
          >
            <BookOpen size={18} aria-hidden="true" />
            Atlas
          </button>
          <button
            type="button"
            aria-controls="challenges-section"
            aria-describedby="challenges-navigation-help"
            aria-pressed={activeSection === 'challenges'}
            data-active={activeSection === 'challenges'}
            onClick={() => setActiveSection('challenges')}
          >
            <Trophy size={18} aria-hidden="true" />
            Challenges
          </button>
          <span id="play-navigation-help" className="sr-only">Gameplay: Elements, Combine, and Guide.</span>
          <span id="atlas-navigation-help" className="sr-only">Historical Encyclopedia for discovered entries. Reading is free.</span>
          <span id="challenges-navigation-help" className="sr-only">Rainmaker and eleven isolated Learning Labs.</span>
        </nav>

        <nav className="era-switcher" aria-label="Play ages" hidden={activeSection !== 'play'}>
          {eras.map((candidate) => {
            const isUnlocked = unlockedEraIds.includes(candidate.id)
            return (
              <button
                key={candidate.id}
                type="button"
                data-active={candidate.id === era.id}
                aria-current={candidate.id === era.id ? 'page' : undefined}
                title={candidate.subtitle}
                disabled={!isUnlocked}
                onClick={() => setActiveEra(candidate.id)}
              >
                {candidate.name}
                {candidate.dateRange && (
                  <small className="era-date-range">{candidate.dateRange}</small>
                )}
              </button>
            )
          })}
        </nav>

        <div className="header-progress" aria-label={`${progress}% discovered`}>
          <Trophy size={17} aria-hidden="true" />
          <span className="progress-label">
            <strong>{discoveredIds.length}</strong> / {elements.length}
          </span>
          <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            className="icon-button sound-btn"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            className="icon-button reset-btn"
            disabled={Boolean(activeChallenge)}
            onClick={handleReset}
            aria-label="Reset journal"
            title="Reset journal"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      {persistenceError && activeSection !== 'atlas' && <p className="persistence-error" role="alert">{persistenceError}</p>}
      {settingsOpen && (
        <SettingsDialog
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Keep sections mounted so navigation preserves campaign, reading and unfinished runs. */}
      <main id="play-section" className="play-section" aria-label="Play" hidden={activeSection !== 'play'}>
        <div className="play-workspace">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="game-layout" data-active-panel={activePanel}>
              <Codex onElementSelected={() => setActivePanel('combine')} />
              <Worktable />
              <Journal
                eraId={era.id}
                challengeName={era.name}
                discoveryGoal={era.discoveryGoal}
                landmarkIds={era.landmarkIds}
                onCombinationPrepared={() => setActivePanel('combine')}
                onViewHistory={viewHistory}
              />
            </div>
          </DndContext>

          <nav className="mobile-panel-nav" aria-label="Game panels">
            <button
              type="button"
              aria-label="Show Combine panel"
              data-active={activePanel === 'combine'}
              aria-pressed={activePanel === 'combine'}
              onClick={() => setActivePanel('combine')}
            >
              <Sparkles size={18} aria-hidden="true" />
              Combine
            </button>
            <button
              type="button"
              aria-label="Show Elements panel"
              data-active={activePanel === 'elements'}
              aria-pressed={activePanel === 'elements'}
              onClick={() => setActivePanel('elements')}
            >
              <Layers3 size={18} aria-hidden="true" />
              Elements
            </button>
            <button
              type="button"
              aria-label="Show Guide panel"
              data-active={activePanel === 'guide'}
              aria-pressed={activePanel === 'guide'}
              onClick={() => setActivePanel('guide')}
            >
              <BookOpen size={18} aria-hidden="true" />
              Guide
            </button>
          </nav>
        </div>
      </main>
      <main id="atlas-section" className="atlas-page" aria-label="Atlas" hidden={activeSection !== 'atlas'}>
        <HistoricalAtlas ref={atlas} />
      </main>
      <main id="challenges-section" className="challenges-page" aria-label="Challenges" hidden={activeSection !== 'challenges'}>
        <div hidden={Boolean(activeChallenge)}>
          <ChallengeHub onChallengeSelected={launchChallenge} />
        </div>
        {activeChallenge && (
          <div className="challenge-surface" ref={challengeSurface}>
            <ChallengeRun key={activeChallenge.id} challenge={activeChallenge} onExit={() => setActiveChallenge(null)} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
