import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { elements, elementsById, recipes } from '../../game/content'
import { pairKey } from '../../game/engine/resolveCombination'
import { useGameStore } from '../../game/state/useGameStore'

interface JournalProps {
  challengeName: string
  discoveryGoal: number
  keystoneId: string
}

export function Journal({
  challengeName,
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
  const failedPairKeys = useGameStore((state) => state.failedPairKeys)
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
  const keystone = elementsById.get(keystoneId)
  const failedPartners = selectedElement
    ? elements.filter((element) =>
        failedPairKeys.includes(pairKey(selectedElement.id, element.id)),
      )
    : []
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
  const studiedElementIds = new Set(
    recipes
      .filter((recipe) => discoveredRecipeIds.includes(recipe.id))
      .flatMap((recipe) => recipe.inputs),
  )
  const categoryProgress = [
    ['essence', 'Essence'],
    ['matter', 'Matter'],
    ['weather', 'Weather'],
    ['life', 'Life'],
    ['craft', 'Craft'],
  ].map(([category, label]) => ({
    category,
    label,
    discovered: discoveredElements.filter(
      (element) => element.category === category,
    ).length,
    total: elements.filter((element) => element.category === category).length,
  }))
  const challengeComplete =
    discoveredIds.length >= discoveryGoal && keystoneFound

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
        <span><strong>{discoveredRecipeIds.length}</strong> formulas recorded</span>
      </div>
      <section className="challenge-status" aria-label={`${challengeName} challenge`}>
        <strong>{challengeName} challenge</strong>
        <p>
          Catalogue {Math.min(discoveredIds.length, discoveryGoal)}/{discoveryGoal}
          {keystone && ` · ${keystone.name} ${keystoneFound ? 'kindled' : 'not found'}`}
        </p>
        {challengeComplete && (
          <p className="challenge-complete">
            The first page is written. Continue exploring the Atlas.
          </p>
        )}
      </section>

      <div className="category-progress" aria-label="Category progress">
        {categoryProgress.map(({ category, label, discovered, total }) => (
          <div
            key={category}
            className="category-progress-row"
            aria-label={`${label}: ${discovered} of ${total}`}
          >
            <span>{label}</span>
            <div aria-hidden="true">
              <span style={{ width: `${(discovered / total) * 100}%` }} />
            </div>
            <strong>{discovered}/{total}</strong>
          </div>
        ))}
      </div>

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
            {!studiedElementIds.has(element.id) && (
              <span className="unstudied-tag" aria-hidden="true">Unstudied</span>
            )}
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

            {failedPartners.length > 0 && (
              <>
                <h4>Tested, no reaction</h4>
                <ul className="failed-partners">
                  {failedPartners.map((partner) => (
                    <li key={partner.id}>{partner.name} — no reaction</li>
                  ))}
                </ul>
              </>
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