import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { elements, elementsById, recipes } from '../../game/content'
import { useGameStore } from '../../game/state/useGameStore'

interface JournalProps {
  discoveryGoal: number
  keystoneId: string
}

export function Journal({
  discoveryGoal,
  keystoneId,
}: JournalProps) {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const discoveredRecipeIds = useGameStore(
    (state) => state.discoveredRecipeIds,
  )
  const hintCredits = useGameStore((state) => state.hintCredits)
  const revealedHintRecipeIds = useGameStore(
    (state) => state.revealedHintRecipeIds,
  )
  const activeHintRecipeId = useGameStore(
    (state) => state.activeHintRecipeId,
  )
  const requestHint = useGameStore((state) => state.requestHint)
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
  const activeHint = activeHintRecipeId
    ? recipes.find((recipe) => recipe.id === activeHintRecipeId)
    : null
  const activeHintInputs = activeHint
    ? activeHint.inputs.map((inputId) => elementsById.get(inputId))
    : []
  const hasAvailableHint = recipes.some(
    (recipe) =>
      !discoveredRecipeIds.includes(recipe.id) &&
      !revealedHintRecipeIds.includes(recipe.id) &&
      recipe.inputs.every((inputId) => discoveredIds.includes(inputId)),
  )
  const discoveredElements = elements.filter((element) =>
    discoveredIds.includes(element.id),
  )

  return (
    <aside className="journal" aria-labelledby="journal-title">
      <div className="section-heading">
        <h2 id="journal-title">Guide</h2>
      </div>

      <section className="hint-panel" aria-labelledby="hint-title">
        <div className="hint-heading">
          <strong id="hint-title">Hint</strong>
          <span>{hintCredits} left</span>
        </div>
        {activeHint && activeHintInputs.every(Boolean) ? (
          <p className="hint-text">
            Try <strong>{activeHintInputs[0]?.name}</strong> +{' '}
            <strong>{activeHintInputs[1]?.name}</strong>.
          </p>
        ) : (
          <p className="hint-text">Reveal a combination using elements you know.</p>
        )}
        <button
          type="button"
          className="hint-button"
          onClick={requestHint}
          disabled={hintCredits === 0 || !hasAvailableHint}
        >
          <Lightbulb size={16} aria-hidden="true" />
          {hintCredits === 0 ? 'No hints left' : 'Show hint'}
        </button>
      </section>

      <div className="progress-summary">
        <span><strong>{discoveredIds.length}</strong> discovered</span>
        <span><strong>{discoveredRecipeIds.length}</strong> formulas</span>
      </div>
      <p className="goal-status">
        Goal: {Math.min(discoveredIds.length, discoveryGoal)}/{discoveryGoal}
        {' · '}{keystoneFound ? 'Beacon found' : 'Beacon not found'}
      </p>

      <div className="journal-record-heading">
        <strong>Discovered</strong>
      </div>
      <div className="discovery-grid" aria-label="Discovery record">
        {discoveredElements.map((element) => (
          <button
            key={element.id}
            type="button"
            data-selected={selectedElementId === element.id}
            onClick={() => setSelectedElementId(element.id)}
            aria-label={`Inspect ${element.name}`}
          >
            {element.name}
          </button>
        ))}
      </div>

      <section className="element-detail" aria-live="polite">
        {selectedElement ? (
          <>
            <div className="element-detail-heading">
              <div>
                <h3>{selectedElement.name}</h3>
                <span>{selectedElement.category}</span>
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
            Select an element to inspect its formulas.
          </p>
        )}
      </section>
    </aside>
  )
}