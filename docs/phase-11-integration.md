# Phase 11: baseline, active catalog, durable saves and Regional Modules

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
| v7 persistence | Core-only legacy migration/normalization and clean-tab adoption | Retained until confirmed migration; never normalize regional progress |
| Durable persistence | Locked raw-byte transactions; opt-in archive service | Production archive sessions, explicit conflicts, dormant rebase, acknowledged saves |
| Archive rules | Namespace/reference checks; inactive data retained | Validate active records against installed definitions, not archive claims |

Static content imports remain appropriate for constructing the core baseline,
legacy v1-v7 normalization, core ownership exclusions, and compatibility APIs.
Type-only imports do not provide competing runtime definitions.

## 11A/B: shared catalog and protected baseline

- `createGameStore()` defaults legacy campaigns to the validated core catalog.
  Archive startup resolves persisted selection against installed definitions
  before publishing catalog, indexes, and canonical enabled IDs together.
  The explicit internal-regional configuration remains available for tests.
- The catalog is fixed session metadata; enabled IDs are persisted alongside
  archive progress, never inserted into legacy v7 fields.
  All live store/view lookups use that catalog. The named core snapshot is used
  only for protected core progression, resolver input, and legacy compatibility.
- The pilot resolves to 228 elements, 294 recipes, five unchanged ages, and
  150 histories, including its sources, three reviews, collection, and challenge.
- SHA-256 fingerprints of normalized raw core elements, recipes, eras, and
  collections pin the merged definitions, not just their totals.
- Integration tests cover combinations, hints, favorites, reading, formula
  context and sources, active counters versus core goals, isolated challenge
  completion, capped/idempotent rewards, dormant roundtrips, and total reset.
- Migration tests cover each legacy version 1 through 7. Lock failures,
  corrupt progress, invalid active references, ownership incompatibility,
  competing tabs, retryable quota failures, and the 1 MiB byte limit are checked.
- Wiring exposed an archive comparison bug: experiment equality depended on JSON
  object property order. It now compares fields. New active experiment IDs also
  start above dormant archive history, so queued writes remain consistent.
- The invalid-target-age registry fixture now retains its valid declared age
  while adding an unknown age, ensuring it exercises the intended registry
  diagnostic rather than failing earlier manifest/element consistency checks.

## 11C: production durable save integration

- Missing/legacy saves retain the v7 reader/writer and existing migration
  behavior. Existing archives automatically use the durable service.
  Installed manifests, not archive claims, authorize active ownership.
- Enabling first offers a backup and validated preview. Only explicit
  confirmation replaces a legacy save with the module envelope. The shared
  Web Lock, raw-byte baseline, candidate revalidation and 1 MiB limit protect
  replacement; failed migration leaves the original recoverable.
- Persisted `enabledModuleIds` is additive to envelope version 1, defaulting
  to `[]` for older archives. Missing/incompatible modules remain dormant with
  warnings. Exact ownership/version compatibility is required for reactivation.
- Every ordinary archive write rebases active progress onto the complete
  archive. Disabled discoveries, performed formulas, favorites, reading marks,
  failed pairs, Open Leads, collection/challenge receipts and histories survive.
  Duplicate progress identifiers, receipt IDs and experiment IDs are rejected.
- Recent Experiments projects the latest 50 active records, retaining dormant
  histories beyond that window within the overall size limit. ID allocation
  accounts for dormant records; safe-integer exhaustion compacts all histories
  together at session boundaries, never between queued writes.
- Confirmed challenge receipts remain idempotent across reactivation. Deliberate
  total reset clears active and dormant progress while retaining module selection
  and the sound preference; disabling is non-destructive.
- Durable tabs fail closed on external byte changes and require reload.
  Retryable storage errors remain explicit. Invalid/future saves are protected
  from autosave, reset and management replacement, but stored bytes are exportable.
- Manual export returns the complete stored bytes after flushing, not unsaved
  in-memory changes after an error. Import accepts legacy v1-v7 and archives,
  validates a focused active/dormant preview, offers a backup, and requires
  explicit total-replacement confirmation. Import is not a merge.

## 11D: Regional Modules interface and session boundary

Settings contains the optional module manager and save-transfer workflow,
separate from Play, Atlas and Challenges. The bundled Achaemenid card shows
region, period, description, version and counts. Installed/enabled/disabled,
unavailable and incompatible states have readable explanations; invalid
activations cannot proceed. Regions default to disabled for legacy players.

Changes are saved only after explicit confirmation, then take effect on reload.
The old store is paused after replacement until that reload, preventing a mixed
catalog/progress state or an overwrite by the old session. Prepared elements,
selected hints, recents and unfinished challenge runs are cleared by reload;
an open-challenge warning precedes confirmation. Persisted Open Leads survive.
There is no URL activation shortcut or live global-catalog mutation.

The modal retains native modality and its fallback keyboard focus handling,
focused previews, cancel/close focus restoration, accessible labels, readable
status/errors and wrapping touch-sized controls. After durable replacement,
closing is blocked until reload and a reload retry remains available.
There are no accounts, payment controls, advertising or notification prompts.

Regional discoveries contribute to active exploration totals, not the core age
discovery goals or age-completion rewards. Regional collections and challenges
retain their own receipts and the existing three-credit Insight cap.

See [Saves and settings](saves.md) for player-facing migration, backup,
replacement, reset and recovery instructions.

## 11E/F: campaign integration and Achaemenid pilot gameplay

- The validated runtime catalog now carries enabled-region labels and element
  ownership for presentation. Only the installed, resolved set supplies this
  metadata; views do not compose a second static module lookup.
- The shelf offers All content, Core content and enabled-region filters,
  independent of the unchanged five-age selector. Age, category and Starred
  combine; search and recents retain their established cross-filter behavior
  without exposing disabled content. Filter changes do not save or award.
- The Guide separates all core discoveries out of 225 from each pack's optional
  discoveries. Core age goals still count only core IDs; the header retains
  total active exploration. Module switching preserves completed objectives,
  existing formulas, Insight balances and receipts without unsolicited rewards.
- Terminal, Exhausted for now, Hide Mastered, Starred and Recently Used use active
  definitions. New regional outgoing recipes reactivate mastered ingredients
  until actually performed. Store selection/drop guards also reject unavailable
  or undiscovered ingredients; immediate combinations cannot use inactive IDs.
- All three reviewed symbolic formulas resolve in either input order on the
  normal worktable. Combined validation proves unique unordered pairs and
  campaign reachability. No pilot discovery is a starter, core age landmark,
  grant or mandatory unlock requirement.
- The full Satrapy, Royal Road and Fortification Tablets histories and cited
  sources render in Atlas. Imperial Connections tracks all three discoveries,
  with the existing one-time capped reward independent of reading.
- Imperial Communications is active only with the pack. Its target is not a
  starter and an available one-step formula reaches it, proving its declared
  one-attempt minimum is the actual shortest solution. The reducer uses the
  active catalog; campaign state and disk remain unchanged until Save result.
- Production disable/reload/re-enable tests restore all three discoveries,
  recorded formulas, stars, reading marks, collection receipts and the lab's
  completed/best-score record. Replaying the lab does not pay a second reward.

See [pilot gameplay](optional-content.md#achaemenid-pilot-gameplay) for the
player-facing explanation and optional recipe spoilers.

## Closed release gates and remaining boundaries

Production durable loading/writing, deliberate migration, backup/restore,
persisted selection, atomic reload transitions, dormant preservation and the
optional Settings interface are implemented. The integration dependencies
recorded before exposing a toggle were resolved with regression coverage.

Remaining boundaries are deliberate, not silent repair paths:

1. No automatic module-version/content migration. An incompatible upgrade stays
   dormant until an explicit supported migration or compatible import is supplied.
2. Legacy-only app versions cannot read module archives; export before migrating
   and use a compatible client or a legacy backup to downgrade.
3. Only vetted bundled first-party content is installable. Archive provenance
   cannot install missing modules or authorize untrusted content.
4. Structural validation cannot establish historical truth; additional packs
   still require human historical editorial review.
5. No PWA/service-worker rollout, account sync or public pack loader is included.

## Executed validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; core graph remains 225 nodes, 179 ingredients, 46 terminals, zero unused |
| `npm test -- --maxWorkers=2` | Passed: 37 files, 1,520 tests |
| Production preview HTTP smoke | Passed; temporary preview servers stopped after validation |
| Browser save/module workflow | Legacy import preview did not replace storage; explicit import/reload and module migration succeeded; regional discovery, performed recipe, favorite and reading marker survived disable/reload/re-enable |
| Browser modal checks | Preview focus and close/cancel focus restoration passed; at 390 x 844 the dialog measured 352 x 812 with no horizontal overflow |
| Browser pilot gameplay | All three formulas discovered normally; regional filter showed 3 of 14 discoveries while core stayed 11/225, with exactly five age buttons; filter changes left stored bytes unchanged |
| Browser short mobile and lab | At 390 x 600, Region control was 44px high and the progress card 343px wide with no horizontal overflow; one-attempt lab completion did not save until explicit Save result |
| Live import audit | No fixed-content value imports in live views; only explicit core-goal baseline and type imports remain |
| Whitespace check | Passed with `core.whitespace=cr-at-eol`, honoring existing Windows line endings |

The first unbounded full-suite run also exposed the registry fixture above and
an App test timeout under parallel contention. That App test passed in isolation;
the complete suite subsequently passed with bounded workers. No existing App
timeout was increased and no production validation rule was weakened.

The production management suite contains 23 tests for v1-v7 migration, complete
dormant roundtrips after 55 core experiments, reset, retries, locks, stale
previews/conflicts, future/corrupt/oversized input, missing modules, incompatible
upgrades, forged ownership, duplicate receipts and ID exhaustion. Settings has
10 tests covering metadata, previews, cancellation/focus, challenge warnings,
explicit replacement/reload, import errors and exact exported Blob contents.

11E/F adds nine regression cases across installed content, shelf, production
management and rendered App coverage, including the complete three-discovery
campaign/Atlas/collection/lab/reactivation flow. All 226 tests in the five
focused suites passed before the full core-only and regional regression run.

The integrated browser did not provide a download event, so a downloaded-file
roundtrip is not claimed; export bytes, filename and object-URL cleanup are
verified by component tests. Its synthetic Escape key did not invoke native
dialog cancellation; browser cancel-event and close-button focus restoration
were verified, and fallback keyboard behavior is covered by component tests.
Browser checks used isolated temporary origins, never an existing player save.
