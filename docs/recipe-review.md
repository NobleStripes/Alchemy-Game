# Historical technology and recipe review

[Back to the project overview](../README.md)

The current catalog contains **194 recipes**, including five optional Iron Age expansion routes, four earlier optional discoveries, and seven optional Classical Antiquity discoveries. Every route has an individual review in [`recipeReviews.json`](../src/game/content/recipeReviews.json), validated by [`recipeReviews.ts`](../src/game/content/recipeReviews.ts). Recipe reviews add no recipe IDs, pairs, results, age gates, rewards or save fields, and preserve alternate discovery routes.

## Classifications

| Classification | Count | Meaning |
| --- | ---: | --- |
| Material process | 14 | The pair evokes an actual transformation or working operation, not a complete procedure or an invention date. |
| Simplified process | 92 | A plausible operation is abbreviated, with missing conditions, stages or materials stated explicitly. |
| Symbolic association | 88 | A conceptual, social or fictional link; it must not be read as historical causation. |

## Player-facing context

Performed formulas have an optional **Historical context** disclosure in both Recorded Formulas and selected-element research. Each formula unlocks its own note; discovering a result does not reveal unperformed alternate routes. Notes do not appear in Open Leads or locked/unsuccessful experiments, and stay separate from the element encyclopedia. Reading changes no worktable slots, Insight, progress or storage.

The audit separates maintaining fire from making it; stone tool evidence from identifying its makers; food processing and early pottery from agricultural prerequisites; drying mud brick from firing ceramics; ore reduction from ordinary heating; alloy composition, casting and working from universal strength claims; papyrus sheets and joined rolls from writing's independent traditions; and maritime knowledge from magnetic navigation. It distinguishes bloomery iron from liquid cast iron and carburization from tempering, and flags earlier precedents for harvesting implements, roads, exchange and worked timber. The Classical Antiquity recipes are symbolic associations for civic spaces, learning, observation, fossil collection and inquiry; none is a literal founding, institutional, or scientific process.

### Classical theory versus Origins combinations

The four starting elements draw on historically documented Greek natural philosophy, not a fictional theory invented for the game. Empedocles' roots and Aristotle's elemental qualities are researched as **historical models**, separate from the classification of any recipe. Neither account establishes the game's exact two-input formulas or Origins-before-Stone-Age chronology.

Reviewed the Origins recipe flavor and review cautions for this distinction. `vein-of-ore` still explicitly disclaims historical smelting; `first-broth` disclaims an established chemical recipe; `quickened-matter` describes fictional life-making, not a claim that the four-element theory itself was fictional. These legitimate abstraction warnings remain. Other simplified material transformations are not scientific confirmation of ancient elemental theory. The recipe data, classifications, counts, ingredient pairs and discovery routes are unchanged.

## Reference limits

References reuse the central source registry and show the original URL, credited authors/institutions and passage-access limits. **88 recipe notes have background references; 106 have no attached source.** Educational QA removed the bread paper from the harvesting-blade note because it does not establish that implement's history. The Xianrendong paper was reviewed only through its abstract; proposed cooking use is not established. The Viking ship page is a later comparison, not evidence for a Bronze Age construction method. Sources support the specific background discussed, **not proof of an exact two-input recipe**. Uncited technical or interpretive cautions explicitly say they are not sourced historical reconstructions. Auditing all routes does not mean all element histories have been researched.

The Iron Age expansion cautions separate symbolic rotation and scribal associations from cereal grinding and an abbreviated manuscript-writing process. The four additional routes are classified as follows:

| Recipe | Classification | Caution |
| --- | --- | --- |
| Bone + Rock → Fossil | Symbolic association | Fossils require burial, preservation and mineral change over geological time. The pair evokes discovering remains; it does not form a fossil or date its organism. |
| Animal + Air → Bird | Symbolic association | The pair is not a biological process. Birds are living avian dinosaurs descended from theropods, and not all birds fly. |
| Pottery + Trade → Amphora | Symbolic association | Trade does not make a pot. The pair evokes ceramic transport vessels and their role in commerce; amphora traditions predate Classical Antiquity. |
| Limestone + Heat → Quicklime | Simplified process | Calcination requires sustained high-temperature firing of calcium carbonate, producing calcium oxide and carbon dioxide. The pair omits fuel, kiln design and firing controls, and the Natufian lime-plaster precedent predates the Bronze Age. |
| City + Market → Agora | Symbolic association | Evokes the Athenian Agora's civic, commercial, legal and social roles; it is not a universal city plan or construction recipe. |
| Archive + Scribe → Academy | Symbolic association | Evokes Plato's Athenian learning community; the pair does not found the Academy or make it a modern university. |
| Academy + Animal → Lyceum | Symbolic association | Evokes Aristotle's wide-ranging studies; it is not the Lyceum's founding process or a zoology-only institution. |
| Human + Cloud → Observation | Symbolic association | Evokes attention to evidence, not one origin of observation or a complete scientific method. |
| Observation + Scribe → Natural Philosophy | Symbolic association | Evokes ancient inquiry into nature; it is neither universal nor an inevitable discipline. |
| Archive + Fossil → Fossil Collection | Symbolic association | Evokes the collected fossil at Mycenae; it does not reproduce recovery or establish the specimen's purpose. |
| Fossil + Observation → Fossil Inquiry | Symbolic association | Evokes comparing evidence and interpretations; it does not prove an ancient mythic explanation or the disputed Protoceratops–griffin proposal. |

The recipe reviews total **14 material-process, 92 simplified-process, and 88 symbolic** classifications. There are **88 cautions with background references and 106 without**; references support the cited context, not proof of an exact two-input formula. No new route establishes a universal invention path, and earlier Flour and Manuscript routes remain available.

Validation rejects missing, duplicate or unknown recipe reviews, empty cautions, invalid classifications and dangling, duplicate or pending source references. [`recipeReviews.test.ts`](../src/game/content/recipeReviews.test.ts) pins the unchanged first 178 recipes and checks original and new chain cautions. Original-source checking remains necessary; schema validation cannot establish historical truth.

See [historical research](research.md) for evidence standards and [educational gameplay](gameplay.md#educational-gameplay) for optional learning labs.
