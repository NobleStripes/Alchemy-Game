# The Unwritten Atlas

An original combination-discovery game with **147 elements and 183 recipes across four ages**, a two-slot worktable, an inspectable Guide, and locally saved progress.

The persistent header switches between **Play** (the default) and **Atlas** (Historical Encyclopedia). Play keeps Elements, Combine, and Guide together on desktop and in three mobile tabs; Atlas is not a fourth gameplay tab. Both sections share discoveries and saved progress, and returning to Play preserves the previous gameplay context. Pointer, touch, and keyboard controls are supported.

Origins is an undated, symbolic gameplay prologue. Its four starting essences draw on documented Greek elemental philosophy, not modern chemistry; the combination mechanics are symbolic. Stone, Bronze, and Iron Age pages organize gameplay, not a universal historical timeline. Classical Antiquity is a possible future chapter, not a requirement for the next update.

Historical explanations are free; **Insight reveals recipe leads, never factual information**. Optional collections, learning labs, and explicit Atlas reading markers complement the discovery game.

Inspect a discovered element in the Guide and choose **View History** to open its Atlas entry directly; returning to Play restores focus to that shortcut. Ordinary section switches focus the Atlas heading or remembered gameplay panel. Navigation does not rewrite saves or change their version 7 format.

## Run locally

```powershell
npm install
npm run dev
```

## Documentation

| Guide | Contents |
| --- | --- |
| [Gameplay and Atlas](docs/gameplay.md) | Four ages, progression, Insights, collections, Rainmaker, historical entries, and learning labs. |
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

## Content

Game definitions live in [`src/game/content`](src/game/content). Every recipe is an unordered pair with one deterministic result. Eras define unlock requirements, granted elements, and optional challenge landmarks.

[`validateContent`](src/game/engine/validateContent.ts) checks references, duplicate pairs, and era contracts, then simulates actual gated play: resolve recipes in unlocked eras, check landmarks, grant newly unlocked elements, and repeat. Circular gates and unreachable page content fail validation before build.
