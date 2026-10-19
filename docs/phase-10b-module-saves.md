# Phase 10B — module-aware save preservation (inactive prototype)

This branch introduces a **separate versioned module-save envelope** and a pure active-progress projection. It does not install, activate or disable modules in the running game. The ordinary `unwritten-atlas-progress` save key, legacy version 1–7 migration, Web Locks, conflict detection, reward handling and current user interface remain unchanged.

## Implemented

- `src/game/state/persistence.ts` exports the existing v7 Zod schema for reuse. There is no behavioral change to v7 parsing or serialization.
- `src/game/state/moduleProgress.ts` validates a versioned envelope with a core-shaped progress record and explicit module ownership metadata for discoveries, recipes, historical research, collections and challenges.
- `projectModuleProgress` gives gameplay an in-memory view that excludes inactive module IDs. The archive itself is not modified, so re-enabling the same compatible module can reveal its stored discoveries and achievement receipts again.
- `moduleProgress.test.ts` covers core compatibility, reversible projections, ownership conflicts, malformed archives, and rejection of the new envelope by the legacy parser.

## Critical next steps before activation

**This is not a complete module-safe saving implementation.** Projection is one-way. Never serialize the filtered active view as the archive, as that would discard inaccessible discoveries. The production saving path still writes ordinary v7 objects and must later be upgraded to merge changes into the durable archive under the existing Web Locks and conflict protections.

1. Validate module identifiers and reference ownership against **installed manifests and the immutable core catalog**. The archive schema guarantees shape and unique ownership, not that a claimed achievement was legitimately acquired. Reject unauthorized core-ID claims.
2. Define precise inactive-module provenance across elements, formulas, leads, experiment history, failed pairs, rewards and challenge records. Check owner-version compatibility; do not activate modules simply because their IDs appear in the archive.
3. Introduce a new, explicit save version or separate durable envelope with legacy migration, bounded byte sizes, and downgrade protection. Never let an older application silently overwrite an unsupported new envelope.
4. Implement a safe **rebase/merge** between the active projection and the durable record. Preserve inactive IDs, module versions and receipts, and reject stale/conflicting writes.
5. Test switch/reload/import/export, cross-tab races, version upgrades, unknown or missing packs, corrupt payloads, storage failures and reward idempotence.
6. Only then wire the active registry into recipes, store selectors, Historical Atlas, challenge lists, hints and UI controls. No player-facing enable/disable control should be exposed before these checks pass.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The connector-based environment has not run these commands. Treat the PR as **draft** until CI or local execution passes.

All modules remain freely available. No accounts, paid content, microtransactions, ads or tracking are included.
