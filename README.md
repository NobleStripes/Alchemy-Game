# The Unwritten Atlas

An original combination-discovery game with 29 elements, 32 recipes, a simple two-slot workspace, an inspectable formula guide, local progress, and responsive pointer, touch, and keyboard controls.

The Guide includes three persisted hint charges. Each hint reveals an untried combination that can be made from currently discovered elements, prioritizing formulas that create something new.

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

Progress is stored in browser local storage under a versioned schema. Version 3 records discovered elements, performed formulas, hint charges, and revealed hints while transparently migrating version 1 and 2 saves. Reset returns the game to its four starting elements and three hints.