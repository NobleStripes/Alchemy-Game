import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { elements, elementsById, eras, recipes } from '../../game/content'
import { isElementUnstudied } from '../../game/engine/isElementUnstudied'
import {
  areGlobalHintsUnlocked,
  HINT_FAILURE_UNLOCK_COUNT,
} from '../../game/engine/hintRules'
import { pairKey } from '../../game/engine/resolveCombination'
import { useGameStore } from '../../game/state/useGameStore'

interface JournalProps {
  eraId: string
  challengeName: string
  discoveryGoal: number
  landmarkIds: string[]
}

export function Journal({
  eraId,
  challengeName,
  discoveryGoal,
  landmarkIds,
}: JournalProps) {
  const discoveredIds = useGameStore((state) => state.discoveredIds)
  const discoveredRecipeIds = useGameStore(
    (state) => state.discoveredRecipeIds,
  )
  const hintCredits = useGameStore((state) => state.hintCredits)
  const revealedHintRecipeIds = useGameStore(
    (state) => state.revealedHintRecipeIds,
  )
  const requestHint = useGameStore((state) => state.requestHint)
  const failedPairKeys = useGameStore((state) => state.failedPairKeys)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const selectedElementCandidate = selectedElementId
    ? elementsById.get(selectedElementId)
    : null
  const selectedElement =
    selectedElementCandidate?.era === eraId ? selectedElementCandidate : null
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
  const foundLandmarkCount = landmarkIds.filter((elementId) =>
    discoveredIds.includes(elementId),
  ).length
  const landmarks = landmarkIds
    .map((elementId) => elementsById.get(elementId))
    .filter((element) => element !== undefined)
  const failedPartners = selectedElement
    ? elements.filter((element) =>
        failedPairKeys.includes(pairKey(selectedElement.id, element.id)),
      )
    : []
  const openHintRecipes = revealedHintRecipeIds
    .filter((recipeId) => !discoveredRecipeIds.includes(recipeId))
    .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
    .filter((recipe) => recipe !== undefined)
  const hasAvailableHint = recipes.some(
    (recipe) =>
      !discoveredRecipeIds.includes(recipe.id) &&
      !revealedHintRecipeIds.includes(recipe.id) &&
      unlockedEraIds.includes(elementsById.get(recipe.result)?.era ?? '') &&
      recipe.inputs.every((inputId) => discoveredIds.includes(inputId)),
  )
  const discoveredElements = elements.filter(
    (element) =>
      element.era === eraId && discoveredIds.includes(element.id),
  )
  const availableElements = elements.filter((element) => element.era === eraId)
  const eraDiscoveryCount = discoveredElements.length
  const eraFormulaCount = discoveredRecipeIds.filter((recipeId) => {
    const recipe = recipes.find((candidate) => candidate.id === recipeId)
    return recipe && elementsById.get(recipe.result)?.era === eraId
  }).length
  const categoryProgress = [
    ['essence', 'Essence'],
    ['matter', 'Matter'],
    ['weather', 'Weather'],
    ['life', 'Life'],
    ['craft', 'Craft'],
  ]
    .map(([category, label]) => ({
      category,
      label,
      discovered: discoveredElements.filter(
        (element) => element.category === category,
      ).length,
      total: availableElements.filter(
        (element) => element.category === category,
      ).length,
    }))
    .filter(({ total }) => total > 0)
  const challengeComplete =
    eraDiscoveryCount >= discoveryGoal &&
    foundLandmarkCount === landmarkIds.length
  const hintsUnlocked = areGlobalHintsUnlocked(
    discoveredIds,
    failedPairKeys,
    elements,
    eras[0],
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
        {openHintRecipes.length > 0 ? (
          <div className="open-leads">
            <strong>Open leads</strong>
            <ul>
              {openHintRecipes.map((recipe) => {
                const firstInput = elementsById.get(recipe.inputs[0])
                const secondInput = elementsById.get(recipe.inputs[1])
                if (!firstInput || !secondInput) return null

                return (
                  <li key={recipe.id}>
                    {firstInput.name} + {secondInput.name}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : hintsUnlocked ? (
          <p className="hint-text">Reveal a combination using elements you know.</p>
        ) : (
          <p className="hint-text hint-locked">
            Hints unlock after Origins or{' '}
            {HINT_FAILURE_UNLOCK_COUNT} recorded failures ({failedPairKeys.length}/
            {HINT_FAILURE_UNLOCK_COUNT}).
          </p>
        )}
        <button
          type="button"
          className="hint-button"
          onClick={requestHint}
          disabled={!hintsUnlocked || hintCredits === 0 || !hasAvailableHint}
        >
          <Lightbulb size={16} aria-hidden="true" />
          {!hintsUnlocked
            ? 'Hints locked'
            : hintCredits === 0
              ? 'No hints left'
              : 'Show hint'}
        </button>
      </section>

      <div className="progress-summary">
        <span><strong>{eraDiscoveryCount}</strong> discovered</span>
        <span><strong>{eraFormulaCount}</strong> formulas recorded</span>
      </div>
      <section className="challenge-status" aria-label={`${challengeName} challenge`}>
        <strong>{challengeName} challenge</strong>
        <p>
          Catalogue {Math.min(eraDiscoveryCount, discoveryGoal)}/{discoveryGoal}
          {' · '}Landmarks {foundLandmarkCount}/{landmarkIds.length}
        </p>
        <div className="landmark-list">
          {landmarks.map((landmark) => (
            <span
              key={landmark.id}
              data-found={discoveredIds.includes(landmark.id)}
            >
              {landmark.name}
            </span>
          ))}
        </div>
        {challengeComplete && (
          <p className="challenge-complete">
            This page's landmarks are recorded. Continue exploring the Atlas.
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
            {isElementUnstudied(element.id, recipes, discoveredRecipeIds) && (
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