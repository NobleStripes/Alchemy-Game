# The Unwritten Atlas

An original combination-discovery game with **225 core elements and 291 core recipes across five gameplay ages**, a two-slot worktable, an inspectable Guide, and locally saved progress. The free, optional **Achaemenid Imperial Connections** module adds three discoveries and three symbolic recipes: **228 elements and 294 recipes** when enabled, with no additional age or change to core completion requirements.

Open **Settings > Regional Modules** to review the bundled pilot, disabled by
default. Activation validates content and save compatibility, offers a backup,
and requires explicit confirmation and reload. Disabling hides regional content
without deleting discoveries, formulas, favorites, reading markers or earned
receipts. Compatible reactivation restores them without repeating rewards.
See [module gameplay and sources](docs/optional-content.md#achaemenid-pilot-gameplay)
and [backup, migration and restoration](docs/saves.md#regional-modules-and-durable-archives).

The persistent header switches between **Play** (the default), **Atlas** (Historical Encyclopedia), and **Challenges**. Play keeps Elements, Combine, and Guide together on desktop and in exactly three mobile tabs; Atlas and Challenges are separate top-level sections, not extra gameplay tabs. Challenges lists Rainmaker and eleven core Learning Labs, plus Imperial Communications while the pilot is enabled, with saved completion status and best attempts. Switching sections preserves gameplay, reading context and unfinished challenge runs. Pointer, touch, and keyboard controls are supported.

The element shelf groups discoveries into collapsible era drawers with discovered/total counts. **Terminal** means no authored recipe uses the element as an ingredient; **Exhausted for now** means all its outgoing formulas in unlocked ages have been performed. New ages can expose new uses. Optional **Hide Mastered** hides both without disabling selection or history. Search temporarily reveals matches across all discovered elements and filters. Hide Mastered and collapsed drawers persist in backward-compatible version 7 fields; both default off/expanded.

Origins is an undated, symbolic gameplay prologue. Its four starting essences draw on documented Greek elemental philosophy, not modern chemistry; the combination mechanics are symbolic. Stone, Bronze, and Iron Age pages organize gameplay, not a universal historical timeline. Classical Antiquity is Age V, a regional chapter that unlocks after all four Iron Age landmarks. Its approximate **800 BCE–500 CE** gameplay frame covers overlapping Mediterranean histories, not a universal period or a necessary stage in every society's history; earlier precedents keep their own dates. Its 45 discoveries explore civic spaces, philosophical schools, architecture, commerce, scholarship, administration, water power and natural-history inquiry, with regional comparisons. The Guide's **About Classical Antiquity** disclosure introduces this scope and its limitations. All 38 expansion discoveries are optional even for the unchanged Age V completion target. Existing Scroll, Coin, and Aqueduct discoveries keep their earlier ages and recipes.

Empedocles' fifth-century BCE roots and Aristotle's fourth-century BCE elemental qualities provide the [historical foundation](docs/historical-interpretation.md#classical-elements-historical-theory-symbolic-gameplay). This inspiration does not place Greek philosophy before prehistoric humanity. All four starting elements have immediately accessible, sourced Atlas histories.

Historical explanations are free; **Insight reveals recipe leads, never factual information**. The core Atlas has **147 researched entries** and **161 verified sources plus one pending lead**. Enabling the pilot gives **150 entries** and **163 verified sources plus the same pending lead**. Natural-history coverage includes Clay, Rock, Sand, Limestone, ores, Salt, Bone, Tree, Timber, Soil, Mud, Sea and five water/weather phenomena. Water's philosophical history also distinguishes the modern water cycle. Natural formation is distinguished from human manufacture; flint and obsidian remain examples under Rock, not new elements. Citizenship distinguishes political membership from residence and equal participation, without treating Greek and Roman institutions as interchangeable. Intellectual histories compare Greek, Mesopotamian, Egyptian, Indian and Chinese examples without equating ancient inquiry with modern science. Fossil and Bird link to optional historical inquiry; the disputed griffin proposal is not established history. Four optional core Age V collections and four isolated labs cover civic life, engineering, commerce, and inquiry. The pilot adds Imperial Connections and the isolated Imperial Communications lab without changing core completion targets or earned rewards.

The [catalog plan toward 250](docs/catalog-plan.md) pairs element milestones with research milestones and separates core, regional and research-only proposals. The latest batch adds Pottery Wheel, Crucible, Annealing and Plumb Line in Bronze Age, plus Waterwheel and Watermill in Classical Antiquity, eleven optional routes and six existing-gap histories: Pottery, Wheel, Mold, Quarry, Crop and Bread. Hand-built pottery and hand milling remain older independent traditions; regional evidence is not universal invention. **78 catalog elements** still have no full history; 25 active candidates remain deferred. Source receipts disclose access limits, and automated checks are not historical peer review.

The [additional-connections audit](docs/catalog-plan.md#additional-recipe-connections-and-research-sign-off) adds three missing optional routes, reuses two existing formulas and rejects one conflicting result rather than overwriting it. All ten materials, watercraft, production and water-power additions have complete sourced histories; the recipe-only follow-up leaves the 78-entry research backlog unchanged.

The [225/291 release baseline](docs/catalog-plan.md#release-baseline-225-discoveries-and-291-formulas) retains every previous 215/270 definition and formula, all five age requirements and version 7 saves. The next evidence-gated checkpoint is **235 discoveries and at least 167 histories**, toward 250/197; no deferred candidate is approved merely to meet that target. [Release QA](docs/educational-qa.md#gameplay-compatibility-and-release-baseline-gh) records compatibility coverage and graph-performance observations.

The [Phase 10 roadmap](docs/phase-10-roadmap.md) distinguishes the implemented registry, regional manager, durable archives, Achaemenid pilot and manual save transfer from outstanding concise Atlas summaries, free contextual nudges and PWA work. Community packs and social sharing remain deferred. The [Phase 11 release audit](docs/phase-11-integration.md) records historical QA, activation/restoration evidence and merge/tag gates; local validation alone is not a tagged-release announcement.

Optional production foundations, engineering, commerce, scholarship and regional branches, plus the landmark track and eleven learning labs, are covered in the [optional content guide](docs/optional-content.md). They extend exploration without increasing existing age-completion requirements; detailed recipes are kept out of this overview.

Inspect a discovered element in the Guide and choose **View History** to open its Atlas entry directly; returning to Play restores focus to that shortcut. Ordinary section switches focus the destination heading or the active run's **Return to Challenges** control. Leaving a run uses the existing discard confirmation and restores focus to its originating challenge card. Runs survive section switches, not reloads. Core-only campaigns retain legacy v7 saving until confirmed migration; module archives preserve the v7 progress fields together with module ownership and selection. Navigation alone never writes a save.

## Development Methodology & Tooling

*The Unwritten Atlas* is authored and architected by NobleStripes, with AI assistance (GitHub Copilot and Codex) used for implementation velocity, refactoring, and test scaffolding.

- **Human Curation:** Historical interpretations, era gating, research citations, and recipe design remain under human editorial responsibility. Research coverage, claim-specific source verification, access limitations, and outstanding review needs are documented in [historical interpretation](docs/historical-interpretation.md) and [historical research](docs/research.md); this does not imply that every gameplay description has been independently verified.
- **Engineered Rigor:** Automated graph reachability checks in [`validateContent.ts`](src/game/engine/validateContent.ts) verify recipe references, duplicate combinations, era gates, and attainable discovery targets. Gated-play simulation detects unreachable content and progression-blocking circular dependencies; it is not a guarantee against every possible broken runtime state.

## Run locally

```powershell
npm install
npm run dev
```

## Documentation

| Guide | Contents |
| --- | --- |
| [Gameplay and Atlas](docs/gameplay.md) | Five gameplay ages, progression, Insights, collections, Rainmaker, historical entries, and learning labs. |
| [Optional content](docs/optional-content.md) | Implemented optional branches, production foundations, landmark objectives, learning labs, recipe spoilers, and historical limits. |
| [Phase 10 roadmap](docs/phase-10-roadmap.md) | Planned expansion architecture, module-safe saves, Achaemenid prototype, free-access requirements, Atlas summaries, nudges, manual save transfer, and deferred features. |
| [Chronology and historical interpretation](docs/historical-interpretation.md) | Regional dates, fictional gates, element corrections, and historical references. |
| [Historical research](docs/research.md) | Research coverage, record fields, source verification, authoring standards, and optional future directions. |
| [Recipe review](docs/recipe-review.md) | Recipe classifications, historical-context disclosures, and citation limits. |
| [Educational QA](docs/educational-qa.md) | Source-review findings, coverage gaps, and the pending human-playtest protocol. |
| [Saves and settings](docs/saves.md) | Local storage, reading markers, migration, cross-tab synchronization, failures, and reset. |

## Validate

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The test suite covers combination rules, gated reachability, rendered controls, experimentation, collection and challenge rewards, reading markers, persistence, and save migration/reset.

Phase 9 also verifies the fifth-age selector, keyboard activation, per-age discovery/category/formula counters, optional collection views, and Age V gate reconciliation for saves from versions 1 through 7. The age row scrolls without clipping its first button when all five ages exceed the available width.

Production builds separate dependencies and static Atlas research into vendor, research-content and craft-research-content chunks using Vite's Rolldown configuration. The research appendix preserves complete articles while keeping individual chunks below the unchanged 500 kB warning threshold. These payloads remain independently cacheable and eagerly available, not fetched on demand or loaded as optional packs.

## Content

Game definitions live in [`src/game/content`](src/game/content). Every recipe is an unordered pair with one deterministic result. Eras define unlock requirements, granted elements, and optional challenge landmarks.

[`validateContent`](src/game/engine/validateContent.ts) checks references, duplicate pairs, and era contracts, then simulates actual gated play: resolve recipes in unlocked eras, check landmarks, grant newly unlocked elements, and repeat. Circular gates and unreachable page content fail validation before build.

Production builds also enforce outgoing-use safeguards for starters and foundational tools, and print graph-derived core counts: **179 crafting ingredients, 46 terminal elements and zero unused nodes**. Active shelf status includes enabled module recipes; no manual `isFinal` metadata is needed. These are authored gameplay statuses, not claims about real-world usefulness or historical mastery.

### Image credits

The optional Achaemenid module uses locally bundled photographs from The Met's
Open Access collection and licensed Wikimedia Commons sources. Their CC0,
CC BY-SA and GFDL terms are separate from the application's source-code license.
See the [image credits and reuse notices](public/images/achaemenid/CREDITS.txt)
and the accompanying [GFDL text](public/images/achaemenid/GFDL-1.3.txt).
Credits are also available in Settings and beside each Atlas photograph.

## A Note from the Developer

The Unwritten Atlas is a personal, open-source side project by a solo developer who loves history, philosophy, and puzzle design.

It is completely free, has no ads or tracking, requires no account, and is supported by a day job.

Every recipe is personally curated, and historical entries are researched and checked against documented sources, with uncertainties acknowledged where appropriate.

I hope you enjoy discovering it as much as I enjoyed researching it.
