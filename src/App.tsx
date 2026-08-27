import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { RotateCcw } from 'lucide-react'
import { Codex } from './features/codex/Codex'
import { Journal } from './features/journal/Journal'
import { Worktable } from './features/worktable/Worktable'
import { elements, eras } from './game/content'
import { useGameStore } from './game/state/useGameStore'
import './Simple.css'

function App() {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const activeEraId = useGameStore((state) => state.activeEraId)
  const setActiveEra = useGameStore((state) => state.setActiveEra)
  const placeElement = useGameStore((state) => state.placeElement)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const era = eras.find((candidate) => candidate.id === activeEraId) ?? eras[0]
  const availableElements = elements.filter((element) =>
    unlockedEraIds.includes(element.era),
  )
  const availableDiscoveryCount = availableElements.filter((element) =>
    discoveredIds.includes(element.id),
  ).length
  const progress = Math.round(
    (availableDiscoveryCount / availableElements.length) * 100,
  )

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
        <strong className="app-name">The Unwritten Atlas</strong>
        <nav className="era-switcher" aria-label="Atlas ages">
          {eras.map((candidate) => {
            const isUnlocked = unlockedEraIds.includes(candidate.id)
            return (
              <button
                key={candidate.id}
                type="button"
                data-active={candidate.id === era.id}
                disabled={!isUnlocked}
                onClick={() => setActiveEra(candidate.id)}
              >
                {candidate.name}
              </button>
            )
          })}
        </nav>
        <div className="header-progress" aria-label={`${progress}% discovered`}>
          <span>{availableDiscoveryCount} / {availableElements.length}</span>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={handleReset}
          aria-label="Reset journal"
          title="Reset journal"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="game-layout">
          <Codex />
          <Worktable />
          <Journal
            eraId={era.id}
            challengeName={era.name}
            discoveryGoal={era.discoveryGoal}
            landmarkIds={era.landmarkIds}
          />
        </div>
      </DndContext>
    </div>
  )
}

export default App
