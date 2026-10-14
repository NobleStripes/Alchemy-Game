# Historical technology and recipe review

[Back to the project overview](../README.md)

The current catalog contains **227 recipes**, including five optional Iron Age expansion routes, four earlier optional discoveries, and 37 Classical Antiquity routes. Every route has an individual review in [`recipeReviews.json`](../src/game/content/recipeReviews.json), validated by [`recipeReviews.ts`](../src/game/content/recipeReviews.ts). Recipe reviews themselves change no recipe IDs, pairs, results, age gates, rewards or save fields.

## Classifications

| Classification | Count | Meaning |
| --- | ---: | --- |
| Material process | 15 | The pair evokes an actual transformation or working operation, not a complete procedure or an invention date. |
| Simplified process | 94 | A plausible operation is abbreviated, with missing conditions, stages or materials stated explicitly. |
| Symbolic association | 118 | A conceptual, social or fictional link; it must not be read as historical causation. |

## Player-facing context

Performed formulas have an optional **Historical context** disclosure in both Recorded Formulas and selected-element research. Each formula unlocks its own note; discovering a result does not reveal unperformed alternate routes. Notes do not appear in Open Leads or locked/unsuccessful experiments, and stay separate from the element encyclopedia. Reading changes no worktable slots, Insight, progress or storage.

The audit separates maintaining fire from making it; stone tool evidence from identifying its makers; food processing and early pottery from agricultural prerequisites; drying mud brick from firing ceramics; ore reduction from ordinary heating; alloy composition, casting and working from universal strength claims; papyrus sheets and joined rolls from writing's independent traditions; and maritime knowledge from magnetic navigation. It distinguishes bloomery iron from liquid cast iron and carburization from tempering, and flags earlier precedents for harvesting implements, roads, exchange and worked timber. The earlier Classical Antiquity recipes are symbolic associations for civic spaces, learning, observation, fossil collection and inquiry; the new Concrete route is a simplified material process, not an institutional association.

### Classical theory versus Origins combinations

The four starting elements draw on historically documented Greek natural philosophy, not a fictional theory invented for the game. Empedocles' roots and Aristotle's elemental qualities are researched as **historical models**, separate from the classification of any recipe. Neither account establishes the game's exact two-input formulas or Origins-before-Stone-Age chronology.

Reviewed the Origins recipe flavor and review cautions for this distinction. `vein-of-ore` still explicitly disclaims historical smelting; `first-broth` disclaims an established chemical recipe; `quickened-matter` describes fictional life-making, not a claim that the four-element theory itself was fictional. These legitimate abstraction warnings remain. Other simplified material transformations are not scientific confirmation of ancient elemental theory. The recipe data, classifications, counts, ingredient pairs and discovery routes are unchanged.

## Reference limits

References reuse the central source registry and show the original URL, credited authors/institutions and passage-access limits. **122 recipe notes have background references; 105 have no attached source.** Educational QA removed the bread paper from the harvesting-blade note because it does not establish that implement's history. The Xianrendong paper was reviewed only through its abstract; proposed cooking use is not established. The Viking ship page is a later comparison, not evidence for a Bronze Age construction method. Sources support the specific background discussed, **not proof of an exact two-input recipe**. Uncited technical or interpretive cautions explicitly say they are not sourced historical reconstructions. Auditing all routes does not mean all element histories have been researched.

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

The 22 Age V expansion routes are all symbolic. They distinguish Greek agoras from Roman forums, elite councils from universal representation, a stoa from a philosophical school, aqueducts from necessarily arched structures, and individual coins from monetary systems. Human + Law adds optional Citizenship: membership is not automatically granted by residence or written rules, and civic status does not imply equal political participation. Natural Inquiry and Bird Inquiry do not grant ancient thinkers modern dinosaur knowledge. Existing Scroll, Coin, and Aqueduct recipes are reused, not replaced or reclassified.

The current recipe reviews total **15 material-process, 94 simplified-process, and 118 symbolic** classifications. All 22 earlier expansion routes have verified background references, and the earlier Aqueduct caution adds pre-Roman context. There are **122 cautions with background references and 105 without**; references support the cited context, not proof of an exact two-input formula. No new route establishes a universal invention path, and all earlier routes remain available. See the [optional branch table](gameplay.md#optional-age-v-branches) for the earlier expansion formulas.

### Scholarship route classifications

| Recipe | Classification | Caution |
| --- | --- | --- |
| Scribe + Knowledge → Historical Writing | Symbolic association | Earlier records and oral memory predate Greek historical inquiry; narratives and royal inscriptions are not automatically accurate. |
| Map + Geometry → Cartography | Symbolic association | Mathematical geography is one mapping tradition; ancient schematic maps and coordinates are not modern precision surveys. |
| Scroll + Logic → Commentary | Symbolic association | Neither papyrus nor Greek formal logic was universally required; explanation can criticize and extend an inherited text. |

Library and Rhetoric retain their existing recipes and classifications. These routes connect to older writing traditions without dating the invention of historical memory, mapping or commentary to Age V.

### Commerce route classifications

Merchant + Road Network → Merchant Network and Maritime Trade + Law → Customs Duty are sourced **symbolic associations**, not processes or invention sequences. The former omits older networks, sea routes and intermediary relationships; the latter omits varying tax jurisdictions and inland stations. The Palmyrene tariff supports a distinction about local taxation, not a caravan-customs claim. Existing Coinage, Mint, Amphora and Maritime Trade routes and classifications remain unchanged.

### Engineering route classifications

| Recipe | Classification | Caution |
| --- | --- | --- |
| Quicklime + Water → Slaked Lime | Material process | Exothermic hydration, distinct from calcination and carbonation; caustic materials, not handling instructions. |
| Slaked Lime + Sand → Lime Mortar | Simplified process | Omits mixing water, proportions and curing; not every lime binder is hydraulic. |
| Rock + Heat → Volcanic Ash | Symbolic association | Geological fragmentation, not heating loose rock or burning wood; only suitable ash is pozzolanic. |
| Lime Mortar + Volcanic Ash → Concrete | Simplified process | Omits coarse aggregate, additional water and placement; Roman hot mixing is an alternative, not a universal self-healing guarantee. |
| Road + Map → Road Network | Symbolic association | Connected and maintained routes, not an invention date or universal map requirement. |
| Aqueduct + Heat → Public Bath | Symbolic association | Varied water supplies and heating systems, Greek precedents, unequal access; Mud Brick is not fired heating tile. |

All six new reviews cite verified background passages. None changes an existing formula or its classification. See [engineering gameplay](gameplay.md#optional-engineering-materials-and-infrastructure) and [research access limits](research.md#engineering-materials-and-infrastructure-audit).

The intellectual additions distinguish numerical and geometrical astronomy from modern astrophysics, medical case records from trials or treatment advice, valid inference from true premises or persuasion, and ancient animal grouping from modern taxonomy and evolutionary ancestry. Geometry and Rhetoric are symbolic ingredients, not universal historical prerequisites. Egyptian medical evidence predates Age V; the astronomy and logic examples keep their regional dates and transmission limits.

Validation rejects missing, duplicate or unknown recipe reviews, empty cautions, invalid classifications and dangling, duplicate or pending source references. [`recipeReviews.test.ts`](../src/game/content/recipeReviews.test.ts) pins the unchanged first 178, first 194, first 211 and first 212 recipes and checks original and new chain cautions. Original-source checking remains necessary; schema validation cannot establish historical truth.

See [historical research](research.md) for evidence standards and [educational gameplay](gameplay.md#educational-gameplay) for optional learning labs.
