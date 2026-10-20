# Phase 11: baseline and active-catalog integration

## Protected baseline

Merged Phase 10 reference: `90e3ad6297d6bcbddfa85558bf18a83f02f17ab0`.
The core catalog contains 225 elements, 291 recipes, five ages, and 147
historical entries (97 primary plus 50 craft records). Core IDs, recipes,
landmarks, unlock conditions, grants, collections, and reward rules are unchanged.

The current worktree includes pre-existing uncommitted work. Validation results
refer to that worktree, not an independently checked-out copy of the merge.
Planning typecheck passed. Initial targeted validation passed 12 tests in three
suites; installed-pack and ownership suites failed to load because five pilot
citation arrays repeated `isac-fortification`. Only the redundant references
are removed; strict citation uniqueness and historical prose are preserved.

## Import and save-path audit

| Surface | Phase 10 finding | Integration requirement |
| --- | --- | --- |
| Runtime catalog | Complete core snapshot and indexes | Immutable baseline, one resolved snapshot per session |
| Full registry / installed modules | Validates gameplay, sources, histories, reviews, challenges | Resolve the entire enabled set before publishing a session |
| Ownership / schema | Trusted bundled definitions, prefixed IDs, no extra ages/starters | Archive ownership cannot install content |
| Zustand store | Core combination index, hints, collections, reading and challenges | All live lookups use the session catalog |
| App / Codex / Worktable / Journal | Core imports or module-scope core maps | Active exploration totals; core-only age objectives |
| HistoricalAtlas / RecipeHistory | Core records, reviews, links and sources | Pass the same snapshot into nested research helpers |
| ChallengeHub / ChallengeRun / reducer | Fixed challenge list and core default reducer | Active list and explicitly supplied session catalog |
| v7 persistence | Core-only legacy migration/normalization and clean-tab adoption | Remains production behavior; never normalize regional progress |
| Durable persistence | Locked raw-byte transactions; opt-in archive service | Internal sessions only, explicit conflicts, dormant rebase, acknowledged saves |
| Archive rules | Namespace/reference checks; inactive data retained | Validate active records against installed definitions, not archive claims |

Static content imports remain appropriate for constructing the core baseline,
legacy v1-v7 normalization, core ownership exclusions, and compatibility APIs.
Type-only imports do not provide competing runtime definitions.

## Implemented integration

- `createGameStore()` resolves the empty enabled set before publishing the
  production catalog. The internal `{ mode: 'internal-regional',
  enabledModuleIds: [...] }` configuration resolves the selected bundled set
  before publishing catalog, indexes, and canonical module IDs together.
- The catalog and enabled IDs are session metadata, never v7 save fields.
  All live store/view lookups use that catalog. The named core snapshot is used
  only for protected core progression, resolver input, and legacy compatibility.
- Internal sessions use `internalProgressPersistence.ts` and the durable service
  exclusively. Startup verifies ownership and active references; invalid active
  progress is reported and cannot replace the stored archive. Production uses
  the unchanged v7 parser/writer and clean-tab adoption policy.
- The pilot resolves to 228 elements, 294 recipes, five unchanged ages, and
  150 histories, including its sources, three reviews, collection, and challenge.
- SHA-256 fingerprints of normalized raw core elements, recipes, eras, and
  collections pin the merged definitions, not just their totals.
- Integration tests cover combinations, hints, favorites, reading, formula
  context and sources, active counters versus core goals, isolated challenge
  completion, capped/idempotent rewards, dormant roundtrips, and total reset.
- Internal migration tests cover each legacy version 1 through 7. Lock failures,
  corrupt progress, invalid active references, ownership incompatibility,
  competing tabs, retryable quota failures, and the 1 MiB byte limit are checked.
- Wiring exposed an archive comparison bug: experiment equality depended on JSON
  object property order. It now compares fields. New active experiment IDs also
  start above dormant archive history, so queued writes remain consistent.
- The invalid-target-age registry fixture now retains its valid declared age
  while adding an unknown age, ensuring it exercises the intended registry
  diagnostic rather than failing earlier manifest/element consistency checks.

## Session boundary

Production remains core-only and writes v7. Regional startup is internal/test-only,
uses durable archives, and is not exposed through settings or URLs. A selected
catalog is fixed for the lifetime of a store. Recreate a session to change the
enabled set; do not mutate a global active catalog or an in-progress challenge.

Regional discoveries contribute to active exploration totals, not the core age
discovery goals or age-completion rewards. Regional collections and challenges
retain their own receipts and the existing three-credit Insight cap.

Durable sessions must run in isolated storage/origins. Their first successful
write can migrate that isolated v7 save to an archive under the same storage key.
Production v7 readers refuse archives and must not overwrite them. Ordinary
archive writes preserve disabled/missing module records; explicit total reset
clears them. Unknown or incompatible active ownership fails closed. Conflicting
durable tabs require reload rather than silently merging unsaved state.

## Gates before any player-facing module toggle

Internal integration is not a production activation rollout. Remaining gates:

1. Production durable loading/writing/synchronization and deliberate migration.
2. Manual backup, compatibility warning, and downgrade/recovery UX.
3. Persisted installed/enabled selection and a defined live-transition policy.
4. Module version/content migrations without deleting dormant progress.
5. Archive-aware import/export and recovery guarantees.
6. End-user activation, removal, reinstallation, and cross-tab recovery coverage.
7. Human historical editorial review; structural tests cannot establish truth.

## Executed validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; core graph remains 225 nodes, 179 ingredients, 46 terminals, zero unused |
| `npm test -- --maxWorkers=2` | Passed: 36 files, 1,484 tests |
| Production preview HTTP smoke | HTML and built entry JavaScript both returned 200; temporary preview stopped |
| Live import audit | No fixed-content value imports in live views; only explicit core-goal baseline and type imports remain |
| Whitespace check | Passed with `core.whitespace=cr-at-eol`, honoring existing Windows line endings |

The first unbounded full-suite run also exposed the registry fixture above and
an App test timeout under parallel contention. That App test passed in isolation;
the complete suite subsequently passed with bounded workers. No existing App
timeout was increased and no production validation rule was weakened.

Browser automation tools were unavailable, so no real-browser visual or
interaction pass is claimed. Play/Atlas/Challenges interactions are covered by
the component integration tests, including a regional campaign and saved lab.
Real-browser activation/recovery UX remains part of the future production
rollout gate, not an enabled player feature.
