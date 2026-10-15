# Catalog plan: production foundations toward 250

[Project overview](../README.md) | [Research standards](research.md#authoring-and-validation) | [Recipe review](recipe-review.md)

## Scope and acceptance rules

Retain the original **194 elements and 232 recipes**, including existing regional Age V discoveries. The target is **250 core elements within the same five gameplay ages**. Newly proposed regional modules are separate editorial backlogs, not a runtime module system or part of the additional 56.

The current milestone is implemented: **215 elements, 270 recipes, 127 full histories, 160 chronology entries, 140 verified sources and one pending source**. The first batch added six discoveries and six backlog histories; the second adds fifteen discoveries and fifteen backlog histories. **88 original elements** still lack full records.

Core means selected for the main catalog, not universal invention or adoption. Regional module means a separately bounded comparative proposal. Research-only means history or evidence without a new gameplay node. A **core candidate** below is not accepted content until it passes all gates.

For every candidate:

1. Compare its definition, display name, stable ID, aliases and purpose against all 194 baseline elements, not just adjacent eras. Record the closest existing IDs and reuse/merge/defer/add decision.
2. Separate target gameplay age from dated evidence, adoption and natural formation. Require passage-specific regional evidence; leave unsupported fields empty rather than inventing a first.
3. Distinguish an excavation, surviving artifact, depiction, textual assertion and modern interpretation. Disclose abstract-only, summary and preprint access. Resemblance alone does not prove diffusion or independent invention.
4. Identify meaningful inputs, intermediate operations and downstream uses. Check every proposed unordered pair against all 232 baseline pairs and the growing catalog, including reversed pairs and self-pairs.
5. Add a full Atlas history and an individual review for every shipped discovery/formula. Existing pending sources cannot support claims.
6. Preserve all baseline IDs, definitions, recipes, age gates/grants/goals/landmarks, collection and challenge definitions, rewards and version 7 saves. Reading remains optional, free and discovered-only.

### Audit coverage and limitations

The baseline inventory below includes every existing ID. Each candidate's nearest semantic overlap is recorded in the tables, not inferred only from spelling. The validator checks exact IDs, normalized duplicate names and pair conflicts; semantic distinctness remains an editorial decision.

The **21 implemented proposals** have passage-reviewed evidence, individually checked pairs and full histories. Of the original 50 later candidates, nine are now accepted and six slots are replaced by the bounded alternatives described below. The remaining **35 active candidates** are still blocked on chronology, regional evidence and recipe design. Their target ages are hypotheses, not historical assertions. This is a research queue, not certification of 56 historical discoveries; replace rather than pad candidates that fail.

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

The current graph is **168 ingredients, 47 terminal discoveries and zero unused nodes**. Lathe gains an outgoing use; saves recompute status rather than storing a permanent terminal flag. Regression coverage fingerprints the entire previous 200/243 catalog, validates both full and prior graphs, checks all 27 pairs in both orders, verifies same-age reachability and cited histories, and round-trips discoveries/formulas/reading in v7.

### Replacements and rejected evidence

Six original slots are replaced, not silently counted in addition to the 56-slot target: generic Chisel -> Iron Chisel; Drill -> Fishhook; Mallet -> Fishing Weir; Sailcloth -> Smelting Furnace; Loom Weight -> Sealed Tablet; Lost-Wax Casting -> Gouge. Displaced proposals remain documented below as deferred research/design candidates; none is certified or shipped.

A Museum Wales [file record](https://museum.wales/collections/online/object/50a1c79a-a981-3a8e-bf76-5ba889a8e1d2/Iron-Age--Roman-iron-file/) has an ambiguous title but explicitly dates the object to **260-355 CE**. It was rejected as support for an Iron Age file. Blocked Met/British Museum pages and search snippets were not promoted to verified receipts; the Louvre's descriptive HTML and other directly read institutional sources supplied the accepted evidence.

## Original later-candidate screen

The tables below preserve the original queue. Nine IDs (`axe`, `adze`, `wedge`, `weight-standard`, `clay-tablet`, `wax-tablet`, `pulley`, `water-screw`, `vault`) are now accepted above; six slots are replaced as listed above. For all remaining rows, **core candidate / evidence blocked** still applies. Their ages are hypotheses and chain roles are design objectives, not authored pairs or verified historical dependencies.

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

The original screen gave **56 named core slots**. With the six explicit replacements above, 21 slots are shipped and 35 remain active but blocked. Retained displaced rows are not extra accepted slots or a promise that all candidates will qualify.

## Regional-module and research-only dispositions

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

| Catalog target | Added in batch | Cumulative new histories | Cumulative old-gap histories | Minimum full histories | Original gaps remaining | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 194 baseline | 0 | 0 | 0 | 85 / 194 | 109 | Baseline |
| 200 | 6 | 6 | 6 | 97 / 200 | 103 | Implemented; verification recorded in educational QA |
| 210 threshold | 10 planned | 16 | 16 | 117 / 210 | 93 | Surpassed by the 215 batch, not a separately shipped snapshot |
| 215 | 15 after 200 | 21 | 21 | 127 / 215 | 88 | Implemented craft, records and engineering batch |
| 225 | 10 after 215 | 31 | 31 | 147 / 225 | 78 | Evidence/chain gate pending |
| 250 | 25 | 56 | 56 | 197 / 250 | 53 | Evidence/chain gate pending |

Every batch requires 100% research coverage for additions, one previously missing full history per added element, unique IDs/pairs, no unused nodes, reviewed recipe semantics, legacy-only completion paths and save compatibility. Source counts and dated-entry counts are not quality quotas; appropriate undated records are preferable to false precision. Independent scholarly review and human learning outcomes remain separate.

## Validation and regression gates

[Graph validation](../src/game/engine/validateContent.ts) remains the build-time gate. New synthetic tests cover normalized name collisions, repeated era references, future grants/landmarks, self-pairs, reversed collisions, missing inputs/results/references, legal alternate routes, seeded versus unseeded cycles, grant-dependent deadlocks, starters and exact goal boundaries.

[Foundation regressions](../src/game/content/foundations.test.ts) retain the exact 200/243/97 snapshot. [Craft-expansion regressions](../src/game/content/craftExpansion.test.ts) check the current 215/270/127 milestone, all new routes, historical distinctions and the complete preceding catalog fingerprint. Existing 194-element/232-recipe fingerprints remain unchanged rather than being regenerated. Existing legitimate terminal nodes remain allowed.

Run focused graph/content/research tests before large additions, then persistence/store, Atlas/Guide/application and challenge regressions. Each release requires typecheck, lint, the complete test suite and the production build. Check narrow/desktop rendering and chunk warnings. Automated checks cannot certify historical truth, live source accessibility, human comprehension or independent peer review.
