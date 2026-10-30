# Educational quality assurance

[Back to the project overview](../README.md)

Latest regional/release review: **2026-10-21**. Earlier dated sections below
remain historical core-release snapshots.

## Status and scope

### Base-game-first rollback

The protected base remains **225 elements, 291 recipes, five ages, 147 histories and 161 verified sources plus one pending lead**. The DLC registry, Achaemenid pack, activation UI and photographs have been removed. The 78-entry research backlog and historical review limits are unchanged.

Core catalog tests fingerprint the complete gameplay definitions, research and recipe reviews. Fresh legacy and archive campaigns are checked for all core discoveries, formulas and age objectives. Compatibility regressions cover previously enabled, disabled and unavailable archives, inactive record preservation, import/export/reset, conflict and storage protection, and base-only rendered UI.

The [Phase 11 audit](phase-11-integration.md) is a superseded historical record of the former pilot. Its activation test counts and bundle measurements are not claims about the current rollback. Software tests remain distinct from independent historical peer review, physical-device or screen-reader certification and learning-outcome evaluation. Earlier dated base-release results below are historical snapshots.

Rollback verification: `npm run typecheck`, `npm run lint`, `npm run build` and `npm test -- --reporter=dot` pass, with **1,487 tests across 34 files**. Exact semantic hashes retain the base elements, recipes, ages, collections, research and recipe reviews. All **225 local documentation links/anchors** resolve. The build retains **179 crafting ingredients, 46 terminal elements and zero unused nodes** and contains no playable DLC identifiers, activation controls or DLC assets. A local production-preview smoke check serves the application document and entry scripts with HTTP 200; it is not a physical-device or visual-browser certification.

### Gameplay compatibility and release baseline (G/H)

The expansion baseline is **225 elements, 291 recipes, 147 histories, 176 chronology entries, 161 verified sources plus one pending**. No content or source is newly approved by this release pass. The rejected Adhesive/Stone Tool -> Spear collision remains rejected; all accepted/deferred/rejected dispositions and evidence-access limits remain in the [catalog plan](catalog-plan.md#additional-recipe-connections-and-research-sign-off). The pending source and 25 deferred candidates remain excluded from supporting released claims. **78 original history gaps**, independent historical peer review, physical-device/screen-reader checks and learning-outcome evaluation remain outstanding.

| Compatibility requirement | Release evidence |
| --- | --- |
| Five ages, landmarks, discovery goals, grants and unlocks unchanged; no new mandatory content | [Stone Age](../src/game/content/stoneAgeMaterials.test.ts) and [production](../src/game/content/productionWaterpower.test.ts) tests fingerprint full era definitions and the complete 215/270 and 219/277 content; old-only validation and objective checks pass. |
| Valid paths, order independence, no duplicate pairs or blocking cycles | [Graph validation](../src/game/engine/validateContent.test.ts) rejects unseeded cycles, unreachable content, grant/gate deadlocks and reversed duplicates. [Connection regressions](../src/game/content/optionalConnections.test.ts) check all 21 expansion formulas in both orders, reject an injected reversed duplicate of each, and pin the new full 225/291 baseline. |
| Old performed formulas and v7 progress survive; old campaigns can discover all additions | [Store regressions](../src/game/state/useGameStore.test.ts) load a completed 215/270 v7 campaign without writes, acquire all ten discoveries from available inputs, record the three newest alternatives as known results, reload, and compare exact old/new formula IDs, preferences, records and reward state. [Persistence tests](../src/game/state/persistence.test.ts) retain older-version loading and full v7 round trips. |
| Favorites, Recently Used, Hide Mastered and Recorded Formulas | [Shelf tests](../src/features/codex/Codex.test.tsx) cover all ten new ingredients in their age/category/starred filters and recent shortcuts. Paddle, Crucible and Plumb Line remain available until their added use is performed, then hide without losing favorites or recent access. [Guide tests](../src/features/journal/Journal.test.tsx) unlock each new alternate's note separately, retain its previous formula and persist both. Recently Used remains session-local rather than a new save field. |
| Optional collections and all existing labs remain usable | Existing content, engine, persistence, runner and application suites cover collection memberships/rewards, Rainmaker and all eleven Learning Labs, including known solutions, age restrictions, isolated state, explicit saves and one-time capped rewards. No challenge or collection definition changes in this release pass. |
| Research quality and provenance | Source schemas reject pending/dangling references; all approved additions have complete cited histories and every formula has an individual review. The Iberian abstract remains abstract-only; interpretations, missing numerical dates and regional adoption are not promoted to universal invention claims. |

Release checks on 17 October 2026: `npm run typecheck`, `npm run lint`, `npm test -- --reporter=dot` (**1,427 tests across 27 files**) and `npm run build` pass. All **182 local documentation links/anchors** resolve. The build retains **179 ingredients, 46 terminal elements and zero unused nodes**, with **287.68 kB application**, **37.54 kB CSS**, **303.96 kB vendor**, **443.35 kB original research** and **190.29 kB craft research** chunks. No production warning or threshold change; the benchmark runner's experimental-API notice is documented below. Earlier section totals are preserved historical snapshots, not the new release's test count.

#### Recipe-graph performance review

Run the existing Vitest benchmark runner with `npx --no-install vitest bench --run src\game\content\catalog.bench.ts`. [The benchmark](../src/game/content/catalog.bench.ts) compares actual 215/270 and 225/291 snapshots using the same production functions; it adds no package or timing assertions to unit tests. The repeat run on 17 October 2026 ran without concurrent tests/builds, with 100 ms warmup and 200 ms sampling per operation:

| Operation | 215/270 mean (ms) | 225/291 mean (ms) |
| --- | ---: | ---: |
| Construct pair index | 0.0991 | 0.1557 |
| Resolve one existing unordered pair | <0.001 | <0.001 |
| Validate references and gated reachability | 0.7260 | 0.6685 |
| Recompute Hide Mastered status | 0.0723 | 0.0837 |
| Select contextual hint | 0.1378 | 0.1185 |

These short machine-local observations are not speedup claims, SLAs, mobile/browser rendering measurements or proof of 250-node performance. Warmup, JIT, GC and shared-machine load affect results; the initial concurrent run was noisier. Pair lookup uses a prebuilt map (construction is paid at module initialization), shelf status rebuilds outgoing uses, hints scan candidates, and build-time validation performs fixed-point reachability. The measured size does not justify speculative caching or engine changes. Re-measure after subsequent batches; keep the existing 500 kB build warning threshold and review research chunks as histories grow. Vitest reports its benchmark API as experimental; that warning does not affect production behavior.

The [next gated milestone](catalog-plan.md#paired-element-and-research-milestones) is **235 discoveries / at least 167 histories**, paired with ten original-gap histories, before proceeding to 250/197. It approves no deferred candidate or unsupported claim.

### Additional recipe connections and research sign-off

The [E/F audit](catalog-plan.md#additional-recipe-connections-and-research-sign-off) evaluates all six requested formulas: three pairs are appended, two existing alternatives reused, and the Spear result rejected because its pair already produces Axe. All 225 element definitions and 288 preceding formulas remain unchanged. Current totals are **225 elements, 291 recipes, 147 histories, 176 chronology entries, 161 verified sources plus one pending**, with **78 original history gaps and 25 deferred candidates**. Recipe classifications are **16 material-process / 114 simplified-process / 161 symbolic**; **186 cited reviews / 105 uncited**.

All ten approved B-D discoveries retain full sourced histories. New Crucible evidence is bounded to the Cambridge repository's original Iberian smelting abstract and citation metadata, read on 17 October 2026; the full paper was not read. Separate crucibles and slag cakes, smelting and alloy melting, and proposed versus established ore identifications remain distinct. Existing source access limits remain intact. Paddle and Plumb Line entries explain the new later-unlocked travel and alignment associations without redating earlier technologies. No new history-count credit or unsupported candidate approval is claimed.

[Connection regressions](../src/game/content/optionalConnections.test.ts) fingerprint the entire 225/288 baseline, validate pairs in both orders, preserve older independent routes, and check every approved history, exact research totals, cited reviews and abstract limits. Store tests cover Bronze Age gating of the Stone Age paddle/canoe pair and persistence of all three new formulas in version 7. Software validation cannot establish independent historical peer review or human learning outcomes.

Software checks on 17 October 2026: typecheck, lint, all **1,408 tests across 27 files**, production build and **164 local documentation links/anchors** pass. The build confirms **179 ingredients, 46 terminal discoveries and zero unused nodes**, with no chunk-size warnings or threshold changes. Original and craft research chunks are **443.35 kB** and **190.29 kB**. The new source-count fixture was updated, and test access to verified-only passage locators now uses explicit type guards. These checks do not replace source inspection or independent historical review.

### Specialized production and water power: preserved 225/288 milestone

The following section records the preceding batch's snapshot, not current recipe/source totals.

The [accepted audit](catalog-plan.md#milestone-225-specialized-production-measurement-and-water-power) adds **six discoveries and eleven formulas**, preserving every preceding **219 definition and 277 recipe**, including the original 215/270 baseline. Totals are **225 elements, 288 recipes, 147 full histories, 176 chronology entries, 160 verified sources and one pending source**. There are **78 original history gaps**. Age totals are **43 / 57 / 54 / 26 / 45**; graph metrics are **179 ingredients, 46 terminal discoveries and zero unused nodes**.

Four Bronze Age discoveries cover pottery-forming equipment, a metallurgical vessel, heat-treatment knowledge and a vertical reference. Two Classical Antiquity discoveries distinguish hydraulic power conversion from a milling installation. Six original gaps also receive histories: Pottery, Wheel, Mold, Quarry, Crop and Bread. Thirteen new receipts disclose abstract-only, collection, selected-textbook and reconstruction limits. Early wheel assistance is not universal throwing; the El Argar non-refractory vessel is not every crucible; an annealing interpretation is not an exact treatment sequence; a preserved bob is not a complete cord assembly; Barbegal models are not intact machinery. Hand-built pottery and hand grinding remain older independent traditions.

[Production regressions](../src/game/content/productionWaterpower.test.ts) fingerprint the 219/277 baseline and unchanged eras/collections, test all eleven pairs in both orders, verify four Bronze Age and two Age V discoveries at their assigned gates, and check all twelve histories and exact coverage totals. Historical milestone fingerprints remain unchanged. Old-only content still supports every age challenge; neither water-power discovery enters Age V unlocks or completion. Persistence and store tests cover old v7 saves, every new formula, result-age locks, explicit reading and unchanged rewards. Atlas tests cover regional chronology, intentionally absent dates, discovered-only visibility and zero-Insight access.

Software checks on 16 October 2026: `npm run typecheck`, `npm run lint`, `npm test -- --reporter=dot` and `npm run build` pass. The full suite reports **1,367 tests across 25 files**. Production chunks are **283.76 kB application**, **303.96 kB vendor**, **443.35 kB original research**, **186.64 kB craft research**, and **36.20 kB CSS**. No chunk-size warning or threshold change. Catalog-dependent tests now expect 54 Bronze Age and 45 Age V entries, and the global discovery percentage reflects the expanded denominator; age-completion thresholds themselves are unchanged.

A production-preview browser smoke check opened **all six new histories at both 1440 px and 390 px** widths. Their expected dated or explicitly undated chronology remained visible, with **no horizontal document overflow**, zero Insight and no automatic reading markers. The temporary browser save was isolated from existing progress and restored after the check; the preview server was stopped. These software checks are not independent historical peer review, physical-device/screen-reader testing or human learning-outcome evaluation.

### Stone Age materials and watercraft: preserved 219-element milestone

The following section records the preceding batch's snapshot and validation, not the current totals.

The [accepted catalog audit](catalog-plan.md#milestone-219-stone-age-materials-and-watercraft) adds **four discoveries and seven formulas**, preserving every preceding 215 element definition and 270 recipe. Totals are **219 elements, 277 recipes, 135 histories, 168 chronology entries, 147 verified sources and one pending source**, with **84 original history gaps**. Age totals are **43 / 57 / 50 / 26 / 43**; graph metrics are **173 ingredients, 46 terminal discoveries and zero unused nodes**. Existing age requirements, collections, challenges, rewards and v7 save fields are unchanged.

Resin, Adhesive, Dugout Canoe and Paddle each have a complete sourced history. Stone Tool, Cordage, Net and Hearth fill four existing gaps. Seven new receipts distinguish Latium resin residues from Sibudu plant gum and experiments; Pesse museum object fields from acquisition dates; contextual dating from directly dated organic material; and preserved paddles from hypotheses about shape or decoration. The Antrea account is explicitly abstract-only. No numerical paddle chronology, universal glue formula, first-ever watercraft or independent-invention claim is introduced.

[Stone Age content regressions](../src/game/content/stoneAgeMaterials.test.ts) fingerprint all 215/270 preceding definitions and formulas and unchanged era/collection data, check all seven pairs in both orders, same-age reachability, no unused nodes, individual source-backed reviews, old-only completion and contextual hints. Previous 194/232, 200/243 and 215/270 milestones remain tested rather than replacing historical hashes. Persistence and store tests retain v7 progress and reward records, persist new formulas and gate Voyage to Bronze Age; Atlas checks discovered-only entries, empty paddle chronology and explicit free reading markers.

Software checks on 16 October 2026: `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass. The full suite reports **1,296 tests across 24 files**. Production chunks are **275.16 kB application**, **303.96 kB vendor**, **443.35 kB original research**, **131.83 kB craft research**, and **36.20 kB CSS**, with no chunk-size warning or threshold change. The two newly introduced test-fixture failures were corrected: the collection hash now uses the captured raw-JSON ordering, and the save fixture respects the existing three-Insight maximum.

A production-preview browser smoke check opened the new canoe history at **1440 px and 390 px** widths: the article and Pesse chronology remained visible with no horizontal document overflow. Paddle opened with the explicit no-sourced-dates message. These checks supplement the exhaustive parameterized Atlas rendering tests; they are not physical-device, screen-reader, independent historical or learning-outcome evaluation.

### Craft, records and engineering: preserved 215-element milestone

The following section records the preceding batch's snapshot and validation, not the current totals.

The [acceptance audit](catalog-plan.md#milestone-215-craft-records-and-engineering) adds **15 discoveries and 27 formulas**, preserving all previous 200 definitions and 243 routes. Totals are **215 elements, 270 recipes, 127 histories, 160 chronology entries, 140 verified sources and one pending source**. Every new discovery has a full history, and fifteen original gaps receive histories too; **88 original gaps** remain. The five ages contain **43 / 53 / 50 / 26 / 43** discoveries. Current graph metrics are **168 ingredients, 47 terminal discoveries and zero unused nodes**.

The batch covers smelting equipment and alternate copper/tin routes; distinct clay supports and sealed documents; regional weighing conventions; stone woodworking and hook/weir fishing; specialized iron implements and wax boards; and Classical lifting, water supply and spanning forms. All **27 reviews** have cited cautions: twenty symbolic and seven simplified processes. All 243 earlier reviews remain unchanged.

Thirteen new receipts distinguish original artifacts, inferred uses, modern replicas, summary-only comparisons and historical technical texts. Louvre AO 9386 attests a tablet inside an impressed envelope, not interchangeability between tablet, seal, impression and envelope. Later Assyrian document formats are not used to date Bronze Age practices. Harappan units are not universal standards. No numerical chronology is invented for the broken chisel, gouge or textual machine descriptions. The Jortveit report does not establish consumption of the reported tuna remains. Wax boards retain earlier precedents.

The file candidate was rejected because its collection description dates it to 260-355 CE despite an ambiguous Iron Age/Roman title. Blocked museum pages and search summaries were not promoted to verified evidence. The recordkeeping comparison does not claim all writing descends from one medium; the limited Irrigation history does not date earlier irrigation from a later Roman text. Human historical review, broader regional evidence and learning-outcome evaluation remain outstanding.

Regression coverage fingerprints the complete 200/243 baseline, validates full and prior graphs, checks every pair in both orders, verifies same-age reachability, optionality, source relationships, terminal reactivation, discovered-only free Atlas rendering and v7 save round trips. The experiment-history fixture now explicitly tests the unchanged 50-entry limit. Research is combined from a separately validated static appendix, preserving every complete article rather than raising the 500 kB warning threshold. This does not implement Phase 10 module manifests.

Final software checks on 15 October 2026: standalone content validation, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` all pass. The full suite reports **1,246 tests across 23 files**, including all 127 Atlas histories. Production chunks are **269.91 kB application**, **303.96 kB vendor**, **443.35 kB original research**, **96.00 kB craft research**, and **36.20 kB CSS**; no chunk-size warning is emitted. **101 local documentation links and heading targets** and CRLF-aware whitespace checks pass. No new browser smoke test or human historical/learning evaluation was performed for this batch.

### Production foundations: preserved first-milestone snapshot

The following section records the earlier 200-element snapshot; its counts and candidate status describe that pass, not the current catalog.

The [catalog plan](catalog-plan.md) retains the original 194 elements and 232 formulas and adds **six core discoveries and eleven optional formulas**: Grinding Stone, Spindle, Yarn, Kiln, Fired Brick and Tin Ore. Current totals are **200 elements, 243 recipes, 97 histories, 149 chronology entries, 127 verified sources and one pending source**. Six legacy gaps receive histories too: Flour, Fibre, Loom, Textile, Tin and Mud Brick. **103 original elements** still lack full records. Existing five-age definitions, gates, goals, grants, landmarks, collections, challenge definitions, rewards and save version remain unchanged.

All 194 baseline IDs are inventoried and all 56 core slots have semantic-overlap dispositions. Only the first six are accepted: the other 50 have target-age hypotheses and chain screens but remain blocked on original regional evidence and recipe design. Regional modules and research-only duplicates are tracked separately. Future milestones require at least 117 histories at 210 elements, 147 at 225 and 197 at 250, including complete histories for every addition and one old-gap history per new element.

#### Evidence and educational limits

Seven new passage-specific receipts cover Paleolithic grinding, Egyptian textile tools and kiln structure, two Harappa summaries, an explicitly classified chronology preprint and modern USGS tin resources. Summaries are not full chapter readings, and a preprint is not certified peer review. No failed museum fetch or irrelevant redirected page was accepted as evidence. Existing verified Penn and bread-study sources support only their reviewed material/process comparisons. Broad first-metal dates and old tin-provenance assertions are not adopted.

Grinding wild plants predates farming; residues and tool wear do not directly preserve a flour meal. Spindle-free Yarn is available in Stone Age gameplay, while Spindle's reviewed Egyptian workshop context does not establish its invention. Raw fibre, prepared strands and woven linen are different stages; this focused flax/linen history is not a complete survey of all fibres and textiles. Kiln designs coexisted, pottery does not universally require enclosed kilns, and mud-brick drying differs from firing a suitable clay unit. Tin Ore is a pre-existing resource; washing, reduction, melting and alloying are not interchangeable. Tin's absent dates and provenance are disclosed rather than fabricated.

This is a passage-level editorial and consistency review, **not independent historical peer review, a complete regional evidence survey, or measurement of human learning**. Later candidate rows explicitly preserve unresolved evidence and potential merge/defer decisions.

#### Software verification

Before additions, focused graph checks passed **202 tests across three files**. Synthetic cases expanded coverage of normalized duplicate names, repeated era references, future grants/landmarks, reusable self-pairs, reversed-pair conflicts, alternate routes, reachable/unseeded cycles, grant-dependent deadlocks, starter constraints and exact discovery-goal boundaries. Existing valid terminal nodes and earlier-age landmarks remain allowed.

The complete regression suite passed **1,121 tests across 22 files**. Typecheck, lint and production build passed. Legacy 194-element/232-recipe fingerprints are unchanged, rather than regenerated for the growing totals. Foundation regressions cover all eleven formulas and reviews, six additions plus six backlog histories, optional legacy-only progression, exhausted-ingredient reactivation, and exact milestone counts. Persistence covers a complete pre-foundation v7 campaign plus new discoveries/formulas/reading; existing v1-v6, rewards, preferences, hints, challenge minima and free/discovered-only Atlas regressions also pass.

The expanded suite exposed two stale test assumptions: an unbounded regional slice included later additions, and a date-rendering assertion assumed every researched history had chronology. Both now retain the intended legacy boundaries and explicitly test honest missing-date rendering for Tin.

An isolated headless browser opened all twelve added histories at **375px and 1280px**: **24 rendered-entry checks**, no horizontal document overflow, no recipe preparation controls, correct absent-date handling for Tin, and the unchanged missing-history state for Heat. Preview discoveries were set in memory only; browsing left stored progress unchanged, checked again after reload. These are automated DOM/layout checks, not screenshot-based visual review, assistive-technology certification or human comprehension testing.

The production graph is **151 crafting ingredients, 49 terminal elements and zero unused nodes**. The application and research chunks remain below the unchanged 500 kB warning threshold. Whitespace checks pass with CRLF-aware configuration, preserving the pre-existing working-tree line endings. The sections below are historical snapshots and retain their then-current counts.

### Phase 9I-9K final integration

The final pass is **research only**: **194 elements, 232 recipes, 40 Age V discoveries, 85 Atlas histories, 138 chronology entries, 120 verified sources and one pending lead**. Twelve full histories cover Salt, Bone, Tree, Timber, Soil, Mud, Sea, Steam, Mist, Cloud, Rain and Lightning. Water adds modern hydrology without erasing the Greek philosophical account. Clay/Amphora, Limestone/lime/concrete and Fossil/Bird/inquiry topic links remain discovered-only. No Flint, Obsidian, Wood or generic Mortar node was added.

The natural-resource audit separates geological/biological origins, archaeological use and modern interpretation. Hallstatt's mining traces do not establish the first salt industry; Sweet Track's dated construction does not invent timber; La Prele's needle materials do not directly preserve complete clothing. Steam/vapor, visible droplets, precipitation and electrical lightning receive explicit scientific cautions. Weather entries invent neither ancient archaeological evidence nor regional first observations. Remaining gaps are listed in the [current research audit](research.md#phase-9i-natural-resources-and-phenomena); 109 catalog elements still lack full histories.

#### Six-branch evidence and interpretation review

| Branch | Reviewed distinctions and limits |
| --- | --- |
| Civic | Agora and Forum remain distinct Greek/Roman settings; Senate, Republic and Citizenship do not imply universal democracy or equal participation. Institutional examples are regional, not global firsts. |
| Intellectual and natural inquiry | Ancient observation, textual reports and inference are distinguished from modern experimental science, evolutionary taxonomy and paleontology. Mesopotamian/Egyptian mathematics and Indian/Chinese traditions are not simply Greek derivatives. Herodotus's reported bones are not identified fossils; the griffin proposal remains disputed with abstract-only access disclosed. |
| Engineering | Pre-Roman waterworks and lime precedents remain explicit. Calcination, slaking and carbonation are different reactions; air-lime and hydraulic binders differ. Roman concrete is not Portland cement. Aqueduct gradients, maintenance, gravity and unequal distribution are covered; an arch supports rather than pumps water. |
| Commerce | Early electrum examples are not universal first-money claims. Indian and Chinese monetary traditions remain distinct; trade does not require coins. Customs evidence separates the Ephesian law from Palmyra's local tariff; amphora traditions predate Classical Antiquity. |
| Scholarship | Earlier writing, archives and scrolls underpin later library examples without making one medium universal. Copying, colophons and selective preservation differ from a single library-destruction story. Historiography distinguishes a surviving royal inscription from its truth; ancient maps are not modern surveys; Chinese commentary is not dependent on Greek formal logic. |
| Regional administration and exchange | Achaemenid satraps, Mauryan officers, Qin/Han offices and Roman proconsuls are not identical institutions. Ashoka's prescriptions and claims do not prove compliance or foreign reception; later examinations are not projected onto Qin/Han rule. Silk Roads have no single opening, and diplomacy is not necessary for all exchange. |

This is an editorial consistency and cited-passage review, **not independent historical peer review, original inscription inspection or a complete comparison of every regional tradition**. Publication dates are separated from archaeological dates, and uncertain purposes, dating and diffusion remain qualified. Selected-passages and abstract-only receipts remain limited to what was read. All new source content was directly consulted. The initial 121-URL probe returned 98 HTTP 200, 19 access/rate-limit blocks and four transport/time-out failures, with no 404/410. The focused follow-up recovered all four, confirming the cited passages: **102 successful checks, 19 access/rate-limit blocks, zero unresolved transport/time-out failures in the combined audit**. ASCSA required Node's system CA store rather than disabled TLS verification; the other three failures were transient. Bounded retry settings and the distinction between this follow-up and a full recheck are documented in the [source-access audit](research.md#phase-9i-natural-resources-and-phenomena). A blocked response is not recertified access or proof of an invalid citation; no failed search result was promoted to evidence.

The snapshots below record earlier stages and their then-current counts, not the final coverage above. Human learning, misconception, assistive-technology and independent scholarly-review observations remain pending; automated coverage must not be described as those outcomes.

#### Final software verification

All required commands passed: `npm run typecheck`, `npm run lint`, `npm test` (**1,052 tests across 20 files**) and `npm run build`. Targeted research, Atlas, persistence and catalog-fingerprint regressions also passed. Coverage includes every researched entry's discovered-only rendering, missing-history states, safe related links, chronology/source schemas, optional Age V completion, reachability/duplicate validation, versions 1-7 migration, complete v7 campaigns, recorded recipes, stars, Recently Used, shelf filters, landmark/challenge receipts and Rainmaker. New regressions cover the twelve records' scientific distinctions, honest empty weather evidence, construction/inquiry links and v7 reading without loss of formulas or preferences.

Browser checks opened all twelve new histories at **375px and 1280px**, searched by name and found no horizontal document overflow. Preview discoveries were injected into the live in-memory store only; the stored campaign snapshot was checked unchanged and the page reloaded afterward. These checks validate rendered behavior, not human comprehension or screen-reader certification.

The production graph is still **145 crafting ingredients, 49 terminal elements and zero unused nodes**. Chunks are **242.12 kB application, 401.57 kB research, 303.96 kB vendor and 36.20 kB CSS**, below the unchanged 500 kB chunk warning threshold. TypeScript, lint, edited-file diagnostics and whitespace checks are clean. Research growth changes neither catalog completion denominators nor the save schema. Unrelated pre-existing line-ending changes are excluded from the release commit.

### Completed optional landmark track and named challenges

The catalog remains **194 elements and 232 recipes**, with **73 Atlas histories** and unchanged age assignments. The Guide now separates four optional landmark objectives from core page completion: Agora (Trade, City, Agora), Library (Archive, City, Library), Aqueduct (Masonry, Aqueduct, Arch), and Mint (Coin, Forge, Mint). The Aqueduct audit confirmed its existing **Iron Age** assignment; it was not moved to Bronze Age or Age V. Arch supplies the Age V connection, not a universal structural prerequisite for real conduits.

All ten earlier collection definitions, eight earlier challenges including Rainmaker, five age definitions, 194 elements and 232 recipes have fingerprint regressions. The four additional collection IDs use existing one-time reward receipts. The separate Civic Foundations, Organization of Knowledge, Engineering the City and Economic Networks labs target Agora, Library, Aqueduct and Mint in **2, 3, 2 and 3** minimum attempts respectively. Breadth-first search verifies those minima against every permitted alternate recipe. There are now **14 collections and 11 learning labs**, plus unchanged Rainmaker. Existing sourced histories, recipe cautions and free theme references are reused; no new historical evidence or literal scientific recipe is asserted.

All four commands passed: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The suite passed **1,012 tests across 20 files**. Coverage includes full supporting-member completion, no pre-Age-V landmark completion, both old and new reward receipts, independent overlapping engineering rewards, capped wallets without banked overflow, repeated saves, v7 reloads, legacy migration coverage, isolated challenge experimentation, visible theme references, explicit result saves and unchanged core completion. Existing completed v7 campaigns receive no load-time reward; the next successful campaign combination can award new landmark receipts without replacing old achievements.

Browser checks at **375px** and **1280px** found no horizontal document overflow; all four landmark cards and four new challenge launch controls were present. The native optional-track disclosure collapsed and expanded with Enter while retaining keyboard focus. A synthetic completed campaign was injected only into transient browser memory, then reloaded back to the original saved progress. These checks supplement component tests, not an assistive-technology certification or human learning study.

The production graph remains **145 crafting ingredients, 49 terminal elements and zero unused nodes**. JavaScript chunks are **242.12 kB application**, **356.36 kB research** and **303.96 kB vendor**; CSS remains **36.20 kB**. The unchanged 500 kB warning threshold passes. Whitespace and edited-file diagnostics are clean.

### Completed optional regional administration and connections

The current catalog has **194 elements and 232 recipes**, including **40 Age V discoveries**. There are **73 full Atlas records**, 123 chronology entries, **110 verified sources and one pending lead**. Five approved optional routes add Imperial Bureaucracy (Empire + Scribe), Provincial Government (Imperial Bureaucracy + City), Diplomatic Mission (Polity + Rhetoric), Caravan Route (Merchant + Land), and Cultural Exchange (Diplomatic Mission + Knowledge). All previous 189 element definitions and 227 recipes remain unchanged; Merchant + Map still produces Voyage.

The histories distinguish Achaemenid satrapies and sealed travel-ration accounts, Mauryan officials and Ashoka's pillar prescriptions, Qin centralization and Han court scholarship, and Mediterranean political institutions. Royal messages are not proof of universal compliance or foreign conversion. Lumbini's pillar date does not settle Buddha chronology; the later Sui examination system is not projected onto Qin/Han officials. Silk Roads have no single worldwide opening date, and diplomacy is not a universal prerequisite for cultural exchange. Coercion and unequal encounters are not excluded.

Nine new URLs were successfully accessed on 14 October 2026. Receipts identify selected passages, geographically limited Persepolis evidence, UNESCO's pillar description, and the hosted English edict rendering's translation limits. The latter is not a university critical edition; original tablets, inscriptions and complete manuscript traditions were not directly inspected. Uncaptured reference bylines and publication dates remain unspecified, and sweeping or problematic unrelated claims in the reference articles are not adopted.

All four commands passed: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The suite passed **968 tests across 19 files**, covering both input orders, gated reachability and optional branch removal, complete pre-expansion fingerprints, chronology/source schema checks, discovered-only Atlas rendering, Age V category/starred/Recently Used filters and version 7 persistence of old/new formulas, favorites, reading and shelf preferences. Existing gates, landmarks, collections, challenge rewards, legacy saves and Rainmaker remain covered. Empire gains an outgoing use; Imperial Bureaucracy and Diplomatic Mission are graph-derived ingredients rather than terminal discoveries.

The production graph reports **145 crafting ingredients, 49 terminal elements and zero unused nodes**. JavaScript chunks are 236.88 kB application, 356.36 kB research and 303.96 kB vendor; CSS remains 36.20 kB. The unchanged 500 kB warning threshold passes. Human learning evaluation, historical peer review and assistive-technology observation remain pending.

### Optional scholarship expansion snapshot

At this snapshot the catalog had **189 elements and 227 recipes**, including **35 Age V discoveries**. There were **68 Atlas records**, 111 chronology entries, **101 verified sources and one pending lead**. Library and Rhetoric were already implemented and reused. Geometry and Map covered the audited mathematical/geographic foundations without duplicate Mathematics or Geography elements. The three approved additions were Historical Writing (Scribe + Knowledge), Cartography (Map + Geometry), and Commentary (Scroll + Logic), each with a full sourced history and symbolic recipe caution.

Earlier Bronze and Iron Age writing definitions, recipes, gates, landmarks, collections and learning challenges remain unchanged. Library's expanded use section covers copying, clay and papyrus formats, tablet colophons and selective preservation. The new histories distinguish Herodotus's textual narrative from Darius's surviving royal inscription and contested claims; ancient geographic representations from modern precision surveys; and Liu Hui's commentary from earlier Egyptian explanatory passages without implying dependence on Greek formal logic.

Source access was checked on 14 October 2026. Three new receipts cover the Herodotus and Behistun reference articles and a credited republication of the British Museum world-map caption. The museum's direct catalog was blocked; its republication is explicitly identified, no image was copied and the inferred purpose remains interpretive. Existing Ptolemy, Nine Chapters, NLM papyrus and library receipts are reused; Ptolemy's receipt now includes the verified Geography passage. This is selected-passage research, not firsthand inscription inspection or consultation of complete critical editions.

All four checks passed: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The suite passed **935 tests across 18 files**, including unordered recipe resolution, gated reachability and optional-branch removal, complete pre-expansion catalog fingerprints, schema and citation integrity, discovered-only Atlas rendering, starred/category/Recently Used filters and version 7 formula/favorite/reading persistence. Logic gains an outgoing use; a terminal-discovery Guide regression now exercises Commentary's history and recorded-origin preparation rather than incorrectly treating Logic as terminal.

The build reports **142 crafting ingredients, 47 terminal elements and zero unused nodes**. JavaScript chunks are 232.19 kB application, 325.45 kB research and 303.96 kB vendor, below the unchanged 500 kB warning threshold. Human learning, historical peer review and assistive-technology observations remain pending; automated tests do not replace them.

### Completed optional commerce expansion

The catalog now contains **186 elements and 224 recipes**, with **32 Age V discoveries** and **65 full Atlas records**, containing 105 chronology entries. The registry holds **98 verified sources and one pending lead**. Coinage, Mint, Maritime Trade and Amphora retain their earlier recipes and ages. Merchant + Road Network adds Merchant Network; Maritime Trade + Law adds Customs Duty. Both are optional symbolic associations, with individual cited cautions. The complete pre-expansion element and recipe definitions are protected by regression fingerprints.

Expanded histories distinguish gold-silver electrum and late seventh-century BCE Ephesian evidence from universal first-money claims. Indian punch-marked and Chinese cast traditions are compared without assuming simultaneous invention or a single diffusion route. Issuer valuation and motives remain interpretations. The Ephesian customs law includes inland stations; its final 62 CE publication is not taxation's invention. Palmyra's 137 CE municipal tariff is explicitly described as local taxation rather than caravan customs. Original inscriptions and complete scholarly editions were not consulted: the customs sources are a scholarly review and an institutional abstract, with access limits disclosed in the registry.

`npm run typecheck`, `npm run lint`, `npm test` and `npm run build` passed. The full suite passed **910 tests across 17 files**, including both input orders, gated reachability without Coin/Coinage/Mint, schema and citation checks, discovered-only Atlas rendering, Age V category/starred/Recently Used filters, recorded commerce formulas and version 7 persistence. Existing age gates, landmarks, collections, challenge rewards and Rainmaker remain covered. Road Network and Maritime Trade gain outgoing graph edges rather than manually changing terminal metadata.

Build validation reports **141 crafting ingredients, 45 terminal elements and zero unused nodes**. Production JavaScript chunks are 229.16 kB application, 307.14 kB research and 303.96 kB vendor, below the unchanged 500 kB warning threshold. This automated verification does not establish learning outcomes or replace pending human accessibility and historical review.

### Completed four-discovery QA snapshot (before the fifth age)

At that review, the catalog contained **151 elements and 187 recipes across four pages**. Fossil, Bird, Amphora and Quicklime had sourced research entries and optional recipes; none changed the existing age unlocks, grants, landmarks, discovery goals, save version 7, or Rainmaker. Their historical notes distinguished evidence from interpretation: fossils predate later human encounters with them; birds are the surviving avian dinosaur lineage after non-avian dinosaur extinction around 66 million years ago; a Cypriot Bronze Age amphora predates Classical Antiquity without establishing a universal origin; and Natufian lime-plaster evidence supports reconstructed calcination around 12,000 years ago without proving a global first quicklime artifact or kiln design. The disputed Protoceratops–griffin hypothesis was not presented as fact.

In that snapshot, the four recipe reviews classified Fossil, Bird and Amphora as **symbolic associations**, and Quicklime as a **simplified process**. They explained why the pairs are not literal fossilization, evolution, vessel manufacture, or a full calcination method. The then-current review had **14 material-process, 92 simplified-process and 81 symbolic** classifications; **81 cautions cited background sources and 106 did not**. The registry contained **45 verified sources and one pending source**; source verification is claim- and passage-specific, not blanket endorsement.

At that stage, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed; the suite passed **596 tests across 14 files**. Coverage included the 151/187 catalog totals, duplicate-pair and gated-reachability checks, unchanged age and landmark requirements, Atlas research rendering, version 7 save preservation for discoveries/formulas/favorites, Rainmaker, filters, and Recently Used shortcuts. No fifth age or Classical Antiquity content was part of that snapshot. Human learning and screen-reader observations remain pending.

### Initial Classical Antiquity implementation snapshot

That implementation contained **158 elements and 194 recipes across five gameplay ages**. The first four pages retained their existing gates, grants, landmarks, and discovery goals. Classical Antiquity had no automatic grant; it unlocked after Iron, Iron Tool, Road, and Market, and set five regional landmarks with a six-discovery challenge goal. Its seven discoveries and recipes did not alter Rainmaker's Origins-only result rules. Version 7 saves retained discoveries, recorded formulas, starred elements, and progress without a version bump.

Historical research then covered **28 of 158 elements** and cited **53 verified sources plus one pending source**. The seven new entries distinguish Athenian examples from universal Mediterranean history, label flexible Greek period boundaries instead of assigning a single chapter-wide date range, and separate Mycenae's archaeological context, Herodotus' differing textual reports, and modern paleontological interpretation. The Protoceratops–griffin proposal is explicitly disputed; only the official 2024 abstract was accessible for this review. The Atlas shows research only for discovered elements. Human learning, misconception and screen-reader observations remain pending.

Final implementation validation passed: `npm run typecheck`, `npm run lint`, `npm test` (**637 tests across 14 files**), and `npm run build`. Automated coverage includes source and research validation, recipe reachability and duplicate pairs, the unchanged original progression contracts, version 7 save compatibility, Rainmaker, Atlas rendering, element filters, and Recently Used shortcuts. No commit was created.

### Optional Age V expansion

The current catalog contains **173 elements and 211 recipes**. Classical Antiquity remains the fifth age, with 22 elements and 24 routes. The expansion adds 15 discoveries and 17 symbolic recipes without changing any age gate, grant, landmark, challenge goal, or collection membership. Scroll, Coin, and Aqueduct retain their existing IDs, ages, and recipes; Agora and Natural Philosophy gain alternate routes. Observation + Knowledge unlocks Natural Inquiry, while existing Fossil Inquiry and new Bird Inquiry provide optional natural-history branches.

All 17 expansion formulas have explicit cautions. Five reuse passage-specific background sources; 12 explicitly disclaim sourced historical reconstruction. The overall review contains **14 material-process, 92 simplified-process, and 105 symbolic** classifications, with **93 source-backed cautions and 118 without attached sources**. The broad civic and architectural framing was checked against the opening discussions in World History Encyclopedia's [Roman Republic](https://www.worldhistory.org/Roman_Republic/) and [Roman Architecture](https://www.worldhistory.org/Roman_Architecture/), not treated as verification of every detail or an archaeological first. Additional institutional pages returned access errors and were not claimed as verified sources.

No new full Atlas research records are added by this expansion: coverage remains **28 entries and 53 verified sources plus one pending source**. All 15 new descriptions retain regional and earlier-precedent cautions where relevant. Ancient bird observation is separated from modern dinosaur classification; the disputed fossil-myth proposal is not promoted to fact. Human learning and screen-reader outcomes remain pending.

Expansion validation passed: `npm run typecheck`, `npm run lint`, `npm test` (**660 tests across 14 files**), and `npm run build`. Regressions pin the first 194 recipe pairs and results, resolve all 17 new routes in both ingredient orders, validate gated reachability and duplicate rejection, and prove the original 158-element catalog still completes every age and collection. Save tests preserve pre-expansion v7 discoveries, formulas, favorites, reading markers, and reward state, and round-trip new formulas without a version bump. UI tests cover fifth-position age navigation, expanded age/category/Starred filters, and Recently Used shortcuts. Rainmaker and existing Atlas regressions pass. No commit was created.

Phase 7 reviewed the pre-expansion four-age baseline: **144 elements, 178 recipes, ten historical entries, and 22 consulted sources plus one pending source**. Original supporting passages were revisited, including official collection APIs and legitimate article archives where the main page was inaccessible. Titles, credited authors/institutions, URLs and access limits remain in the [research registry](../src/game/content/research.json).

The ten entries contain **94 citation-bearing blocks** and **23 chronology entries**, including three undated entries. Blocks can contain several statements; this is not a count of individually proven claims. The review checked those statements against the accessed passages and examined descriptions for contradictory implications.

**This is not certification of every historical claim in the game.** The current 28 research entries cover 28 of 173 elements; 145 elements still lack research records. A background reference need not establish every clause, material or causal implication. Structural validation cannot establish historical truth. Completing the source coverage and real-player review below remains necessary before claiming comprehensive historical or educational validation.

**No human participants have been observed. Learning and misconception results are pending**, by agreement. Scripted tests are not player teach-back evidence.

## Historical findings and corrections

The Phase 7 counts and software observations below are retained as a baseline, not retroactively attributed to later additions. Separate implementation snapshots appear in the relevant review sections.

| Area | Evidence checked and resulting treatment |
| --- | --- |
| Wayfinding | Royal Museums Greenwich supports nonmagnetic Viking navigation and late-twelfth-century European compass introduction. Later ship examples do not date prehistoric navigation or establish a global compass invention. |
| Lens | British Museum Images identifies a Neo-Assyrian polished crystal, about 870-612 BCE, probably an inlay. Optical properties do not prove intentional magnification or fire-making. The short description now avoids implying documented ancient optical use. |
| Polity | Uruk context supports regional urban administration, not an inevitable progression from written law to cities to nations. Secondary encyclopedia context does not prove a global first city or uniform political control. |
| Metal | The Tel Tsaf article supports a copper awl in a context approximately 5100-4600 calibrated BCE. Its corrosion limits manufacturing reconstruction; intrusion and proposed northern origins are interpretations, not settled facts. Origins Metal remains fictional. Smelting and melting now have plain-language definitions. |
| Writing Reed | The Bibliotheca Alexandrina catalog supports a reed implement from Egypt with a broad period. The Met palette API establishes wood/pigment metadata, not brush design. Neither establishes the first stylus, brush, cut nib or this pen's construction. Short descriptions and documentation no longer assert those details. |
| Writing | The comparative study distinguishes several primary writing traditions and contested early signs. The short description no longer equates early accounting signs with recorded speech. The clay-tablet catalog does not identify its actual tool, now explicit in the relevant recipe caution. Chinese writing surfaces and divination are explained in ordinary language. |
| Road | Avalon Marshes supports Post Track construction in 3838 BCE and Sweet Track construction in spring 3806 BCE, not invention of roads. Tree-ring dating is now explained. |
| Market | Grain distribution and imported goods support exchange, not necessarily a formal marketplace. The short description and chronology guide no longer assert an unsupported early formal-market chronology. Coins and widespread ironworking are not universal prerequisites for exchange. |
| Ard | The Sion publisher-deposited abstract supports early fifth-millennium BCE plough marks and interpreted animal traction. Sixth-millennium introduction is a suggestion. Full-paper details and exact implement geometry are not verified; the recipe caution now reflects this limit. |
| Glass | The Met catalog supports the Malqata vessel's textual date, approximately 1386-1347 BCE; numeric API bounds differ and do not replace it. The Smithsonian Roman bowl supports a later technique and substantial restoration, not a universal Bronze Age method or invention date. Glassworking terms are explained. |
| Food, bread and flour | The PNAS study supports bread-like food made by hunter-gatherers from wild plants before agriculture. Descriptions no longer imply farming is necessary. Its citation was removed from the harvesting-blade caution because it does not establish that implement's history. |
| Bronze and papyrus | Penn metallurgy/tin articles support extraction, alloying and composition-dependent properties. Bronze's description no longer implies a single universally strengthening tin proportion. University of Michigan papyrus research supports joined sheets in rolls; Scroll no longer implies binding or an already written document. |

### Date review

The displayed age labels are unchanged:

- **Origins:** undated gameplay prologue, with fictional combinations inspired by documented Greek elemental philosophy. This wording clarifies the historical theory/gameplay distinction reviewed below.
- **Stone Age:** approximately 3.3 million years ago to approximately 3300 BCE. The opening uses Kenyan Lomekwi evidence; the closing is a conventional Near Eastern frame. This is deliberately not one continuous local chronology.
- **Bronze Age:** approximately 3300-1200 BCE, a regional Near Eastern frame rather than a worldwide invention/adoption schedule.
- **Iron Age:** from approximately 1200 BCE, with regional end dates varying. Britain's approximately 800 BCE-43 CE example is not the global boundary.

The Three-Age System arose within particular archaeological traditions, not a universal sequence for all societies. Thomsen's 1836 publication, Denmark's 1700-500 BCE Bronze Age and Britain's Iron Age were checked through the institutions linked in the [chronology guide](historical-interpretation.md#historical-references). Lomekwi's 3.3-million-year date was checked through the [original author-article abstract at Columbia](https://academiccommons.columbia.edu/doi/10.7916/D83X85SP), after the Nature page refused access.

The 23 historical-entry date labels were reviewed as dates of evidence, regional development or explicitly undated concepts, not exact invention dates. Key distinctions include proto-cuneiform around 3300-2900 BCE versus debated language notation; contested Abydos U-j tags around 3200 BCE versus later formalization; and late Shang evidence around 1250-1046 BCE rather than a worldwide writing date. Writing Reed has no narrowed invention date; Mesoamerica has no invented date. BCE, CE and "c." are now explained in the Atlas.

### Older interpretations and access limits

- Smithsonian's Stone Tools page still frames earliest toolmaking around 2.6 million years ago. Its hammerstone/core/flake discussion is useful; that global earliest date is not adopted after Lomekwi.
- Smithsonian's Hearths page distinguishes hearth evidence from tentative earlier cooking. It is not treated as an exact first-control or first-fire-making date.
- The 1977 Penn tin article contains obsolete fourth-millennium Thai bronze claims. They are not adopted. [Higham, Douka and Higham (2015), *A New Chronology for the Bronze Age of Northeastern Thailand and Its Implications for Southeast Asian Prehistory*](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0137542), contrasts approximately 2000 BCE and eleventh-century BCE models, supporting the latter with radiocarbon determinations. Its original abstract/introduction was checked for this report; this is not a declaration that all later debate is settled.
- The writing study was first published online in November 2024, with a January 2026 issue. Those publication dates are not ancient dates.
- Xianrendong pottery is supported through the original abstract: approximately 20,000-19,000 calendar years before present and forager contexts; proposed cooking use is not established.
- Sion and Xianrendong full papers remain unread; museum API metadata does not stand in for unread essays. The British Museum scribal palette remains pending and supports no accepted claim.
- The original Smithsonian and Bibliotheca HTML was inspected where markdown extraction omitted the text. Search summaries were leads, not evidence.

This targeted newer-literature check is not an exhaustive current literature review.

## Open evidence and representation issues

| Issue | Status / next action |
| --- | --- |
| 134 elements without historical entries | Open: prioritize independent, claim-specific research rather than promoting gameplay descriptions to verified history. |
| 106 uncited recipe cautions | Open: retain their visible limitation; add sources only after checking the exact supporting passage. |
| Compound background cautions | Open: the general Stone Tools source does not establish every cultivation or quarry assertion in `cultivated-land` and `opened-stone`. Obtain specific archaeological evidence before stronger claims. |
| Reed-tool and plough reconstruction | Narrowed: captions and abstracts do not identify actual tools or complete manufacturing sequences. Stronger reconstruction requires direct evidence/full-paper review. |
| Cultural coverage | Open: Egypt, Mesopotamia, the Levant and Europe dominate. China is represented in writing and pottery background; Mesoamerica is named through a synthesis without dated local evidence here. South Asia, sub-Saharan Africa, Oceania and much of the Americas lack substantive coverage. |
| Independent developments | Open: missing coverage is not evidence that a region lacked a technology. Add local archaeology and scholarship without inventing dates or origins for numerical balance. |
| Comprehension and misconceptions | Pending: source review identifies risks but cannot determine whether players understand the explanations or acquire misconceptions. |

No recipe pairs, results, ordering, age assignments, unlock gates, rewards or save version were changed. Historical corrections do not establish a single compulsory historical invention path.

## Technical QA

Automated checks exercise all ten rendered research records: their date labels, discovered-only related context, absence of recipe-formula instructions, and unchanged progression/storage at zero Insights. A fresh-store UI test discovers a researched element, finds its free history, retains a prepared worktable and resumes normal combining.

Existing tests also cover hidden-topic search, performed-only recipe disclosures, keyboard navigation, native citation links, optional reading, isolated labs, Rainmaker, save version 7 compatibility and actual gated reachability. These verify software behavior, not human learning or independent accessibility certification.

Validation completed on the review date:

- **450 tests passed across 13 files**, including eleven new rendered-history and fresh-player-flow cases.
- Production build and TypeScript checking passed; focused ESLint and editor diagnostics were clean.
- The recipe graph hash remained `2b61adfef961ea0ef755f72bdfe192766d3082184dd5cd59b0480badef2674a9`; the full suite includes gated reachability and persistence regressions.
- **38 local documentation links/anchors** resolved; the whitespace check passed.
- The discovered Metal entry displayed the date glossary and smelting definition in the browser. At **375px**, neither the page nor article overflowed horizontally; citation navigation gave the native bibliography target focus, and returning to Combine worked.
- The browser checks made no persistent save changes. The viewport was restored to **1440px**, where the page/article also fit. No shared campaign was reset, seeded or used for test combinations.

These are software/source-review observations, not human-playtest results or a comprehensive screen-reader audit.

## Iron Age expansion review

This subsequent batch adds **Rotary Quern, Lathe, and Alphabet**, five optional routes, and three complete historical entries. Current totals are **147 elements, 183 recipes, 13 historical entries, 29 chronology entries, and 26 consulted sources plus one pending source**. All 178 earlier recipe IDs, input pairs, results and ordering remain pinned by their original prefix hash. Gates, grants, landmarks, challenge goals, collections, labs, rewards and save version 7 are unchanged; catalog completion percentages include the new optional discoveries.

| Addition | Original evidence and limits |
| --- | --- |
| Rotary Quern | Northampton Museums' Hunsbury account supports British regional context, older saddle grinding, cereal processing and distant stone sources. Around 200 BCE is not a global invention or uniform adoption date. A proposed dowry interpretation and industrial-revolution rhetoric are not accepted as archaeological conclusions. |
| Lathe | The V&A's contextual essay supports a later depicted rope-driven turning example. Sitry's original 2022 journal abstract proposes earlier pivot identifications from shape and wear; the full study was not reviewed. The proposed parts remain hypothetical, and the museum's first-proven phrasing is not adopted as a worldwide conclusion. |
| Alphabet | Inspected Penn Museum sections support earlier precedents, later regional examples and literacy without alphabets. Early dating/origin interpretations remain contested. The displayed Beth Shemesh cast is not described as the original tablet; disputed third-millennium claims and one universal diffusion explanation are not accepted. |
| Lock | Deferred by explicit user choice: no appropriate original ancient archaeological account was verified. A reconstruction, a medieval key guide and unverified search claims were insufficient. No element, recipe, accepted source or historical entry was added. |

The five new recipe cautions carry background references, giving **77 referenced and 106 unreferenced cautions**. All three additions have historical records, so **134 discoveries still lack researched histories**. Regional representation gaps and earlier Phase 7 open questions remain; this batch is not an exhaustive literature review.

Expansion validation:

- **486 tests passed across 13 files**, including both-order resolution for all five pairs, gated reachability, source/uncertainty validation, free discovered-only Atlas rendering and topic search, and performed-only alternate-route disclosure.
- Original version 7 discoveries, historical experiments and earned rewards survive loading without auto-discovering the additions. Existing normalization removes newly valid pairs from the active failure ledger without changing stored bytes on load or awarding Insight; an old no-reaction experiment remains a historical record. New discoveries and explicit reading markers round-trip.
- Production build/TypeScript checking, focused ESLint and editor diagnostics passed. Vite reports a bundle-size advisory, not a failed build.
- All **40 local documentation links/anchors** resolved; scoped whitespace checks passed.
- Existing keyboard/citation and isolated Rainmaker/lab regressions passed. No shared browser campaign was reset, seeded or used for combinations. The previously shared browser page was unavailable for an additional live layout check; new entries were verified in isolated rendered tests, not claimed as a new device or screen-reader audit.

Human comprehension and misconception results remain **pending**. Relevant future probes include whether a rotary quern needs a vehicle wheel, whether proposed pivots are proven earliest evidence, and whether alphabets are necessary for literacy. These are facilitator topics, not simulated participant observations.

## Human playtest protocol

### Setup and consent

- Recruit volunteers with differing game familiarity and historical knowledge. Use anonymous participant IDs; do not collect names or sensitive demographic details.
- Explain observation and optional quotation recording, obtain consent, and allow stopping. Record accessibility needs only when volunteered and relevant.
- Participants use their own fresh profile or explicitly authorized test save. Do not reset or seed someone else's campaign. Record the build and starting age; report incomplete ages as incomplete.
- Run normal gameplay first, without teaching historical answers or exposing undiscovered recipes. Insights may be used for puzzle assistance; history must remain free.

### Tasks and neutral prompts

1. Let the participant begin an age and think aloud if comfortable. Record stuck points, help, abandoned combinations and whether normal progression is understandable.
2. After a researched discovery, ask them to find more information about it. Record success, time, route and assistance before mentioning Atlas or search.
3. Ask them to return to combining. Observe whether reading or labs interfere, clear slots, appear mandatory, spend Insight or reveal undiscovered formulas.
4. After actual age completion, ask: "What did you learn? Describe one discovery and the evidence behind it in your own words." Record the answer verbatim before corrective prompts.
5. Ask: "Which parts seemed historical, and which seemed like puzzle shortcuts?" Then ask how they interpreted displayed dates and whether another region could have a different timeline.
6. Only afterward use the relevant probes below. Record prompted answers separately. Explain corrections at the end, then retest understanding without treating the corrected response as an original learning outcome.

If the participant does not finish an age or does not encounter relevant content, mark the corresponding outcome **not assessed** rather than extrapolating.

### Facilitator probes and interpretation key

| Age | Probe after unprompted teach-back | Misconception to watch for |
| --- | --- | --- |
| Origins | What does this page say about real human history? | Treating fictional combinations, including Metal, as prehistoric manufacturing events. |
| Stone | What do the food and pottery examples imply about farming? Who might have made the earliest tools? | Farming as necessary for all bread or pottery; all toolmakers assumed to be modern humans. |
| Bronze | Could writing use different materials or arise in different places? What is omitted in the metal puzzles? | Papyrus/alphabet as universal prerequisites; early accounting automatically recording speech; extraction reduced to heat alone. |
| Iron | What does placing roads or exchange here imply about their beginnings? Must all societies pass through these pages in order? | Roads/exchange beginning with iron; one global timeline; universal historical Bronze-to-Iron prerequisites. |

Use probes only for discoveries and explanations the participant actually encountered. Do not supply the expected answer inside the question. A misconception may derive from prior beliefs, the game or interviewer prompting; record those possibilities, not unsupported causation.

### Observation template

Copy one blank record per participant/task; there are no completed participant records yet.

| Field | Record |
| --- | --- |
| Anonymous participant ID / consent | |
| Build / device / input method / starting age | |
| Task / discovered entry / relevant performed recipe | |
| Age completed? / observed task outcome | |
| Start/end time / help and interruptions | |
| Spontaneous teach-back quote | |
| Prompt used / prompted quote | |
| Misconception: observed / not observed / not assessed | |
| Prior belief or source of confusion, if actually reported | |
| Software obstruction or spoiler actually observed | |
| Proposed correction / owner / retest result | |

### Release review

Separate task completion, factual comprehension and engagement. Review actual quotes and help needed, not just collection completion. Investigate every observed spoiler, currency charge, progression obstruction or misconception and retest any correction. Agree participant coverage and success criteria before recruitment; do not retrofit thresholds to make results pass.

Human comprehension, discoverability and misconception outcomes remain **pending** until real observations are recorded.

## Play and Atlas navigation review

This software review is separate from the historical review and does not establish human learning outcomes.

- Play loads by default; the persistent header offers two keyboard-accessible section controls with an explicit active state.
- Desktop Play retains Elements, Combine, and Guide. Mobile Play retains exactly three tabs; Atlas is a separate encyclopedia page without gameplay tabs.
- Application tests cover cross-age access, discovered-only history, shared free reading markers, unchanged saves on navigation, and restoration of filters, selected entries, prepared combinations, results, mobile tab, and isolated challenge context.
- The complete regression suite passed 492 tests across 13 files. Production build/type-check, focused lint, and 40 local documentation links/anchors passed.
- Live browser checks covered Play at 1440, 1024, 768, 740, 375, and 320px widths, and Atlas with an open entry at 1440, 375, and 320px. No page-level horizontal overflow occurred; Atlas hid the gameplay tabs and its article fit the available width.
- Browser navigation left existing saved bytes unchanged and restored the gameplay panel. No browser save was reset, seeded, or deliberately changed.

Keyboard behavior has automated coverage; actual screen-reader and human usability observations remain pending.

## Save compatibility and interface regression review

This later interface-validation snapshot supplements, rather than replaces, the initial navigation review above.

- Version 7 save fields and existing v1-v6 loading behavior are unchanged; no navigation migration or second progress store was introduced.
- Application tests load a complete v7 campaign and retain all discovery/recipe IDs, favorites, Insight and stall progress, collection/age rewards, challenge records, experiments, leads, reading markers, ages and sound preference. Every discovered encyclopedia entry remains available.
- Read/unread controls are checked against the exact persisted save shape and a newly loaded store; reset clears reading markers and hides removed discoveries, including a previously selected article.
- Interface tests open history from each v1-v6 save without rewriting the save on navigation. Actual quota failures while marking reading retain the original saved bytes and leave a single visible warning across sections.
- Research rendering, marker changes and reset leave the historical research database unchanged. The Guide's component test excludes encyclopedia headings and search controls while preserving its View History callback and gameplay research.
- All four required commands passed: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The complete suite passed **512 tests across 13 files**. The production build retains the existing nonfatal bundle-size warning.
- Browser-guided checks at 1440, 740 and 375px confirmed section/article focus, restored mobile Guide context with exactly three gameplay tabs, no horizontal overflow, and normal Rainmaker launch, Atlas detour, resume and exit focus. No new console or runtime errors occurred during these actions; saved bytes, occupied-slot contents and the selected age were unchanged.
- Historical research, element/recipe catalogs and persistence/store implementation files were checked against pre-review file hashes. This update changes tests and documentation only. Optional Atlas filters, timelines, bibliography browsing and Classical Antiquity remain deferred.

These checks verify software behavior, not historical claim accuracy or real-player learning. Screen-reader and human playtest observations remain pending.

## Classical-element classification review

This subsequent content correction distinguishes documented Greek natural philosophy from the game's symbolic mechanics; earlier review counts above remain historical snapshots.

- Reviewed original passages from Kingsley and Parry's *Empedocles*, Aristotle's *On Generation and Corruption* Book II in Joachim's translation, and Perkins' *Metaphysics in Chinese Philosophy*. Source receipts preserve authors, initial publication/revision metadata and the limits of translated, fragmentary textual evidence.
- Empedocles of Acragas is identified as a major early fifth-century BCE formulator of the four-root theory. Aristotle's fourth-century BCE account and hot/cold, dry/moist qualities are distinguished from it. These dates describe Greek philosophy, not Origins, natural phenomena or universal adoption.
- Checked OpenStax *Chemistry 2e* passages for combustion reactions, elements versus compounds, water's two hydrogen atoms and one oxygen atom, air as a mixture, and granite's mineral mixture. These modern scientific contrasts do not imply ancient knowledge of molecular composition.
- Greek roots are not presented as every ancient civilization's belief. Chinese *wuxing* is a distinct five-phase context, not an equivalent theory or evidence of a common origin. Scientific validity is distinguished from historical attestation.
- Clarified the blanket Origins subtitle, Atlas placement label and chronology-table framing. The four descriptions retain their flavor sentences with separately labeled historical summaries; four cited Atlas records now provide the fuller explanations.
- Coverage is now **17 of 147 elements**, with **31 verified sources and one pending source**; **130 elements** still lack researched histories. Existing records remain intact. Fictional life-making and symbolic Metal creation remain disclosed.
- Starting IDs, categories, icons, ages and recipe associations are unchanged. Recipe and persistence/store implementation hashes match the pre-correction baseline; version 7 remains unchanged. New starter reading markers use the existing explicit, free mechanism, with no automatic reading, currency charge, reward or navigation save.
- `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` passed; **546 tests across 13 files** include starter identity, sourced rendering, topical search, recipe secrecy, reachability, free reading and legacy-save coverage. The existing nonfatal production bundle-size warning remains.

The starter-history live browser smoke check remains pending: the available shared page could not be isolated safely, and no player progress was deliberately changed. Automated rendering, search, focus and persistence checks passed. Human learning and screen-reader observations remain pending; these checks do not certify every claim or establish learning outcomes.

## Historical-model schema and reception review

This subsequent review retains the earlier snapshots above.

- Fire, Water, Earth and Air now use `historical-model`, with structurally nonempty citations and catalog-aware rejection of unknown or pending supporting sources. The other placement classifications remain supported; Metal retains its symbolic Origins classification.
- Rechecked Empedocles' enduring roots and Aristotle's hot/cold and wet (moist)/dry pairs against the reviewed philosophical passages. Each starter explains all four correct pairings and distinguishes historical categories from modern scientific measurements.
- Added passage-specific reception receipts for Weisberg, Needham and Hendry's *Philosophy of Chemistry*, and Cartwright's supplementary *Alchemy*. Original author/publication metadata was inspected. Reception and revision are distinguished from unchanged scientific survival, successful gold transmutation and universal adoption.
- The Atlas presents conceptual use and intellectual-history evidence without renaming the existing stored fields, inventing artifacts or changing progression. All four histories remain immediately available with zero Insight, no automatic reading, no rewards and no navigation save.
- Coverage remains **17 of 147 elements**, now with **33 verified sources and one pending source**. Philosophical dates still describe theories, not natural phenomena. Content schema version 2 and save version 7 remain unchanged.
- TypeScript, ESLint, all **556 tests across 13 files**, and the production build passed. Focused coverage includes model citation requirements, legacy classifications, fresh-campaign access, qualities, textual headings and reception links. Existing compatibility, discovery secrecy, reading/reset and reachability regressions remain passing.
- Recipe, persistence and game-store implementation hashes match the pre-request baseline. This update changes no recipe or save-data schema and introduces no migration.

Live browser verification remains pending: the shared preview changed back to Play between Atlas navigation and article selection, so the read-only smoke check could not complete reliably. No combinations, reading markers, saves or player progression were deliberately changed. Automated UI checks passed; human learning and screen-reader checks remain pending.

## Origins subtitle, Atlas disclosure and classical-source regression review

This follow-up completes the wording and source checks; earlier results above remain historical snapshots.

- Origins now uses the exact subtitle **An undated prologue inspired by the four classical elements of ancient Greek natural philosophy.** Its name, `first-light` ID, absence of a date range, landmarks, discovery goal, unlock requirements and grants are preserved. The Stone Age transition and all subsequent progression gates are unchanged.
- The historical-model label now precedes the article overview. The general Atlas disclaimer distinguishes the documented Greek model from symbolic combinations, and the chronology note explicitly denies that Greek philosophy preceded prehistoric humanity. Search, citations, discovery restrictions and explicit free reading markers remain intact.
- Reconsulted SEP *Empedocles* (Life and Writings; Roots and Forces, including fragments B6/B17), SEP *Aristotle* (biographical and surviving-writings context), and Aristotle's Book II, Parts 2-3 in Joachim's translation. The primary pairing passage assigns fire hot/dry, water cold/moist, earth cold/dry and air hot/moist; the modern scholarly sources are not presented as primary texts.
- Added Christopher Shields' SEP *Aristotle* with a selected-passages receipt, verified credited author and publication/revision metadata. Its fourth-century context supports the four entries' philosophical chronology, not dates for physical phenomena. The archive translation and fragmentary/editorial interpretation limitations remain explicit; wet/moist wording is not a modern measurement.
- Reviewed documentation and Origins recipe cautions for obsolete fiction claims about the theory. Clarified the older blanket QA wording while retaining legitimate fictional life-making, symbolic Metal and simplified-recipe warnings. Recipe flavors and review classifications did not require changes.
- Coverage remains **17 researched entries and 147 elements**, with **183 unchanged recipes**, **34 verified sources and one pending source**. Element, recipe, persistence and game-store implementation hashes match the pre-request baseline. Content schema version 2 and save version 7 are unchanged; no migration is introduced.
- `npm run typecheck`, `npm run lint`, all **560 tests across 13 files**, and `npm run build` passed. Tests pin the exact subtitle and Origins configuration, the same four Rainmaker starters, unchanged original combinations and gates, source validation, four-entry topic/source search, fresh-game access, discovery secrecy, free reading and legacy/v7 saves. The existing nonfatal bundle-size warning remains.
- A live preview smoke check confirmed the exact subtitle and visible model labels and SEP Aristotle links for **Fire, Water, Earth and Air**. It restored the prior top-level section and search query and did not toggle reading markers or perform combinations. This was a functional check, not a complete mobile, screen-reader or console audit.

Historical verification remains passage-specific, not certification of every source or every description. Human playtesting, learning outcomes and comprehensive screen-reader checks remain pending.

## Classical Antiquity research and optional-objective review

Reviewed on **14 October 2026**. Earlier totals and validation results above remain historical snapshots.

- Catalog remains **173 elements and 211 recipes**. All **22 Age V elements** now have full Atlas records; the 15 expansion records and supplemental Aqueduct, Scroll and Coin histories bring coverage to **46 entries with 77 chronology entries**. **127 elements** remain unresearched.
- The registry has **71 verified sources and one pending lead**. The 18 added receipts record checked passages and original URLs. Sources include Stanford philosophical scholarship, ASCSA excavation context, UNESCO qanat documentation, MacTutor mathematical histories, translated Aristotle, and attributed historical syntheses. Failed requests, disambiguation pages, and a generic coinage account with problematic origin claims were not promoted to accepted evidence.
- Agora remains multifunctional. Roman institutional records distinguish retrospective foundation stories from excavated contexts and changing civic arrangements; Senate and Republic do not imply equal representation or universal democracy.
- Aqueduct distinguishes pre-Roman Aegean, Mesopotamian, Assyrian and Greek works from Roman monumental systems and Persian groundwater galleries. Arch acknowledges Etruscan precedents; Stoa is a roofed colonnade, not automatically a philosophical school. Amphitheater describes violent spectacles without endorsing them or treating every arena as an arched monument.
- Library distinguishes earlier tablet collections from Hellenistic Alexandria and retains uncertainty about foundation and loss. Geometry compares Indian altar construction, Chinese practical mathematics and Euclid's synthesis without a single cultural ladder. A dated commentary is not an invention date.
- Natural Inquiry and Natural Philosophy compare Indian and Chinese categories without imposing simultaneous Greek Classical chronology. Aristotle's bird accounts include testimony, not ancient confirmation of modern dinosaur ancestry. Fossil Inquiry retains the disputed status and abstract-only limit of the Protoceratops–griffin proposal.
- All **17 expansion formula reviews** now have relevant verified background references. The earlier Aqueduct review also gains context: totals are **106 source-backed cautions and 105 uncited cautions**, with classifications unchanged at **14 material-process, 92 simplified-process and 105 symbolic**. No reference proves an exact gameplay combination.
- Added four optional collections and **Civic, Engineering, Commerce and Inquiry Labs**. Agora and the five existing core landmarks, six-discovery chapter goal, all age gates, original collection memberships, original labs and Rainmaker remain unchanged. Library, Aqueduct, Arch and Stoa are optional collection targets rather than new required landmarks. Historical explanations remain free and separate from puzzle flavor and reward eligibility.
- Regression tests verify every permitted alternate route when proving minimum attempts, actual rendered challenge completion, isolation from campaign discoveries, confirmed first rewards, capped/repeated rewards, and persistence. Earlier version 7 completions load unchanged without new discoveries, load-time rewards or rewritten storage. New objective records and reading markers round-trip.
- `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` all passed: **749 tests across 14 files**. Existing gated reachability, unordered-pair uniqueness, original recipe fingerprints, Rainmaker, element filters, Recently Used, discovered-only Atlas rendering/search and legacy-save regressions pass. Whitespace checks passed.

No live shared-browser state was modified for this review. Atlas and lab behavior were verified in isolated rendered tests, not claimed as human learning evidence or a new mobile/screen-reader audit. Regional source coverage remains selective; missing histories must not be interpreted as absence of knowledge or technology.

## Phase 9: interface, progression and save compatibility

Reviewed on **14 October 2026** after the research/objective snapshot above.

- Classical Antiquity appears fifth in Play navigation and in the independent shelf age filter. Rendered tests check disabled locked navigation, keyboard activation of the unlocked page, its current-page accessibility marker, its six-discovery/five-landmark completion, and every Age V collection view.
- Guide totals count **22 distinct Age V elements**, not **24 recipe routes**. Tests check every nonempty category total and separately recorded alternate Agora formulas. Only performed formulas appear. The global discovery counter retains the **173-element** denominator.
- Existing tests cover fifth-age Starred/category filtering, Recently Used across ages, discovered-only Atlas records, persisted favorites/formulas, original recipe fingerprints, gated reachability, duplicate pairs, Rainmaker and reward isolation. Added migration tests exercise fresh and complete gates, and each individually missing gate ingredient, for **versions 1 through 7**, with export/reload checks and no invented Age V discoveries, formulas or completions.
- Live browser geometry checks at **1440, 1024, 768, 390 and 320 pixels** found a centered-overflow issue in the age row. Safe centering and non-shrinking buttons now keep both first and fifth buttons scroll-reachable at every checked width without horizontal page overflow. Existing browser progress was not reset or seeded. The browser's separate-context restriction prevented an isolated seeded live campaign; unlocked-age interaction is covered by rendered tests instead.
- Final validation passed: `npm run typecheck`, `npm run lint`, `npm test` (**758 tests across 14 files**) and `npm run build`. No editor diagnostics were reported for the changed tests or stylesheet.

This is targeted keyboard, semantic-control and responsive-layout verification, not a comprehensive accessibility audit, screen-reader session or human learning study. Those reviews remain pending.

## Phase 9G: priority natural-history coverage

Reviewed on **14 October 2026**. Earlier counts above remain historical snapshots.

- Audited existing natural resources against the research registry and documented geological, organism/life, phenomenon/environment and biogenic/processed groups in the [research guide](research.md#phase-9g-natural-history-audit). Added full entries for **Clay, Rock, Sand, Limestone, Copper Ore and Iron Ore**. Flint and Obsidian are not catalog elements and appear only as geological context; Earth remains the separate philosophical starter.
- Coverage is now **52 of 173 elements**, with **85 chronology entries**, **77 verified sources and one pending lead**. **121 elements** still lack full records. The batch adds six passage-specific USGS/BCcampus receipts and reuses existing archaeological, museum and technical evidence. It does not claim new biological research or full natural-history coverage.
- Reviewed clay particles versus clay minerals, natural rock cycles versus stoneworking, grain size versus sand composition, biogenic and nonmarine carbonate formation, and naturally concentrated ores versus extracted metals. Geological formation remains explicitly undated; pottery and plaster dates describe human use, not mineral formation. Smelting is chemical reduction, not melting alone.
- Retained abstract-only limits for Xianrendong pottery and Natufian plaster. The sand/glass artifact comparison does not identify ancient feedstock provenance or certify a raw-sand production method. Modern ore-grade thresholds, textbook geological examples and later Saugus machinery are not assigned to all ancient communities. Failed source requests and search summaries were not accepted as verified passages.
- Reviewed the existing symbolic formation clues and simplified downstream processing routes. Added record-level cautions without changing recipe classifications, ingredients, results or age assignments. Ore grants remain access abstractions, not geological formation or universal first-mining dates.
- Generic Atlas regressions render each new entry only after discovery, retain free reading and distinguish researched Clay from still-unresearched Papyrus when following related links. New content regressions pin coverage, undated geological chronology, material distinctions and unchanged ore grants. Full graph, duplicate-pair, progression, Rainmaker, filters, Recently Used and legacy/version 7 save tests pass.
- All four requested checks passed: `npm run typecheck`, `npm run lint`, `npm test` (**779 tests across 14 files**) and `npm run build`. The element, recipe and era definitions have no substantive differences from the committed baseline. Save and research schemas remain versions 7 and 2 respectively; no migration or completion requirement was added.

This verifies content structure and software behavior, not human learning outcomes. Broader organism/phenomenon coverage, detailed sand-feedstock archaeology, regional resource-use histories and human/screen-reader reviews remain future work.

## Age V chronology and four-age save review

- Audited the five age definitions, **173 elements**, **211 recipes**, landmarks and collection targets. Classical Antiquity was already registered fifth; it now displays **c. 800 BCE–c. 500 CE** and supplies a collapsed **About Classical Antiquity** Guide introduction. This is an approximate Mediterranean gameplay frame, not the narrower Greek Classical period or a synchronized worldwide stage. Earlier precedents retain their own dates; Persian, Indian and Chinese comparisons are not assigned simultaneous Classical periods.
- Ages I-IV retain their unlock requirements, grants, landmarks and discovery goals. Age V still requires Iron, Iron Tool, Road and Market, grants nothing, and completes with six distinct Age V discoveries including Agora, Academy, Lyceum, Natural Philosophy and Fossil Inquiry. All 22 Age V discoveries remain collectible; optional collections and expansion branches do not increase the completion requirement.
- Existing new-game, incomplete-gate and upgraded-save tests cover versions 1-7. Added a complete four-age Phase 8-style version 7 fixture preserving discoveries, performed formulas, favorites, reading markers, earlier age/collection rewards, Rainmaker completion and the active Iron Age page while exposing Age V. Export/reload retains the result without inventing Age V discoveries or rewards.
- The metadata uses the existing optional chronology field and an optional educational-description field, not persisted save data. Save version 7 and its loader remain unchanged. Rendered tests verify both the selector date and expanded introduction; graph reachability, unordered-pair uniqueness and original recipe fingerprints remain passing.
- Validation passed: `npm run typecheck`, `npm run lint`, `npm test` (**780 tests across 14 files**) and `npm run build`. Whitespace and changed-file editor diagnostics checks passed. This is software regression verification, not a new live-browser, screen-reader or human learning study.

## Civic catalog and Citizenship review

Earlier sections retain their historical totals. This review brings the current catalog to **174 elements and 212 recipes**, including **23 Age V elements and 25 routes**.

- Reused City, Trade, Law and Polity rather than duplicating the broad political-community concept as Government. Agora, Forum, Senate, Republic and Rhetoric already had recipes and full histories. Senate is a specifically Roman elite council; Greek and Roman assemblies remain separately explained institutions, not interchangeable new elements. Rhetoric supplies the civic-debate practice.
- Added optional **Citizenship**, associated symbolically with Human and Law. The clue neither grants real citizenship nor requires written law, universal equal rights or a Greek-to-Roman institutional sequence. Agora remains multifunctional and Greek; Forum remains distinctly Roman. Membership, residence and effective political participation are distinguished.
- Checked Fred Miller's *Aristotle's Political Theory* in the Stanford Encyclopedia of Philosophy, especially sections 2-3 and author/publication metadata. The receipt records selected-passage access, not a full-source certification. Aristotle's normative discussion is textual evidence interpreted by modern scholarship, not a census of all Greek cities or an endorsement of slavery and male rule. Existing Roman Republic and Senate references supply Roman context. Overgeneralized citizenship claims encountered elsewhere were not adopted.
- Coverage is **53 researched entries, 87 chronology entries, 78 verified references and one pending lead**; **121 elements** remain without full research. Dates describe regional Greek theoretical and Roman institutional contexts, not a universal first citizenship. Recipe classifications are **14 material-process, 92 simplified-process and 106 symbolic**, with **107 cited cautions and 105 uncited**.
- Exact comparisons against the pre-addition catalog confirm that every existing element and recipe definition is preserved, with only one appended element and route. All era definitions, collection memberships and isolated challenge definitions are unchanged. The graph validates without Citizenship as well as with it, so existing completion and reward requirements do not depend on the addition.
- Save version **7** remains unchanged. Regression coverage round-trips Citizenship, its recorded formula, favorites and explicit reading, while retaining prior routes and older campaign progress. Rendered tests cover the new researched article without formula leaks, Age V totals, Society/Starred filters and Recently Used shortcuts across age filters.
- All four checks passed: `npm run typecheck`, `npm run lint`, `npm test` (**790 tests across 14 files**) and `npm run build`. Whitespace and changed-code editor diagnostics checks also passed. No new live-browser, human learning or screen-reader study is claimed.

## Intellectual practices expansion review

Earlier sections retain their historical totals. The current catalog contains **178 elements and 216 recipes**, including **27 Age V elements and 29 routes**.

- Reused Observation, Knowledge, Natural Inquiry, Natural Philosophy and Geometry. Rhetoric and Logic cover persuasion and inference without duplicate Reason, Argument or Philosophy discoveries. Existing Fossil Inquiry supplies ancient fossil interpretation, not modern paleontology. Added optional Mathematical Astronomy, Clinical Observation, Logic and Natural Classification; the latter complements rather than replaces Bird Inquiry.
- Seven selected-passage source receipts support the additions: Topoi's Babylonian astronomy project, MacTutor's Ptolemy and Aryabhata accounts, NLM's Edwin Smith Papyrus announcement, the Stanford Encyclopedia's Aristotle's Logic and Mohist Canons entries, and MIT's translated History of Animals, Book I. Source URLs and relevant passages were accessed; SEP author/publication metadata was checked. Failed fetches and search summaries were not accepted as evidence. NLM announcement access is not full scan/translation inspection.
- The entries distinguish Mesopotamian computed tables, Alexandrian geometrical models and an Indian text dated 499 CE from a single invention or modern astrophysics. Egyptian trauma-case evidence predates Age V and is neither a controlled trial nor medical advice. Greek deduction and Chinese Mohist distinctions are compared without equating their systems, guaranteeing true premises or inventing a first human reasoning. Animal comparisons are not Linnaean ranks or evolutionary trees; modern bird ancestry is not assigned to ancient observers.
- Coverage is **57 researched entries, 94 chronology entries, 85 verified references and one pending lead**; **121 elements** remain without full research. These are selected regional examples, not exhaustive histories, simultaneous Classical periods or proof of cultural isolation. Each evidence date keeps its own meaning and uncertainty; later Mohist passages receive no invented precise composition date.
- All four new routes are symbolic and source-backed. Review totals are **14 material-process, 92 simplified-process and 110 symbolic**, with **111 cited cautions and 105 uncited**. References support context, not literal two-input historical processes.
- Every committed element and recipe definition remains unchanged; the prior uncommitted Citizenship route is additionally protected by a first-212-recipe fingerprint. Era definitions, collection memberships and isolated challenge definitions are unchanged. The graph passes both with and without all four new discoveries, leaving existing age targets, landmarks and collection rewards independent of them.
- Save version **7** remains unchanged. Tests cover the new reading markers, performed routes and favorites, older-save migration, Rainmaker, discovered-only Atlas rendering without formula leaks, Age V counters, Knowledge/Starred filters and Recently Used shortcuts across age filters.
- All four checks passed: `npm run typecheck`, `npm run lint`, `npm test` (**817 tests across 14 files**) and `npm run build`. Exact baseline comparisons, whitespace checks and changed-code editor diagnostics also passed. This is software and content-structure verification, not a new live-browser, screen-reader or human learning study.

## Graph-aware era shelf review

- Replaced the flat inventory with chronological era drawers, discovered/total badges, native expanded-state controls and persistent collapse preferences. Full collection says **Collected**, not historical or formula mastery. Sorting remains available within drawers, along with horizontal category scrolling and compact layout.
- Status is computed from recipes, not authored `isFinal` metadata. **Terminal** means a produced discovery has no outgoing ingredient use anywhere. **Exhausted for now** requires every outgoing formula in unlocked result ages to have been performed, including alternate routes. Hint disclosure and known results do not suffice. Locked-only uses do not imply exhaustion; an age unlock can reactivate an ingredient. These labels concern authored gameplay, not real-world utility or historical accomplishment.
- **Hide Mastered** hides both statuses by choice, off by default. Search spans discovered elements across age/category/Starred/Hide Mastered filters and temporarily opens matching drawers, restoring preferences when cleared. Recently Used, tap/Enter selection, Space-key dragging, favorites, Guide inspection, recorded-origin preparation and discovered Atlas histories remain usable. An active drag source stays mounted through filtering. Focus recovery is covered when a focused tile or entire drawer disappears.
- Save version **7** retains its number and adds defaulted `hideFinalElements` and `collapsedShelves` fields. Tests cover v1-v7 defaults, canonical collapsed IDs, malformed values, serialized round-trips, reset, cross-tab adoption and write failures. Rendered App coverage verifies Play/Atlas return and remounting without navigation writes. No manual file import/export interface was added.
- Shared validation protects starters and foundational Tool/Stone Tool/Bronze Tool/Iron Tool outgoing uses while allowing legitimate terminal tools. Production builds validate and report **178 total elements: 135 crafting ingredients, 43 terminal elements and zero unused nodes**. Exact parsed comparisons confirm element, recipe, age, collection, research and recipe-review data are unchanged by this shelf work.
- A storage-write-blocked, memory-only browser fixture used all 178 discoveries without replacing an existing browser save. At **375 x 812**, collapsing Origins, Stone Age and Bronze Age reduced measured shelf content height from **8,380 to 2,716 pixels (68%)**. Search revealed hidden Terminal Quicklime, allowed selection and retained its Recently Used shortcut. Desktop **1280 x 800** and short-mobile **375 x 600** checks showed no horizontal page overflow. These are scripted fixture observations, not a live-save migration, real-player, physical-touch-device or screen-reader study.
- Final checks passed: `npm run typecheck`, `npm run lint`, `npm test` (**851 tests across 15 files**) and `npm run build`, plus whitespace checks. The application chunk is **487.61 kB (128.46 kB gzip)**, up **4.55 kB** from the pre-shelf 483.06 kB baseline and below Vite's default 500 kB warning threshold. No dependency or size-limit changes were needed. Human learning and assistive-technology observations remain pending.

## Optional engineering expansion review

- Added six optional discoveries and six formulas: Slaked Lime, Lime Mortar, Volcanic Ash, Concrete, Road Network and Public Bath. Arch, Aqueduct and Amphitheater are reused; Limestone, Quicklime, Pottery, Water and Road retain their existing roles. One Lime Mortar tile covers the mortar branch without a redundant generic Mortar. Earth uses internal ID `stone`; geological Rock uses `rock`, and Water uses `tide`.
- Catalog totals are **184 elements and 222 recipes**, with age counts **43 / 46 / 42 / 23 / 30**. All first 178 complete element definitions and 216 complete recipe definitions are pinned by regression fingerprints. Age gates, landmarks, completion targets, collection memberships, lab definitions and rewards are unchanged; gated validation also passes after removing the entire engineering branch.
- Atlas coverage is **63 entries and 101 chronology entries**, with **92 verified references and one pending lead**; **121 elements** still lack full research. Seven new selected-passage receipts cover lime chemistry, USGS ash formation, peer-reviewed Roman hot mixing and contextual engineering/roads/baths accounts. Publisher access failures were not claimed as successful verification; the Roman concrete study was read through its legitimate PMC archive. Existing plaster and pre-Roman waterwork evidence remains qualified.
- Cautions distinguish calcination, exothermic hydration, air-lime carbonation and hydraulic reactions; omitted water and coarse aggregate; prehistoric plaster versus masonry mortar; volcanic ash versus wood ash; Roman concrete versus Portland-cement concrete; and site-specific hot-mixing evidence versus universal self-healing. Rock + Heat is explicitly symbolic, not a volcanic-ash manufacturing process. No practical caustic-material handling directions are given.
- Aqueduct research now describes surveyed gravity gradients, non-pumping arch supports, conduits, settling, distribution and maintenance without a universal slope or equal household supply. Bath history retains Greek precedents, varied water/heating systems and hot-air hypocausts, not modern radiators. Mud Brick is not silently converted into fired terracotta. Roads include older routes, maintenance and imperial power, not a Roman invention of all roads.
- Recipe classifications are **15 material-process, 94 simplified-process and 113 symbolic**, with **117 source-backed cautions and 105 uncited**. All six new routes resolve in either order, remain reachable and have individual reviewed cautions. Quicklime's graph-derived Terminal label disappears because it now has an outgoing recipe; the graph reports **139 crafting ingredients, 45 terminal elements and zero unused nodes**.
- Version **7** is unchanged. Engineering formulas, discoveries, stars, reading markers and shelf preferences round-trip together. All six additions have age/category/Starred and cross-filter Recently Used regression coverage. Existing v1-v7 migration, Rainmaker, challenge/reward persistence and discovered-only Atlas tests remain passing; every new research entry participates in sourced-date rendering and recipe-leak checks.
- Validation passed: `npm run typecheck`, `npm run lint`, `npm test` (**889 tests across 16 files**) and `npm run build`, plus whitespace and changed-code editor diagnostics. Static research now has its own eagerly loaded, independently cacheable chunk; the default 500 kB warning threshold remains unchanged. This is automated software/content QA, not a new human learning, physical-device or screen-reader study.
- Final production chunks are **227.10 kB application**, **292.29 kB research** and **303.96 kB vendor**, all below the unchanged warning threshold. A production-preview smoke check returned HTTP 200, rendered Play and opened Atlas and a sourced starter article. No campaign fixture was injected and no existing browser save was replaced; new engineering-entry coverage comes from the automated discovered-only Atlas tests.
