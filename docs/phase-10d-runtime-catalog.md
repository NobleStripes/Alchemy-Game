# Phase 10D — unified runtime catalog (core-only integration slice)

**Phase 11 update:** the live store, Play views, Atlas, recipe context, and
Challenges now share a validated catalog per session. Production remains
core-only/v7; regional sessions are internal/test-only and use durable archives.
See the [baseline audit and remaining toggle gates](phase-11-integration.md).
The implementation notes below describe the original Phase 10D slice.

The current game still runs with the **original five ages**, 225 core discoveries, 291 recipes and version 7 local progress. This branch begins replacing scattered static lookups with a single, validated runtime catalog; **no regional module is enabled**.

## Added and refactored

- `src/game/modules/runtimeCatalog.ts`: one typed snapshot containing elements, recipes, eras, collections, source receipts, full historical records, recipe reviews and isolated challenges, plus their associated indexes.
- `src/game/modules/runtimeCatalog.test.ts`: verifies exact core equivalence and a synthetic alternative challenge recipe without changing the shared catalog.
- `src/game/engine/challengeRules.ts`: accepts an optional catalog parameter while retaining the original challenge API and defaults.
- `src/features/worktable/Worktable.tsx`: reads definitions from the shared runtime catalog (currently core-only).
- `src/game/modules/schema.ts`: extends the module data contract with historical sources, fully cited records, recipe reviews and optional challenge definitions. Existing Phase 10A fixtures continue using omitted fields with empty defaults.
- `src/game/content/schema.ts` and `src/game/content/recipeReviews.ts`: share the recipe-review entry schema instead of duplicating it.

## Original Phase 10D limitations (superseded by Phase 11 integration)

This is the first **integration slice**, not a complete dynamically switchable game. The live Zustand store, remaining views, research screens, challenge listing and persistence writer still depend on core definitions. It is unsafe to activate optional modules until all consumers use the *same* resolved catalog and save transactions operate on complete durable archives.

A future integration change must validate **every module source, record, recipe review and challenge** against the combined active definitions before exposing an enabled module. Basic Zod shape validation is not proof of historical research or adequate citation review. No Achaemenid historical content is claimed as implemented.

## Original next checkpoints

1. Extend `resolveRegionalCatalog` to include and cross-validate research, recipe reviews, collections, challenges and source ownership; reject incomplete packs.
2. Inject resolved active content through the gameplay store, remaining UI consumers, challenge reducer and historical Atlas, without two competing global catalogs.
3. Make the live save writer use Phase 10C's durable archive atomically, with enabled/missing/incompatible module policies, ownership checks and cross-tab recovery.
4. Test modules being enabled, disabled, removed and restored, plus reward idempotence, migration/downgrade behavior and performance.
5. Only then expose an activation interface and begin a fully sourced regional content prototype.

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` before merging. Current validation results are tracked in the Phase 11 audit.

All official modules remain free; no ads, tracking, subscriptions, accounts or paywalls are introduced.
