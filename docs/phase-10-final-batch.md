# Phase 10 — Final Batch: Achaemenid Pilot and Activation Gates

This batch added the first **free, optional, first-party historical region pack**.
Phase 11 now makes it selectable through **Settings > Regional Modules**,
disabled by default. Play, Atlas and Challenges use one validated catalog per
session; activation requires a validated preview, explicit durable-save
migration confirmation and reload. Legacy campaigns remain core-only/v7 until
confirmation. See the [integration audit](phase-11-integration.md) and
[save guide](saves.md). The Phase 10 implementation notes below are historical.

## Phase 10G — Pilot data and combined catalog

- `src/game/modules/achaemenid/pack.json` adds **three** symbolic discoveries: Achaemenid Satrapy, Achaemenid Royal Road, and Persepolis Fortification Tablets.
- The pack has three recipes, three full historical histories, three reviewed formulas, one optional collection, and one isolated challenge.
- Earlier ingredients are reused; existing age requirements, core discoveries, recipes, and rewards remain unchanged.
- `src/game/modules/installed.ts` registers the bundled, data-only pack for validation. `resolveInstalledRegions([])` continues to return the unchanged core game.
- `installed.test.ts` checks combined content and core-only equivalence.

## Phase 10H — Ownership and save-preservation verification

- `src/game/modules/ownership.ts` derives the declared ownership of each bundled pack from its actual definitions. Archive claims do not become installed content merely because they appear in a save.
- `ownership.test.ts` checks dormant progress, explicit read markers, favorites, awarded collections, challenge results, and successful reactivation in the isolated archive projection.
- The Phase 10B/10C archive now backs production regional sessions. Phase 11
  supplies the migration, compatibility, backup/import and activation interface;
  ordinary writes preserve dormant records and reward receipts.

## Phase 10I — Research and educational bounds

The Royal Road history uses the inspected `Encyclopaedia Iranica` entry by Muhammad A. Dandamayev (`commerce-ii`) as a secondary source, with carefully bounded references to Herodotus and the road network. Persepolis tablets and satrapies also reuse existing verified institutional/source references in the base game. One inaccessible Iranica page was removed as supporting evidence rather than marked verified.

The module is about specific administrative, transport, and archival institutions. It does not claim that the Persians invented provincial rule, roads, or writing, or that the Fortification tablets document all Achaemenid territory.

## Original activation checklist

Phase 11 completes shared runtime lookups and production archive roundtrips.
The following describes the original checklist; the integration audit
records completed production checks and remaining version-migration boundaries.

- Route the Zustand store, all Play and Atlas components, Challenges, research/context displays, hints, and reward logic through **one selected active catalog**, not mixed static and dynamic imports.
- Make the core game's save writer fully archive-aware and preserve dormant data on every write; handle cross-tab conflict, failed writes, migration, downgrade, import/export and deliberate reset.
- Confirm active module references and version compatibility against vetted manifests, and repair any mismatch without deleting saved records.
- Enforce region-specific challenge best-score checks, source-ownership checks and reward idempotence across all supported active sets.
- Run end-to-end user tests: enable → discover → record and read → disable → reload → re-enable, as well as invalid/missing/incompatible modules.
- Add a player-facing module selector only after the above conditions pass. No runtime selector or migration UI is included in this PR.

## Quality gates

Run these gates when changing content or integration; executed Phase 11 results
are recorded in its audit:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The historical content remains research subject to human editorial review. Tests can verify structure, sources and game reachability, but not authenticate every historical interpretation.

All official modules, historical text and challenges remain free. No ads, accounts, data collection, payments, premium hints or monetization systems are included.
