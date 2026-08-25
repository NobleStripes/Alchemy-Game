# The Unwritten Atlas

An original combination-discovery game presented as an arcane field journal. The current vertical slice includes the first era, 19 elements, 20 recipes, a two-slot transmutation table, local progress, and responsive pointer, touch, and keyboard controls.

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

Progress is stored in browser local storage under a versioned schema. The reset control returns the journal to its four starting essences.