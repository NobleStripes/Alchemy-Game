import { useDraggable } from '@dnd-kit/core'
import { ArrowUpDown, Search, Star, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { elements, elementsById } from '../../game/content'
import type { ElementCategory } from '../../game/domain/types'
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
  const favoriteIds = useGameStore((state) => state.favoriteIds)
  const toggleFavorite = useGameStore((state) => state.toggleFavorite)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `element/${elementId}` })

  if (!element) return null
  const isFavorite = favoriteIds.includes(element.id)
  const slotLabel =
    firstSlotId === element.id
      ? 'Slot 1'
      : secondSlotId === element.id
        ? 'Slot 2'
        : null

  const style: CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  function handleFavoriteClick(e: MouseEvent) {
    e.stopPropagation()
    toggleFavorite(elementId)
  }

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
      <span className="element-sigil" data-category={element.category} aria-hidden="true">
        {element.icon || element.sigil}
      </span>
      <span className="element-copy">
        <strong>{element.name}</strong>
        <small>{element.category}</small>
      </span>
      {slotLabel && (
        <span className="slot-badge" aria-hidden="true">{slotLabel}</span>
      )}
      <button
        type="button"
        className="tile-fav-btn"
        data-active={isFavorite}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? `Unfavorite ${element.name}` : `Favorite ${element.name}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </button>
  )
}

interface CodexProps {
  onElementSelected?: () => void
}

type SortOrder = 'alphabetical' | 'category' | 'recent'

export function Codex({ onElementSelected }: CodexProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const favoriteIds = useGameStore((state) => state.favoriteIds)

  const categories: Array<{ id: string; label: string; icon?: string }> = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Starred', icon: '⭐' },
    { id: 'essence', label: 'Essence' },
    { id: 'matter', label: 'Matter' },
    { id: 'weather', label: 'Weather' },
    { id: 'life', label: 'Life' },
    { id: 'craft', label: 'Craft' },
    { id: 'society', label: 'Society' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'transport', label: 'Transport' },
  ]

  const visibleElements = useMemo(() => {
    const result = elements.filter((element) => {
      if (!discoveredIds.includes(element.id)) return false

      if (selectedCategory === 'favorites') {
        if (!favoriteIds.includes(element.id)) return false
      } else if (selectedCategory !== 'all') {
        if (element.category !== (selectedCategory as ElementCategory)) return false
      }

      if (deferredQuery) {
        const matchesName = element.name.toLowerCase().includes(deferredQuery)
        const matchesCategory = element.category.includes(deferredQuery)
        if (!matchesName && !matchesCategory) return false
      }

      return true
    })

    if (sortOrder === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOrder === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    } else if (sortOrder === 'recent') {
      result.sort((a, b) => discoveredIds.indexOf(b.id) - discoveredIds.indexOf(a.id))
    }

    return result
  }, [discoveredIds, favoriteIds, selectedCategory, deferredQuery, sortOrder])

  return (
    <aside className="codex" aria-labelledby="codex-title">
      <div className="section-heading">
        <h2 id="codex-title">Elements</h2>
        <span className="section-count">{discoveredIds.length} known</span>
      </div>

      <div className="codex-search-row">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search discovered elements</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search elements..."
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>

        <div className="sort-control">
          <label htmlFor="sort-select" className="sr-only">Sort elements</label>
          <div className="sort-select-wrapper">
            <ArrowUpDown size={14} aria-hidden="true" />
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="alphabetical">A-Z</option>
              <option value="recent">Recent</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      <div className="category-tabs" role="tablist" aria-label="Element categories">
        {categories.map((cat) => {
          const count =
            cat.id === 'all'
              ? discoveredIds.length
              : cat.id === 'favorites'
                ? favoriteIds.filter((id) => discoveredIds.includes(id)).length
                : elements.filter(
                    (el) => el.category === cat.id && discoveredIds.includes(el.id),
                  ).length

          if (cat.id !== 'all' && cat.id !== 'favorites' && count === 0) return null

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className="category-tab"
              data-active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
              <span>{cat.label}</span>
              <span className="tab-count">{count}</span>
            </button>
          )
        })}
      </div>

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
            {query.trim()
              ? `No discovered element matches “${query.trim()}”.`
              : 'No elements found in this category.'}
          </p>
        )}
      </div>
    </aside>
  )
}