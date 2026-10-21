# Saves and settings

[Back to the project overview](../README.md)

## Local progress

The four catalog batches add 31 optional discoveries and 56 formulas without changing version 7, gates, goals or reward definitions. Complete pre-expansion 194-element/232-formula, 200-element/243-formula, 215-element/270-formula and 219-element/277-formula campaigns retain every prior field and can discover the additions normally. The total catalog denominator grows to 225; old completion thresholds do not increase. Newly researched existing discoveries become readable without repeating formulas or receiving automatic reading markers, including Pottery, Wheel, Mold, Quarry, Crop and Bread in the latest batch. New outgoing uses can reactivate an exhausted ingredient under Hide Mastered because status is computed from the current graph, not stored; Lathe has a Water Screw association and Forest gains resin and canoe routes. Production and water-power formulas and explicit reading markers round-trip in the existing format. The latest 50 experiments remain the history limit even as the recipe catalog grows. See the [catalog milestones](catalog-plan.md#paired-element-and-research-milestones).

Progress is stored locally in the browser under `unwritten-atlas-progress`. Version 7 includes discovered elements, performed formulas, Insight credits and stall progress, age challenge reward markers, Open Leads, failed unordered pairs, unlocked ages, and the active page, plus favorites, sound preference, the latest 50 experiments, collection reward markers, Rainmaker and learning-lab completion/best-score records, and explicit historical reading markers. The reading field is additive: older v7 saves default to an empty list, as do migrated v1-v6 saves. Only discovered, researched element IDs are retained as reading markers. In-flight challenge state is not saved. There are no accounts or cloud sync.

Two additive shelf preferences also use version 7: `hideFinalElements` defaults to `false`, and `collapsedShelves` defaults to `[]` (all expanded). Collapsed IDs are deduplicated and restricted to canonical age IDs: `first-light`, `stone-age`, `bronze-age`, `iron-age` and `classical-antiquity`. Legacy v1-v7 saves with missing fields receive defaults without a version bump. Malformed values retain normal invalid-save protection rather than silently resetting corrupted data. Serialized exports and parsing preserve valid preferences.

The twelve Phase 9I histories attach to existing element IDs. Old discoveries become readable without repeating formulas, rewriting progress on navigation, or awarding collections. The researched-entry reading denominator can increase, but discovery and age-completion counters do not. Marking one of these entries read uses the same optional v7 field; recorded formulas, stars, shelf preferences and Rainmaker receipts are retained.

Campaign progress is saved automatically and restored on reload. Settings controls the persistent sound preference and offers Regional Modules, save export, and validated file import. Favorites also persist immediately. Existing local saves remain compatible and stay on the v7 writer until a module migration is explicitly confirmed. Storage failures are reported, so continued in-memory play is not a guarantee that progress was saved.

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

Open **Settings > Regional Modules**, independently of Play, Atlas and Challenges.
Regional packs are disabled by default for new and existing legacy campaigns.
The bundled Achaemenid Imperial Connections pilot lists its region, historical
period, description, version and content counts: three discoveries, recipes and
histories, one collection and one challenge. Installed packs show enabled,
disabled or incompatible status; archived packs absent from this installation
show unavailable status. Save metadata cannot install content.

### Compatibility at a glance

| Stored format / content | Behavior |
| --- | --- |
| Legacy versions 1-7 | Load through existing migrations; remain legacy until a confirmed module archive replacement |
| Module envelope version 1, matching bundled ownership/version | Project the saved enabled set; inactive records remain in the complete archive |
| Disabled or missing regional pack | Hide regional gameplay and research records; preserve progress and receipts |
| Installed version/ownership mismatch | Keep records dormant, report incompatibility and require explicit supported migration or compatible import |
| Unsupported future format, corrupt or oversized save | Block writes and replacement; preserve original bytes for export/recovery |
| Legacy-only client reading an archive | Cannot safely load it; do not downgrade without a pre-migration legacy backup |

Installed manifests, not a file's ownership claims, authorize activation.
The current pilot is `achaemenid` version `0.1.0`; no automatic content-version
upgrade migration exists. Exact compatible ownership is required as well as a
matching version. The manager does not download or install packs.

Enabling or disabling first validates the complete selected catalog, installed
ownership, save compatibility and active references. A focused preview shows
the resulting enabled set, active/dormant discoveries and stored record counts.
Queued ordinary autosaves are flushed before management operations; the preview
does not commit a replacement. Canceling leaves the selection unchanged.

Before the first activation, export the offered backup: confirmation replaces
the legacy save with envelope version 1 of `unwritten-atlas-module-save` under
the same storage key. Its progress record retains the v7 fields and adds trusted
ownership and persisted `enabledModuleIds` alongside them. Older archives without
that selection default to no enabled modules. Earlier v1-v7 migrations retain
their existing behavior. A failed validation, lock, conflict, size check or write
does not replace the old save.

**Confirm module change and reload** is required before any selection takes
effect. Successful replacement pauses the old session until reload, preventing
it from overwriting the new save. Reload clears prepared ingredients, hint
selection, recently used shortcuts, and unfinished or unsaved isolated runs;
Settings warns when a challenge is open. Persisted Open Leads remain saved.
If automatic reload does not complete, use the offered reload control.

All live gameplay and research use one validated catalog for that session.
Regional discoveries contribute to exploration totals, never to unchanged core
age goals or age rewards. Disabling hides discoveries, recipes, favorites,
reading markers and achievements without deleting them. Ordinary writes rebase
active progress onto the full archive, also retaining dormant failed pairs,
Open Leads, experiment histories and one-time reward receipts. Reactivation
restores compatible records without paying rewards again.

Recent Experiments shows the latest 50 active records. Inactive experiments
are retained in addition to that active window, subject to the overall 1 MiB
serialized UTF-8 limit. IDs are allocated above retained histories and compacted
together at session boundaries near safe-integer exhaustion. A save exceeding
the limit reports an error rather than deleting dormant history.

Missing or incompatible packs stay hidden with a compatibility warning.
Reactivation requires exact installed ownership and version compatibility;
module upgrades requiring record changes need an explicit supported migration.
There is no automatic module-version migration or destructive repair. Keep a
backup and use a compatible installation or a validated compatible import.
Legacy-only releases refuse archives rather than stripping module records.

## Manual backup and restore

1. Open **Settings > Save backup and restore** and choose **Export saved progress**.
   The JSON download contains the complete stored save, including dormant
   records. It exports the exact stored bytes after flushing pending writes;
   unsaved in-memory progress after a storage error is not included. Existing
   invalid/future-format bytes can still be exported for recovery.
2. Choose **Import save file** with a legacy v1-v7 JSON save or a durable archive,
   up to 1 MiB. Parsing, migration, module compatibility and reference validation
   run before the preview. No content is installed from the file.
3. Review visible/dormant counts and warnings, and export the current save if
   needed. Import is **total replacement, not a merge**: regional progress absent
   from the file will be lost. A legacy import into an archive remains in archive
   format with no enabled regions or retained old regional records.
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

### Restoration check after changing modules

1. Export before migration or replacement and retain the downloaded file outside
   browser storage. Backups are not automatic or cloud-synced.
2. Disable and confirm/reload. The optional shelf entries, Atlas entries, leads
   and challenge disappear; this is not a total reset.
3. Core play can continue and save while the regional progress is dormant.
4. Re-enable the compatible bundled pack and confirm/reload. Discoveries,
   performed formulas, favorites, reading markers, collection receipts and saved
   challenge results return; previously earned rewards are not paid again.
5. If a conflict appears, stop and reload the winning saved version. Export
   stored bytes for recovery; an export after a failed write does not capture
   unsaved memory. Do not resolve a conflict by importing an older file unless
   replacing all later progress is intentional.

The activation/restoration suite and manual older-save checks are recorded in
the [release verification evidence](phase-11-integration.md#11i-documentation-and-release-verification).
