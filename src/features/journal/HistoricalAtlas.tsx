import { useEffect, useRef, useState } from 'react'
import { elements, elementsById, eras } from '../../game/content'
import {
  historicalResearch,
  researchByElementId,
  type HistoricalResearchRecord,
} from '../../game/content/research'
import { useGameStore } from '../../game/state/useGameStore'

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
  'fictional-prologue': 'Fictional, undated prologue',
}
const accessLabels = {
  'collection-record': 'Collection metadata reviewed',
  'selected-passages': 'Selected original passages reviewed',
  'abstract-only': 'Abstract only; full paper not reviewed',
}

function ResearchEntry({
  record, discoveredIds, onSelect,
}: {
  record: HistoricalResearchRecord
  discoveredIds: string[]
  onSelect: (elementId: string) => void
}) {
  const related = record.relatedDiscoveries.filter(
    (link) => discoveredIds.includes(link.elementId),
  )
  const citedIds = new Set([
    ...record.historicalOverview.sourceIds,
    ...record.manufactureOrUse.sourceIds,
    ...record.agePlacement.sourceIds,
    ...record.historicalSignificance.sourceIds,
    ...record.approximateDates.flatMap((entry) => entry.sourceIds),
    ...record.archaeologicalEvidence.flatMap((entry) => entry.sourceIds),
    ...record.independentDevelopments.flatMap((entry) => entry.sourceIds),
    ...related.flatMap((link) => link.sourceIds),
  ])
  const sources = historicalResearch.sources.filter((source) => citedIds.has(source.id))

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
      <h4>Historical overview</h4>
      {passage(record.historicalOverview)}
      <h4>Historical dates and geography</h4>
      <p>Regions: {record.associatedRegions.join('; ')}.</p>
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
      <h4>Manufacture and use</h4>
      {passage(record.manufactureOrUse)}
      <h4>Why it mattered</h4>
      {passage(record.historicalSignificance)}
      <h4>Archaeological context</h4>
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
      <span className="history-indicator">{placementLabels[record.agePlacement.status]}</span>
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
          <li id={`history-source-${source.id}`} key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
            <p>
              {source.authors.length > 0 && `${source.authors.join(', ')}. `}
              {source.institution}
              {source.publicationDate && `. Published ${source.publicationDate}`}
            </p>
            {source.verification.status === 'verified' && (
              <details>
                <summary>{accessLabels[source.verification.accessLevel]}</summary>
                <p>Checked {source.verification.checkedOn}. {source.verification.locator}</p>
                {source.verification.accessedUrl !== source.url && (
                  <a href={source.verification.accessedUrl} target="_blank" rel="noreferrer">
                    Consulted original record
                  </a>
                )}
              </details>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}

export function HistoricalAtlas() {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const discovered = elements.filter((element) => discoveredIds.includes(element.id))
  const selected = discovered.find((element) => element.id === selectedId)
  const record = selected ? researchByElementId.get(selected.id) : undefined
  const matches = discovered
    .filter((element) => element.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (selected) headingRef.current?.focus()
  }, [selected])

  return (
    <details className="guide-section historical-atlas">
      <summary>Historical Encyclopedia</summary>
      <p className="detail-desc">
        Optional historical notes, separate from formulas and hints. Browse discoveries from any age.
        Undiscovered entries stay hidden; not every discovery has researched notes yet.
      </p>
      <label className="history-search">
        Search discovered historical entries
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <nav className="history-index" aria-label="Discovered historical entries">
        {matches.map((element) => (
          <button
            className="journal-element-btn"
            type="button"
            key={element.id}
            aria-label={`Open historical entry for ${element.name}`}
            aria-pressed={selected?.id === element.id}
            data-selected={selected?.id === element.id}
            onClick={() => setSelectedId(element.id)}
          >
            {element.name}
          </button>
        ))}
        {matches.length === 0 && <p className="journal-empty">No matching discovered entries.</p>}
      </nav>
      {selected ? (
        <article className="element-detail history-entry" aria-labelledby="atlas-history-title">
          <h3 id="atlas-history-title" tabIndex={-1} ref={headingRef}>{selected.name}</h3>
          <p className="detail-cat-badge">
            {eras.find((era) => era.id === selected.era)?.name} · {selected.category}
          </p>
          <p>
            Origins is a fictional, undated prologue. The Three-Age System reflects particular
            archaeological traditions, not one worldwide sequence. Boundaries vary geographically;
            first appearance and widespread adoption are different.
          </p>
          {record ? (
            <ResearchEntry record={record} discoveredIds={discoveredIds} onSelect={setSelectedId} />
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
    </details>
  )
}
