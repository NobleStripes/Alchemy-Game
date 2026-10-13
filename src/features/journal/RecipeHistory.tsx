import { reviewsByRecipeId } from '../../game/content/recipeReviews'
import { historicalResearch } from '../../game/content/research'
import { SourceReference } from './SourceReference'

const classificationLabels = {
  'material-process': 'Material process',
  'simplified-process': 'Simplified process',
  symbolic: 'Symbolic association',
}

export function RecipeHistory({ recipeId }: { recipeId: string }) {
  const review = reviewsByRecipeId.get(recipeId)
  if (!review) throw new Error(`Missing historical recipe review: ${recipeId}`)
  const sources = historicalResearch.sources.filter((source) => review.sourceIds.includes(source.id))

  return (
    <details className="recipe-history">
      <summary>Historical context: {classificationLabels[review.classification]}</summary>
      <p>{review.caution}</p>
      <p className="recipe-history-limit">
        {review.classification === 'symbolic'
          ? 'Gameplay abstraction, not historical causation.'
          : 'A gameplay interpretation, not a complete procedure or the only historical route.'}
      </p>
      {sources.length > 0 ? (
        <>
          <p>References support the background discussed here, not this exact two-input combination.</p>
          <ol className="history-sources">
            {sources.map((source) => (
              <li key={source.id}><SourceReference source={source} /></li>
            ))}
          </ol>
        </>
      ) : (
        <p className="recipe-history-limit">
          No supporting reference attached; this note is not a sourced historical reconstruction.
        </p>
      )}
    </details>
  )
}
