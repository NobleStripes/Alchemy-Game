# Phase 10A — regional module registry (prototype)

This document records the original **inactive, data-only foundation** for free first-party historical expansions. Phase 11 now provides optional Settings activation, validated durable migration and a shared catalog; see the [current integration audit](phase-11-integration.md). The original implementation boundaries below are historical. The protected core baseline remains 225 elements, 291 recipes and five ages.

## Implemented

- `schema.ts`: Zod-validated, versioned manifests with stable hyphenated IDs, historical scope, target core eras, explicit dependencies, and module-owned element, recipe, and collection definitions.
- `registry.ts`: pure deterministic composition of selected packs with the immutable core definitions, core-version checks, dependency validation, namespaced ownership, conflict detection, and existing graph reachability checks.
- `registry.test.ts`: core-only compatibility, one synthetic optional module, and invalid input/dependency/recipe cases.

This first contract deliberately allows only **new module-owned recipe results**. It does not change core recipes. Existing core eras remain authoritative; a module cannot add a new mandatory age or starter. Synthetic test discoveries are not historical claims or shipped game content.

## Original gates before player-facing activation

1. Expand registration and validation to referenced historical sources, full Atlas records, individual recipe reviews, isolated learning labs, and optional collection rewards. Enforce provenance and avoid silently overwriting core records.
2. Refactor all active gameplay and UI consumers to use the same resolved catalog, including progress, hints, labels, shelves, encyclopedia lookup, and challenge play.
3. Introduce **durable module-aware save preservation**. Currently `normalizeProgress` filters IDs against the active global catalog. Never expose a disable switch until inactive-module discoveries, recipes, reading markers, favorites, challenge results and rewards survive disable → reload → re-enable.
4. Review module upgrades, migrations, unknown records, failed loads and browser conflict behavior.
5. Develop the Achaemenid prototype using actual, verified, passage-cited research; no historical items are preapproved.
6. Design the activation UI and run the complete regression suite.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

This branch is for review. The connector environment cannot execute the repository's installed npm dependencies, so passing checks must be confirmed by GitHub Actions or locally before merge.

All official expansions remain free. No payment systems, premium unlocks, ads, behavioral tracking, or executable third-party plugins are part of this proposal.
