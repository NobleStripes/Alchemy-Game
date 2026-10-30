# Phase 11: regional integration, historical QA and restoration tests

> **Superseded DLC development record.** DLC is deferred while development focuses on the base game. The playable pack, registries, activation UI and DLC assets described below have been removed. Shared core catalog helpers, manual save transfer and legacy-archive preservation remain. Historical paths, test counts and activation instructions below are not current implementation guidance. See [current saves](saves.md) and [base content](optional-content.md).

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

## Licensed module photography

The three pilot text sigils now have locally bundled photo counterparts:
the Met's CC0 Persian guard relief (explicitly contextual, not a satrap portrait),
Bahar019's GFDL regional route photograph, and Pfa16's CC BY-SA 4.0 Fortification
Archive tablet photo. The tablet icon crops a readable artifact detail.
One shared renderer covers shelf tiles, recents, slots, results, Guide and lab
surfaces; existing core emoji/text fallbacks are unchanged.

Each Atlas figure includes a caption, creator/institution, source link, license
link and modification notice. Settings links to the bundled credit notices;
the road image includes the complete GFDL 1.3 text. These image licenses do not
replace the source-code license. No images are hotlinked or remotely fetched
while playing, and subpath deployment uses the configured application base.
All four JPEG files together remain below 200 KiB, with each below 100 KiB.
See image credits (historical file removed in the base-game rollback).

## 11G: historical integrity and research QA

Reviewed 2026-10-21. This is a bounded source/prose review, not certification of
every inference or direct examination of ancient objects. No gameplay IDs,
formulas, age gates, landmarks, reward rules or save formats changed.

### Inspected sources and metadata

| Source | Inspection and metadata | Limits |
| --- | --- | --- |
| [Dandamayev, Commerce ii](https://www.iranicaonline.org/articles/commerce-ii/) | Browser-rendered opening route paragraph, bibliography and metadata; published 1992-12-15, updated 2013-04-05; Vol. VI, Fasc. 1, pp. 59-61 | Secondary synthesis citing Herodotus 5.52-54 and Hallock p. 6; neither ancient text nor tablet edition was directly inspected |
| [Mark, Ancient Persian Governors](https://www.worldhistory.org/Persian_Governor/) | Opening definition and obligations; citation/license footer confirms Joshua J. Mark, 2019-11-15 | No adoption of sweeping efficiency, tolerance, fixed provincial counts, speculative Median origins or direct institutional descent to Rome/modern states |
| [ISAC, Persepolis Fortification Tablets](https://isac.uchicago.edu/publications/persepolis-fortification-tablets) | Hosted excerpt attributed to D. M. Lewis, "The Persepolis Fortification Texts," in Sancisi-Weerdenburg and Kuhrt, eds., Achaemenid History IV: Centre and Periphery (Leiden, 1990), pp. 2-6 | Full chapter, original tablets and Hallock corpus not inspected; web publication date remains unknown, not invented from the cited chapter year |
| [Stolper and colleagues, Persepolis Fortification Archive](https://www.iranicaonline.org/articles/persepolis-admin-archive/persepolis-administrative-archives-i-persepolis-fortification-archive/) | New regional receipt: all six displayed authors, published 2017-06-09, updated 2017-06-20; discovery/components, dated Elamite documents/geography, Aramaic and seal-only sections read in the browser | Specialist synthesis, not inspection of every edition, bibliography item or tablet; counts/holdings are dated snapshots |

The direct Iranica fetch returned only a page shell; the rendered browser article
provided the inspected text and metadata. Receipts describe that access rather
than claiming full-text primary-source verification. Publication dates, update
dates and inspection dates are kept distinct. The shared core-source metadata
corrections also improve existing bibliography displays without changing core
historical narratives or campaign definitions.

### Entry-by-entry review

| Checklist area | Result |
| --- | --- |
| Pilot sources/publication metadata | Reviewed and corrected as above; the pilot adds two sources to the core bibliography |
| Accurate verification receipts | Selected-passage scope, exact access URL, check date and exclusions recorded; no original-tablet or full-chapter claim |
| Institutions versus generic technologies | Satrapy is an Achaemenid regional arrangement, Royal Road a particular imperial use of routes, tablets a localized archive, not first inventions |
| Royal Road chronology/evidence | Imperial span is contextual, not a construction date; Herodotus is literary testimony through a secondary source; regional tablet travel is not proof of the whole Sardis-Susa route |
| Fortification geographic/documentary limits | Southwestern Iranian administration, distant destinations versus local coverage, Elamite/Aramaic/seal-only records and lost perishable material distinguished |
| Every entry's dates/references/relationships/cautions | All three reviewed; cross-reference validation retained. Corrected 509-494 to 509-493 BCE and classified it as dated evidence; earlier references/later consultation do not define institutional lifetime |
| Symbolic formulas | All three reviews remain symbolic; Atlas, formula archive and lab explain that these are not manufacturing procedures or causal histories |
| Absence versus nonexistence | Explicit warnings added for each entry; missing road segments, documents or publications cannot establish an institution's absence |
| Free research access | Three rendered Atlas tests cover complete explanations, chronology, cautions, bibliography and saved reading markers at zero Insight, without charges or passive save writes |
| Subsequent editorial review | Open items below remain explicit rather than being promoted to verified archaeological claims |

### Editorial follow-ups

- Compare particular satrapies with specialist regional studies before making
  more detailed claims about taxation, military authority or institutional
  uniformity; the current introductory overview is not a provincial survey.
- Compare Herodotus' route with specific archaeological corridor surveys before
  adding road-construction dates, station identifications or a reconstructed map.
  The contextual Fars photograph does not authenticate its surface as a securely
  excavated Sardis-Susa road segment.
- Reassess Fortification publication totals, holdings and institutional
  interpretations against current project editions before displaying statistics.
  The 1990 excerpt and 2017 synthesis must not be treated as live inventories.
- The functional relationship between inscribed and seal-only documents remains
  an interpretive problem in the cited specialist survey. No universal social or
  administrative model is inferred from this partial surviving archive.

## 11H: end-to-end activation and restoration evidence

Automated evidence includes real React controls and production store/persistence
sessions in jsdom, not just resolver counts. Browser checks additionally used an
isolated local development origin at desktop 1440 x 900 and narrow 390 x 600.
Only the pre-existing completed-v7 fixture was seeded; discoveries, stars, read
markers, module changes and challenge saving used rendered controls.

| Required scenario | Persistent regression / executed evidence |
| --- | --- |
| Fresh campaign, modules disabled | `state/activeCatalog.test.ts`: fresh legacy and empty archive start at four essences, 225 elements, 291 recipes, five ages; browser fresh origin confirmed no save written |
| Completed v7 migration | `state/saveManagement.test.ts`: fully discovered/performed core fixture preserves progress on confirmed migration; browser retained 225 discoveries, five age receipts and zero Insight |
| Enable adds three discoveries/recipes | Installed/store/rendered tests and browser confirm 228/294, unchanged five ages |
| Discover all three through gameplay | `src/activeCatalog.test.tsx` and browser select both ingredients and press Combine for every pilot recipe |
| Formulas, favorites, Atlas read markers | Rendered test and browser record all three; no passive reading reward or cost |
| Collection and explicit lab completion | Both exercise collection receipt, one-attempt lab, unchanged campaign/save before Save result and one saved challenge record afterwards |
| Disable hides but preserves | Exact complete archive retained; active shelf/Atlas/lab records disappear in rendered test and active projection |
| Reload while disabled | Fresh production store and browser page reload retain core-only projection and dormant archive |
| Save core gameplay while disabled | Rendered cycle adds Steam and its formula; browser re-performs a core formula in the already-complete campaign; archive retains all regional receipts/history and adds a safe experiment ID |
| Re-enable restores every record | Rendered cycle compares complete resulting progress, favorites, read marks and receipts; browser compares exact archive progress with post-core-play snapshot |
| No repeat rewards | Store tests and rendered cycle replay saved receipts; browser wallet remains 2/3 (not capped at full) after reactivation, all three formulas and explicit lab replay, with one collection receipt, one challenge receipt and five unchanged core-age receipts |
| Missing/version/dependency/corruption | Save management and durable tests cover dormant missing/incompatible ownership, invalid/future archives and corrupt records; full-catalog resolver test rejects missing pilot dependency without publishing a catalog; registry tests cover disabled, undeclared and cyclic dependencies |
| Cross-tab/storage failures | Existing durable and production management suites preserve winner/original bytes under raw-byte conflict, Web Lock failure, quota errors and retry; two real browser tabs confirm the stale tab shows an external-change alert and leaves the winner's exact bytes unchanged |
| Migration/import cancellation | Settings tests cancel both previews and preserve exact original bytes before re-opening/confirming; browser keyboard migration cancellation leaves fresh storage untouched and restores focus, and file-import cancellation preserves the complete archive bytes |
| Desktop/mobile/keyboard/reduced motion | Browser keyboard activation/cancellation, reactivation and complete lab replay; 352 x 568 dialog at 390 x 600 without horizontal overflow; reduced-motion media active and button transition 0.00001s; lab action targets at least 44px high |
| Core-only paths sufficient for every age | Fresh legacy and archive tests repeatedly perform only available original core formulas, then reload: all 225 discoveries, all 291 recorded formulas, five unlocked ages and five completed/rewarded age objectives |

The core-play restoration assertion compares ID sets, not incidental array
ordering: active records precede dormant records during rebasing. Complete
progress is compared again after reactivation. No preservation requirement was
weakened to work around this ordering.

## 11I: documentation and release verification

Verification date: **2026-10-21**. This section records a verified working-tree
candidate, not a new release tag. The production implementation already exists
on local and remote `main` at
`ce61c51754af1baa63068600de77c5d146dfaf88`. Before this pass, all 101 dirty
tracked files differed from that commit only in line endings
(`git diff --ignore-space-at-eol --stat` was empty). This pass changes
documentation and the existing benchmark, not production gameplay code.

### Release checklist and publication gates

- [x] README distinguishes 225/291 core from 228/294 with the optional pilot,
  and 147 versus 150 histories.
- [x] Phase 10 roadmap marks implemented features and outstanding proposals.
- [x] Save guide describes archives, migrations, backup and restoration.
- [x] Regional Modules controls, reload boundary and compatibility are documented.
- [x] Interpretation, research and educational QA documents include regional limits.
- [x] All three regional discoveries and their four consulted sources are listed.
- [x] `npm run typecheck` passed.
- [x] `npm run lint` passed.
- [x] `npm test -- --maxWorkers=2` passed: **1,538 tests in 39 files**.
- [x] `npm run build` passed, with unchanged core graph and no chunk warning.
- [x] Failure paths, bundle sizes, heap observations and switching costs reviewed.
- [x] Production-preview manual checks used representative v1, v4, v6 and v7 saves.
- [ ] Commit/merge this release-documentation and benchmark update only after the
  activation/restoration tests pass; do not bundle unrelated line-ending edits.
- [ ] Tag the first playable regional release only after verifying the actual
  final merged commit and its built assets.

The activation/restoration suite passes against the existing merged gameplay
implementation. However, the new release-documentation/benchmark changes are
not yet committed, there is no existing tag, and GitHub CLI is unauthenticated,
so PR/required-check state and an authenticated merge cannot be verified here.
No branch, commit, push, merge or tag was created by this pass. An unauthenticated
`git ls-remote origin refs/heads/main` confirmed the remote hash above; a cached
tracking ref alone was not used as proof.

For publication, commit only reviewed changes, verify the final merged SHA
(including any intervening changes), rerun the four normal checks and the
production activation/restoration smoke, then choose the project's release
version and create/push a tag pointing to that verified SHA. Do not tag the
earlier SHA merely because it contains the gameplay implementation, or treat
this local report as evidence that new remote commits have passed.

### Production build and failure review

All normal commands passed on this shared Windows environment. Complete tests
use two workers to bound contention; no timeout or assertion was weakened.
All **172 local file/anchor links across the eight updated release documents**
resolve, and touched-file whitespace checks pass with Windows line endings.
The benchmark runner emits its existing experimental-API notice, not a
production warning. No new dependency, cache layer or larger bundle threshold
was introduced. The graph is still **225 nodes, 179 ingredients, 46 terminals,
zero unused**. The complete suite retains explicit missing/incompatible/dependency,
corrupt/future/oversized-save, raw-byte-conflict, Web Lock, quota/retry and
cancellation coverage described in 11H.

| Production asset | Raw kB | Build-reported gzip kB |
| --- | ---: | ---: |
| Application | 348.55 | 97.51 |
| Vendor | 303.95 | 92.85 |
| Core research | 443.77 | 111.14 |
| Craft research | 190.29 | 49.94 |
| CSS | 39.17 | 8.66 |
| Rolldown runtime | 0.58 | 0.36 |

Every JavaScript chunk remains below the unchanged 500 kB warning threshold.
The local four-photo payload is **190,596 bytes**, under 200 KiB, plus 26,278
bytes of credit/license text. Local generated JS/CSS/HTML and these image/license
files total **1,544,095 bytes**; this is an asset inventory, not a measured
first-load transfer. Research and bundled manifest data are eager even while
the pilot is disabled. Photos are requested by their rendered surfaces; disabling
content is not an on-demand code-download system or an offline/PWA guarantee.

### Module-switching performance and memory

The existing [benchmark](../src/game/content/catalog.bench.ts) now also measures
the actual installed resolver and validated disable/reactivation previews
against an archive with all 228 discoveries and 294 recorded formulas.
Command: `npx --no-install vitest bench --run src\game\content\catalog.bench.ts`.
The run followed the full suite/build, not concurrent unit tests; 100 ms warmup,
200 ms sampling and at least 50 iterations retain the existing benchmark setup.

| Operation | Mean ms |
| --- | ---: |
| Core 225/291 pair index | 0.1943 |
| Existing pair lookup | <0.001 |
| Core gated reachability | 1.0371 |
| Core Hide Mastered calculation | 0.1302 |
| Core contextual hint | 0.1433 |
| Resolve core-only catalog | 9.2045 |
| Resolve enabled pilot | 8.3663 |
| Validate disable preview | 18.8880 |
| Validate reactivation preview | 21.7265 |

These noisy short samples are not evidence that adding content is faster,
mobile SLAs or a benchmark of maximum-size archives.

Production browser measurements used the migrated 219/277 v7 fixture after all
three regional discoveries (222 discoveries / 280 formulas), desktop 1440 x 900,
and three complete disable/re-enable cycles. Preview timings include opening
Settings and automation overhead; confirmation timings include storage
validation and actual reload/render. Disable previews took **210-324 ms**,
enable previews **307-339 ms**; confirmation/reload took **461-576 ms** and
**575-643 ms**, respectively. Every transition preserved exact archive progress.

CDP `Performance.getMetrics` after explicit `HeapProfiler.collectGarbage` observed:

| State | Used JS heap bytes, cycles 1 / 2 / 3 | DOM nodes | Documents |
| --- | --- | ---: | ---: |
| Disabled | 13,367,252 / 12,335,276 / 12,336,640 | 7,908 | 1 |
| Enabled | 12,524,724 / 12,525,388 / 12,525,660 | 8,268 | 1 |

The first disabled sample was higher; subsequent same-state observations did
not show accumulating documents/nodes or material heap growth in this short
run. This is not proof of no leak, total process/GPU memory, low-memory-device
capacity or long-session stability. Archive sizes were 9,454/9,466 UTF-8 bytes.
No speculative optimization is justified by these observations; remeasure for
larger packs, near-limit saves and representative physical mobile devices.

### Production-preview older-save smoke

All checks used generated fixtures on an isolated localhost origin, never a
player's existing save. Initial load, navigation and compatibility preview left
legacy bytes unchanged until explicit confirmation. The v1 four-essence save
migrated with its existing legacy defaults (including three Insight); v4, v6
and v7 fixtures retained **219 discoveries / 277 performed formulas and two
Insight**. The v7 fixture also retained stars, reading, Rainmaker best attempts,
collection and age receipts. No migration silently installed content or paid a
new reward.

From that migrated v7 campaign, rendered controls discovered all three pilot
items, starred them, marked all three histories read and explicitly saved the
one-attempt lab. Disabling and reloading hid the content but kept its records.
Core play then discovered Pottery Wheel while regional progress was dormant.
Re-enabling restored every saved field, including the added core discovery,
regional collection/lab receipts and the original Rainmaker record (string-ID
arrays compared as sets where rebasing changes order).

A local file-input preview of an older save was canceled without changing
stored bytes. Explicit import of the complete archive then restored exactly the
same bytes after confirmation/reload. This verifies actual file-input and
replacement controls, not an OS-downloaded-file roundtrip; export Blob/download
metadata remain component-tested as noted below.

At 390 x 600 with reduced motion, keyboard-only disable/confirm/reload worked;
the dialog was **352 x 568**, had no horizontal overflow, and button transition
duration was **0.00001 s**. This supplements, not replaces, the desktop,
keyboard, mobile, conflict and reward checks in 11H.
Temporary browser fixture data was removed after verification; the production
preview server was stopped.

## Closed integration gates and remaining boundaries

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
| `npm test -- --maxWorkers=2` | Passed: 39 files, 1,538 tests |
| Production preview HTTP smoke | Passed; temporary preview servers stopped after validation |
| Browser save/module workflow | Legacy import preview did not replace storage; explicit import/reload and module migration succeeded; regional discovery, performed recipe, favorite and reading marker survived disable/reload/re-enable |
| Browser modal checks | Preview focus and close/cancel focus restoration passed; at 390 x 844 the dialog measured 352 x 812 with no horizontal overflow |
| Browser pilot gameplay | All three formulas discovered normally; regional filter showed 3 of 14 discoveries while core stayed 11/225, with exactly five age buttons; filter changes left stored bytes unchanged |
| Browser short mobile and lab | At 390 x 600, Region control was 44px high and the progress card 343px wide with no horizontal overflow; one-attempt lab completion did not save until explicit Save result |
| Browser module photography | All three local shelf thumbnails decoded at 38 x 38; full Atlas images decoded and fit a 283px mobile article without overflow; credits and bundled GFDL text returned HTTP 200 |
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

Photography adds six component/schema/base-path cases and a Node-side asset
integrity/license/budget test. Rendered campaign coverage also checks worktable,
Atlas and lab imagery. All 19 tests in the four focused image/gameplay/Settings
suites passed before the full regression run.

11G/H adds eleven regression cases: source metadata/inspection boundaries,
three entry-level historical checks, the road/tablet evidence distinction,
atomic dependency rejection, three zero-Insight regional Atlas tests, and
fresh core-only completion through actual formulas in both save formats.
The existing rendered cycle now saves additional core gameplay while disabled;
Settings also cancels and reopens a file-import preview. The final complete
39-file, 1,538-test run, production build/typecheck, lint and touched-file
whitespace check passed. Historical changes are prose/citation/metadata only;
no module version, ownership or archive migration was required.

The integrated browser did not provide a download event, so a downloaded-file
roundtrip is not claimed; export bytes, filename and object-URL cleanup are
verified by component tests. Its synthetic Escape key did not invoke native
dialog cancellation; browser cancel-event and close-button focus restoration
were verified, and fallback keyboard behavior is covered by component tests.
Browser checks used isolated temporary origins, never an existing player save.
