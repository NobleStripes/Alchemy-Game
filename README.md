# The Unwritten Atlas

An original combination-discovery game with **225 elements and 288 recipes across five gameplay ages**, a two-slot worktable, an inspectable Guide, and locally saved progress.

The persistent header switches between **Play** (the default) and **Atlas** (Historical Encyclopedia). Play keeps Elements, Combine, and Guide together on desktop and in three mobile tabs; Atlas is not a fourth gameplay tab. Both sections share discoveries and saved progress, and returning to Play preserves the previous gameplay context. Pointer, touch, and keyboard controls are supported.

The element shelf groups discoveries into collapsible era drawers with discovered/total counts. **Terminal** means no authored recipe uses the element as an ingredient; **Exhausted for now** means all its outgoing formulas in unlocked ages have been performed. New ages can expose new uses. Optional **Hide Mastered** hides both without disabling selection or history. Search temporarily reveals matches across all discovered elements and filters. Hide Mastered and collapsed drawers persist in backward-compatible version 7 fields; both default off/expanded.

Origins is an undated, symbolic gameplay prologue. Its four starting essences draw on documented Greek elemental philosophy, not modern chemistry; the combination mechanics are symbolic. Stone, Bronze, and Iron Age pages organize gameplay, not a universal historical timeline. Classical Antiquity is Age V, a regional chapter that unlocks after all four Iron Age landmarks. Its approximate **800 BCE–500 CE** gameplay frame covers overlapping Mediterranean histories, not a universal period or a necessary stage in every society's history; earlier precedents keep their own dates. Its 45 discoveries explore civic spaces, philosophical schools, architecture, commerce, scholarship, administration, water power and natural-history inquiry, with regional comparisons. The Guide's **About Classical Antiquity** disclosure introduces this scope and its limitations. All 38 expansion discoveries are optional even for the unchanged Age V completion target. Existing Scroll, Coin, and Aqueduct discoveries keep their earlier ages and recipes.

Empedocles' fifth-century BCE roots and Aristotle's fourth-century BCE elemental qualities provide the [historical foundation](docs/historical-interpretation.md#classical-elements-historical-theory-symbolic-gameplay). This inspiration does not place Greek philosophy before prehistoric humanity. All four starting elements have immediately accessible, sourced Atlas histories.

Historical explanations are free; **Insight reveals recipe leads, never factual information**. The Atlas has **147 researched entries**, including every Age V discovery, supported by **160 verified sources** (plus one pending research lead). Natural-history coverage includes Clay, Rock, Sand, Limestone, ores, Salt, Bone, Tree, Timber, Soil, Mud, Sea and five water/weather phenomena. Water's philosophical history also distinguishes the modern water cycle. Natural formation is distinguished from human manufacture; flint and obsidian remain examples under Rock, not new elements. Citizenship distinguishes political membership from residence and equal participation, without treating Greek and Roman institutions as interchangeable. Intellectual histories compare Greek, Mesopotamian, Egyptian, Indian and Chinese examples without equating ancient inquiry with modern science. Fossil and Bird link to optional historical inquiry; the disputed griffin proposal is not established history. Four optional Age V collections and four isolated labs cover civic life, engineering, commerce, and inquiry. Existing completion targets, collection memberships, earned rewards, and version 7 saves remain unchanged.

The [catalog plan toward 250](docs/catalog-plan.md) pairs element milestones with research milestones and separates core, regional and research-only proposals. The latest batch adds Pottery Wheel, Crucible, Annealing and Plumb Line in Bronze Age, plus Waterwheel and Watermill in Classical Antiquity, eleven optional routes and six existing-gap histories: Pottery, Wheel, Mold, Quarry, Crop and Bread. Hand-built pottery and hand milling remain older independent traditions; regional evidence is not universal invention. **78 catalog elements** still have no full history; 25 active candidates remain deferred. Source receipts disclose access limits, and automated checks are not historical peer review.

The [Phase 10 roadmap](docs/phase-10-roadmap.md) covers the planned content registry and regional modules, save preservation, an Achaemenid prototype, free-access requirements, concise Atlas summaries, contextual nudges and manual save transfer. PWA support depends on safe backup/restore; community packs and social sharing remain deferred. These are planned features, not current functionality.

Optional production foundations, engineering, commerce, scholarship and regional branches, plus the landmark track and eleven learning labs, are covered in the [optional content guide](docs/optional-content.md). They extend exploration without increasing existing age-completion requirements; detailed recipes are kept out of this overview.

Inspect a discovered element in the Guide and choose **View History** to open its Atlas entry directly; returning to Play restores focus to that shortcut. Ordinary section switches focus the Atlas heading or remembered gameplay panel. Navigation does not rewrite saves or change their version 7 format.

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

Production builds also enforce outgoing-use safeguards for starters and foundational tools, and print graph-derived counts. The current catalog has **168 crafting ingredients, 47 terminal elements and zero unused nodes**; no manual `isFinal` metadata is needed. These are authored gameplay statuses, not claims about real-world usefulness or historical mastery.

## A Note from the Developer

The Unwritten Atlas is a personal, open-source side project by a solo developer who loves history, philosophy, and puzzle design.

It is completely free, has no ads or tracking, requires no account, and is supported by a day job.

Every recipe is personally curated, and historical entries are researched and checked against documented sources, with uncertainties acknowledged where appropriate.

I hope you enjoy discovering it as much as I enjoyed researching it.
