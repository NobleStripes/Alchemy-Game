# Phase 10E–10F batch: full catalog validation

> **Superseded DLC development record.** DLC is deferred while development focuses on the base game. The playable pack, registries, activation UI and DLC assets described below have been removed. Shared core catalog helpers, manual save transfer and legacy-archive preservation remain. Historical paths, test counts and activation instructions below are not current implementation guidance. See [current saves](saves.md) and [base content](optional-content.md).

**Phase 11 update:** all live consumers now share a catalog per session.
Production defaults to core-only/v7; Settings offers optional regional
activation with confirmed durable migration and reload.
See the [integration audit](phase-11-integration.md). The boundary checklist
below describes the original Phase 10E/F slice, not current missing UI wiring.

This batch advances the free first-party regional-module framework without enabling unverified content or changing the current campaign.

## Phase 10E — Combined historical and gameplay validation

- Adds `src/game/modules/fullRegistry.ts`, which composes the existing deterministic gameplay registry with historical sources, researched Atlas records, reviewed formulas and isolated challenges.
- Checks that every module-owned discovery has an Atlas entry and every module formula has a recipe review.
- Reuses existing research and recipe-review validators for source receipts, source status, chronology metadata, duplicate IDs and references.
- Rejects undeclared cross-module links in historical entries, recipe reviews, challenge requirements and collection members.
- Requires regional challenge starter and target elements to exist, verifies allowed ages and source IDs, and simulates challenge recipe reachability.
- Adds `fullRegistry.test.ts` for core-only equivalence and incomplete/malformed test pack rejection.

## Phase 10F — Runtime integration boundary

The combined resolver produces an integrated `RuntimeCatalog` containing gameplay definitions, source receipts, historical entries, recipe reviews and challenges. It does **not** automatically switch the live Zustand store, Play, Atlas or Challenges to regional content.

**Why no toggle yet?** Existing components still import core definitions directly, and the durable module archive is not adopted by the production store. A toggle now would risk inconsistent visibility and lost progress.

### Before enabling modules

1. Introduce a single active catalog provider consumed by the store, worktable, element shelf, Guide, Historical Atlas, challenge hub and challenge runner.
2. Complete cross-module ownership validation and ensure enabled module inventories match vetted manifests and archive records.
3. Connect all active writes to the durable archive service with safe cross-tab adoption, version handling, migration, reset and downgrade protection.
4. Test enabled → disabled → reload → enabled round trips, including receipts and old saves.
5. Audit source attributions and historical claims for the Achaemenid first-party pilot before publishing its recipes.

## Release safety

Core-only execution must continue to match the existing 225-element, 291-recipe, five-age catalog; no core recipes, age unlocks, or v7 save behavior are modified by this batch. All official regional modules remain free and data-only.

Before merging, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Executed validation and remaining production activation gates are recorded in
the Phase 11 audit.
