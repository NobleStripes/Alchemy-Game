import { useDraggable } from '@dnd-kit/core'
import { Search } from 'lucide-react'
import { useDeferredValue, useState, type CSSProperties } from 'react'
import { elements, elementsById } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface ElementTileProps {
  elementId: string
  onSelected?: () => void
}

function ElementTile({ elementId, onSelected }: ElementTileProps) {
  const element = elementsById.get(elementId)
  const selectElement = useGameStore((state) => state.selectElement)
  const firstSlotId = useGameStore((state) => state.firstSlotId)
  const secondSlotId = useGameStore((state) => state.secondSlotId)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `element/${elementId}` })

  if (!element) return null
  const slotLabel =
    firstSlotId === element.id
      ? 'Slot 1'
      : secondSlotId === element.id
        ? 'Slot 2'
        : null

  const style: CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="element-tile"
      aria-label={element.name}
      data-selected={Boolean(slotLabel)}
      data-category={element.category}
      data-dragging={isDragging}
      style={style}
      onClick={() => {
        selectElement(element.id)
        onSelected?.()
      }}
      {...listeners}
      {...attributes}
      aria-pressed={Boolean(slotLabel)}
    >
      <span className="element-sigil" aria-hidden="true">
        {element.sigil}
      </span>
      <span className="element-copy">
        <strong>{element.name}</strong>
        <small>{element.category}</small>
      </span>
      {slotLabel && (
        <span className="slot-badge" aria-hidden="true">{slotLabel}</span>
      )}
    </button>
  )
}

interface CodexProps {
  onElementSelected?: () => void
}

export function Codex({ onElementSelected }: CodexProps) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const visibleElements = elements.filter(
    (element) =>
      discoveredIds.includes(element.id) &&
      (element.name.toLowerCase().includes(deferredQuery) ||
        element.category.includes(deferredQuery)),
  )

  return (
    <aside className="codex" aria-labelledby="codex-title">
      <div className="section-heading">
        <h2 id="codex-title">Elements</h2>
        <span className="section-count">{discoveredIds.length} known</span>
      </div>

      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search discovered elements</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search elements"
        />
      </label>

      <div className="element-list">
        {visibleElements.map((element) => (
          <ElementTile
            key={element.id}
            elementId={element.id}
            onSelected={onElementSelected}
          />
        ))}
        {visibleElements.length === 0 && (
          <p className="empty-note">
            No discovered element matches “{query.trim()}”.
          </p>
        )}
      </div>
    </aside>
  )
}