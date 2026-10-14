# The Unwritten Atlas

An original combination-discovery game with **173 elements and 211 recipes across five gameplay ages**, a two-slot worktable, an inspectable Guide, and locally saved progress.

The persistent header switches between **Play** (the default) and **Atlas** (Historical Encyclopedia). Play keeps Elements, Combine, and Guide together on desktop and in three mobile tabs; Atlas is not a fourth gameplay tab. Both sections share discoveries and saved progress, and returning to Play preserves the previous gameplay context. Pointer, touch, and keyboard controls are supported.

Origins is an undated, symbolic gameplay prologue. Its four starting essences draw on documented Greek elemental philosophy, not modern chemistry; the combination mechanics are symbolic. Stone, Bronze, and Iron Age pages organize gameplay, not a universal historical timeline. Classical Antiquity is Age V, a regional chapter that unlocks after all four Iron Age landmarks. Its approximate **800 BCE–500 CE** gameplay frame covers overlapping Mediterranean histories, not a universal period or a necessary stage in every society's history; earlier precedents keep their own dates. Its 22 discoveries explore Greek and Roman civic spaces, philosophical schools, architecture, commerce, scholarship, and natural-history inquiry. The Guide's **About Classical Antiquity** disclosure introduces this scope and its limitations. The 15 expansion discoveries are optional even for the unchanged Age V completion target. Existing Scroll, Coin, and Aqueduct discoveries keep their earlier ages and recipes.

Empedocles' fifth-century BCE roots and Aristotle's fourth-century BCE elemental qualities provide the [historical foundation](docs/historical-interpretation.md#classical-elements-historical-theory-symbolic-gameplay). This inspiration does not place Greek philosophy before prehistoric humanity. All four starting elements have immediately accessible, sourced Atlas histories.

Historical explanations are free; **Insight reveals recipe leads, never factual information**. The Atlas has **52 researched entries**, including every Age V discovery and natural-history records for Clay, Rock, Sand, Limestone, Copper Ore, and Iron Ore, supported by **77 verified sources** (plus one pending research lead). Natural formation is distinguished from human manufacture; flint and obsidian are contextual examples, not new elements. Four optional Age V collections and four new isolated labs cover civic life, engineering, commerce, and inquiry. Existing completion targets, earned rewards, and version 7 saves remain unchanged.

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

Production builds separate third-party dependencies into a shared vendor chunk using Vite's Rolldown configuration. This keeps application code and dependencies independently cacheable while retaining the default 500 kB chunk-size warning.

## Content

Game definitions live in [`src/game/content`](src/game/content). Every recipe is an unordered pair with one deterministic result. Eras define unlock requirements, granted elements, and optional challenge landmarks.

[`validateContent`](src/game/engine/validateContent.ts) checks references, duplicate pairs, and era contracts, then simulates actual gated play: resolve recipes in unlocked eras, check landmarks, grant newly unlocked elements, and repeat. Circular gates and unreachable page content fail validation before build.
