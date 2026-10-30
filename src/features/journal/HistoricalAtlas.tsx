import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { HistoricalResearchRecord } from '../../game/content/research'
import type { RuntimeCatalog } from '../../game/content/runtimeCatalog'
import { useGameStore } from '../../game/state/useGameStore'
import { SourceReference } from './SourceReference'
import { ElementImageFigure } from '../../components/ElementIcon'

const dateLabels = {
  'dated-evidence': 'Dated evidence',
  'earliest-known-evidence': 'Earliest known evidence, not an invention date',
  'regional-development': 'Regional development',
  'widespread-adoption': 'Widespread adoption',
  undated: 'Undated',
}
const evidenceLabels = {
  attested: 'Documented evidence',
  hypothesis: 'Hypothesis',
  disputed: 'Contested interpretation',
}
const placementLabels = {
  'earlier-precedents': 'Predates its gameplay age: earlier precedents',
  'regional-gameplay-placement': 'Regional gameplay placement',
  'fictional-prologue': 'Undated, symbolic gameplay prologue',
  'historical-model': 'Historical model: documented natural philosophy',
}

function entrySources(record: HistoricalResearchRecord, discoveredIds: readonly string[], catalog: RuntimeCatalog) {
  const citedIds = new Set([
    ...record.historicalOverview.sourceIds,
    ...record.manufactureOrUse.sourceIds,
    ...record.agePlacement.sourceIds,
    ...record.historicalSignificance.sourceIds,
    ...record.approximateDates.flatMap((entry) => entry.sourceIds),
    ...record.archaeologicalEvidence.flatMap((entry) => entry.sourceIds),
    ...record.independentDevelopments.flatMap((entry) => entry.sourceIds),
    ...record.relatedDiscoveries
      .filter((link) => discoveredIds.includes(link.elementId))
      .flatMap((link) => link.sourceIds),
  ])
  return catalog.sources.filter((source) => citedIds.has(source.id))
}

function historicalSearchText(record: HistoricalResearchRecord, discoveredIds: readonly string[], catalog: RuntimeCatalog) {
  return [
    record.historicalOverview.text,
    record.manufactureOrUse.text,
    record.historicalSignificance.text,
    record.agePlacement.text,
    ...record.associatedRegions,
    ...record.approximateDates.flatMap((entry) => [
      entry.dateRange, dateLabels[entry.dateType], ...entry.regions, entry.note,
    ]),
    ...record.archaeologicalEvidence.flatMap((entry) => [
      entry.text, evidenceLabels[entry.interpretation], entry.evidenceType,
    ]),
    ...record.independentDevelopments.flatMap((entry) => [...entry.regions, entry.text]),
    ...record.historicalUncertainty,
    ...record.gameplaySimplifications,
    ...record.relatedDiscoveries
      .filter((link) => discoveredIds.includes(link.elementId))
      .flatMap((link) => [catalog.elementsById.get(link.elementId)!.name, link.explanation]),
    ...entrySources(record, discoveredIds, catalog).flatMap((source) => [
      source.title, source.institution, ...source.authors,
    ]),
  ].join(' ')
}

function ResearchEntry({
  record, discoveredIds, onSelect,
}: {
  record: HistoricalResearchRecord
  discoveredIds: string[]
  onSelect: (elementId: string) => void
}) {
  const catalog = useGameStore((state) => state.catalog)
  const { elementsById } = catalog
  const related = record.relatedDiscoveries.filter(
    (link) => discoveredIds.includes(link.elementId),
  )
  const sources = entrySources(record, discoveredIds, catalog)
  const isHistoricalModel = record.agePlacement.status === 'historical-model'

  function citations(sourceIds: string[]) {
    return sourceIds.map((id) => {
      const number = sources.findIndex((source) => source.id === id) + 1
      return (
        <a key={id} href={`#history-source-${id}`} aria-label={`Reference ${number}`}>
          {' '}[{number}]
        </a>
      )
    })
  }

  function passage(entry: HistoricalResearchRecord['historicalOverview']) {
    return <p>{entry.text}{citations(entry.sourceIds)}</p>
  }

  return (
    <>
      {isHistoricalModel && (
        <p><span className="history-indicator">{placementLabels[record.agePlacement.status]}</span></p>
      )}
      <h4>Historical overview</h4>
      {passage(record.historicalOverview)}
      <h4>Historical dates and geography</h4>
      {record.associatedRegions.length > 0
        ? <p>Regions: {record.associatedRegions.join('; ')}.</p>
        : <p>No geographical associations are recorded for this entry.</p>}
      {record.approximateDates.length > 0 ? (
        <>
          <p>BCE means Before the Common Era; CE means Common Era. “c.” means approximately.</p>
          <p>Dates describe particular evidence or regional histories, not universal invention dates.</p>
          <ul>
            {record.approximateDates.map((entry, index) => (
              <li key={index}>
                <strong>{entry.dateRange}</strong>
                <span className="history-indicator">{dateLabels[entry.dateType]}</span>
                {entry.regions.length > 0 && <p>{entry.regions.join('; ')}</p>}
                <p>{entry.note}{citations(entry.sourceIds)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : <p>No sourced dates are recorded for this entry.</p>}
      <h4>{isHistoricalModel ? 'Concept and use' : 'Manufacture and use'}</h4>
      {passage(record.manufactureOrUse)}
      <h4>Why it mattered</h4>
      {passage(record.historicalSignificance)}
      <h4>{isHistoricalModel ? 'Intellectual-history evidence' : 'Archaeological context'}</h4>
      {isHistoricalModel && (
        <p>Philosophical texts attest the historical theory, not its scientific validity. Textual evidence is distinct from excavated artifacts.</p>
      )}
      {record.archaeologicalEvidence.length === 0
        ? <p>No material evidence is established in this research record.</p>
        : (
          <ul>
            {record.archaeologicalEvidence.map((entry, index) => (
              <li key={index}>
                <span className="history-indicator" data-interpretation={entry.interpretation}>
                  {evidenceLabels[entry.interpretation]} · {entry.evidenceType}
                </span>
                {passage(entry)}
              </li>
            ))}
          </ul>
        )}
      {record.independentDevelopments.length > 0 && (
        <>
          <h4>Independent regional developments</h4>
          <ul>
            {record.independentDevelopments.map((entry, index) => (
              <li key={index}>
                <strong>{entry.regions.join('; ')}</strong>
                {passage(entry)}
              </li>
            ))}
          </ul>
        </>
      )}
      <h4>Gameplay interpretation</h4>
      <span className="history-indicator">Symbolic combinations: gameplay abstractions</span>
      <p>These notes are not recipe hints or historical manufacturing instructions.</p>
      {!isHistoricalModel && <span className="history-indicator">{placementLabels[record.agePlacement.status]}</span>}
      <p>{record.agePlacement.text}{citations(record.agePlacement.sourceIds)}</p>
      <ul>{record.gameplaySimplifications.map((text) => <li key={text}>{text}</li>)}</ul>
      <h4>Historical uncertainty</h4>
      <ul>{record.historicalUncertainty.map((text) => <li key={text}>{text}</li>)}</ul>
      {related.length > 0 && (
        <>
          <h4>Related discoveries</h4>
          <p>Connections between topics, not combination instructions. Only discovered entries appear.</p>
          <ul>
            {related.map((link) => (
              <li key={link.elementId}>
                <button
                  className="journal-element-btn"
                  type="button"
                  onClick={() => onSelect(link.elementId)}
                  aria-label={`Read history of ${elementsById.get(link.elementId)?.name}`}
                >
                  {elementsById.get(link.elementId)?.name}
                </button>
                <span className="history-indicator">
                  {link.relationship === 'documented' ? 'Documented relationship' : 'Gameplay association'}
                </span>
                <p>{link.explanation}{citations(link.sourceIds)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <h4>Sources and references</h4>
      <ol className="history-sources">
        {sources.map((source) => (
          <li id={`history-source-${source.id}`} key={source.id} tabIndex={-1}>
            <SourceReference source={source} />
          </li>
        ))}
      </ol>
    </>
  )
}

export interface HistoricalAtlasHandle {
  openEntry: (elementId: string) => void
}

export function HistoricalAtlas({ ref }: { ref?: Ref<HistoricalAtlasHandle> }) {
  const catalog = useGameStore((state) => state.catalog)
  const { elements, eras, researchByElementId } = catalog
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const readHistoricalElementIds = useGameStore((state) => state.readHistoricalElementIds)
  const toggleHistoricalRead = useGameStore((state) => state.toggleHistoricalRead)
  const persistenceError = useGameStore((state) => state.persistenceError)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useImperativeHandle(ref, () => ({
    openEntry(elementId) {
      setQuery('')
      setSelectedId(elementId)
    },
  }), [])
  const discovered = elements.filter((element) => discoveredIds.includes(element.id))
  const selected = discovered.find((element) => element.id === selectedId)
  const record = selected ? researchByElementId.get(selected.id) : undefined
  const readable = discovered.filter((element) => researchByElementId.has(element.id))
  const readCount = readable.filter((element) => readHistoricalElementIds.includes(element.id)).length
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matches = discovered
    .filter((element) => {
      if (searchTerms.length === 0) return true
      const research = researchByElementId.get(element.id)
      const text = [
        element.name,
        research ? historicalSearchText(research, discoveredIds, catalog) : '',
      ].join(' ').toLowerCase()
      return searchTerms.every((term) => text.includes(term))
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (selected) headingRef.current?.focus()
  }, [selected])

  return (
    <section className="historical-atlas" aria-labelledby="encyclopedia-title">
      <h1 id="atlas-title" tabIndex={-1}>Atlas</h1>
      <h2 id="encyclopedia-title">Historical Encyclopedia</h2>
      <p className="detail-desc">
        Optional historical notes, separate from formulas and hints. Browse discoveries from any age.
        Undiscovered entries stay hidden; not every discovery has researched notes yet.
      </p>
      <p className="detail-desc">Historical explanations are always free. Insight reveals recipe leads, not facts.</p>
      <p className="detail-desc">
        The four classical elements are a documented model of ancient Greek natural philosophy,
        not inventions of the game. Origins combinations are symbolic gameplay, not literal natural history.
      </p>
      <p className="atlas-discovery-count">
        {discovered.length} discovered encyclopedia {discovered.length === 1 ? 'entry' : 'entries'}.
      </p>
      <p className="detail-desc">
        Optional reading: {readCount}/{readable.length} discovered researched entries marked as read.
        Reading is never required for rewards.
      </p>
      {persistenceError && <p className="save-error" role="alert">{persistenceError}</p>}
      <div className="atlas-browser">
        <aside className="atlas-sidebar" aria-labelledby="atlas-browse-title">
          <h3 id="atlas-browse-title">Browse discoveries</h3>
          <label className="history-search">
            Search discovered historical entries
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-describedby="history-search-help"
            />
          </label>
          <p id="history-search-help" className="detail-desc">
            Search names, historical topics, regions, dates, or cited sources. Every search word must match.
            Only discovered entries and their visible research are searched.
          </p>
          <p className="detail-desc" role="status" aria-live="polite" aria-atomic="true">
            {matches.length} discovered {matches.length === 1 ? 'entry' : 'entries'} found.
          </p>
          <nav className="history-index" aria-label="Discovered historical entries">
            {matches.map((element) => (
              <button
                className="journal-element-btn"
                type="button"
                key={element.id}
                aria-label={`Open historical entry for ${element.name}${readHistoricalElementIds.includes(element.id) ? ' (read)' : ''}`}
                aria-pressed={selected?.id === element.id}
                data-selected={selected?.id === element.id}
                onClick={() => {
                  setSelectedId(element.id)
                  if (selectedId === element.id) headingRef.current?.focus()
                }}
              >
                {element.name}
                {readHistoricalElementIds.includes(element.id) && <span className="history-read-tag">Read</span>}
              </button>
            ))}
            {matches.length === 0 && <p className="journal-empty">No matching discovered entries.</p>}
          </nav>
        </aside>
        {selected ? (
          <article className="element-detail history-entry" aria-labelledby="atlas-history-title">
            <h3 id="atlas-history-title" tabIndex={-1} ref={headingRef}>{selected.name}</h3>
            <p className="detail-cat-badge">
              {eras.find((era) => era.id === selected.era)?.name} · {selected.category}
            </p>
            <ElementImageFigure element={selected} />
            <details className="guide-section" key={selected.id}>
              <summary>About gameplay ages</summary>
              <p>
                Origins is an undated prologue inspired by ancient Greek elemental philosophy,
                not a claim that this philosophy preceded prehistoric humanity.
              </p>
              <p>
                The Three-Age System reflects particular archaeological traditions, not one worldwide sequence.
                Boundaries vary geographically; first appearance and widespread adoption are different.
                Classical Antiquity is an overlapping Mediterranean chapter, not a universal next stage.
                Its approximate gameplay frame is 800 BCE–500 CE, not a date for every discovery or region.
              </p>
            </details>
            {record ? (
              <>
                <button
                  type="button"
                  className="journal-element-btn history-read-control"
                  onClick={() => toggleHistoricalRead(selected.id)}
                >
                  Mark {selected.name} as {readHistoricalElementIds.includes(selected.id) ? 'unread' : 'read'}
                </button>
                <p className="detail-desc">A personal reading marker, not a knowledge test. It costs no Insight and earns no reward.</p>
                <ResearchEntry record={record} discoveredIds={discoveredIds} onSelect={setSelectedId} />
              </>
            ) : (
              <>
                <h4>Historical notes not yet researched</h4>
                <p>No verified historical record is available for this discovery yet. No historical date is assigned here.</p>
                <h4>Atlas description (gameplay, not verified history)</h4>
                <p>{selected.description}</p>
                <span className="history-indicator">Symbolic combinations: gameplay abstractions</span>
              </>
            )}
          </article>
        ) : <p className="journal-empty">Select a discovered entry to read its historical notes.</p>}
      </div>
    </section>
  )
}
