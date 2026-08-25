import { useDraggable } from '@dnd-kit/core'
import { Search } from 'lucide-react'
import { useDeferredValue, useState, type CSSProperties } from 'react'
import { elements, elementsById } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface ElementTileProps {
  elementId: string
}

function ElementTile({ elementId }: ElementTileProps) {
  const element = elementsById.get(elementId)
  const selectElement = useGameStore((state) => state.selectElement)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `element/${elementId}` })

  if (!element) return null

  const style: CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="element-tile"
      aria-label={element.name}
      data-category={element.category}
      data-dragging={isDragging}
      style={style}
      onClick={() => selectElement(element.id)}
      {...listeners}
      {...attributes}
    >
      <span className="element-sigil" aria-hidden="true">
        {element.sigil}
      </span>
      <span className="element-copy">
        <strong>{element.name}</strong>
        <small>{element.category}</small>
      </span>
    </button>
  )
}

export function Codex() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const visibleElements = elements.filter(
    (element) =>
      discoveredIds.includes(element.id) &&
      element.name.toLowerCase().includes(deferredQuery),
  )

  return (
    <aside className="codex" aria-labelledby="codex-title">
      <div className="section-heading">
        <span className="eyebrow">Known matter</span>
        <h2 id="codex-title">The Codex</h2>
      </div>

      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search discovered elements</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the leaves"
        />
      </label>

      <div className="element-list">
        {visibleElements.map((element) => (
          <ElementTile key={element.id} elementId={element.id} />
        ))}
        {visibleElements.length === 0 && (
          <p className="empty-note">No known element bears that name.</p>
        )}
      </div>
    </aside>
  )
}