# Saves and settings

[Back to the project overview](../README.md)

## Local progress

The five catalog batches add 41 optional discoveries and 79 formulas beyond the original 194/232 snapshot without changing version 7, gates, goals or reward definitions. Complete pre-expansion campaigns, including the previous 225/291 catalog, retain their prior fields and can discover additions normally. The total denominator grows to 235; old completion thresholds do not increase. New histories become readable without repeating formulas or receiving automatic reading markers. Salt, Needle and Textile can reappear under Hide Mastered because they now have onward uses. Newly performed formulas and explicit reading markers round-trip in v7. The latest 50 experiments remain the history limit. See the [catalog milestones](catalog-plan.md#paired-element-and-research-milestones).

Progress is stored locally in the browser under `unwritten-atlas-progress`. Version 7 includes discovered elements, performed formulas, Insight credits and stall progress, age challenge reward markers, Open Leads, failed unordered pairs, unlocked ages, and the active page, plus favorites, sound preference, the latest 50 experiments, collection reward markers, Rainmaker and learning-lab completion/best-score records, and explicit historical reading markers. The reading field is additive: older v7 saves default to an empty list, as do migrated v1-v6 saves. Only discovered, researched element IDs are retained as reading markers. In-flight challenge state is not saved. There are no accounts or cloud sync.

Two additive shelf preferences also use version 7: `hideFinalElements` defaults to `false`, and `collapsedShelves` defaults to `[]` (all expanded). Collapsed IDs are deduplicated and restricted to canonical age IDs: `first-light`, `stone-age`, `bronze-age`, `iron-age` and `classical-antiquity`. Legacy v1-v7 saves with missing fields receive defaults without a version bump. Malformed values retain normal invalid-save protection rather than silently resetting corrupted data. Serialized exports and parsing preserve valid preferences.

The twelve Phase 9I histories attach to existing element IDs. Old discoveries become readable without repeating formulas, rewriting progress on navigation, or awarding collections. The researched-entry reading denominator can increase, but discovery and age-completion counters do not. Marking one of these entries read uses the same optional v7 field; recorded formulas, stars, shelf preferences and Rainmaker receipts are retained.

Campaign progress is saved automatically and restored on reload. Settings controls the persistent sound preference and offers save export and validated file import. Favorites also persist immediately. Legacy saves remain on the v7 writer; fresh campaigns do not create module archives. Storage failures are reported, so continued in-memory play is not a guarantee that progress was saved.

Play/Atlas/Challenges navigation is local interface state, not a saved field. Opening a section or using View History does not autosave, spend Insight, change the active age, or clear prepared ingredients. In-progress isolated runs survive section switches because the runner stays mounted, but do not survive reloads. Challenge cards read completion and best attempts from existing `challengeRecords`; only explicit confirmed result saves update those records and the unchanged one-time Insight reward. No migration exists solely for this navigation. Explicit read/unread controls still persist reading markers, and local save errors remain visible whichever section is active.

Shelf search, age/category/Starred filters, sorting, compact layout, and the eight recently used ingredients are session-only. They are not fields in the version 7 save and do not cause writes. Favorites themselves remain persistent. Recently used ingredients survive normal section switches and slot clearing, reset on reload or campaign reset, and lose any no-longer-discovered entries when external progress is adopted.

Hide Mastered and drawer expansion are persistent exceptions: changing either uses the existing guarded autosave path and error reporting. Search temporarily reveals hidden or collapsed matches without modifying these saved preferences. Terminal and temporary exhaustion statuses are derived from recipes, unlocked ages and performed formulas, never stored as stale per-element flags. Clean cross-tab adoption includes both preferences.

## Save protection and synchronization

A missing save starts a writable campaign. An existing save that is invalid, unsupported, too large, or unreadable instead starts in-memory play with autosaving blocked for that page session. Nothing overwrites the original, including reset, preference changes, and challenge-result saving. The warning remains visible; reload after addressing the storage problem to try loading again. Reloading discards unsaved session changes.

Writes use browser Web Locks to serialize cooperating tabs and check the original stored snapshot inside the lock. Clean legacy-v7 tabs automatically adopt valid external updates on storage events, focus, visibility changes, or before the next action, without replaying rewards. Sound updates immediately; still-valid occupied slots are retained. External reset or save removal restores fresh campaign defaults. If an external save changes while this tab has unsaved progress, saving and adoption pause until reload, preserving this tab's in-memory session rather than silently discarding or merging it. Durable archive sessions instead treat any external byte change as a conflict requiring reload, even when this tab is clean. Invalid or unreadable external updates also pause saving. Ordinary quota failures remain retryable when the stored snapshot has not changed.

Safe autosaving requires Web Locks support (and a secure context, including localhost). Unsupported browsers allow in-memory play but do not fall back to unsafe writes. All open tabs should run the updated app: older versions and external scripts do not honor its lock, so they cannot be guaranteed to cooperate. This is local browser synchronization, not cloud sync or a backup.

## Migration and reset

Classical Antiquity uses the existing version 7 format. Fresh campaigns still start in Origins; loading saves from versions 1 through 7 reconciles the fifth-age unlock when Iron, Iron Tool, Road and Market are all discovered. A partial gate stays locked unless the save already has fifth-age discoveries or an explicit unlock under existing legacy reconciliation rules. Unlocking the page does not invent fifth-age discoveries or performed formulas, and browsing its collections does not award Insight. Older version 7 formulas, favorites, reading markers and earned completions remain intact.

The optional Agora, Library, Aqueduct and Mint landmark objectives use four new collection IDs in the existing `rewardedCollectionIds` field. Civic Foundations, Organization of Knowledge, Engineering the City and Economic Networks use separate new IDs in `challengeRecords`. All ten earlier collection IDs, seven lab IDs, Rainmaker records and age receipts remain valid. No new save field or version bump is required. A v7 save already containing all supporting discoveries gains no load-time reward; its first subsequent successful campaign combination records the new collection receipts with the normal capped reward. A new lab only pays on its first explicitly saved completion. Older app versions do not know these new IDs, so do not use an older release to rewrite updated progress.

Earlier saves migrate to v7, preserving old hint credits as Insights within the three-credit cap. Favorites, experiment history, and challenge records default to empty, and sound defaults to enabled. Already-completed collections in v1-v6 saves are marked rewarded without retroactive Insight; existing age challenge reward migration is retained. Migration removes failed pairs that are valid in the current graph, and successful formulas defensively clear stale failures. Correct guesses from locked pages remain free Open Leads. Historical discoveries reconcile matching age unlocks and grants without retroactive unlock rewards.

Reset returns the campaign to Origins with four starting elements and three Insights. It clears discoveries beyond the starters, formulas, leads, failure progress, favorites, experiment history, reward markers, historical reading markers, and challenge completion/best-score records, while preserving the sound preference. Hide Mastered returns to off and all era drawers expand. In a module archive this deliberately clears dormant regional progress too, but retains the enabled-module selection. Disabling a module is not a reset.

See [Gameplay and Atlas](gameplay.md) for challenge rewards and manual reading controls, and [historical interpretation](historical-interpretation.md#element-review) for reclassified legacy discoveries.

## Regional Modules and durable archives

DLC is deferred. This heading is retained for existing documentation links; there is no Regional Modules manager, installed pack registry, activation or reactivation workflow. Every session uses the 235-element, 311-recipe core catalog.

| Stored format / content | Behavior |
| --- | --- |
| Legacy versions 1-7 | Load through existing migrations; ordinary saves use v7, never a new archive |
| Module envelope version 1, including previously enabled DLC | Load a base-only projection; no saved selection activates content |
| Known or unavailable legacy module IDs/versions | Retain ownership and inactive records without requiring installed definitions |
| Invalid, oversized or unsupported future save | Block writes/replacement and preserve original bytes for recovery |

The compatibility adapter validates archive shape, ownership namespaces, references and active core progress. It never treats ownership claims as playable content. It retains inactive discoveries, formulas, hints, favorites, reading marks, failed pairs, experiments, collection receipts and challenge records when core progress changes. Core reward receipts, Insight, preferences, ages and scores do not replay on load.

Loading and navigation do not rewrite stored bytes. Export returns the exact stored save after queued writes flush, including its original selection metadata if no write has occurred. Subsequent core writes and confirmed imports record an empty enabled set. No records are activated. Keep exports outside browser storage.

Recent Experiments exposes the latest 50 active core records; inactive experiments remain additionally archived, subject to the 1 MiB UTF-8 save limit. Safe-integer compaction and history allocation still account for retained records. Storage limits report errors rather than silently dropping inactive history.

Web Locks, expected-byte conflict checks, invalid-save protection and visible write failures remain required. Total reset deliberately clears inactive progress too; import replaces rather than merges all progress. Neither operation is a DLC activation path. Older v7-only clients cannot safely read archives; do not downgrade and rewrite them.

## Manual backup and restore

1. Open **Settings > Save backup and restore** and choose **Export saved progress**.
   The JSON download contains the complete stored save, including dormant
   records. It exports the exact stored bytes after flushing pending writes;
   unsaved in-memory progress after a storage error is not included. Existing
   invalid/future-format bytes can still be exported for recovery.
2. Choose **Import save file** with a legacy v1-v7 JSON save or a durable archive,
   up to 1 MiB. Parsing, migration, archive integrity and core reference validation
   run before the preview. No content is installed from the file.
3. Review visible/dormant counts and warnings, and export the current save if
   needed. Import is **total replacement, not a merge**: inactive progress absent
   from the file will be lost. A legacy import into an archive remains in archive
   format with no active DLC or retained records from the replaced save.
4. Choose **Replace all progress and reload** explicitly, or cancel. Confirmation
   revalidates the candidate and checks the expected raw stored bytes under the
   shared Web Lock. A changed save, malformed/oversized file, unsupported format,
   or failed write leaves the previous stored save intact.

Unsupported future saves are never rewritten, including by management actions;
export them for recovery and use a compatible application version. Successful
imports reload into a coherent catalog/progress session without replaying
rewards. Files stay local: there are no accounts, uploads, payment controls,
advertising or notification prompts.

See the [Phase 11 integration audit](phase-11-integration.md) for regression
coverage and remaining boundaries.

### Legacy archive preservation checks

The store, save-management and rendered application regressions load previously enabled, disabled and unavailable DLC archives as base-only campaigns. They check no load/navigation writes, exact backup export, inactive-record retention after core play and reload, no repeated rewards, explicit replacement/reset, stale previews, conflicts and storage/lock failures. No reactivation is offered.

The [downloaded-file verification guide](save-roundtrip-verification.md)
describes real browser downloads, fresh-context imports and reload checks.
The browser suite covers legacy v7 and archives that previously selected or
disabled DLC; both archive cases now remain base-only and preserve inactive
records. The earlier activation/restoration results are historical, not
instructions to re-enable removed content.
