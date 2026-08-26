# The Unwritten Atlas

An original combination-discovery game with 55 elements, 71 recipes, a simple two-slot workspace, an inspectable formula guide, local progress, and responsive pointer, touch, and keyboard controls.

The First Light challenge asks players to catalogue 12 elements and kindle the Beacon. Completing it writes the first page without ending free exploration. Weather, geography, life, materials, agriculture, navigation, and civilization remain open in parallel.

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

Game definitions live in `src/game/content`. Every recipe is an unordered pair with one deterministic result. `validateContent` checks references, duplicate pairs, era keystones, and reachability from the four starter essences.

Progress is stored in browser local storage under a versioned schema. Version 4 records discovered elements, performed formulas, hint charges, revealed hints, and failed unordered pairs while transparently migrating earlier saves. Failed attempts retain slot I for faster experimentation and appear as tested partners in the Guide. Reset returns the game to its four starting elements and three hints.