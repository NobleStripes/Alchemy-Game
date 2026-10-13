# Saves and settings

[Back to the project overview](../README.md)

## Local progress

Progress is stored locally in the browser under `unwritten-atlas-progress`. Version 7 includes discovered elements, performed formulas, Insight credits and stall progress, age challenge reward markers, Open Leads, failed unordered pairs, unlocked ages, and the active page, plus favorites, sound preference, the latest 50 experiments, collection reward markers, Rainmaker and learning-lab completion/best-score records, and explicit historical reading markers. The reading field is additive: older v7 saves default to an empty list, as do migrated v1-v6 saves. Only discovered, researched element IDs are retained as reading markers. In-flight challenge state is not saved. There are no accounts or cloud sync.

Campaign progress is saved automatically and restored on reload. Settings controls the persistent sound preference; favorites also persist immediately. Manual file import and export are not available. Existing local saves remain compatible. Storage failures are reported, so continued in-memory play is not a guarantee that progress was saved.

Play/Atlas navigation is local interface state, not a saved field. Opening either section or using View History does not autosave, spend Insight, change the active age, or clear prepared ingredients. No migration exists solely for this navigation. Explicit read/unread controls still persist reading markers, and local save errors remain visible whichever section is active.

## Save protection and synchronization

A missing save starts a writable campaign. An existing save that is invalid, unsupported, too large, or unreadable instead starts in-memory play with autosaving blocked for that page session. Nothing overwrites the original, including reset, preference changes, and challenge-result saving. The warning remains visible; reload after addressing the storage problem to try loading again. Reloading discards unsaved session changes.

Writes use browser Web Locks to serialize cooperating tabs and check the original stored snapshot inside the lock. Clean tabs automatically adopt valid external updates on storage events, focus, visibility changes, or before the next action, without replaying rewards. Sound updates immediately; still-valid occupied slots are retained. External reset or save removal restores fresh campaign defaults. If an external save changes while this tab has unsaved progress, saving and adoption pause until reload, preserving this tab's in-memory session rather than silently discarding or merging it. Invalid or unreadable external updates also pause saving. Ordinary quota failures remain retryable when the stored snapshot has not changed.

Safe autosaving requires Web Locks support (and a secure context, including localhost). Unsupported browsers allow in-memory play but do not fall back to unsafe writes. All open tabs should run the updated app: older versions and external scripts do not honor its lock, so they cannot be guaranteed to cooperate. This is local browser synchronization, not cloud sync or a backup.

## Migration and reset

Earlier saves migrate to v7, preserving old hint credits as Insights within the three-credit cap. Favorites, experiment history, and challenge records default to empty, and sound defaults to enabled. Already-completed collections in v1-v6 saves are marked rewarded without retroactive Insight; existing age challenge reward migration is retained. Migration removes failed pairs that are valid in the current graph, and successful formulas defensively clear stale failures. Correct guesses from locked pages remain free Open Leads. Historical discoveries reconcile matching age unlocks and grants without retroactive unlock rewards.

Reset returns the campaign to Origins with four starting elements and three Insights. It clears discoveries beyond the starters, formulas, leads, failure progress, favorites, experiment history, reward markers, historical reading markers, and challenge completion/best-score records, while preserving the sound preference.

See [Gameplay and Atlas](gameplay.md) for challenge rewards and manual reading controls, and [historical interpretation](historical-interpretation.md#element-review) for reclassified legacy discoveries.
