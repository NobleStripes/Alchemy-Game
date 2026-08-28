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
  RotateCcw,
  Shapes,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'
import { Codex } from './features/codex/Codex'
import { Journal } from './features/journal/Journal'
import { Worktable } from './features/worktable/Worktable'
import { elements, eras } from './game/content'
import { useGameStore } from './game/state/useGameStore'
import './Simple.css'

function App() {
  const [activePanel, setActivePanel] = useState<
    'combine' | 'elements' | 'guide'
  >('combine')
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const activeEraId = useGameStore((state) => state.activeEraId)
  const setActiveEra = useGameStore((state) => state.setActiveEra)
  const placeElement = useGameStore((state) => state.placeElement)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const soundEnabled = useGameStore((state) => state.soundEnabled)
  const toggleSound = useGameStore((state) => state.toggleSound)
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

  return (
    <div className="game-shell">
      <header className="game-header">
        <div className="header-brand">
          <Sparkles className="brand-icon" size={20} aria-hidden="true" />
          <strong className="app-name">The Unwritten Atlas</strong>
        </div>

        <nav className="era-switcher" aria-label="Atlas ages">
          {eras.map((candidate) => {
            const isUnlocked = unlockedEraIds.includes(candidate.id)
            return (
              <button
                key={candidate.id}
                type="button"
                data-active={candidate.id === era.id}
                aria-current={candidate.id === era.id ? 'page' : undefined}
                disabled={!isUnlocked}
                onClick={() => setActiveEra(candidate.id)}
              >
                {candidate.name}
              </button>
            )
          })}
        </nav>

        <div className="header-progress" aria-label={`${progress}% discovered`}>
          <span className="progress-label">{discoveredIds.length} / {elements.length}</span>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="header-actions">
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
            onClick={handleReset}
            aria-label="Reset journal"
            title="Reset journal"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="game-layout" data-active-panel={activePanel}>
          <Codex onElementSelected={() => setActivePanel('combine')} />
          <Worktable />
          <Journal
            eraId={era.id}
            challengeName={era.name}
            discoveryGoal={era.discoveryGoal}
            landmarkIds={era.landmarkIds}
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
          <FlaskConical size={18} aria-hidden="true" />
          Combine
        </button>
        <button
          type="button"
          aria-label="Show Elements panel"
          data-active={activePanel === 'elements'}
          aria-pressed={activePanel === 'elements'}
          onClick={() => setActivePanel('elements')}
        >
          <Shapes size={18} aria-hidden="true" />
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
  )
}

export default App
