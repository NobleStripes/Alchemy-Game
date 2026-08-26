import { useDroppable } from '@dnd-kit/core'
import { CopyPlus, Sparkles, X } from 'lucide-react'
import { elementsById } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface TableSlotProps {
  name: 'first' | 'second'
  elementId: string | null
  canRepeat: boolean
}

function TableSlot({ name, elementId, canRepeat }: TableSlotProps) {
  const element = elementId ? elementsById.get(elementId) : null
  const clearSlot = useGameStore((state) => state.clearSlot)
  const placeElement = useGameStore((state) => state.placeElement)
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
          {canRepeat && (
            <button
              type="button"
              className="repeat-element"
              onClick={() =>
                placeElement(name === 'first' ? 'second' : 'first', element.id)
              }
              aria-label={`Use ${element.name} again`}
            >
              <CopyPlus size={14} aria-hidden="true" />
              Use again
            </button>
          )}
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
        <h1 id="worktable-title">Combine elements</h1>
        <p>Click or drag two elements into the slots.</p>
      </div>

      <div className="transmutation-circle">
        <div className="slot-row">
          <TableSlot
            name="first"
            elementId={firstSlotId}
            canRepeat={Boolean(firstSlotId && !secondSlotId)}
          />
          <span className="combine-mark" aria-hidden="true">+</span>
          <TableSlot
            name="second"
            elementId={secondSlotId}
            canRepeat={Boolean(secondSlotId && !firstSlotId)}
          />
        </div>

        <button type="button" className="transmute-button" onClick={transmute}>
          <Sparkles size={18} aria-hidden="true" />
          Combine
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