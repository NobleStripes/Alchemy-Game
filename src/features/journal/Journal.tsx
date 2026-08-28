import { Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { elements, elementsById, eras, recipes } from '../../game/content'
import { areGlobalHintsUnlocked } from '../../game/engine/hintRules'
import {
  FAILURES_PER_INSIGHT,
  MAX_INSIGHT_CREDITS,
} from '../../game/engine/insightRules'
import { isElementUnstudied } from '../../game/engine/isElementUnstudied'
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
  const insightCredits = useGameStore((state) => state.insightCredits)
  const insightFailureProgress = useGameStore(
    (state) => state.insightFailureProgress,
  )
  const revealedHintRecipeIds = useGameStore(
    (state) => state.revealedHintRecipeIds,
  )
  const failedPairKeys = useGameStore((state) => state.failedPairKeys)
  const unlockedEraIds = useGameStore((state) => state.unlockedEraIds)
  const requestHint = useGameStore((state) => state.requestHint)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  const selectedCandidate = selectedElementId
    ? elementsById.get(selectedElementId)
    : null
  const selectedElement =
    selectedCandidate?.era === eraId ? selectedCandidate : null
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
  const eraFormulaCount = discoveredRecipeIds.filter((recipeId) => {
    const recipe = recipes.find((candidate) => candidate.id === recipeId)
    return recipe && elementsById.get(recipe.result)?.era === eraId
  }).length
  const landmarks = landmarkIds
    .map((elementId) => elementsById.get(elementId))
    .filter((element) => element !== undefined)
  const foundLandmarkCount = landmarkIds.filter((elementId) =>
    discoveredIds.includes(elementId),
  ).length
  const challengeComplete =
    discoveredElements.length >= discoveryGoal &&
    foundLandmarkCount === landmarkIds.length
  const categoryProgress = [
    ['essence', 'Essence'],
    ['matter', 'Matter'],
    ['weather', 'Weather'],
    ['life', 'Life'],
    ['craft', 'Craft'],
    ['society', 'Society'],
    ['knowledge', 'Knowledge'],
    ['transport', 'Transport'],
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
  const insightsUnlocked = areGlobalHintsUnlocked(
    discoveredIds,
    failedPairKeys,
    elements,
    eras[0],
  )
  const walletPaused =
    insightCredits >= MAX_INSIGHT_CREDITS &&
    insightFailureProgress === FAILURES_PER_INSIGHT - 1

  return (
    <aside className="journal" aria-labelledby="journal-title">
      <div className="section-heading">
        <h2 id="journal-title">Guide</h2>
      </div>

      <section className="hint-panel" aria-labelledby="insight-title">
        <div className="hint-heading">
          <strong id="insight-title">Insight</strong>
          <span>{insightCredits} available</span>
        </div>
        <p className="insight-progress">
          Insight: {insightFailureProgress}/{FAILURES_PER_INSIGHT} unsuccessful
          experiments{walletPaused ? ' · paused while wallet is full' : ''}
        </p>

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
        ) : insightsUnlocked ? (
          <p className="hint-text">Reveal a promising combination when needed.</p>
        ) : (
          <p className="hint-text hint-locked">
            Insights unlock after Origins or 3 recorded failures.
          </p>
        )}

        <button
          type="button"
          className="hint-button"
          onClick={requestHint}
          disabled={
            !insightsUnlocked || insightCredits === 0 || !hasAvailableHint
          }
        >
          <Lightbulb size={16} aria-hidden="true" />
          {!insightsUnlocked
            ? 'Insights locked'
            : insightCredits === 0
              ? 'No Insights available'
              : 'Reveal lead'}
        </button>
      </section>

      <div className="progress-summary">
        <span><strong>{discoveredElements.length}</strong> discovered</span>
        <span><strong>{eraFormulaCount}</strong> formulas recorded</span>
      </div>
      <section className="challenge-status" aria-label={`${challengeName} challenge`}>
        <strong>{challengeName} challenge</strong>
        <p>
          Catalogue {Math.min(discoveredElements.length, discoveryGoal)}/
          {discoveryGoal} · Landmarks {foundLandmarkCount}/{landmarkIds.length}
        </p>
        <div className="landmark-list">            {landmarks.map((landmark) => (
            <span
              key={landmark.id}
              className="landmark-chip"
              data-found={discoveredIds.includes(landmark.id)}
            >
              <span className="landmark-icon" aria-hidden="true">
                {landmark.icon || landmark.sigil}
              </span>
              <span>{landmark.name}</span>
            </span>
          ))}
        </div>
        {challengeComplete && (
          <p className="challenge-complete">
            🏆 This page's landmarks are recorded. Continue exploring the Atlas.
          </p>
        )}
      </section>

      <details className="guide-section" open>
        <summary>Collections</summary>
        <div className="category-progress" aria-label="Category progress">
          {categoryProgress.map(({ category, label, discovered, total }) => (
            <div
              key={category}
              className="category-progress-row"
              aria-label={`${label}: ${discovered} of ${total}`}
            >
              <span>{label}</span>
              <div aria-hidden="true" className="cat-progress-track">
                <span style={{ width: `${(discovered / total) * 100}%` }} />
              </div>
              <strong>{discovered}/{total}</strong>
            </div>
          ))}
        </div>

        <div className="journal-record-heading">
          <strong>Discovered on this page</strong>
        </div>
        <div className="discovery-grid" aria-label="Discovery record">
          {discoveredElements.map((element) => (
            <button
              key={element.id}
              type="button"
              className="journal-element-btn"
              data-selected={selectedElementId === element.id}
              aria-pressed={selectedElementId === element.id}
              onClick={() => setSelectedElementId(element.id)}
              aria-label={`Inspect ${element.name}`}
            >
              <span className="journal-el-icon" aria-hidden="true">
                {element.icon || element.sigil}
              </span>
              <span className="journal-el-name">{element.name}</span>
              {isElementUnstudied(element.id, recipes, discoveredRecipeIds) && (
                <span className="unstudied-tag" aria-hidden="true">Unstudied</span>
              )}
            </button>
          ))}
        </div>
      </details>

      <details className="guide-section research-section" open={Boolean(selectedElement)}>
        <summary>Element research</summary>
        <section className="element-detail" aria-live="polite">
          {selectedElement ? (
            <>
            <div className="element-detail-heading">
              <span className="detail-sigil" data-category={selectedElement.category} aria-hidden="true">
                {selectedElement.icon || selectedElement.sigil}
              </span>
              <div>
                <h3>{selectedElement.name}</h3>
                <span className="detail-cat-badge">{selectedElement.category}</span>
              </div>
            </div>
            <p className="detail-desc">{selectedElement.description}</p>

            <h4>Recorded formulas</h4>
            {knownRecipes.length > 0 ? (
              <ul className="formula-list">
                {knownRecipes.map((recipe) => {
                  const firstInput = elementsById.get(recipe.inputs[0])
                  const secondInput = elementsById.get(recipe.inputs[1])
                  const result = elementsById.get(recipe.result)
                  if (!firstInput || !secondInput || !result) return null

                  return (
                    <li key={recipe.id} className="formula-card">
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
                    <li key={partner.id}>
                      <span>{partner.icon || '•'}</span>
                      <span>{partner.name} — no reaction</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            </>
          ) : (
            <p className="journal-empty">
              Select an element above to inspect its formulas and experiments.
            </p>
          )}
        </section>
      </details>
    </aside>
  )
}