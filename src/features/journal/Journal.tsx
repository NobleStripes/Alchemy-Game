import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { elements, elementsById, recipes } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface JournalProps {
  discoveryGoal: number
  eraSubtitle: string
  keystoneId: string
}

export function Journal({
  discoveryGoal,
  eraSubtitle,
  keystoneId,
}: JournalProps) {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const discoveredRecipeIds = useGameStore(
    (state) => state.discoveredRecipeIds,
  )
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const selectedElement = selectedElementId
    ? elementsById.get(selectedElementId)
    : null
  const relatedRecipes = selectedElement
    ? recipes.filter(
        (recipe) =>
          recipe.result === selectedElement.id ||
          recipe.inputs.includes(selectedElement.id),
      )
    : []
  const knownRecipes = relatedRecipes.filter((recipe) =>
    discoveredRecipeIds.includes(recipe.id),
  )
  const hiddenRecipeCount = relatedRecipes.length - knownRecipes.length
  const keystoneFound = discoveredIds.includes(keystoneId)

  return (
    <aside className="journal" aria-labelledby="journal-title">
      <div className="section-heading">
        <span className="eyebrow">Era progress</span>
        <h2 id="journal-title">
          <BookOpen size={20} aria-hidden="true" />
          Field Journal
        </h2>
      </div>

      <p className="era-subtitle">{eraSubtitle}</p>
      <div className="journal-rule" />

      <div className="journal-objectives">
        <div
          className="objective"
          data-complete={discoveredIds.length >= discoveryGoal}
        >
          <span className="objective-mark" aria-hidden="true" />
          <div>
            <strong>Catalogue {discoveryGoal} elements</strong>
            <p>{Math.min(discoveredIds.length, discoveryGoal)} recorded</p>
          </div>
        </div>
        <div className="objective" data-complete={keystoneFound}>
          <span className="objective-mark" aria-hidden="true" />
          <div>
            <strong>Kindle the Beacon</strong>
            <p>{keystoneFound ? 'Keystone discovered' : 'Keystone unknown'}</p>
          </div>
        </div>
      </div>

      <div className="journal-record-heading">
        <strong>Discovery record</strong>
        <span>{discoveredRecipeIds.length} formulas</span>
      </div>
      <div className="discovery-grid" aria-label="Discovery record">
        {elements.map((element) => {
          const isFound = discoveredIds.includes(element.id)
          return isFound ? (
            <button
              key={element.id}
              type="button"
              data-found="true"
              data-selected={selectedElementId === element.id}
              onClick={() => setSelectedElementId(element.id)}
              aria-label={`Inspect ${element.name}`}
              title={element.name}
            >
              {element.sigil}
            </button>
          ) : (
            <span key={element.id} title="Unknown">
              ?
            </span>
          )
        })}
      </div>

      <section className="element-detail" aria-live="polite">
        {selectedElement ? (
          <>
            <div className="element-detail-heading">
              <span
                className="element-sigil"
                data-category={selectedElement.category}
                aria-hidden="true"
              >
                {selectedElement.sigil}
              </span>
              <div>
                <span className="eyebrow">{selectedElement.category}</span>
                <h3>{selectedElement.name}</h3>
              </div>
            </div>
            <p>{selectedElement.description}</p>

            <h4>Recorded formulas</h4>
            {knownRecipes.length > 0 ? (
              <ul className="formula-list">
                {knownRecipes.map((recipe) => {
                  const firstInput = elementsById.get(recipe.inputs[0])
                  const secondInput = elementsById.get(recipe.inputs[1])
                  const result = elementsById.get(recipe.result)
                  if (!firstInput || !secondInput || !result) return null

                  return (
                    <li key={recipe.id}>
                      <strong>
                        {firstInput.name} + {secondInput.name} → {result.name}
                      </strong>
                      <p>{recipe.flavor}</p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="journal-empty">No performed formula touches this entry yet.</p>
            )}

            {hiddenRecipeCount > 0 && (
              <p className="hidden-formulas">
                {hiddenRecipeCount}{' '}
                {hiddenRecipeCount === 1 ? 'formula remains' : 'formulas remain'}{' '}
                undeciphered.
              </p>
            )}
          </>
        ) : (
          <p className="journal-empty">
            Select a recorded sigil to inspect its formulas.
          </p>
        )}
      </section>
    </aside>
  )
}