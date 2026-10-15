# Catalog plan: production foundations toward 250

[Project overview](../README.md) | [Research standards](research.md#authoring-and-validation) | [Recipe review](recipe-review.md)

## Scope and acceptance rules

Retain the original **194 elements and 232 recipes**, including existing regional Age V discoveries. The target is **250 core elements within the same five gameplay ages**. Newly proposed regional modules are separate editorial backlogs, not a runtime module system or part of the additional 56.

The first milestone is implemented: **200 elements, 243 recipes, 97 full histories, 149 chronology entries, 127 verified sources and one pending source**. Six new discoveries have histories; six previously unresearched elements now have histories too. **103 original elements** still lack full records.

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

The **six implemented proposals** have passage-reviewed evidence, individually checked pairs and useful downstream routes. The **50 later core candidates** have an overlap/chain screen but are explicitly **blocked on chronology and regional source verification**. Their target ages are hypotheses, not historical assertions. No recipes for those 50 are authored or collision-certified. This is a research queue, not certification of 56 historical discoveries; replace rather than pad candidates that fail.

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

The six backlog histories are **Flour, Fibre, Loom, Textile, Tin and Mud Brick**. Their coverage is bounded: Egyptian flax is not every fibre; woven linen is not every textile; Tin deliberately has no unsupported invention date or ancient provenance. The actual graph has **151 ingredients, 49 terminal elements and zero unused nodes**. Legitimate terminal discoveries elsewhere do not require artificial outgoing recipes.

## Later core candidates: screened, not accepted

Every row is **core candidate / evidence blocked**. The proposed age is a gameplay hypothesis requiring original regional passages before acceptance. The chain column is a design objective, **not an authored pair or verified historical dependency**. For each row, dates, regions, receipts, pair selection and collision status remain unverified; no claim of readiness is made.

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

This gives **56 named core slots including the six shipped discoveries**, not a promise that all 50 screened candidates will qualify. A failed node is replaced with an individually audited candidate, with its rejected row retained.

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
| 210 | 10 | 16 | 16 | 117 / 210 | 93 | Evidence/chain gate pending |
| 225 | 15 | 31 | 31 | 147 / 225 | 78 | Evidence/chain gate pending |
| 250 | 25 | 56 | 56 | 197 / 250 | 53 | Evidence/chain gate pending |

Every batch requires 100% research coverage for additions, one previously missing full history per added element, unique IDs/pairs, no unused nodes, reviewed recipe semantics, legacy-only completion paths and save compatibility. Source counts and dated-entry counts are not quality quotas; appropriate undated records are preferable to false precision. Independent scholarly review and human learning outcomes remain separate.

## Validation and regression gates

[Graph validation](../src/game/engine/validateContent.ts) remains the build-time gate. New synthetic tests cover normalized name collisions, repeated era references, future grants/landmarks, self-pairs, reversed collisions, missing inputs/results/references, legal alternate routes, seeded versus unseeded cycles, grant-dependent deadlocks, starters and exact goal boundaries.

[Foundation regressions](../src/game/content/foundations.test.ts) check the exact 200/243/97 milestone, each formula and source-backed review, spindle-free early Yarn, legacy-only completion, old route preservation, new outgoing-use reactivation and evidence limits. Existing 194-element/232-recipe fingerprints remain unchanged rather than being regenerated. Existing legitimate terminal nodes remain allowed.

Run focused graph/content/research tests before large additions, then persistence/store, Atlas/Guide/application and challenge regressions. Each release requires typecheck, lint, the complete test suite and the production build. Check narrow/desktop rendering and chunk warnings. Automated checks cannot certify historical truth, live source accessibility, human comprehension or independent peer review.
