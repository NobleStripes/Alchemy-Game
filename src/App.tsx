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
  const placeElement = useGameStore((state) => state.placeElement)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const era = eras[0]
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
        <strong className="app-name">The Unwritten Atlas</strong>
        <span className="era-name">{era.name}</span>
        <div className="header-progress" aria-label={`${progress}% discovered`}>
          <span>{discoveredIds.length} / {elements.length}</span>
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
            challengeName={era.name}
            discoveryGoal={era.discoveryGoal}
            keystoneId={era.keystone}
          />
        </div>
      </DndContext>
    </div>
  )
}

export default App
