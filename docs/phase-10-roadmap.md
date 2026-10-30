# Phase 10 roadmap: a safe, free expansion framework

> **Superseded DLC development record.** DLC is deferred while development focuses on the base game. The playable pack, registries, activation UI and DLC assets described below have been removed. Shared core catalog helpers, manual save transfer and legacy-archive preservation remain. Historical paths, test counts and activation instructions below are not current implementation guidance. See [current saves](saves.md) and [base content](optional-content.md).

[Back to the project overview](../README.md) | [Implemented optional content](optional-content.md) | [Catalog plan toward 250](catalog-plan.md)

## Status and boundaries

This roadmap retains the original design brief below, with a current delivery
status as of **2026-10-21**. Phase 11 implements the validated shared catalog,
bundled regional manifest, dormant-progress preservation, optional Settings
module manager and manual save-transfer controls. See the
[integration and release audit](phase-11-integration.md) and [save guide](saves.md).
Implementation and local verification do not imply a tagged player-facing release.

Phase 10 establishes the framework needed for optional regional content without risking progress or weakening free access. It does not replace the [catalog's evidence and research gates](catalog-plan.md#validation-and-regression-gates), certify proposed discoveries, or move existing Age V content into a removable pack. The original brief started at 200 elements; the protected merged Phase 10 baseline is now **225 core elements, 291 recipes, five ages and 147 histories**. The enabled Achaemenid pilot gives **228/294 and 150 histories**, with the same core objectives.

## Delivery checklist

- [x] [Finish the content registry and module manifest architecture](#1-content-registry-and-module-manifests).
- [x] [Protect saves against disabling or removing regional content](#2-preserve-progress-when-regional-content-is-unavailable).
- [x] [Create and validate the Achaemenid prototype](#3-achaemenid-prototype).
- [x] [Document and enforce free-access and non-predatory requirements](#4-free-access-and-non-predatory-design).
- [ ] [Design concise Historical Atlas summaries while retaining full articles](#5-concise-atlas-summaries-with-full-articles).
- [ ] [Prototype a free contextual nudge alongside Insight](#6-free-contextual-nudge).
- [x] [Design manual save export/import before PWA support](#7-manual-save-export-and-import-before-pwa-support).
- [x] [Keep community-uploaded packs and social sharing deferred](#8-deferred-community-packs-and-social-sharing).

Completed items are backed by the [11A-H implementation and QA evidence](phase-11-integration.md).
Outstanding implementation: concise Atlas summaries, a separate free contextual
nudge, automatic module-upgrade migrations, and a separately designed PWA.
Independent historical peer review, physical-device/screen-reader checks and
learning-outcome evaluation also remain outstanding. Community uploads, accounts,
social features and monetization remain outside scope.

The following proposed contracts and "starting point" paragraphs preserve the
original brief; they are not descriptions of the current implementation.
Current behavior is authoritative in the linked integration and save guides.

## 1. Content registry and module manifests

### Current starting point

[The content entry point](../src/game/content/index.ts) parses four bundled JSON collections and exports the element lookup and starter IDs. [Research](../src/game/content/research.ts), [recipe reviews](../src/game/content/recipeReviews.ts) and [challenges](../src/game/content/challenges.ts) have related definitions outside that entry point. This is not yet a module registry.

### Proposed architecture

- Keep a mandatory core manifest containing the existing catalog. Give optional first-party regional modules stable module IDs, independent content versions and an explicit manifest-format version.
- Describe a module's title, regional/chronological scope, compatible application/save capabilities, required module dependencies, content ownership and data references. Include elements, recipes, research records, source receipts, recipe reviews, collections and challenges where applicable.
- Preserve existing stable IDs. New module-owned IDs must follow a documented collision-resistant naming convention; do not rename legacy IDs merely to add namespaces.
- Distinguish **installed**, **enabled**, **disabled**, **missing**, and **incompatible** modules. Resolve dependencies before composing a deterministic active catalog; report why an activation cannot proceed.
- Reuse existing schemas and graph/research validators. Reject duplicate IDs, ambiguous unordered recipe pairs, dependency cycles, missing references and unsupported manifest versions. Do not allow silent overrides of core definitions.
- Reject a core gate, reward requirement or recipe that depends on optional content. Validate each supported module combination, not only the all-enabled graph. Cross-module dependencies must be declared, not inferred from whichever module happened to load first.
- Route gameplay, lookup maps, hints, shelf status, Atlas, progression, collections, challenges and persistence through the same resolved catalog. Do not leave a second static catalog silently determining some screens.
- Start with trusted, bundled, data-only modules. No remote code, arbitrary HTML, user-supplied scripts, public pack loader or marketplace is part of this phase.

**Completion gate:** loading core alone reproduces existing IDs, formulas, progression and rewards; adding or declining a module is deterministic, validated and reversible. Failures are visible and leave the previous working catalog and save intact.

## 2. Preserve progress when regional content is unavailable

### Existing risk

[Save normalization](../src/game/state/persistence.ts) currently filters discoveries and related records against the loaded catalog. Disabling a module must not turn its valid progress into disposable unknown IDs. Build the preservation layer **before exposing module-disable controls**.

### Proposed preservation contract

- Separate the durable saved record from the active playable projection. Retain unavailable module-owned discoveries, performed formulas, reading markers, favorites, experiments, leads, failed-pair context, collection/challenge receipts and relevant age preferences even when they cannot be rendered or used.
- Store enough module/version provenance to distinguish inactive or unavailable content from malformed data. Missing references are not automatically proof of corruption; genuinely invalid input must still fail validation with an explanation.
- Disabled or missing content must not become craftable, appear as usable ingredients, satisfy active requirements incorrectly, or leak hidden discoveries. Show a clear unavailable-content notice and preserve the associated records for restoration.
- Re-enabling the same compatible module restores its progress without repeating discoveries, duplicating rewards or re-awarding completed objectives. Content upgrades require explicit ID migration/tombstone policies, not silent deletion.
- Preserve core completion and existing earned rewards. Explain which active-view denominators change when optional content is disabled; do not reinterpret archived progress as lost achievement.
- Decide and document whether a new save version is necessary. Preserve v1-v7 migration behavior and original bytes until migration is accepted and durably saved; do not promise module-safe v7 storage without proving it.
- Retain conflict detection, Web Locks, visible storage failures and oversized/unsupported-save protection. Unsupported future formats must not be rewritten as an empty or reduced campaign.

**Completion gate:** test enabled -> disabled -> reload -> export -> import -> re-enabled round trips, as well as a missing module, incompatible version, application downgrade, module upgrade, storage failure and conflicting tab. All retained progress and one-time reward receipts must survive without being granted twice.

## 3. Achaemenid prototype

Use one small **first-party Achaemenid regional module** to exercise the architecture rather than designing a general public pack platform first.

- Define its historical and geographical scope through verified passages before accepting a roster or dates. It is a regional comparison, not a universal successor age.
- Audit every candidate against existing Imperial Bureaucracy, Provincial Government, Diplomatic Mission, Caravan Route, Cultural Exchange, Empire, Scribe, Archive, Road Network and other relevant discoveries. Reuse or extend existing content rather than duplicating generic institutions under new names.
- Begin with a focused chain supported by evidence about administration, provisioning or connections. Select exact discoveries only after the overlap, chronology, pair-collision and intermediate-technology audit.
- Existing Persepolis receipts are research leads, not blanket verification of the whole empire. Distinguish ration/travel records, royal claims, local practice and modern reconstructions; do not treat one administrative archive as proof of uniform imperial behavior.
- Give every new discovery a full Atlas article and every formula an individual review. Disclose access limits and uncertain interpretations. Keep reading optional and free.
- Keep all prototype content outside core gates and pre-existing collection/challenge requirements. A module-specific objective, if included, needs a stable owned ID and independent one-time receipt.
- Validate core-only, prototype-enabled, prototype-disabled and prototype-missing configurations. Check source ownership, reachable chains, hints, Atlas links, graph-derived status and save restoration.

**Completion gate:** a sourced, reachable prototype that can be enabled, played, disabled and restored without changing core completion or erasing its own progress. No unchecked historical proposal enters the catalog merely to fill a module quota.

## 4. Free-access and non-predatory design

These are requirements, not possible monetization experiments:

- Keep the game, historical reading, optional regional modules, summaries, contextual nudges and save transfer free. No paid hints, paid content gates or payment to recover progress.
- No advertising, behavioral tracking, account requirement, loot boxes, premium currency, energy systems or paid retries.
- No artificial waiting, daily streak pressure, expiring content, fear-of-missing-out prompts or deliberately frustrating puzzles intended to sell relief.
- Insight remains an earned in-game guidance mechanic, never purchasable or replenished by ads. Failed experiments do not become financial or time penalties.
- Do not gate factual explanations, citations, uncertainty notes or full articles behind Insight, a quiz, an account or a reading-completion reward.
- Respect local-first play, accessible controls, reduced motion and explicit player choices. No unsolicited notifications or background social posting.
- Explain that following an external citation opens another site's normal network connection; do not describe third-party sources as offline or tracking-free on the project's behalf.

**Completion gate:** review each Phase 10 interaction against this list, including empty, failure and recovery states. The [developer note](../README.md#a-note-from-the-developer) remains an accurate statement of how the game operates.

## 5. Concise Atlas summaries with full articles

Design a short, author-reviewed entry point for the [Historical Atlas](../src/features/journal/HistoricalAtlas.tsx), not a replacement for the current articles.

- Proposed summary shape: a brief identification, why it matters, and one material historical caveat, linking to the existing full discussion and references. Aim for a short paragraph rather than duplicating the entire article.
- Reuse verified claims and citations. Separate target gameplay age from regional evidence; never compress uncertainty into an unsupported first-invention claim.
- Preserve the complete article, bibliography, chronology, manufacture/use, interpretation limits and reading markers. Offer a plainly labeled way to continue to the full article without spending Insight.
- Keep both forms discovered-only. A summary must not reveal an unperformed formula, hidden related discovery or unavailable module's content.
- Decide whether summaries are authored metadata or derived presentation before changing [the research schema](../src/game/content/schema.ts). Prefer explicit reviewed text over automatic truncation that can remove a crucial qualification.
- Define behavior for existing records without a summary: retain their current full-article access rather than inventing new prose or hiding research.

**Completion gate:** mobile/desktop and keyboard checks demonstrate a concise entry point and intact full articles. Regressions cover source links, scientific/historical caveats, absent metadata, hidden content, reading markers and no navigation-triggered save writes.

## 6. Free contextual nudge

Prototype a distinct, optional aid alongside [the existing Insight selection rules](../src/game/engine/hintRules.ts).

- Proposed first experiment: on explicit request, suggest one already-discovered ingredient with an available unexplored use and a broad, reviewed theme. Do not disclose the full pair, result name or hidden article.
- Scope suggestions to enabled content and currently playable ages. Never suggest a dead end, a missing module, an already-performed use as new, or a recipe that needs unavailable ingredients.
- Keep the nudge free, repeatable and dismissible. No currency charge, ad, cooldown, failure quota or automatic stall popup.
- Do not spend or replenish Insight, perform a formula, populate the worktable, mark an article read, grant a reward or alter experiment/failure history merely because a nudge was opened.
- Preserve the existing explicit Insight lead path and its accounting. Explain the difference between a broad nudge and a recipe lead.
- If no suitable nudge exists, say so clearly; do not fabricate a plausible-sounding clue or imply an unseen recipe exists.

**Completion gate:** deterministic tests cover fresh progress, exhausted ingredients, newly enabled uses, all eligible uses performed, zero Insight, unavailable modules and hidden results. Player review must assess whether the nudge is useful without replacing exploration; automated checks alone cannot establish that.

## 7. Manual save export and import before PWA support

[Serialization and parsing helpers](../src/game/state/persistence.ts) already exist, but [Settings](../src/features/settings/Settings.tsx) does not offer manual file transfer. Design a reversible user-facing workflow before adding installation or offline-update behavior.

### Export

- Download a versioned local file that preserves core and unavailable-module progress, provenance, preferences and receipts. No account or upload is required.
- Distinguish a confirmed durable save from unsaved in-memory progress, especially after a storage error or conflict. Do not label either one a successful backup without explaining what was exported.
- Handle download/serialization failures visibly, retain current progress and explain that the file contains personal progress.

### Import

- Read a chosen local file without uploading it. Validate byte limits, format/version, schema, duplicate/reference integrity and module compatibility before changing the campaign.
- Show a preview of the proposed replacement, unavailable module notices and any required migration. The first design should use explicit replacement, not an unproven merge algorithm.
- Require confirmation and make the current campaign exportable before replacement. Cancellation, invalid files, unsupported versions and failed storage must leave the original save intact.
- Commit through existing synchronization and conflict safeguards; acknowledge success only after durable persistence. Never replay rewards during import or migration.
- After import, reset transient UI/run state safely and reconcile active projections without dropping archived module records.

**Completion gate:** export/import round trips cover legacy saves, current saves, missing-module records, malformed/truncated/oversized files, unsupported versions, canceled selection, conflicts and failed writes. Design labels, confirmation and recovery first; decide save-version details with the preservation layer.

PWA implementation stays blocked until manual backup/restore and module-safe persistence pass these gates. Later PWA work must separately address offline assets, application/content version mismatch, service-worker updates, rollback and recovery; it must not imply that external scholarly websites will be available offline.

## 8. Deferred community packs and social sharing

Community-uploaded packs, remote pack feeds, public sharing links, accounts, leaderboards, publishing tools and social integrations are **out of scope for Phase 10**. Do not add placeholder upload routes or sharing infrastructure while the core contracts are unsettled.

Reconsider only after the registry/manifest contract, optional-content save preservation, Achaemenid prototype and manual transfer workflow are stable. A later proposal must separately address untrusted data, sanitization, licensing and attribution, historical review, moderation, privacy, compatibility, removal and non-predatory incentives. This roadmap does not authorize those features.

## Dependency and release gates

| Workstream | Prerequisites | Exit evidence |
| --- | --- | --- |
| Free-access requirements | None; constrain every other workstream | Requirements documented and used in acceptance review |
| Registry and manifest architecture | Inventory the current consumers and agree on ownership/version contracts | Core-only equivalence, deterministic composition, invalid-module diagnostics |
| Module-safe saves | Ownership/version design; may develop alongside registry | Disabled/missing/incompatible round trips and no lost receipts |
| Achaemenid prototype | Registry, module-safe saves and verified historical audit | Core-only/enabled/disabled/missing validation plus source-backed content |
| Atlas summary design | Existing article/evidence audit; module-aware visibility before release | Concision, full-article access, no spoilers or lost caveats |
| Free nudge prototype | Existing hint audit; resolved active catalog before release | Useful eligible guidance without currency use or hidden-content leaks |
| Manual transfer design | Existing persistence/UI audit; module-safe envelope before implementation ships | Preview, confirmation, backups, durable replacement and failure recovery |
| PWA | Stable manual transfer and persistence; separate design approval | Offline/update/recovery proposal, not part of this roadmap's implementation |
| Community packs and social sharing | Stable expansion framework; separate scope and review | Deferred; no current implementation commitment |

Before a Phase 10 implementation is released, run focused schema, graph, research, persistence/store and affected UI regressions, then the project's typecheck, lint, complete tests and production build. Preserve the existing catalog and save fixtures. Test supported active-module combinations and explicit failure paths; a passing all-enabled graph is insufficient.

The checked delivery items above are implemented; unchecked proposals are not
silently included in this release. Research-coverage milestones remain governed
by the [catalog plan](catalog-plan.md#paired-element-and-research-milestones).
Historical truth, independent peer review and human comprehension are not
certified by software tests. Before tagging, verify the actual merged main
commit and its production build, not only an earlier branch or local worktree.
