# Catalog plan: production foundations toward 250

[Project overview](../README.md) | [Research standards](research.md#authoring-and-validation) | [Recipe review](recipe-review.md)

## Scope and acceptance rules

Retain the original **194 elements and 232 recipes**, including existing regional Age V discoveries. The target is **250 core elements within the same five gameplay ages**. Newly proposed regional modules are separate editorial backlogs, not a runtime module system or part of the additional 56.

The current milestone is implemented: **235 elements, 311 recipes, 167 full histories, 184 chronology entries, 167 verified sources and one pending source**. The latest batch adds ten everyday-craft and practical-engineering discoveries with twenty formulas, pairing each discovery history with one original-gap history. **68 original elements** still lack full records. No sixth age or DLC is added.

Core means selected for the main catalog, not universal invention or adoption. Regional module means a separately bounded comparative proposal. Research-only means history or evidence without a new gameplay node. A **core candidate** below is not accepted content until it passes all gates.

For every candidate:

1. Compare its definition, display name, stable ID, aliases and purpose against the complete current catalog, including all 194 baseline elements, not just adjacent eras. Record the closest existing IDs and reuse/merge/defer/add decision.
2. Separate target gameplay age from dated evidence, adoption and natural formation. Require passage-specific regional evidence; leave unsupported fields empty rather than inventing a first.
3. Distinguish an excavation, surviving artifact, depiction, textual assertion and modern interpretation. Disclose abstract-only, summary and preprint access. Resemblance alone does not prove diffusion or independent invention.
4. Identify meaningful inputs, intermediate operations and downstream uses. Check every proposed unordered pair against all 232 baseline pairs and the growing catalog, including reversed pairs and self-pairs.
5. Add a full Atlas history and an individual review for every shipped discovery/formula. Existing pending sources cannot support claims.
6. Preserve all baseline IDs, definitions, recipes, age gates/grants/goals/landmarks, collection and challenge definitions, rewards and version 7 saves. Reading remains optional, free and discovered-only.

### Audit coverage and limitations

The baseline inventory below includes every existing ID. Each candidate's nearest semantic overlap is recorded in the tables, not inferred only from spelling. The validator checks exact IDs, normalized duplicate names and pair conflicts; semantic distinctness remains an editorial decision.

The **41 implemented additions** have passage-reviewed evidence, individually checked pairs and full histories. The prior 225 milestone had 31 additions and 25 active deferred candidates, plus six displaced proposals. This batch accepts six active candidates, revisits displaced Sailcloth and Loom Weight, and adds Sewing and Salted Meat to give Needle and Salt useful onward routes. **19 active candidates and four displaced proposals remain deferred**, competing for at most fifteen remaining discoveries toward 250. Their target ages are hypotheses, not historical assertions; the target is not a promise to ship every candidate.

## Milestone 200: accepted production foundations

| Discovery / ID | Classification and age | Baseline overlap audit and decision | Evidence and limits |
| --- | --- | --- | --- |
| Grinding Stone / `grinding-stone` | Core; Stone Age | Rock, Stone Tool and Rotary Quern already exist. Add a non-rotary processing implement, retaining both old flour routes. | [PNAS study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2973873/), Abstract, The Sites and Lithic Use-Wear Analysis: roughly 30,000-year-old Bilancino II, Kostenki 16 and Pavlov VI contexts. Starch/wear support plant processing; flour is an interpretation, not a directly preserved meal or first invention. |
| Spindle / `spindle` | Core; Bronze Age | Fibre, Cordage, Loom and Textile do not represent the rotating yarn-preparation tool. Add it without making all yarn depend on it. | [UCL textile tools](https://www.ucl.ac.uk/museums-static/digitalegypt/textil/tools.html), spindles and Meketra workshop about 1950 BCE, Egypt. This conservative gameplay placement is not spindle invention; earlier textile evidence alone is not direct spindle evidence. |
| Yarn / `yarn` | Core; Stone Age | Fibre is a resource, Cordage a separate cord-making abstraction, and Textile a finished material. Add strands prepared for textile work, not a claim of universal ancient terminology. | UCL textile tools: Badari workshop about 3600 BCE, surviving Egyptian roves, spliced/twisted and spindle-free methods. Depictions, preserved strands and reconstructed techniques are different evidence types. |
| Kiln / `kiln` | Core; Bronze Age | Hearth maintains a fire; Forge and Bloomery serve different metalworking roles; Pottery is a product. Add a firing structure, not a universal prerequisite for pottery. | [Harappa summary of Miller](https://www.harappa.com/content/pottery-firing-structures-kilns-indus-civilization-during-third-millennium-bc): third-millennium greater Indus structures, airflow and coexisting designs. Summary/selected quotations only, not the complete chapter. [UCL kiln diagram](https://www.ucl.ac.uk/museums-static/digitalegypt/pottery/kilns.html): fire hole, hearth, chamber and vent. |
| Fired Brick / `fired-brick` | Core; Bronze Age | `brick` already means dried Mud Brick; Pottery, Wall and Masonry are not the same building unit. Add a fired unit and alternate wall route; retain `kiln-work` unchanged. | [Harappa brick overview](https://www.harappa.com/content/bricks-and-urbanism-indus-valley-rise-and-decline): water-exposed walls/floors and coexistence with mud brick. [Selected preprint section 2.1](https://ar5iv.labs.arxiv.org/html/1303.1426): approximate Mature Harappan 2600-1900 BCE, earlier precedents and overlapping local chronologies; not proof of worldwide first use or peer review. |
| Tin Ore / `tin-ore` | Core; Bronze Age resource access | Tin, Copper Ore, Iron Ore, Rock and Quarry already exist. Add the tin-bearing resource, not a duplicate metal or a new geological invention. | [USGS resource overview](https://www.usgs.gov/centers/national-minerals-information-center/tin-statistics-and-information): cassiterite SnO2 and placer resources. [Penn tin essay](https://www.penn.museum/sites/expedition/tin-in-the-ancient-near-east/): bounded ore/metal/alloy distinctions. Geological origin remains undated; no ancient mine/provenance claim. Older first-bronze and pure-tin dates are not adopted. |

All source receipts are in [research.json](../src/game/content/research.json). The preprint has an explicit `research-preprint` type rather than being mislabeled peer reviewed. Source verification attests the passages read, not every claim on the page.

### Implemented recipes and intermediate chains

All eleven pairs were absent from the baseline and are unique in the full graph. Existing alternate formulas remain unchanged.

| Inputs | Result | Review |
| --- | --- | --- |
| Rock + Stone Tool | Grinding Stone | Symbolic toolmaking association; not a manufacturing reconstruction |
| Fibre + Stone Tool | Spindle | Symbolic equipment association; shaft and whorl omitted |
| Spindle + Fibre | Yarn | Simplified preparation/twist |
| Fibre + Human | Yarn | Simplified spindle-free hand work; keeps Yarn available in Stone Age |
| Pottery + Hearth | Kiln | Symbolic workshop association, not construction from pots |
| Kiln + Mud Brick | Fired Brick | Simplified firing of a suitable shaped clay unit, not every mud-brick mixture |
| Quarry + Rock | Tin Ore | Symbolic recognition/access, not mineral formation or proof of a mine |
| Grinding Stone + Crop | Flour | Material process; wild-plant grinding predates cultivated crops |
| Loom + Yarn | Textile | Simplified weaving; preparation and skilled labor omitted |
| Tin Ore + Charcoal | Tin | Simplified reduction; controlled equipment/heat omitted, not operating guidance |
| Fired Brick + Fired Brick | Wall | Simplified assembly; joints, foundations and support omitted |

The chains now expose grinding -> Flour -> Dough -> Bread, fibre preparation -> Yarn -> Textile, firing structure -> Fired Brick -> Wall, and ore -> Tin -> Bronze. They do not require replacing legacy formulas or enforcing one historical sequence.

The six backlog histories are **Flour, Fibre, Loom, Textile, Tin and Mud Brick**. Their coverage is bounded: Egyptian flax is not every fibre; woven linen is not every textile; Tin deliberately has no unsupported invention date or ancient provenance. This preserved 200-element snapshot had **151 ingredients, 49 terminal elements and zero unused nodes**. Legitimate terminal discoveries elsewhere do not require artificial outgoing recipes.

## Milestone 215: craft, records and engineering

All fifteen discoveries are **core content**, optional for the unchanged age-completion targets. They were screened against the full 200-element catalog, including every original 194 definition and every existing pair, before acceptance.

| Discovery / ID | Gameplay age | Overlap audit and decision | Bounded evidence |
| --- | --- | --- | --- |
| Smelting Furnace / `smelting-furnace` | Bronze Age | Kiln fires ceramics; Forge works metal; Bloomery retains its iron-specific role. Add ore-reduction equipment and alternate copper/tin routes, not a universal kiln-to-furnace sequence. | [Eretz Israel Museum](https://www.eretzmuseum.org.il/en/nehushtan-pavilion/) distinguishes original copper furnaces and reconstructions. Twelfth-century BCE original supports regional use; earlier precedents remain explicit. Copper evidence does not certify a named tin furnace. |
| Clay Tablet / `clay-tablet` | Bronze Age | Clay, Writing, Writing Reed and Archive are material, practice, implement and recordkeeping. Add a support, not another writing invention. | [ORACC](https://oracc.museum.upenn.edu/nimrud/ancientkalhu/thewritings/cuneiformonclay/index.html) distinguishes moist-clay inscription, direct impressions and envelopes. The existing writing-origin receipt supplies the earlier Mesopotamian comparison. Most tablets were not fired. |
| Sealed Tablet / `sealed-tablet` | Bronze Age | Seal is a tool, not its impression. Add a document state, not a second Seal or an automatic envelope. | [Louvre AO 9386](https://collections.louvre.fr/en/ark:/53355/cl010124308) is a tablet inside an impressed envelope, broadly catalogued 2000-1392 BCE. Raw descriptive fields were read; purchase provenance is not an excavated context. Later ORACC formats are comparisons, not Bronze Age dating evidence. |
| Standardized Weights / `weight-standard` | Bronze Age | Balance is the instrument; Trade and Coinage are not the metrological convention. Retain the planned stable ID with a clearer display name. | [Harappa series](https://www.harappa.com/slide/weights-harappa) and [comparative summary](https://www.harappa.com/blog/uniqueness-ancient-indus-weight-system): regional units and variability, not one universal standard. The complete underlying PNAS paper was not reviewed. |
| Axe / `axe` | Stone Age | Stone Tool is generic, Spear has a different role, and Saw is not the only woodworking method. Add a hafted stone woodworking form. | [Sweet Track](https://avalonmarshes.org/heritage/sweet-track/) construction in 3806 BCE used stone axes and wooden wedges; that dates the structure, not axe invention. |
| Adze / `adze` | Stone Age | Distinguish Axe's parallel edge from transverse hafting; do not merge all stone woodworking tools. | [Hampshire adze](https://stonetoolsmuseum.com/artefact/europe/stone-adze-4/2870/) has an interpreted hafting arrangement and collection range 4500-6000 BP, not a newly calibrated BCE date. |
| Wedge / `wedge` | Stone Age | Splitting differs from sawing and is not a new resource called Timber. Add an alternative worked-wood route. | Sweet Track explicitly names wooden wedges. Timber keeps its old Iron Age gameplay page without claiming worked wood began then. |
| Fishhook / `fishhook` | Stone Age | Needle, Spear and Net do not represent hook-and-line fishing. Add a bone-hook branch without renaming those tools. | [Jortveit report](https://archaeology.org/issues/september-october-2020/artifacts/artifact-norway-neolithic-fishhook/), 3400-2200 BCE Norwegian Neolithic. Line material/attachment are proposed; tuna bones are not demonstrated consumption. |
| Fishing Weir / `fishing-weir` | Stone Age | Net and Basket are not a stationary barrier. Reuse basketry knowledge while distinguishing barriers from traps. | [Syltholm study](https://doi.org/10.1017/ppr.2024.15) distinguishes wattle barriers and wicker traps; compatible dates around 3900-3600 calibrated BCE suggest associated use, not one exact construction year. |
| Iron Chisel / `iron-chisel` | Iron Age | Narrow the generic Chisel proposal to an iron implement distinct from Iron Tool; do not claim all chisels began with iron. | [Twyn-y-Gaer object](https://museum.wales/collections/online/object/e1bfeffe-0e85-3b29-b81e-20bba013acb2/Iron-Age-iron-chisel/) is incomplete and its context is not yet known; no numerical date or precise task is invented. |
| Gouge / `gouge` | Iron Age | Distinguish a curved hollowing edge from Chisel, Adze and generic Iron Tool. | [Museum Wales carpentry account](https://museum.wales/blog/729/Bryn-Eryr-Farm---How-to-become-an-Iron-Age-Carpenter/) names a Castell Henllys gouge and separates originals, reconstructed handles and modern trials. No exact date is supplied. |
| Wax Tablet / `wax-tablet` | Iron Age | A reusable support is not Manuscript, Writing or Clay Tablet. Wax and stylus are explicit omitted inputs rather than unsupported extra resource nodes. | [ORACC other media](https://oracc.museum.upenn.edu/nimrud/ancientkalhu/thewritings/cuneiformonothermedia/index.html) distinguishes references, depictions and surviving boards; possible 612 BCE deposition is not manufacture. Earlier precedents are retained. |
| Pulley / `pulley` | Classical Antiquity | Wheel and Cordage do not describe a complete lifting machine. Add a rope-guiding mechanism and building association. | [Vitruvius X.2](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/10*.html) is textual evidence for hoists, not an excavated first pulley. Fixed and compound systems differ. |
| Water Screw / `water-screw` | Classical Antiquity | Irrigation, Canal and Aqueduct are not a helical water lift. Lathe is a rotary-craft clue, not a documented prerequisite. | Vitruvius X.6 describes the device; it does not establish sole inventorship, an Assyrian predecessor or an exact origin date. |
| Vault / `vault` | Classical Antiquity | Arch is a form, Concrete a material, Public Bath a building use. Add an extended spanning form. | [Roman Architecture](https://www.worldhistory.org/Roman_Architecture/), materials section: first-century BCE regional concrete use in vaults, not the first vault worldwide or a requirement for every vault. |

### Accepted chains and recipe limits

The batch appends **27 unique unordered pairs**: **20 symbolic associations and seven simplified processes**, all individually reviewed and cited. Every one of the earlier 243 routes remains unchanged. New chains include:

- Firing knowledge -> Smelting Furnace -> alternative Copper/Tin -> existing Bronze.
- Clay + Writing Reed -> Clay Tablet -> Sealed Tablet, alongside existing Writing, Seal and Archive.
- Balance -> Standardized Weights -> an optional Merchant association.
- Hafted Axe -> Adze and Wedge -> Shelter or split Timber; the later Timber page is retained for compatibility.
- Bone/line and basketry/water -> distinct hook and weir fishing -> existing Food.
- Iron Tool -> Iron Chisel or Gouge -> optional masonry/boat associations; those uses are gameplay-only, not proven tasks of the cited objects.
- Timber/writing -> Wax Tablet, with wax, preparation and stylus acknowledged as omitted.
- Wheel/rope -> Pulley -> masonry logistics; rotary craft/water management -> Water Screw -> irrigation association; Arch/masonry -> Vault -> a bath-space association.

The [optional-content guide](optional-content.md#craft-records-and-engineering) contains the complete recipe spoiler table. Two-input clues are not operating, manufacturing or structural instructions.

Fifteen original gaps now receive histories: **Copper, Bronze, Forge, Seal, Scribe, Archive, Balance, Bronze Tool, Masonry, Irrigation, Bellows, Bloomery, Iron, Iron Tool and Blacksmith**. These are bounded entries, not claims of exhaustive research: several deliberately have no numerical chronology, and Irrigation's Roman technical comparison does not date earlier irrigation. Full coverage now reaches **127/215**, with **88 original gaps** remaining.

The preserved 215 milestone graph is **168 ingredients, 47 terminal discoveries and zero unused nodes**. Lathe gains an outgoing use; saves recompute status rather than storing a permanent terminal flag. Regression coverage fingerprints the entire previous 200/243 catalog, validates both full and prior graphs, checks all 27 pairs in both orders, verifies same-age reachability and cited histories, and round-trips discoveries/formulas/reading in v7.

### Replacements and rejected evidence

At the 215 milestone, six original slots were replaced: generic Chisel -> Iron Chisel; Drill -> Fishhook; Mallet -> Fishing Weir; Sailcloth -> Smelting Furnace; Loom Weight -> Sealed Tablet; Lost-Wax Casting -> Gouge. The 235 batch separately accepts Sailcloth and Loom Weight after review, without removing their replacements. The other four displaced proposals remain deferred; the 250 target still allows only fifteen further discoveries.

A Museum Wales [file record](https://museum.wales/collections/online/object/50a1c79a-a981-3a8e-bf76-5ba889a8e1d2/Iron-Age--Roman-iron-file/) has an ambiguous title but explicitly dates the object to **260-355 CE**. It was rejected as support for an Iron Age file. Blocked Met/British Museum pages and search snippets were not promoted to verified receipts; the Louvre's descriptive HTML and other directly read institutional sources supplied the accepted evidence.

## Milestone 219: Stone Age materials and watercraft

The approved batch appends **Resin, Adhesive, Dugout Canoe and Paddle**, all optional Stone Age discoveries. All **215 preceding definitions and 270 formulas** remain byte-for-byte equivalent as parsed objects, with preservation fingerprints in [Stone Age regressions](../src/game/content/stoneAgeMaterials.test.ts). Ages, gates, grants, goals, landmarks, collections, challenges, rewards and v7 save fields are unchanged.

| Accepted discovery / ID | Existing meanings and decision | Passage-reviewed evidence and age limits |
| --- | --- | --- |
| Resin / `resin` | Tree and Forest provide biological context; Ash, Charcoal and Pigment are different resources. Add naturally exuded conifer resin, not all sap, gum, tar or prepared glue. | [Latium residue study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6586293/): Pinaceae resin on varied Middle Paleolithic tools. Fossellone layer 23 is indirectly bracketed about 55-40 ka, not directly dated resin or natural formation. Collection/dehafting interpretations do not prove the game's harvesting action. |
| Adhesive / `adhesive` | Cordage and Leather are not prepared bonding materials; Lime Mortar and Concrete already represent masonry binders. Add an organic hafting preparation, represented by resin use rather than every adhesive. | Latium resin and one beeswax mixture; [Sibudu study](https://pmc.ncbi.nlm.nih.gov/articles/PMC2700998/) describes approximately 70 ka plant-gum/ochre evidence. Gum is not resin; modern replication is not a preserved ancient recipe. Separate regions do not prove independent invention. |
| Dugout Canoe / `dugout-canoe` | Boat explicitly acknowledges earlier dugouts while retaining its later page; Timber, Axe, Adze and Gouge are not this watercraft. Add a hollowed-trunk tradition without requiring later tools. | [Pesse record](https://drentsmuseum.nl/en/collection/pesse-canoe-the-oldest-boat-in-the-world), embedded object fields: circa 8250-7550 BCE, wood, Mesolithic, 1955-VIII-2. [Broksoe account](https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-mesolithic-period/the-dugout-boat-from-broksoe/): separate oak craft c. 3500 BCE, axes and wedges. Neither dates the first watercraft. |
| Paddle / `paddle` | Boat is a craft, Sail wind propulsion, Voyage travel and Wayfinding (`compass`) navigation. Add handheld water-propulsion equipment rather than a duplicate boat or an oar system. | [Danish paddle exhibit](https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-mesolithic-period/the-dugout-boat-from-broksoe/the-paddles/): paddles/poles and Tybrind Vig finds. Shape/decoration interpretations are hypotheses. No numerical paddle date is supplied; the Broksoe date is not transferred. |

### Accepted recipes and downstream uses

All seven unordered pairs were absent from the baseline, including reversed forms. Each has an individual cited review: six symbolic associations and one simplified process.

| Inputs | Result | Classification and limits |
| --- | --- | --- |
| Forest + Stone Tool | Resin | Symbolic access to suitable trees, not a verified harvesting method or resin formation |
| Resin + Heat | Adhesive | Simplified resin preparation; workability changes need not create a new chemical substance; not all adhesives |
| Forest + Axe | Dugout Canoe | Symbolic woodworking; selection, wedges and skilled work omitted |
| Dugout Canoe + Tree | Paddle | Symbolic equipment/material relationship, not a boat made into a paddle or a priority claim |
| Adhesive + Stone Tool | Axe | Symbolic hafting; handle and binding omitted; studied Italian tools are not identified as these axes |
| Dugout Canoe + Net | Food | Symbolic fishing; catch and ecological conditions omitted; no claimed excavated canoe/net assemblage |
| Paddle + Boat | Voyage | Symbolic human-powered travel; Voyage remains Bronze Age and old sailing/wayfinding routes remain |

Origins supplies Forest, Tree and Heat; existing Stone Age Stone Tool and Cordage already provide Axe. Thus all four additions are reachable without Timber, Boat, Sail or metal tools. The independent old Axe route prevents an unseeded hafting cycle. Every new discovery has an outgoing use; Paddle's Voyage use is intentionally later-age, not a reason to delay its discovery.

Four old gaps also receive full histories: **Stone Tool, Cordage, Net and Hearth**. Smithsonian process/attribution and hearth-use passages are reused without adopting older first-tool or first-fire dates. The [Abri du Maras study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7145842/) documents a three-ply inner-bark fragment on an in-situ flake; Level 4.2 sample ages are context, not direct fibre dates or evidence of found nets. The [Antrea original abstract](https://journal.fi/iskos/article/view/110409) supports willow-bast net cord and separates the 9140 +/- 135 radiocarbon BP measurement from a proposed 8400-8300 calBC sinking context. The full Antrea paper was not read; dimensions, knots and catch species are not invented.

Source receipts distinguish selected passages, museum collection fields and abstract-only access. Pesse's HTML object data, not its sparse simplified extraction, supplied the dating fields; its 1955 acquisition is not an ancient date. Unknown publication dates remain null. No first-ever adhesive, canoe, paddle or independent-invention claim is accepted.

The graph is now **173 ingredients, 46 terminal discoveries and zero unused nodes**. Full histories reach **135/219**, leaving **84 original gaps**. All prior 127 histories and source receipts remain. Old saves expose newly researched existing IDs without auto-reading, rewards or replaying recipes.

### Deferred and rejected dispositions at the 219 milestone

The original tables below retain the complete overlap screen. Their **31 active deferred candidates** are Joinery, Pottery Wheel, Crucible, Annealing, Dye, Dyeing, Fermentation, Oil Press, Olive Oil, Lamp, Wick, Plaster, Lever, Winch, Gear, Waterwheel, Watermill, Sundial, Water Clock, Gnomon, Calendar, Abacus, Surveying, Plumb Line, Measuring Rod, Counting Token, Stylus, Mosaic, Tessera, Dome and Wheelbarrow. Their proposed ages are not historical approval. Dye/Dyeing, Gnomon/Sundial and Mosaic/Tessera need separate gameplay value; Plaster and Stylus must avoid existing binder/reed meanings. Merge or reject rather than pad these chains if that test fails.

At this milestone, six displaced proposals remained separately deferred: generic Chisel, Drill, Mallet, Sailcloth, Loom Weight and Lost-Wax Casting. They are not extra active slots. Regional modules and research-only reuse decisions below remain outside this batch; Resin does not approve Lacquerware.

Rejected interpretations include universal resin-to-glue transformation, equating gum/resin/tar, inferring an exact harvesting method from residues, treating preserved objects as first inventions, transferring canoe dates to paddles, and reading the museum's English word "sailing" as evidence of a sail. No focus candidate required replacement.

## Milestone 225: specialized production, measurement and water power

All six requested candidates are accepted with bounded meanings, four in Bronze Age and two in Classical Antiquity. The entire **219-element/277-recipe baseline**, including the earlier 215/270 baseline, remains unchanged. [Production and water-power regressions](../src/game/content/productionWaterpower.test.ts) fingerprint definitions, formulas, era requirements and collections. No age, grant, goal, landmark, collection, challenge, reward or v7 field changes.

| Accepted discovery / ID | Existing IDs and meanings; decision | Inspected evidence, chronology and access limits |
| --- | --- | --- |
| Pottery Wheel / `pottery-wheel` | Wheel is transport-related; Pottery is the product; Lathe represents a different woodworking arrangement. Add pottery-forming equipment, not a new origin for ceramics. | [Berg's encyclopedia abstract](https://research.manchester.ac.uk/en/publications/the-potters-wheel/): Near Eastern fifth-millennium BCE development and staged/hybrid techniques, not universal full throwing. [UCL production table](https://www.ucl.ac.uk/museums-static/digitalegypt/pottery/production.html): Egyptian Fifth Dynasty use around 2400 BCE alongside hand methods. Earlier development, regional use and Bronze Age gameplay remain separate. Full chapter not read. |
| Crucible / `crucible` | Pottery is a general product, Kiln a firing structure, Forge a workshop and Mold a shape-defining form. Add a metallurgical working vessel, not every pot or another furnace. | [El Argar study abstract](https://britishmuseum.iro.bl.uk/entities/publication/5110ab08-7784-4900-ba81-e439249e936b): Bronze Age southeast Spain, excavated vessel, thick walls/spout/non-refractory fabric and copper-alloy melting. This example differs from contemporary smelting vessels. Proposed recycling/alloying activities remain possibilities. No numerical object date or full-paper reading claimed. |
| Annealing / `annealing` | Copper/Bronze are materials; Smelting Furnace, Forge and Crucible serve different roles; Metal Tool (`tool`) is a product. Add solid-metal heat-treatment knowledge, not smelting, alloying, melting, quenching or tempering. | [Scott's Getty textbook](https://www.getty.edu/publications-reports/item/248C43), printed pp. 3, 7-9 and 88: work-hardening, working/annealing cycles, recrystallization and a Late Bronze Age Tell Ajjul interpretation. Hot-working may produce similar structures. Regional Bronze placement, not first annealing; no exact origin date or universal cooling rule. |
| Plumb Line / `plumb-line` | Cordage is a material, Balance compares mass and Masonry is construction. Add a gravity-direction reference, not a complete survey system. | [Met bob record](https://www.metmuseum.org/art/collection/search/546810), read through the official API: Lisht North, travertine, circa 1850-1700 BCE. [GEM3458](https://gem.eg/en/collection/artefacts/plumb-line-level): separate Dynasty 12 wooden builders'/carpenters' level with missing string. Neither proves use on a named pyramid, exact field surveys or first invention. |
| Waterwheel / `waterwheel` | Wheel is a rotary transport element; Water Screw lifts water; River/Aqueduct supply water. Add hydraulic power conversion, not the complete milling installation. | [Vitruvius X.5.1-2](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/10*.html) is textual evidence for current-driven wheels. [Barbegal hydraulics study](https://pmc.ncbi.nlm.nih.gov/articles/PMC7578838/) supports an aqueduct-fed overshot lower-mill reconstruction in a second-century CE French complex. Undershot/overshot configurations are not a universal chronological ladder; wood has decayed and modeled geometry is not an intact wheel. |
| Watermill / `watermill` | Rotary Quern is older hand equipment; Flour is output; Waterwheel supplies power. Add a powered installation, not the beginning of grinding. | Vitruvius X.5.2 describes transmission, hopper and flour. [Barbegal study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6124920/) documents a second-century CE complex of sixteen mills and carbonate casts. [Hand-quern evidence](https://timeline.northamptonmuseums.com/timeline/iron-age-rotary-quern) predates it. Seasonal operation and proposed hardtack customers are interpretations, not proven cargo or consumers. |

### Accepted production and water-power recipes

All eleven unordered pairs are new and individually reviewed: **six symbolic associations and five simplified processes**. All have verified background citations, not proof of an exact ancient formula.

| Inputs | Result | Classification and omitted conditions |
| --- | --- | --- |
| Wheel + Pottery | Pottery Wheel | Symbolic rotation/craft association, not proven derivation from a vehicle wheel |
| Kiln + Pottery | Crucible | Symbolic ceramic knowledge; refiring an arbitrary pot does not make it suitable for metallurgy |
| Copper + Heat | Annealing | Simplified treatment; prior working, time, temperature, atmosphere and cooling omitted |
| Cordage + Rock | Plumb Line | Symbolic suspension/weight; suitable bob and assembly omitted |
| River + Wheel | Waterwheel | Symbolic engineering; not every wheel is river-fed, and supply/supports/site are omitted |
| Waterwheel + Rotary Quern | Watermill | Simplified powered-milling chain; transmission and installation omitted, not direct attachment of any quern |
| Pottery Wheel + Clay | Pottery | Simplified forming route; preparation, drying and firing omitted; old pottery remains independent |
| Crucible + Bronze | Bronze Tool | Simplified casting; prepared alloy supplied, mold/cooling/finishing omitted |
| Annealing + Copper | Metal Tool | Symbolic further-working association; heat alone neither finishes a tool nor creates an alloy |
| Plumb Line + Rock | Masonry | Symbolic construction control; no claim of this instrument at every quarry or monument |
| Watermill + Crop | Flour | Simplified grain grinding; Crop means suitable prepared grain, not all cultivated plants |

All four production discoveries are reachable during Bronze Age without later tools; Waterwheel and Watermill are reachable only when their Age V results unlock. Their recipes do not enter the unchanged Age V unlock or completion requirements. The old graph alone still supports every age challenge. Each new discovery is an ingredient in a meaningful onward route; graph totals are **179 ingredients, 46 terminal discoveries and zero unused nodes**.

Six original gaps receive full histories: **Pottery, Wheel, Mold, Quarry, Crop and Bread**. Pottery predates farming and wheel forming; the [Ljubljana museum](https://mgml.si/en/city-museum/exhibitions/273/ljubljana-history-city/) provides a bounded wheel/axle example, not worldwide invention. [UCL casting](https://www.ucl.ac.uk/museums-static/digitalegypt/metal/metal.html) separates molds from melting vessels and does not turn later Roman/Byzantine mold records into Bronze Age evidence. [Egyptian quarrying](https://www.ucl.ac.uk/museums-static/digitalegypt/stone/quarries.html) is regional, not a tin-mine claim. The [Smithsonian cultivation overview](https://humanorigins.si.edu/human-characteristics/humans-change-world) distinguishes food production from gathering; its schematic relative dates are not adopted as exact origins. [Shubayqa bread-like remains](https://pmc.ncbi.nlm.nih.gov/articles/PMC6077754/) document forager plant-food processing before farming, not a modern loaf or universal first.

Thirteen new receipts state the exact inspected passages and abstract/collection/textbook/modeling limits. Previously verified records remain intact. The Cambridge Cyprus paper's introductory possibility of annealing was not used as proof of a directly demonstrated Chalcolithic treatment; Scott's inspected mechanism and archaeological interpretation provide the bounded account instead. Blocked pages and search summaries are not evidence receipts.

### Additional recipe connections and research sign-off

The E/F follow-up evaluates all six requested formulas against the complete live graph, rather than adding six duplicates. **Three new pairs** are appended, **two existing formulas** are reused, and **one conflicting result is rejected**. All **225 definitions and 288 preceding recipes** remain unchanged, including IDs, inputs, results, flavor and order; the original 215/270 baseline remains covered by earlier fingerprints. No new element, age requirement, reward, collection, challenge or v7 field is introduced.

| Requested inputs / result | Disposition | Review and evidence limits |
| --- | --- | --- |
| Adhesive + Stone Tool -> Spear | **Reject conflicting result; retain Axe** under `adhesive-hafting` | The unordered pair already produces Axe. Preserve it and the independent `long-reach` Spear formula; do not create a second result, rename an old formula or substitute an unresearched pair. The existing cited symbolic hafting review does not identify the studied tools as axes or spears. |
| Paddle + Dugout Canoe -> Voyage | **Accept** `dugout-voyage` | Symbolic equipment/travel association. The [National Museum of Denmark](https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-mesolithic-period/the-dugout-boat-from-broksoe/the-paddles/) explicitly describes paddles or poles propelling dugouts. Both ingredients are Stone Age; Voyage stays Bronze Age. This later gate is not the beginning of journeys, paddling or boats. |
| Pottery Wheel + Clay -> Pottery | **Reuse** `wheel-assisted-pottery` | Existing simplified process, with preparation, drying and firing omitted. Hand-built pottery and its earlier route remain independent; wheel assistance is not all ceramics or universal full throwing. |
| Crucible + Copper Ore -> Copper | **Accept** `crucible-copper` | Simplified reduction in a suitable crucible-furnace arrangement, not contact with any pot. Ore preparation, fuel, controlled heat/atmosphere, slag handling and metal recovery are omitted. The [original Cambridge-hosted abstract](https://www.repository.cam.ac.uk/items/e35c8582-d60d-47df-852d-04ec6e0646aa) interprets Chalcolithic Iberian slagged crucibles as primary copper production, distinct from the earlier El Argar melting example. |
| Plumb Line + Masonry -> Wall | **Accept** `aligned-masonry-wall` | Symbolic alignment association, supported by the [GEM level description](https://gem.eg/en/collection/artefacts/plumb-line-level). Blocks, joints, foundations, support and skilled construction are omitted. Bronze Age measuring equipment does not date the earlier Stone Age Wall or Masonry discoveries. |
| Watermill + Crop -> Flour | **Reuse** `watermill-flour` | Existing simplified grinding route for suitable prepared grain. Earlier grinding stones, hand querns and flour remain independent; later powered equipment does not begin milling or farming. |

Every accepted formula has its own verified-source review, including the two reused alternatives and the preserved Axe association. All ten approved B-D discoveries already have complete Atlas entries with cited overview, use, significance and age placement; evidence, uncertainty, gameplay limits, related entries and further-research questions remain explicit. The Crucible entry now separates Chalcolithic Iberian smelting from Bronze Age El Argar alloy melting, and adds bounded Copper Ore/Copper links. Paddle and Plumb Line explain the added journey and Wall associations.

The new `iberian-crucible-smelting` receipt records the **original abstract and repository citation metadata actually read on 17 October 2026**, not the full paper or search summaries. Two Lugar Viejo III crucibles and the separate Cueva del Canaveralejo slag cakes are not conflated. Suggested sulfidic ores remain a possibility concerning the latter assemblage. No exact artifact date, first invention, independent invention or universal skill judgment is inferred. Its December 2022 publication metadata lacks a day, so `publicationDate` stays null.

Rechecked background passages include the Danish paddle paragraph, Penn Museum's primary-production/slag paragraph and tuyere caption, and the GEM description exposed in original HTML metadata (the simplified page showed a ticket overlay). Earlier receipts retain their actual passage/access limits. Unverified candidates remain deferred; the pending source cannot support shipped claims.

At the E/F sign-off, coverage was **147/225 histories**, **176 chronology entries**, **161 verified sources plus one pending**, and **291 individual recipe reviews**: **16 material-process, 114 simplified-process, 161 symbolic**, with **186 cited and 105 uncited**. This recipe-only pass adds no history-count credit: **78 original gaps** and **25 deferred core candidates** remain. Graph totals remain **179 ingredients, 46 terminal and zero unused**. Independent scholarly review remains outstanding.

### Current deferred and rejected dispositions

The **19 active deferred candidates** are Joinery, Dye, Dyeing, Fermentation, Oil Press, Olive Oil, Plaster, Gear, Water Clock, Gnomon, Calendar, Abacus, Surveying, Measuring Rod, Counting Token, Stylus, Mosaic, Tessera and Wheelbarrow. Generic Chisel, Drill, Mallet and Lost-Wax Casting remain separately displaced/deferred. Sailcloth and Loom Weight were displaced earlier but are now accepted alongside Lamp, Wick, Lever, Winch, Sundial and Dome in the 235 batch.

Rejected interpretations: all pottery is wheel-thrown; any pot becomes a crucible by firing; all ancient crucibles use refractory fabric; heating alone proves annealing or hardens copper like steel; a bob preserves its missing cord or proves a particular pyramid survey; undershot must universally precede overshot; all waterwheels are river-fed; a reconstruction is a complete surviving machine; powered milling invented flour. No requested node required replacement, and no redundant discovery was added to fill a quota.

## Original later-candidate screen

The tables below preserve the original queue and age hypotheses, not a current approval list. The accepted batches above and the [235 audit](#milestone-235-everyday-crafts-and-practical-engineering) record actual dispositions. Nineteen active candidates and four displaced proposals remain deferred. Unaccepted ages are hypotheses and chain roles are design objectives, not authored pairs or verified historical dependencies.

### Toward 210: ten woodworking and binding candidates

| ID / proposed discovery | Target age hypothesis | Closest baseline IDs; distinctness test and proposed chain role |
| --- | --- | --- |
| `axe` / Axe | Stone Age | Stone Tool, Saw, Timber: a cutting implement with a distinct wood-working use; otherwise extend Stone Tool research. |
| `adze` / Adze | Stone Age | Stone Tool, Saw, Timber: distinguish edge orientation and shaping work from Axe; merge if it adds no separate route. |
| `chisel` / Chisel | Bronze Age | Metal Tool, Masonry, Stone Tool: a directed cutting implement connecting wood/stone finishing, not another generic tool tier. |
| `drill` / Drill | Stone Age | Stone Tool, Needle: a perforating tool, not a duplicate sewing implement; potential bead/joinery chain needs evidence. |
| `mallet` / Mallet | Stone Age | Stone Tool, Anvil: a striking implement for controlled work; require a useful complementary tool route. |
| `wedge` / Wedge | Stone Age | Stone Tool, Timber, Quarry: splitting rather than sawing; investigate the existing Sweet Track source before accepting a node. |
| `joinery` / Joinery | Bronze Age | Timber, House, Cart, Boat: a joining practice, not a renamed building or generic Timber history. |
| `resin` / Resin | Stone Age | Tree, Ash, Pigment: a specific biological resource; formation/use must not be confused with a compounded adhesive. |
| `adhesive` / Adhesive | Stone Age | Cordage, Pigment, Leather: a bonding preparation with a distinct hafting/joining role; define composition narrowly enough to research. |
| `paddle` / Paddle | Stone Age | Boat, Sail, Voyage: human-powered propulsion rather than a duplicate watercraft; require appropriate regional artifact evidence. |

### Toward 225: fifteen craft and processing candidates

These are retained proposal rows, not a current approval list. Sailcloth, Wick and Lamp are accepted in the 235 batch; Loom Weight is accepted with an Iron Age gameplay placement explicitly distinguished from the cited Ptolemaic date. See the [235 audit](#milestone-235-everyday-crafts-and-practical-engineering).

| ID / proposed discovery | Target age hypothesis | Closest baseline IDs; distinctness test and proposed chain role |
| --- | --- | --- |
| `dugout-canoe` / Dugout Canoe | Stone Age | Boat, Timber: a bounded construction tradition rather than relabeling Boat; earlier wood-working ingredients must be accessible. |
| `sailcloth` / Sailcloth | Bronze Age | Sail, Textile, Loom: a material prepared for propulsion; merge into Sail research if no distinct operation exists. |
| `loom-weight` / Loom Weight | Bronze Age | Loom, Clay: tensioning equipment; cannot imply every loom used weights. |
| `pottery-wheel` / Pottery Wheel | Bronze Age | Wheel, Pottery, Lathe: distinguish forming equipment from transport and turning; hand-built pottery stays valid. |
| `crucible` / Crucible | Bronze Age | Pottery, Forge, Mold: a heat-resistant working vessel, not every clay pot; useful metalworking intermediate. |
| `lost-wax-casting` / Lost-Wax Casting | Bronze Age | Mold, Bronze, Art: a distinct process, not a new alias for Mold; needs evidence and missing wax intermediate review. |
| `annealing` / Annealing | Bronze Age | Forge, Metal Tool, Bronze: a material-working process; distinguish from melting, smelting and tempering. |
| `dye` / Dye | Bronze Age | Pigment, Textile, Plant: distinguish soluble colorant from the existing pigment abstraction; define a researched example. |
| `dyeing` / Dyeing | Bronze Age | Pigment, Clothing, Textile: a treatment practice, not the Dye material; merge if separate gameplay value is weak. |
| `fermentation` / Fermentation | Stone Age | Food, Crop, Bread, Meal: a bounded biological processing concept, not proof of controlled modern microbiology. |
| `oil-press` / Oil Press | Iron Age | Tool, Rotary Quern, Crop: pressing rather than grinding; verify earlier precedents and the required equipment. |
| `olive-oil` / Olive Oil | Bronze Age | Plant, Food, Meal: a specific processed resource, not every oil; olive input and regional scope need review. |
| `lamp` / Lamp | Bronze Age | Hearth, Beacon, Pottery: a bounded lighting device with a fuel/consumable chain, not another signal fire. |
| `wick` / Wick | Bronze Age | Fibre, Cordage, Textile: a fuel-delivery consumable, not generic string; only add with a supported lighting chain. |
| `plaster` / Plaster | Stone Age | Quicklime, Slaked Lime, Lime Mortar, Wall: a surface treatment distinct from masonry binder; defer/merge unless the definition avoids generic Mortar duplication. |

### Toward 250: twenty-five mechanics, records and built-environment candidates

Lever, Winch, Sundial and Dome are now accepted in the 235 batch. Lever uses the overlapping Iron Age page rather than the original Classical hypothesis; the cited Roman text does not date its invention.

| ID / proposed discovery | Target age hypothesis | Closest baseline IDs; distinctness test and proposed chain role |
| --- | --- | --- |
| `lever` / Lever | Classical Antiquity | Tool, Quarry, Geometry: distinguish an explicit mechanical principle from every earlier levering action. |
| `pulley` / Pulley | Classical Antiquity | Wheel, Cordage, Quarry: lifting mechanism, not a transport wheel; investigate real rigging and older precedents. |
| `winch` / Winch | Classical Antiquity | Wheel, Cordage, Cart: a winding device with a meaningful lifting/movement route. |
| `water-screw` / Water Screw | Classical Antiquity | Irrigation, Canal, Aqueduct: a lifting mechanism distinct from gravity supply; avoid an automatic sole-inventor claim. |
| `gear` / Gear | Classical Antiquity | Wheel, Lathe: toothed motion transmission rather than another rotation symbol; tool access and manufacture need review. |
| `waterwheel` / Waterwheel | Classical Antiquity | Wheel, River, Rotary Quern: a power-conversion device, distinct from the mill it can drive. |
| `watermill` / Watermill | Classical Antiquity | Rotary Quern, Flour, River: powered processing installation, not the origin of grain milling. |
| `sundial` / Sundial | Classical Antiquity | Mathematical Astronomy, Observation, Geometry: an instrument, not all astronomical timekeeping. |
| `water-clock` / Water Clock | Bronze Age | Water, Pottery, Mathematical Astronomy: timed flow device; distinguish artifact dates from first time measurement. |
| `gnomon` / Gnomon | Bronze Age | Observation, Geometry, Mathematical Astronomy: shadow instrument; merge with Sundial if a separate chain is artificial. |
| `calendar` / Calendar | Bronze Age | Writing, Observation, Mathematical Astronomy: a rule system, not one universal year or an invention of writing. |
| `abacus` / Abacus | Classical Antiquity | Geometry, Knowledge: a counting aid distinct from an abstract discipline; specify regional device and evidence. |
| `surveying` / Surveying | Bronze Age | Map, Geometry, Irrigation, Cartography: measured spatial practice distinct from representing a map. |
| `plumb-line` / Plumb Line | Bronze Age | Cordage, Masonry, Balance: vertical reference tool rather than a weighing instrument. |
| `measuring-rod` / Measuring Rod | Bronze Age | Map, Geometry, Tool: a bounded measurement artifact, not generic knowledge. |
| `weight-standard` / Weight Standard | Bronze Age | Balance, Trade, Coinage: metrological convention, not the scale or necessarily money. |
| `counting-token` / Counting Token | Stone Age | Clay, Writing, Seal: accounting artifact with a specific regional context; must not imply all writing descends from tokens. |
| `clay-tablet` / Clay Tablet | Bronze Age | Clay, Writing, Archive: a writing support, not a second invention of writing or a required medium. |
| `stylus` / Stylus | Bronze Age | Writing Reed, Writing, Seal: a bounded implement for another support; merge if merely a renamed reed. |
| `wax-tablet` / Wax Tablet | Iron Age | Manuscript, Writing, Timber: reusable support; missing wax and tool dependencies must be justified. |
| `mosaic` / Mosaic | Classical Antiquity | Art, Pottery, Masonry: assembled surface work, not all decoration. |
| `tessera` / Tessera | Classical Antiquity | Rock, Glass, Pottery: prepared mosaic unit, not every pebble; reject if too granular for meaningful play. |
| `vault` / Vault | Classical Antiquity | Arch, Masonry, Amphitheater: a spatial spanning structure rather than another name for Arch. |
| `dome` / Dome | Classical Antiquity | Arch, Concrete, Public Bath: a different spanning form; do not make concrete universal or necessary. |
| `wheelbarrow` / Wheelbarrow | Classical Antiquity | Wheel, Cart, Wagon: a distinct load-carrying arrangement; regional evidence decides main-catalog versus module scope. |

The original screen gave **56 named core slots**. At the 225 baseline, 31 were shipped and 25 active candidates remained blocked, with six displaced proposals separate. The 235 batch accepts six active candidates, two formerly displaced proposals and two additions outside that screen. There are now 41 discoveries beyond the 194 baseline; 19 active candidates and four displaced proposals remain unapproved. At most fifteen can fit the 250 target, so the queue is not a promise that all candidates will qualify.

## Regional-module and research-only dispositions

DLC work is deferred in favor of the base game. Regional-module proposals below remain editorial backlog, not installed or activatable content. Existing regional histories in the base catalog remain included.

These do not count toward 250. All unverified dates/regions remain blockers rather than accepted historical claims.

| Proposal | Classification | Target / evidence status | Baseline overlap and disposition |
| --- | --- | --- | --- |
| Qanat | Regional module | Age V comparison; existing UNESCO receipt is a lead, not a complete new-node audit | Aqueduct, Canal and Irrigation exist. Investigate groundwater galleries as a bounded regional system without treating all waterworks as equivalent. |
| Cast Iron | Regional module | Iron Age/Chinese comparison hypothesis; source verification pending | Iron, Steel, Bloomery exist. Distinguish production/material behavior, not a generic stronger-metal tier. |
| Crossbow | Regional module | Iron Age hypothesis; dated regional evidence pending | Spear, Sword, Tool exist. Bounded artifact history only; no practical construction instructions. |
| Lacquerware | Regional module | Bronze/Iron Age hypothesis; evidence pending | Resin, Pigment and Textile proposals do not establish lacquer chemistry or traditions. Research before assigning recipes. |
| Silk Weaving | Regional module | Bronze Age hypothesis; evidence pending | Fibre, Loom and Textile exist. First extend their regional evidence; do not duplicate Textile without a meaningful bounded chain. |
| Wootz Steel | Regional module | Iron Age/Age V hypothesis; evidence pending | Steel, Iron and Forge exist. Distinguish the actual process/material from legends or a generic sword upgrade. |
| Paper | Regional module | Age V comparison hypothesis; evidence pending | Papyrus, Scroll and Manuscript exist. Paper is not papyrus, but source dates, process intermediates and scope require review. |
| Stepwell | Regional module | Era placement unresolved; defer if evidence falls outside the five-age scope | Well-like water access is not Aqueduct or Public Bath. Do not force later evidence into antiquity. |
| Wood | Research-only | Reuse Tree and Timber | Biological growth and worked wood already have separate IDs/histories. No duplicate generic resource. |
| Flint | Research-only | Extend Rock/Stone Tool evidence | Already covered as a geological/tool material under Rock; no node accepted merely to rename a rock example. |
| Obsidian | Research-only | Extend Rock evidence | Existing volcanic-glass context is not evidence that heating an ordinary rock makes obsidian. |
| Generic Mortar | Research-only | Reuse Lime Mortar | Avoid duplicating an already explicit binder; additional binder traditions need separately verified definitions. |
| Mathematics | Research-only | Extend Geometry and mathematical histories | Do not repackage existing Geometry, Mathematical Astronomy and Knowledge as a generic new discovery. |
| Geography | Research-only | Extend Map/Cartography | Representation and geographic inquiry already have multiple discoveries; no duplicate broad label. |
| Lock | Research-only, deferred | Original archaeological account still unverified | Earlier research already deferred this. Reconstructions and search summaries do not satisfy the evidence gate. |

## Baseline inventory used for the overlap audit

These are the **original 194 IDs**, including misleading legacy aliases. Current definitions and every incoming/outgoing pair remain in [elements.json](../src/game/content/elements.json) and [recipes.json](../src/game/content/recipes.json). Automated tests fingerprint the complete 194/232 baseline; additions are appended.

- **Origins (43):** `ember`, `tide`, `stone`, `gale`, `heat`, `sea`, `land`, `wind`, `steam`, `dust`, `spark`, `clay`, `metal`, `storm`, `soil`, `bloom`, `primordial-soup`, `life`, `plant`, `reed`, `ash`, `forest`, `seed`, `tree`, `charcoal`, `mud`, `mist`, `cloud`, `rain`, `swamp`, `sand`, `wildfire`, `lightning`, `rock`, `animal`, `river`, `lake`, `algae`, `fish`, `salt`, `limestone`, `bird`, `volcanic-ash`.
- **Stone Age (46):** `brick`, `beacon`, `compass`, `wall`, `house`, `village`, `quarry`, `masonry`, `field`, `crop`, `food`, `bread`, `magnet`, `flour`, `dough`, `human`, `stone-tool`, `spear`, `meat`, `cooked-meat`, `hide`, `hearth`, `camp`, `shelter`, `pigment`, `art`, `basket`, `fibre`, `cordage`, `clothing`, `pottery`, `hunt`, `home`, `storage`, `meal`, `cave-painting`, `bone`, `needle`, `leather`, `tent`, `flute`, `net`, `fossil`, `quicklime`, `slaked-lime`, `lime-mortar`.
- **Bronze Age (42):** `tool`, `city`, `nation`, `papyrus`, `map`, `glass`, `copper-ore`, `copper`, `tin`, `bronze`, `bronze-tool`, `wheel`, `cart`, `trade`, `writing`, `scribe`, `town`, `forge`, `anvil`, `mold`, `plow`, `sword`, `chariot`, `ink`, `quill`, `scroll`, `archive`, `seal`, `law`, `boat`, `sail`, `anchor`, `harbor`, `merchant`, `voyage`, `irrigation`, `canal`, `granary`, `loom`, `textile`, `balance`, `amphora`.
- **Iron Age (23):** `lens`, `iron-ore`, `iron`, `bellows`, `bloomery`, `iron-tool`, `sickle`, `road`, `market`, `steel`, `coin`, `aqueduct`, `empire`, `manuscript`, `blacksmith`, `nail`, `saw`, `timber`, `bridge`, `wagon`, `rotary-quern`, `lathe`, `alphabet`.
- **Classical Antiquity (40):** `agora`, `academy`, `lyceum`, `observation`, `natural-philosophy`, `fossil-collection`, `fossil-inquiry`, `knowledge`, `natural-inquiry`, `forum`, `senate`, `republic`, `rhetoric`, `arch`, `stoa`, `amphitheater`, `coinage`, `mint`, `maritime-trade`, `library`, `geometry`, `bird-inquiry`, `citizenship`, `mathematical-astronomy`, `clinical-observation`, `logic`, `natural-classification`, `concrete`, `road-network`, `public-bath`, `merchant-network`, `customs-duty`, `historical-writing`, `cartography`, `commentary`, `imperial-bureaucracy`, `provincial-government`, `diplomatic-mission`, `caravan-route`, `cultural-exchange`.

Alias checks include Fire=`ember`, Water=`tide`, Earth=`stone` (not Rock), Air=`gale`, Mud Brick=`brick`, Wayfinding=`compass`, Lodestone=`magnet`, Polity=`nation`, Metal Tool=`tool`, Ard=`plow`, and Writing Reed=`quill`.

## Paired element and research milestones

### Release baseline: 225 discoveries and 291 formulas

The A-H materials, watercraft, production and water-power expansion closes at **225 elements / 291 recipes / 147 full histories / 176 chronology entries**, with **161 verified sources and one pending**. All five age definitions, landmark IDs, discovery goals, unlocks and grants remain unchanged. The complete original **215 definitions / 270 formulas** and intervening **219/277** and **225/288** snapshots remain fingerprinted. The [release regression](../src/game/content/optionalConnections.test.ts) also pins the full **225/291** catalog, so future work must append rather than silently replace definitions or formulas.

The [compatibility and performance evidence](educational-qa.md#gameplay-compatibility-and-release-baseline-gh) covers old completed v7 campaigns, all ten acquisition paths, all 21 added formulas in both orders, reversed-pair rejection, gated reachability and old-only completion. New content remains optional for existing objectives; the previous graph alone still satisfies all five ages. No save-version change or automatic reading/reward credit is introduced.

| Catalog target | Added in batch | Cumulative new histories | Cumulative old-gap histories | Minimum full histories | Original gaps remaining | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 194 baseline | 0 | 0 | 0 | 85 / 194 | 109 | Baseline |
| 200 | 6 | 6 | 6 | 97 / 200 | 103 | Implemented; verification recorded in educational QA |
| 210 threshold | 10 planned | 16 | 16 | 117 / 210 | 93 | Surpassed by the 215 batch, not a separately shipped snapshot |
| 215 | 15 after 200 | 21 | 21 | 127 / 215 | 88 | Implemented craft, records and engineering batch |
| 219 | 4 after 215 | 25 | 25 | 135 / 219 | 84 | Implemented Stone Age materials and watercraft batch |
| 225 | 6 after 219 | 31 | 31 | 147 / 225 | 78 | Released baseline with 291 recipes; G/H compatibility evidence recorded |
| 235 | 10 after 225 | 41 | 41 | 167 / 235 | 68 | Implemented everyday crafts and practical engineering; 311 recipes |
| 250 | 15 after 235 | 56 | 56 | 197 / 250 | 53 | Evidence/chain gate pending |

The **235-discovery / 167-history checkpoint is implemented** in the [everyday-craft batch](#milestone-235-everyday-crafts-and-practical-engineering). The remaining step to 250 would add at most fifteen discoveries and at least thirty further histories, reducing original gaps to at most 53. Nineteen active candidates and four displaced proposals remain deferred, so not every queued item can fit; reject or replace redundancy after evidence and chain review. Re-run compatibility and graph benchmarks at each accepted batch; recipe and source counts are not padding targets.

Every batch requires 100% research coverage for additions, one previously missing full history per added element, unique IDs/pairs, no unused nodes, reviewed recipe semantics, legacy-only completion paths and save compatibility. Source counts and dated-entry counts are not quality quotas; appropriate undated records are preferable to false precision. Independent scholarly review and human learning outcomes remain separate.

## Milestone 235: everyday crafts and practical engineering

This batch reaches **235 discoveries / 311 recipes / 167 histories**, with **184 chronology entries**, **167 verified sources plus one pending**, and **68 original history gaps**. Every earlier definition, pair, review and history remains intact. All ten discoveries have onward uses; Salt, Needle and Textile gain their first outgoing recipes. The graph has **193 ingredients, 42 terminals and zero unused nodes**.

| Discovery | Gameplay age / distinctness decision | Inspected evidence and limits |
| --- | --- | --- |
| Sewing | Stone Age; operation distinct from Needle, Hide and finished Clothing | [La Prele study](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0313610), abstract and introduction: identified needle materials, with garment/pelt interpretation rather than complete surviving outfits. |
| Salted Meat | Bronze Age; preserved provisions distinct from Meat, Food and Storage | [Hallstatt study](https://pmc.ncbi.nlm.nih.gov/articles/PMC5899323/), abstract, introduction and sampled assemblage: Late Bronze Age pork processing and interpreted log curing basins. The genetic pilot is not a curing procedure or proof of first preservation. |
| Loom Weight | Iron Age; tensioning equipment, not Loom or Spindle | [Alexandria museum](https://antiquities.bibalex.org/Collection/Detail.aspx?collection=743&a=1226&lang=en): Ptolemaic terracotta examples, 323-31 BCE. Iron Age has variable regional ends and overlaps the Classical page; this is not Bronze Age evidence or an invention date. Egyptian ground/two-beam looms remain distinct. |
| Sailcloth | Bronze Age; prepared textile rather than assembled Sail | [UCL textile uses](https://www.ucl.ac.uk/museums-static/digitalegypt/textil/other.html), opening: sails among Egyptian textile uses. Dated bags and ropes elsewhere on the page do not date a complete sail. |
| Wick | Bronze Age; lighting component distinct from generic Cordage | [Milwaukee lamp overview](https://www.mpm.edu/research-collections/anthropology/anthropology-collections-research/mediterranean-oil-lamps/description-and-history-oil-lamps), definition/history: wick, reservoir, fuel and air. No universal fibre species or first wick date is claimed. |
| Lamp | Bronze Age; clay lighting device, not Hearth or Beacon | Same museum overview: earlier stone/fat lamps, Bronze Age clay examples and later forms. Fuel and suitable preparation remain omitted; not every pot is a lamp. |
| Lever | Iron Age; explicit load-moving principle distinct from generic Tool | [Vitruvius X.2-3](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/10*.html), iron lever/fulcrum and axle handles. Timber/Rock is an abstraction, not an excavated prototype. The late textual attestation does not establish an Iron Age invention. |
| Winch | Classical Antiquity; supported winding axle, not Pulley or Wheel | Same text X.2.2-4: rope, axle, levers and lifting blocks. No complete excavated harbor machine or sole inventor is established; Anchor/Harbor is symbolic. |
| Sundial | Classical Antiquity; instrument distinct from Observation or Mathematical Astronomy | [Vitruvius IX.7.7-8.1](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/9*.html): local diagrams, seasonal daylight divisions and named dial types. Attribution traditions are not independently verified inventorship. |
| Dome | Classical Antiquity; roof form distinct from other Vaults | [Roman architecture overview](https://www.worldhistory.org/Roman_Architecture/), architectural orders/materials: domed bath spaces including the Pompeian cold room. Broad priority claims are not adopted; not all domes use concrete or baths domes. |

The [twenty-formula table](optional-content.md#everyday-crafts-and-practical-engineering) includes seven simplified processes and thirteen symbolic associations. Every pair was absent from the previous 291, including reversed forms. Older clothing, textile, sail, home, quarry, harbor, knowledge and bath routes remain independent. Later inputs do not redetermine the invention date or original age of their result. Origins gains no historical craft node; its underused Salt instead feeds the later preservation branch.

The ten paired original-gap histories are **Needle, Hide, Clothing, Meat, Food, Storage, Sail, Boat, Trade and Merchant**. Their histories bound the selected evidence rather than claiming universal origins. Egyptian containers, Hallstatt basins, Paleolithic needles and Roman trade belong to separate contexts. Unsupported dates and independent-development assertions remain empty.

The 235/167 checkpoint is implemented. Further progress toward **250/197** requires at most fifteen additional nodes and at least thirty histories, with the same evidence and compatibility gates. This is not preparation or approval for another age. New regression coverage is in [everydayCrafts.test.ts](../src/game/content/everydayCrafts.test.ts); all prior snapshots remain protected.

## Validation and regression gates

[Graph validation](../src/game/engine/validateContent.ts) remains the build-time gate. New synthetic tests cover normalized name collisions, repeated era references, future grants/landmarks, self-pairs, reversed collisions, missing inputs/results/references, legal alternate routes, seeded versus unseeded cycles, grant-dependent deadlocks, starters and exact goal boundaries.

[Foundation regressions](../src/game/content/foundations.test.ts) retain the exact 200/243/97 snapshot. [Craft-expansion regressions](../src/game/content/craftExpansion.test.ts) and [Stone Age regressions](../src/game/content/stoneAgeMaterials.test.ts) preserve the 215/270/127 and 219/277/135 milestones as historical slices. [Production and water-power regressions](../src/game/content/productionWaterpower.test.ts) preserve the 225/288/147 milestone, all eleven pairs, full 219/277 preservation fingerprints, assigned-age reachability, optionality and research limits. Persistence, store and Atlas tests cover old v7 data, new formula IDs, result-age gating and discovered-only free reading. Existing 194-element/232-recipe fingerprints remain unchanged rather than being regenerated. Existing legitimate terminal nodes remain allowed.

[Additional-connection regressions](../src/game/content/optionalConnections.test.ts) pin all 225 definitions and the full 288-recipe prefix, check the current 291-recipe totals, six dispositions, unique symmetric pairs, older independent routes, all ten approved histories and the new abstract's evidence limits. Store tests check the new Voyage result gate and all three new formulas across v7 reloads.

Run focused graph/content/research tests before large additions, then persistence/store, Atlas/Guide/application and challenge regressions. Each release requires typecheck, lint, the complete test suite and the production build. Check narrow/desktop rendering and chunk warnings. Automated checks cannot certify historical truth, live source accessibility, human comprehension or independent peer review.
