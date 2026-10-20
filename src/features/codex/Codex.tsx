import { useDndContext, useDraggable } from '@dnd-kit/core'
import { ArrowUpDown, ChevronDown, EyeOff, Layers, Search, Star, X } from 'lucide-react'
import { useDeferredValue, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import type { ElementCategory } from '../../game/domain/types'
import { getExhaustedElements, getTemporarilyExhaustedElements } from '../../game/engine/elementStatus'
import { useGameStore } from '../../game/state/useGameStore'

function EraShelf({ eraId, children }: { eraId: string; children: ReactNode }) {
  const ref = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const node = ref.current
    return () => {
      if (node?.contains(document.activeElement) && !node.closest('[hidden]')) {
        document.getElementById('codex-title')?.focus()
      }
    }
  }, [])
  return <section ref={ref} className="era-shelf" aria-labelledby={`shelf-header-${eraId}`}>{children}</section>
}

interface ElementTileProps {
  elementId: string
  onSelected?: () => void
  status?: 'Terminal' | 'Exhausted for now'
}

function ElementTile({ elementId, onSelected, status }: ElementTileProps) {
  const { elementsById } = useGameStore((state) => state.catalog)
  const element = elementsById.get(elementId)
  const elementEra = element?.era
  const selectElement = useGameStore((state) => state.selectElement)
  const firstSlotId = useGameStore((state) => state.firstSlotId)
  const secondSlotId = useGameStore((state) => state.secondSlotId)
  const favoriteIds = useGameStore((state) => state.favoriteIds)
  const toggleFavorite = useGameStore((state) => state.toggleFavorite)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `element/${elementId}` })
  const tileRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const node = tileRef.current
    return () => {
      if (!node?.contains(document.activeElement) || node.closest('[hidden]')) return
      const header = document.getElementById(`shelf-header-${elementEra}`)
      if (header?.isConnected) header.focus()
      else document.getElementById('codex-title')?.focus()
    }
  }, [elementEra])

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
    <div
      ref={(node) => { tileRef.current = node; setNodeRef(node) }}
      className="element-tile"
      aria-label={element.name}
      data-selected={Boolean(slotLabel)}
      data-category={element.category}
      data-dragging={isDragging}
      data-status={status}
      style={style}
      onClick={() => {
        selectElement(element.id)
        onSelected?.()
      }}
      {...listeners}
      {...attributes}
      aria-describedby={[attributes['aria-describedby'], status ? `element-status-${element.id}` : ''].filter(Boolean).join(' ')}
      aria-pressed={Boolean(slotLabel)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' && !isDragging) {
          event.preventDefault()
          selectElement(element.id)
          onSelected?.()
        } else {
          listeners?.onKeyDown?.(event)
        }
      }}
    >
      <span className="element-sigil" data-category={element.category} aria-hidden="true">
        {element.icon || element.sigil}
      </span>
      <span className="element-copy">
        <strong>{element.name}</strong>
        <small>{element.category}</small>
        {status && <small id={`element-status-${element.id}`} className="element-status" title={status === 'Terminal'
          ? 'No authored recipes use this element as an ingredient. You can still select it and read its history.'
          : 'All outgoing formulas in unlocked ages have been performed. Another age may expose new uses.'}>{status}</small>}
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
    </div>
  )
}

interface CodexProps {
  onElementSelected?: () => void
}

type SortOrder = 'alphabetical' | 'category' | 'recent'

export function Codex({ onElementSelected }: CodexProps) {
  const { elements, elementsById, eras, recipes, regions } = useGameStore((state) => state.catalog)
  const elementEras = useMemo(() => new Map(elements.map((element) => [element.id, element.era])), [elements])
  const regionalElementIds = useMemo(() => new Set(regions.flatMap((region) => region.elementIds)), [regions])
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all')
  const [selectedAge, setSelectedAge] = useState('all')
  const [starredOnly, setStarredOnly] = useState(false)
  const [compact, setCompact] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const favoriteIds = useGameStore((state) => state.favoriteIds)
  const recentIngredientIds = useGameStore((state) => state.recentIngredientIds)
  const selectElement = useGameStore((state) => state.selectElement)
  const discoveredRecipeIds = useGameStore((state) => state.discoveredRecipeIds)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const hideFinalElements = useGameStore((state) => state.hideFinalElements)
  const collapsedShelves = useGameStore((state) => state.collapsedShelves)
  const toggleHideFinalElements = useGameStore((state) => state.toggleHideFinalElements)
  const toggleShelf = useGameStore((state) => state.toggleShelf)
  const { active } = useDndContext()
  const draggedId = typeof active?.id === 'string' && active.id.startsWith('element/')
    ? active.id.slice('element/'.length) : null
  const terminalIds = useMemo(() => getExhaustedElements(recipes, new Set(discoveredIds)), [recipes, discoveredIds])
  const exhaustedIds = useMemo(() => getTemporarilyExhaustedElements(
    recipes, new Set(discoveredIds), new Set(discoveredRecipeIds), new Set(unlockedEraIds), elementEras,
  ), [recipes, discoveredIds, discoveredRecipeIds, unlockedEraIds, elementEras])
  const searching = Boolean(query.trim())

  const categories: Array<{ id: ElementCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'essence', label: 'Essence' },
    { id: 'matter', label: 'Matter' },
    { id: 'weather', label: 'Weather' },
    { id: 'life', label: 'Life' },
    { id: 'craft', label: 'Craft' },
    { id: 'society', label: 'Society' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'transport', label: 'Transport' },
  ]

  const matchingElements = useMemo(() => {
    return elements.filter((element) => {
      if (!discoveredIds.includes(element.id)) return false
      if (element.id === draggedId) return true
      if (searching) {
        return element.name.toLowerCase().includes(deferredQuery) || element.category.includes(deferredQuery)
      }
      if (starredOnly && !favoriteIds.includes(element.id)) return false
      if (selectedAge !== 'all' && element.era !== selectedAge) return false
      if (selectedRegion === 'core' && regionalElementIds.has(element.id)) return false
      if (selectedRegion !== 'all' && selectedRegion !== 'core' &&
        !regions.find((region) => region.id === selectedRegion)?.elementIds.includes(element.id)) return false
      if (hideFinalElements && (terminalIds.has(element.id) || exhaustedIds.has(element.id))) return false

      return true
    })
  }, [elements, discoveredIds, favoriteIds, starredOnly, selectedAge, selectedRegion,
    regionalElementIds, regions, deferredQuery, searching, hideFinalElements, terminalIds, exhaustedIds, draggedId])

  const visibleElements = useMemo(() => {
    const result = matchingElements.filter(
      (element) => searching || element.id === draggedId || selectedCategory === 'all' || element.category === selectedCategory,
    )
    if (sortOrder === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOrder === 'category') {
      result.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    } else if (sortOrder === 'recent') {
      result.sort((a, b) => discoveredIds.indexOf(b.id) - discoveredIds.indexOf(a.id))
    }

    return result
  }, [matchingElements, selectedCategory, sortOrder, discoveredIds, searching, draggedId])

  const recentElements = recentIngredientIds
    .filter((id) => discoveredIds.includes(id))
    .map((id) => elementsById.get(id))
    .filter((element) => element !== undefined)
  const hasFilters = query !== '' || selectedAge !== 'all' || selectedRegion !== 'all' ||
    selectedCategory !== 'all' || starredOnly || hideFinalElements

  function clearFilters() {
    setQuery('')
    setSelectedAge('all')
    setSelectedRegion('all')
    setSelectedCategory('all')
    setStarredOnly(false)
    if (hideFinalElements) toggleHideFinalElements()
  }

  return (
    <aside className="codex" aria-labelledby="codex-title">
      <div className="codex-toolbar">
        <div className="section-heading">
          <div>
            <span className="panel-kicker">Your collection</span>
            <h2 id="codex-title" tabIndex={-1}>Element shelf</h2>
          </div>
          <span className="section-count">{discoveredIds.length} unlocked</span>
        </div>

        <div className="codex-search-row">
          <label className="search-field">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search discovered elements</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find an element"
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

        <div className="codex-filter-row">
          <label className="age-filter">
            Age
            <select value={selectedAge} onChange={(event) => setSelectedAge(event.target.value)}>
              <option value="all">All Ages</option>
              {eras.map((era) => <option key={era.id} value={era.id}>{era.name}</option>)}
            </select>
          </label>
          <button
            type="button"
            className="category-tab"
            aria-pressed={starredOnly}
            data-active={starredOnly}
            onClick={() => setStarredOnly((current) => !current)}
          >
            <Star size={13} aria-hidden="true" />
            Starred
          </button>
        </div>

        {regions.length > 0 && (
          <div className="codex-filter-row">
            <label className="age-filter region-filter">
              Region
              <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
                <option value="all">All content</option>
                <option value="core">Core content</option>
                {regions.map((region) => <option key={region.id} value={region.id}>{region.title}</option>)}
              </select>
            </label>
          </div>
        )}

        <div className="category-tabs" role="tablist" aria-label="Element categories" tabIndex={0}>
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? matchingElements.length
                : matchingElements.filter((element) => element.category === cat.id).length

            if (cat.id !== 'all' && selectedCategory !== cat.id && !elements.some(
              (element) => element.category === cat.id && discoveredIds.includes(element.id),
            )) return null

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
                <span>{cat.label}</span>
                <span className="tab-count">{count}</span>
              </button>
            )
          })}
        </div>
        <button type="button" className="category-tab mastered-toggle" aria-pressed={hideFinalElements} data-active={hideFinalElements}
          aria-describedby="mastered-help" onClick={toggleHideFinalElements}>
          <EyeOff size={14} aria-hidden="true" /> Hide Mastered
        </button>
        <p id="mastered-help" className="shelf-help">Hides Terminal and Exhausted for now. Selection and history stay available.</p>
        {searching && <p className="shelf-help" role="status">Searching all discovered elements; filters and drawer collapse are temporarily bypassed.</p>}

        <div className="codex-results-row">
          <p className="codex-results-count" role="status" aria-label="Element filter results" aria-live="polite" aria-atomic="true">
            {visibleElements.length} of {discoveredIds.length} discovered elements
          </p>
          <button type="button" className="codex-clear-filters" onClick={clearFilters} disabled={!hasFilters}>
            Clear filters
          </button>
        </div>
        <button
          type="button"
          className="category-tab codex-layout-toggle"
          aria-pressed={compact}
          aria-controls="codex-elements"
          data-active={compact}
          onClick={() => setCompact((current) => !current)}
        >
          Compact layout
        </button>
        {recentElements.length > 0 && (
          <section className="recent-ingredients" aria-labelledby="recent-ingredients-title">
            <h3 id="recent-ingredients-title">Recently used <small>Across all filters</small></h3>
            <div className="recent-ingredient-list">
              {recentElements.map((element) => (
                <button
                  key={element.id}
                  type="button"
                  className="category-tab"
                  aria-label={`Use recent ingredient ${element.name}`}
                  onClick={() => {
                    selectElement(element.id)
                    onElementSelected?.()
                  }}
                >
                  <span aria-hidden="true">{element.icon || element.sigil}</span>
                  {element.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="codex-results" role="region" aria-label="Matching discovered elements" tabIndex={0}>
        <div id="codex-elements" className="era-shelves">
          {eras.map((era) => {
            const members = visibleElements.filter((element) => element.era === era.id)
            if (!members.length) return null
            const count = elements.filter((element) => element.era === era.id && discoveredIds.includes(element.id)).length
            const total = elements.filter((element) => element.era === era.id).length
            const expanded = searching || members.some((element) => element.id === draggedId) || !collapsedShelves.includes(era.id)
            return <EraShelf key={era.id} eraId={era.id}>
              <h3 className="shelf-heading">
                <button type="button" id={`shelf-header-${era.id}`} aria-expanded={expanded}
                  aria-controls={`shelf-body-${era.id}`} disabled={searching || Boolean(draggedId)}
                  onClick={() => toggleShelf(era.id)}>
                  <Layers size={16} aria-hidden="true" />
                  <span>{era.name}</span>{' '}
                  <small>{count}/{total} discovered{count === total ? ' · Collected' : ''}</small>
                  <ChevronDown size={16} aria-hidden="true" className={expanded ? '' : 'shelf-chevron-collapsed'} />
                </button>
              </h3>
              <div id={`shelf-body-${era.id}`} hidden={!expanded} className="element-list" data-layout={compact ? 'compact' : 'tiles'}>
                {expanded && members.map((element) => <ElementTile key={element.id} elementId={element.id}
                  status={terminalIds.has(element.id) ? 'Terminal' : exhaustedIds.has(element.id) ? 'Exhausted for now' : undefined}
                  onSelected={onElementSelected} />)}
              </div>
            </EraShelf>
          })}
          {visibleElements.length === 0 && (
            <p className="empty-note">
              {query.trim()
                ? `No discovered element matches “${query.trim()}”.`
                : 'No discovered elements match these filters.'}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}