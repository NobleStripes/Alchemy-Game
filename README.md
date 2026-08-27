# The Unwritten Atlas

An original combination-discovery game with 73 elements and 88 recipes across a persistent historical Atlas. The simple two-slot workspace, inspectable Guide, local progress, and pointer, touch, and keyboard controls remain available across every unlocked age.

**Origins** is the natural-world prologue. Discovering Life, Land, Tree, Rock, and Animal unlocks **The Stone Age**, grants Human as that page's starting element, and keeps all earlier matter available. Stone Age landmarks are Stone Tool, Hearth, Art, and Village; optional discoveries remain open after its challenge is complete.

The Stone Age spreads across hunting, cooking, shelter, art, fibres, clothing, pottery, farming, bread, and settlement. Generic Metal Tool now requires Stone Tool + Metal, so pre-metal human craft has its own foundation.

The Guide includes category completion, **Unstudied** markers for elements with unresolved outgoing uses, and three persisted hint charges. Limited hints unlock after completing First Light or recording three distinct failures. They prioritize mixed-input formulas that create something new, and every revealed but unperformed formula remains under **Open leads**.

Agriculture branches from Field into Crop. Crop + Heat creates broad Food, while Bread has one authored route: Crop + Tool → Flour, Flour + Water → Dough, and Dough + Heat → Bread.

## Run locally

```powershell
npm install
npm run dev
```

## Validate

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The test suite validates recipe order independence, same-element combinations, unknown combinations, alternate discovery routes, graph reachability, rendered tap controls, failure feedback, and local save creation.

## Content

Game definitions live in `src/game/content`. Every recipe is an unordered pair with one deterministic result. Eras define unlock landmarks, granted elements, and optional challenge landmarks. `validateContent` checks references, duplicate pairs, era contracts, and global reachability from starters plus era grants.

Progress is stored in browser local storage under a versioned schema. Version 5 records discovered elements, performed formulas, hint charges, revealed hints, failed unordered pairs, unlocked eras, and the active page while transparently migrating earlier saves. Legacy saves containing historical discoveries unlock the matching age automatically. Reset returns the game to Origins with four starting elements and three hints.