# Educational quality assurance

[Back to the project overview](../README.md)

Review date: **2026-10-14**.

## Status and scope

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
