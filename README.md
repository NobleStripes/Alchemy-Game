# The Unwritten Atlas

An original combination-discovery game presented as an arcane field journal. The current vertical slice includes the first era, 29 elements, 32 recipes, a two-slot transmutation table, an inspectable formula journal, local progress, and responsive pointer, touch, and keyboard controls.

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

Progress is stored in browser local storage under a versioned schema. Version 2 records both discovered elements and the exact formulas performed, while transparently preserving element progress from version 1 saves. The reset control returns the journal to its four starting essences.