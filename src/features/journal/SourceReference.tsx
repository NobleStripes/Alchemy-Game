import type { HistoricalResearchSource } from '../../game/content/research'

const accessLabels = {
  'collection-record': 'Collection metadata reviewed',
  'selected-passages': 'Selected original passages reviewed',
  'abstract-only': 'Abstract only; full paper not reviewed',
}

export function SourceReference({ source }: { source: HistoricalResearchSource }) {
  return (
    <>
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
    </>
  )
}
