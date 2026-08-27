# The Unwritten Atlas

An original combination-discovery game with 89 elements and 105 recipes across a persistent historical Atlas. The simple two-slot workspace, inspectable Guide, local progress, and pointer, touch, and keyboard controls remain available across every unlocked age.

**Origins** is the natural-world prologue. Discovering Life, Land, Tree, Rock, and Animal unlocks **The Stone Age**, grants Human as that page's starting element, and keeps all earlier matter available. Stone Age landmarks are Stone Tool, Hearth, Art, and Village; optional discoveries remain open after its challenge is complete.

The Stone Age spreads across hunting, cooking, shelter, art, fibres, clothing, pottery, farming, bread, and settlement. Stone Tool opens Field and Quarry without metal. Generic Metal Tool requires Stone Tool + Metal, so pre-metal human craft has its own foundation. Spear, Hearth, Shelter, Basket, Pottery, and Art now lead into Hunt, Home, Storage, Meal, and Cave Painting.

**The Bronze Age** unlocks after Village, Pottery, Metal, and Quarry, then grants Copper Ore. Its first page branches through Copper and Tin into Bronze and Bronze Tool; through Metal Tool into Wheel and Cart; through Trade into Town and City; and through Papyrus into Writing and Scribe. Bronze, Wheel, Writing, and City are the age landmarks.

Society, Knowledge, and Transport join the original categories. Village and City are Society; Papyrus, Map, Writing, and Scribe are Knowledge; Wheel and Cart are Transport. Legacy saves containing reclassified Metal Tool, Glass, Papyrus, Map, or City unlock Bronze Age automatically.

The Guide includes active-era category completion, **Unstudied** markers for elements with unresolved outgoing uses, and a three-credit **Insight** wallet. Insights unlock after Origins or three distinct failures. Five new unique failures earn one credit, new discoveries reset the visible `0/5` stall meter, repeats do nothing, and a full wallet pauses at `4/5`. Unlocking an age and completing an age challenge each award one credit up to the cap.

Spending Insight reveals one lead without automatically performing it. Selection prioritizes unknown results from the active age, then cross-age formulas using active-age elements, then other unlocked discoveries. Every revealed but unperformed formula remains under **Open leads** regardless of the selected page.

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

Game definitions live in `src/game/content`. Every recipe is an unordered pair with one deterministic result. Eras define unlock requirements, granted elements, and optional challenge landmarks. `validateContent` checks references, duplicate pairs, era contracts, and simulates gated recipe reachability before applying each era grant.

Progress is stored in browser local storage under a versioned schema. Version 6 records discovered elements, performed formulas, Insight credits and stall progress, rewarded challenges, Open Leads, failed unordered pairs, unlocked eras, and the active page while transparently migrating earlier saves. Migration preserves old hint credits as Insights and marks already-completed challenges as rewarded. Migration removes failed pairs that are valid in the current graph, and successful formulas defensively clear stale failures. Correct guesses from locked pages are preserved as free Open Leads. Legacy saves containing historical discoveries unlock the matching age automatically. Reset returns the game to Origins with four starting elements and three Insights.

Content validation simulates actual play: resolve recipes only in unlocked eras, check landmark requirements, grant newly unlocked elements, and repeat. Circular era gates and unreachable page content fail validation before build.