import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { BookOpen, RotateCcw } from 'lucide-react'
import { Codex } from './features/codex/Codex'
import { Worktable } from './features/worktable/Worktable'
import { elements, eras } from './game/content'
import { useGameStore } from './game/state/useGameStore'
import './App.css'

function App() {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const placeElement = useGameStore((state) => state.placeElement)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const era = eras[0]
  const keystoneFound = discoveredIds.includes(era.keystone)
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
        <div className="brand-mark" aria-hidden="true">UA</div>
        <div className="era-heading">
          <span>Era I</span>
          <strong>{era.name}</strong>
        </div>
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
          <aside className="journal" aria-labelledby="journal-title">
            <div className="section-heading">
              <span className="eyebrow">Era progress</span>
              <h2 id="journal-title">
                <BookOpen size={20} aria-hidden="true" />
                Field Journal
              </h2>
            </div>

            <p className="era-subtitle">{era.subtitle}</p>
            <div className="journal-rule" />

            <div className="objective" data-complete={discoveredIds.length >= era.discoveryGoal}>
              <span className="objective-mark" aria-hidden="true" />
              <div>
                <strong>Catalogue {era.discoveryGoal} elements</strong>
                <p>{Math.min(discoveredIds.length, era.discoveryGoal)} recorded</p>
              </div>
            </div>
            <div className="objective" data-complete={keystoneFound}>
              <span className="objective-mark" aria-hidden="true" />
              <div>
                <strong>Kindle the Beacon</strong>
                <p>{keystoneFound ? 'Keystone discovered' : 'Keystone unknown'}</p>
              </div>
            </div>

            <div className="discovery-grid" aria-label="Discovery record">
              {elements.map((element) => {
                const isFound = discoveredIds.includes(element.id)
                return (
                  <span
                    key={element.id}
                    data-found={isFound}
                    title={isFound ? element.name : 'Unknown'}
                  >
                    {isFound ? element.sigil : '?'}
                  </span>
                )
              })}
            </div>
          </aside>
        </div>
      </DndContext>
    </div>
  )
}

export default App
