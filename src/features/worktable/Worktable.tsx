import { useDroppable } from '@dnd-kit/core'
import { CopyPlus, Sparkles, Trash2, X } from 'lucide-react'
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
            {element.icon || element.sigil}
          </span>
          <strong className="slot-name">{element.name}</strong>
          <span className="slot-cat">{element.category}</span>
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
        <div className="empty-slot-content">
          <span className="empty-sigil" aria-hidden="true">
            {name === 'first' ? 'I' : 'II'}
          </span>
          <span className="empty-text">Empty vessel</span>
          <small className="empty-hint">Drop or tap element</small>
        </div>
      )}
    </div>
  )
}

export function Worktable() {
  const firstSlotId = useGameStore((state) => state.firstSlotId)
  const secondSlotId = useGameStore((state) => state.secondSlotId)
  const lastAttempt = useGameStore((state) => state.lastAttempt)
  const transmute = useGameStore((state) => state.transmute)
  const clearAllSlots = useGameStore((state) => state.clearAllSlots)
  const result = lastAttempt?.resultId
    ? elementsById.get(lastAttempt.resultId)
    : null

  const isReady = Boolean(firstSlotId && secondSlotId)
  const hasAnyElement = Boolean(firstSlotId || secondSlotId)

  return (
    <main className="worktable" aria-labelledby="worktable-title">
      <div className="section-heading centered">
        <h1 id="worktable-title">Combine elements</h1>
        <p>Drop or select elements onto the altar to forge new discoveries.</p>
      </div>

      <div className="transmutation-circle" data-ready={isReady}>
        <div className="altar-glow" aria-hidden="true" />

        <div className="slot-row">
          <TableSlot
            name="first"
            elementId={firstSlotId}
            canRepeat={Boolean(firstSlotId && !secondSlotId)}
          />
          <div className="combine-mark-wrap">
            <span className="combine-mark" aria-hidden="true">+</span>
          </div>
          <TableSlot
            name="second"
            elementId={secondSlotId}
            canRepeat={Boolean(secondSlotId && !firstSlotId)}
          />
        </div>

        <div className="altar-actions">
          <button
            type="button"
            className="transmute-button"
            data-ready={isReady}
            onClick={transmute}
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>Combine</span>
          </button>

          {hasAnyElement && (
            <button
              type="button"
              className="clear-table-btn"
              onClick={clearAllSlots}
              aria-label="Clear table"
              title="Clear both slots"
            >
              <Trash2 size={16} aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>
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
                {result.icon || result.sigil}
              </span>
            )}
            <div className="attempt-copy">
              <strong>{lastAttempt.title}</strong>
              <p>{lastAttempt.detail}</p>
              {lastAttempt.unlockedEra && (
                <p className="era-unlocked">
                  ✨ {lastAttempt.unlockedEra.name} unlocked!
                  {lastAttempt.unlockedEra.grantNames.length > 0 &&
                    ` ${lastAttempt.unlockedEra.grantNames.join(', ')} added to the Atlas.`}
                </p>
              )}
              {Boolean(lastAttempt.insightEarned) && (
                <p className="insight-earned">
                  +{lastAttempt.insightEarned} Insight earned.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="circle-quiet">The circle is quiet.</p>
        )}
      </div>
    </main>
  )
}