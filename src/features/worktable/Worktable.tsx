import { useDroppable } from '@dnd-kit/core'
import { Sparkles, X } from 'lucide-react'
import { elementsById } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface TableSlotProps {
  name: 'first' | 'second'
  elementId: string | null
}

function TableSlot({ name, elementId }: TableSlotProps) {
  const element = elementId ? elementsById.get(elementId) : null
  const clearSlot = useGameStore((state) => state.clearSlot)
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${name}` })

  return (
    <div
      ref={setNodeRef}
      className="table-slot"
      data-filled={Boolean(element)}
      data-over={isOver}
    >
      {element ? (
        <>
          <span
            className="slot-sigil"
            data-category={element.category}
            aria-hidden="true"
          >
            {element.sigil}
          </span>
          <strong>{element.name}</strong>
          <button
            type="button"
            className="icon-button clear-slot"
            onClick={() => clearSlot(name)}
            aria-label={`Remove ${element.name}`}
            title={`Remove ${element.name}`}
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="empty-sigil" aria-hidden="true">
            {name === 'first' ? 'I' : 'II'}
          </span>
          <span>Empty vessel</span>
        </>
      )}
    </div>
  )
}

export function Worktable() {
  const firstSlotId = useGameStore((state) => state.firstSlotId)
  const secondSlotId = useGameStore((state) => state.secondSlotId)
  const lastAttempt = useGameStore((state) => state.lastAttempt)
  const transmute = useGameStore((state) => state.transmute)
  const result = lastAttempt?.resultId
    ? elementsById.get(lastAttempt.resultId)
    : null

  return (
    <main className="worktable" aria-labelledby="worktable-title">
      <div className="section-heading centered">
        <span className="eyebrow">The brass athanor</span>
        <h1 id="worktable-title">The Unwritten Atlas</h1>
        <p>Set two known things upon the circle.</p>
      </div>

      <div className="transmutation-circle">
        <span className="orbit-mark mark-one" aria-hidden="true">III</span>
        <span className="orbit-mark mark-two" aria-hidden="true">VII</span>
        <div className="slot-row">
          <TableSlot name="first" elementId={firstSlotId} />
          <span className="combine-mark" aria-hidden="true">+</span>
          <TableSlot name="second" elementId={secondSlotId} />
        </div>

        <button type="button" className="transmute-button" onClick={transmute}>
          <Sparkles size={18} aria-hidden="true" />
          Transmute
        </button>
      </div>

      <div
        className="attempt-result"
        data-kind={lastAttempt?.kind ?? 'idle'}
        aria-live="polite"
      >
        {lastAttempt ? (
          <>
            {result && (
              <span
                className="result-sigil"
                data-category={result.category}
                aria-hidden="true"
              >
                {result.sigil}
              </span>
            )}
            <div>
              <strong>{lastAttempt.title}</strong>
              <p>{lastAttempt.detail}</p>
            </div>
          </>
        ) : (
          <p>The circle is quiet.</p>
        )}
      </div>
    </main>
  )
}