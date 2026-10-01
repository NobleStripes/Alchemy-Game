# The Unwritten Atlas

An original combination-discovery game with 115 elements and 146 recipes across four ages in a persistent historical Atlas. The simple two-slot workspace, inspectable Guide, local progress, and pointer, touch, and keyboard controls remain available across every unlocked age.

Desktop keeps Elements, Combine, and Guide visible together. Mobile uses a fixed three-tab navigator; choosing an element returns directly to Combine, while the Elements list marks occupied slots. Search matches names and categories, and the Guide separates collections from optional element research with native disclosure controls.

**Origins** is the natural-world prologue. Discovering Life, Land, Tree, Rock, and Animal unlocks **The Stone Age**, grants Human as that page's starting element, and keeps all earlier matter available. Stone Age landmarks are Stone Tool, Hearth, Art, and Village; optional discoveries remain open after its challenge is complete.

The Stone Age spreads across hunting, cooking, shelter, art, fibres, clothing, pottery, farming, bread, and settlement. Stone Tool opens Field and Quarry without metal. Generic Metal Tool requires Stone Tool + Metal, so pre-metal human craft has its own foundation. Spear, Hearth, Shelter, Basket, Pottery, and Art now lead into Hunt, Home, Storage, Meal, and Cave Painting.

**The Bronze Age** unlocks after Village, Pottery, Metal, and Quarry, then grants Copper Ore. Its page branches through Copper and Tin into Bronze and Bronze Tool; through Metal Tool into Wheel and Cart; through Trade into Town and City; and through Papyrus into Writing and Scribe. Metalworking, records, and maritime trade extend through Forge, Anvil, Law, Harbor, and Voyage. Its seven landmarks are Bronze, Wheel, Writing, City, Forge, Law, and Voyage; completing its age challenge requires all seven and 23 Bronze Age discoveries.

**The Iron Age** is a compact chapter with eight elements and seven recipes. Discovering Bronze, Forge, Law, and City unlocks it and grants Iron Ore. Its elements are Iron Ore, Iron, Bellows, Bloomery, Iron Tool, Sickle, Road, and Market. The age challenge requires Iron, Iron Tool, Road, and Market plus six Iron Age discoveries, including the granted ore. All earlier matter remains available.

The seven new unordered recipes are:

- Hide + Air -> Bellows
- Bellows + Forge -> Bloomery
- Iron Ore + Bloomery -> Iron
- Iron + Anvil -> Iron Tool
- Iron Tool + Crop -> Sickle
- Iron Tool + Land -> Road
- Road + Town -> Market

Society, Knowledge, and Transport join the original categories. Village and City are Society; Papyrus, Map, Writing, and Scribe are Knowledge; Wheel and Cart are Transport. Legacy saves containing reclassified Metal Tool, Glass, Papyrus, Map, or City unlock Bronze Age automatically.

The Guide includes active-era category completion, **Unstudied** markers for elements with unresolved outgoing uses, and a three-credit **Insight** wallet. Insights unlock after Origins or three distinct failures. Five new unique failures earn one credit, new discoveries reset the visible `0/5` stall meter, repeats do nothing, and a full wallet pauses at `4/5`. Unlocking an age and completing an age challenge each award one credit up to the cap.

Spending Insight reveals one lead without automatically performing it. Selection prioritizes unknown results from the active age, then cross-age formulas using active-age elements, then other unlocked discoveries. Every revealed but unperformed formula remains under **Open leads** regardless of the selected page.

Recorded formulas, eligible Open Leads, and Recent Experiments have prepare-only actions: they fill both slots without combining, spending Insight, or recording an attempt. Locked leads keep their result hidden and their prepare action disabled until the required age unlocks. The Guide retains the latest 50 complete experiments, including repeated pairs, with discovery, known-result, no-reaction, or locked outcomes. Empty-slot submissions and hint requests are excluded; locked outcomes do not reveal the result.

The searchable **Recorded Formulas** archive lists every performed formula whose result belongs to the active age, including alternate routes. Formula records remain available after their attempts leave Recent Experiments. Older saves with performed recipe IDs populate the archive without inventing experiment history; element-only saves do not imply that a formula was performed.

Three themed collections appear separately from category completion: **Stormwatch** (Mist, Cloud, Rain, Storm, Lightning), **Harvest Table** (Field, Crop, Flour, Dough, Bread), and **Ironworkers** (Iron Ore, Bellows, Bloomery, Iron, Iron Tool). Each first completion awards +1 Insight, capped at three. Completing a collection with a full wallet still consumes its one-time reward; overflow is not banked. Loading a save does not award collection rewards.

Agriculture branches from Field into Crop. Crop + Heat creates broad Food, while Bread has one authored route: Crop + Tool → Flour, Flour + Water → Dough, and Dough + Heat → Bread.

## Rainmaker

Rainmaker is an isolated replay challenge targeting Rain, starting with only Fire, Water, Earth, and Air and allowing only recipes with Origins results. Each complete combination counts as an attempt, including repeats and failures; empty submissions do not count. It has no campaign age unlocks or hints.

Challenge discoveries, formulas, experiments, and occupied slots do not change the campaign. A completed run changes campaign metadata only through explicit **Save result**: the first saved completion awards +1 Insight up to the three-credit cap and records the best attempt count. The reward is consumed even at a full wallet; later saved wins can improve the best score but never award another Insight. Returning, abandoning, or retrying does not copy challenge discoveries into the Atlas. Runs are transient: reloading abandons the run and returns to the campaign, with no active-run resume.

Save result waits for confirmed storage before acknowledging completion or granting its reward. Saving, Return, and Retry are disabled while confirmation is pending; a failed write leaves records and rewards untouched and permits retry unless save protection is latched.

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

The test suite covers recipe order independence, same-element combinations, unknown combinations, alternate discovery routes, gated graph reachability, rendered controls, failure feedback, prepare-only actions, experiment history, collection rewards, local autosave, persistent preferences, save migration/reset, and Rainmaker isolation and completion records.

## Content

Game definitions live in `src/game/content`. Every recipe is an unordered pair with one deterministic result. Eras define unlock requirements, granted elements, and optional challenge landmarks. `validateContent` checks references, duplicate pairs, era contracts, and simulates gated recipe reachability before applying each era grant.

Content validation simulates actual play: resolve recipes only in unlocked eras, check landmark requirements, grant newly unlocked elements, and repeat. Circular era gates and unreachable page content fail validation before build.

## Saves And Settings

Progress is stored locally in the browser under `unwritten-atlas-progress`. Version 7 includes discovered elements, performed formulas, Insight credits and stall progress, age challenge reward markers, Open Leads, failed unordered pairs, unlocked ages, and the active page, plus favorites, sound preference, the latest 50 experiments, collection reward markers, and Rainmaker completion/best-score records. In-flight challenge state is not saved. There are no accounts or cloud sync.

Campaign progress is saved automatically and restored on reload. Settings controls the persistent sound preference; favorites also persist immediately. Manual file import and export are not available. Existing local saves remain compatible. Storage failures are reported, so continued in-memory play is not a guarantee that progress was saved.

A missing save starts a writable campaign. An existing save that is invalid, unsupported, too large, or unreadable instead starts in-memory play with autosaving blocked for that page session. Nothing overwrites the original, including reset, preference changes, and challenge-result saving. The warning remains visible; reload after addressing the storage problem to try loading again. Reloading discards unsaved session changes.

Writes use browser Web Locks to serialize cooperating tabs and check the original stored snapshot inside the lock. Clean tabs automatically adopt valid external updates on storage events, focus, visibility changes, or before the next action, without replaying rewards. Sound updates immediately; still-valid occupied slots are retained. External reset or save removal restores fresh campaign defaults. If an external save changes while this tab has unsaved progress, saving and adoption pause until reload, preserving this tab's in-memory session rather than silently discarding or merging it. Invalid or unreadable external updates also pause saving. Ordinary quota failures remain retryable when the stored snapshot has not changed.

Safe autosaving requires Web Locks support (and a secure context, including localhost). Unsupported browsers allow in-memory play but do not fall back to unsafe writes. All open tabs should run the updated app: older versions and external scripts do not honor its lock, so they cannot be guaranteed to cooperate. This is local browser synchronization, not cloud sync or a backup.

Earlier saves migrate to v7, preserving old hint credits as Insights within the three-credit cap. Favorites, experiment history, and challenge records default to empty, and sound defaults to enabled. Already-completed collections in v1-v6 saves are marked rewarded without retroactive Insight; existing age challenge reward migration is retained. Migration removes failed pairs that are valid in the current graph, and successful formulas defensively clear stale failures. Correct guesses from locked pages remain free Open Leads. Historical discoveries reconcile matching age unlocks and grants without retroactive unlock rewards.

Reset returns the campaign to Origins with four starting elements and three Insights. It clears discoveries beyond the starters, formulas, leads, failure progress, favorites, experiment history, reward markers, and challenge completion/best-score records, while preserving the sound preference.