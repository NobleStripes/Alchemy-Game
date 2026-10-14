# Historical research

[Back to the project overview](../README.md)

Research lives in [`src/game/content/research.json`](../src/game/content/research.json), not inside element definitions or a hosted database. Schema version 2 adds educational Atlas fields. Historical source, chronology, entry, and database schemas are exported from [`schema.ts`](../src/game/content/schema.ts); [`research.ts`](../src/game/content/research.ts) adds catalog-aware validation and loads the database. [`research.test.ts`](../src/game/content/research.test.ts) tests both layers.

This separation keeps factual entries and bibliographic references out of gameplay definitions and save-game progression. Research entries refer to stable element IDs; they do not define recipe dependencies, unlock conditions, or rewards. Version 7 saves remain compatible and store only explicit reading IDs, never copies of research text or sources. The schema update does not itself define age assignments or recipe routes.

Historical entries now appear in the top-level **Atlas** section, reached from the persistent application header. **Play** retains the gameplay Guide and recipe assistance. Atlas is independent of the currently selected age and shares the same discoveries and reading markers; moving between sections neither changes gameplay context nor adds save fields.

## Application views and state

[`App.tsx`](../src/App.tsx) owns local `activeSection: 'play' | 'atlas'` state, defaulting to Play, separately from the existing mobile `activePanel`. Both views remain mounted; the inactive view is hidden rather than replaced. This preserves component-local filters and selections as well as unsaved worktable slots and the last result. `DndContext` wraps only the Play workspace, not the encyclopedia.

Both views use the existing [`useGameStore`](../src/game/state/useGameStore.ts) Zustand store. There is no second discovery or reading-progress store. Navigation does not change the active gameplay age, reconnect progress synchronization, or write a save; it does not persist the selected view. Explicit read/unread actions still save personal reading markers without changing progression or rewards.

The age switcher is labeled **Play ages**. Isolated challenges return via **Return to Play**, restoring focus to the Rainmaker header button or the originating Learning Lab control. Switching to Atlas temporarily hides, rather than discards, an active run.

The Guide's discovered-element **View History** action uses the mounted encyclopedia's `openEntry` command to select a local reading entry and clear stale historical search text. It neither updates the game store nor marks reading. Returning to Play restores focus to the originating control; direct entry requests still pass through the encyclopedia's discovered-only filter.

Ordinary header navigation focuses the Atlas heading or the remembered gameplay panel heading, or the active challenge's Return control. It does not steal focus on initial load or mobile-tab changes. Selecting an entry, including reselecting the current entry, focuses its article heading; bibliography targets remain keyboard-focusable. Inactive views are excluded from the keyboard and accessibility tree.

## Interface compatibility and scope

The interface separation introduces no save fields or migration. The existing version 7 format continues to preserve valid discovery and recipe IDs, reading markers, favorites, Insight and failure progress, collection rewards, challenge records, experiments, leads, ages and sound preference. Classical Antiquity is added through normal content and era reconciliation, not a save-version change. Versions 1-6 still use the existing loader and its historical defaults; loading old research-free v7 saves still defaults reading markers to unread.

Application regression tests load an existing complete v7 campaign and check every discovered encyclopedia entry, all persisted fields, and no writes while navigating. Explicit read/unread actions are checked against a newly loaded store and the exact v7 save shape; reset clears reading and immediately hides removed discoveries. Tests also browse existing v1-v6 saves without rewriting them merely to open Atlas, and exercise real failed reading-marker writes with visible errors in both sections.

Research records and verified references remain content data, not navigation state. Regression coverage checks that rendering, reading markers and reset do not mutate the research database. The existing discovered-only search, related-entry filtering, zero-Insight reading and challenge focus tests remain in place.

[`HistoricalAtlas.tsx`](../src/features/journal/HistoricalAtlas.tsx) remains in `src/features/journal` for this update. A future `src/features/atlas` directory could clarify ownership as independent Atlas features grow, but moving files now would add import churn without changing behavior. The Guide already has no encyclopedia import; its recipe disclosures and shared source presentation remain gameplay features. No old embedded-encyclopedia disclosure styles remain; shared historical-context styles still serve Atlas, recipe notes and Learning Labs. Timelines and bibliography browsing remain outside this interface update; all Classical Antiquity research entries use the existing discovered-only Atlas experience.

## Research coverage

Research covers **57 of 178 elements**, including all **27 Age V discoveries**. The 53 records through Citizenship remain, joined by Mathematical Astronomy, Clinical Observation, Logic and Natural Classification. The registry contains **85 verified sources and one pending source**, including recipe-review background. The remaining **121 elements** have no full research record. These focused entries are not exhaustive histories or certification of every claim in existing gameplay descriptions.

### Intellectual practices audit

Observation, Knowledge, Natural Inquiry, Natural Philosophy and Geometry already have recipes and histories. Rhetoric and the new Logic cover persuasion and inference without duplicating Reason, Argument or Philosophy. Existing Fossil Inquiry supplies ancient fossil interpretation; its distinction from modern paleontology and its caution about fossil-inspired mythology remain. Natural Classification adds comparison and grouping alongside, rather than replacing, Bird Inquiry.

Seven new selected-passage receipts support four optional discoveries:

- Topoi's institutional account of Late Babylonian tablets distinguishes computed tables and procedures from observations; the corpus's approximate 400-50 BCE span is not an astronomy origin date.
- MacTutor's Ptolemy and Aryabhata accounts compare Alexandrian geometrical models with an Indian mathematical text dated 499 CE. Neither a successful prediction nor the text's date establishes a correct physical cosmology or a first Indian astronomy.
- NLM's Edwin Smith Papyrus announcement describes 48 structured trauma cases in a document dated approximately to the seventeenth century BCE. This earlier Egyptian precedent is not a clinical trial, evidence of treatment efficacy or medical advice. The announcement, not every scan or the full translation, was inspected.
- The Stanford Encyclopedia's Aristotle's Logic and Mohist Canons entries distinguish Greek deduction from Chinese models, distinctions and analogical argument. Author/publication metadata was checked; a precise date for each later Mohist passage is not assigned.
- MIT's translated History of Animals, Book I, supports animal comparison, not modern Linnaean ranks or evolutionary phylogeny. The existing Natural History Museum bird source supplies modern theropod ancestry, not an ancient belief.

These sources complement the existing Egyptian, Mesopotamian, Indian, Chinese and Mediterranean discussions. They are selected examples, not exhaustive regional histories or proof of total cultural isolation. No failed fetch or search summary was promoted to evidence. All new recipes are symbolic; their histories, evidence dates and access limits use schema version 2. Ages, collections, rewards and save version 7 are unchanged.

### Civic catalog audit

City, Trade and Law already provide ingredients. Polity supplies the existing broad political-community concept rather than adding a second Government element. Agora, Forum, Senate, Republic and Rhetoric already have separate recipes and sourced histories; Rhetoric supplies the civic-debate practice. Senate is specifically a Roman elite council, not a generic Council. Assemblies remain distinct institutions discussed in the histories, not interchangeable new elements.

The only new discovery is optional Citizenship. Its record compares Aristotle's definition of political participation with changing Roman republican institutions, separates membership from residence and effective power, and explains exclusions without endorsing them. Fred Miller's *Aristotle's Political Theory* in the Stanford Encyclopedia of Philosophy was checked for the relevant passages and author/publication metadata. It is modern interpretation of an ancient normative text, not an archaeological census or proof of universal Greek practice. Existing Roman Republic and Senate references supply bounded Roman context. No universal first citizenship or simple Greek-to-Roman origin path is claimed. The symbolic recipe grants no real rights and does not require historical citizenship to depend on written law. Existing collections, rewards and age requirements are unchanged.

### Phase 9G natural-history audit

The catalog was checked by stable ID against the research registry. This batch prioritizes existing geological materials, not new recipes. The starter named **Earth** has ID `stone` and an existing philosophical-model history; **Rock** has ID `rock` and now has a distinct geological history. **Flint and Obsidian are absent from the catalog**: chert/flint and natural volcanic glass are contextual examples in Rock, not invented discoveries.

| Category | Coverage and remaining priorities |
| --- | --- |
| Geological materials | New records: Clay, Rock, Sand, Limestone, Copper Ore, Iron Ore. Still without records: Dust, Soil, Mud, Salt, Lodestone. Fossil already has a preservation/discovery history. |
| Organisms and life concepts | Bird is researched. Bloom, Life, Plant, Reed, Forest, Seed, Tree, Animal, Human, Algae and Fish still lack records. Life and Primordial Soup need special care: the game's life-making clues are not established origin-of-life mechanisms. |
| Natural phenomena and environments | Heat, Sea, Land, Wind, Steam, Spark, Storm, Mist, Cloud, Rain, Wildfire, Lightning, River, Lake and Swamp lack records. Starter Fire, Water, Earth and Air have histories of philosophical categories, not complete natural-science accounts. |
| Biogenic resources and processed materials | Bone, Hide, Fibre, Meat, Ash and Timber lack records; processed Charcoal, Leather, Papyrus, Pigment and metals need separate manufacture histories. A game category alone does not establish natural origin. |

These are thematic audit groups, not new gameplay categories or an exhaustive listing of civic and manufactured gaps among the 121 remaining records. Organism/phenomenon entries and broader regional use histories remain future priorities; no biological coverage beyond the existing Bird entry is claimed for this geological batch.

Six new passage-specific receipts cover USGS clay mineralogy and BCcampus rock cycles, clastic sediments, carbonate rocks, magma crystallization and metal deposits. Existing pottery, clay-account, stone-tool, glass-object, plaster and metallurgy sources provide human-use comparisons. Formation accounts are modern scientific explanations, not ancient testimony. Dates for pottery or plaster date archaeological use, not the minerals; other geological origins remain explicitly undated. Modern ore-grade examples and later furnace machinery are not projected onto ancient practice.

Clay minerals versus fine sediment, sand size versus composition, nonmarine carbonate formation, and ore versus extracted metal receive explicit cautions. The sand entry uses an Egyptian glass object as a comparative artifact, not proof of its sand source or batch chemistry. The Xianrendong and Natufian studies retain their abstract-only limits. No failed fetch, search summary or unreviewed PDF was promoted to verified evidence.

All six entries use existing schema version 2 and discovered-only Atlas rendering. Ore unlock grants signify access to existing resources, not instant formation or the beginning of mining. This batch changes no catalog elements, ages, formulas, recipe-review classifications, progression requirements, rewards or version 7 save fields.

The expansion uses passage-specific Stanford Encyclopedia discussions, ASCSA's excavation overview, UNESCO's Persian Qanat description, MacTutor's mathematical histories, translated Aristotle, the AHA's amphora teaching resource, and attributed World History Encyclopedia syntheses. Failed or disambiguation-only URLs were not accepted as sources. A generic coinage article with problematic origin claims was not used; regional Greek and Roman accounts support the narrower claims instead. Bibliographic dates are null when not established, and institutional authorship is retained where an individual credit was not confirmed.

Comparisons include Persian groundwater galleries, Indian altar geometry and philosophical diversity, Chinese mathematical problems and philosophical categories, and Mediterranean civic and scholarly settings. These do not impose simultaneous classical periods, prove cultural isolation, or establish one diffusion path. Liu Hui's 263 CE commentary is dated evidence for a text, not the first Chinese geometry; the Indian philosophy article's much broader classical scope is explicitly disclosed. Earlier libraries, arches, stoas and water conduits remain earlier precedents.

The four newest records distinguish the geological preservation of fossils from their much later discovery, identify birds as the surviving avian dinosaur lineage while separating that survival from the extinction of non-avian dinosaurs, place amphorae within Bronze Age and later Mediterranean commerce, and document quicklime calcination before the Bronze Age. Quicklime is assigned to the Stone Age because the reviewed study reconstructs lime production in Natufian plaster about 12,000 years ago; that evidence is not presented as a universal first or a standalone quicklime artifact.

The Classical Antiquity records use focused Athenian institutional evidence, scholarly accounts of Aristotle and early Greek thought, Herodotus' distinct textual reports, and a peer-reviewed study of a fossilized rhinoceros bone in a thirteenth-century BCE Mycenae context. Their individual evidence dates are not constrained to the chapter's approximate 800 BCE–500 CE Mediterranean gameplay frame. They distinguish a physical find and a cautious collection hypothesis from ancient observation, reported belief, and modern interpretation. The 2024 Protoceratops–griffin reassessment was verified only through its official abstract; the proposed connection is not presented as established fact.

Starter histories distinguish documented Greek natural philosophy from undated gameplay and modern chemistry. Original passages from the Stanford Encyclopedia of Philosophy establish Empedocles of Acragas and a distinct Chinese five-phase context; Aristotle's translated Book II establishes elemental qualities; OpenStax's chemistry textbook supports the scientific contrasts. Receipts include credited authors, original publication dates where known, revision information and access limits. Century labels date philosophical development, not Origins or natural phenomena. Existing research records and recipe references are retained.

The four starters use `historical-model`, not `fictional-prologue`. Their entries explain enduring roots, Aristotle's hot/cold and wet (moist)/dry classifications, and their influence and revision in later natural philosophy and alchemy. SEP's *Philosophy of Chemistry* and supplementary World History Encyclopedia context support narrowly scoped reception claims; neither proves successful transmutation or identical beliefs across alchemical traditions. The Atlas labels conceptual usage and intellectual-history evidence separately from manufacturing and archaeology. All four entries are available immediately, without Insight or automatic reading markers.

The optional Iron Age batch uses Northampton Museums' regional quern account, the V&A's contextual turning essay, Yigal Sitry's original 2022 journal abstract, and inspected sections of Penn Museum's alphabet essay. The lathe pivots are a proposed identification, not confirmed worldwide first-use evidence; the full study remains unread. Alphabetic precedents predate their gameplay page, and a displayed cast is distinguished from its ancient original. No source establishes uniform adoption across all societies. **Lock remains deferred** because an appropriate original archaeological account was not verified; reconstructions, medieval key guides and search summaries were not accepted as ancient evidence.

## Record format

| Record field | Meaning |
| --- | --- |
| `elementId`, `elementName` | Stable gameplay ID and current display name; stale names and unknown IDs fail validation. |
| `historicalOverview` | A sourced overview, with references to the central source registry. |
| `manufactureOrUse` | Sourced material, production or usage context; for historical models, conceptual use rendered as **Concept and use**. The existing field remains compatible; no invented manufacturing process is required. |
| `agePlacement` | Cited earlier precedents, regional gameplay placement, a documented `historical-model`, or an undated symbolic prologue. Models require nonempty citations structurally and verified references through catalog-aware validation; classification does not infer chronology or scientific validity. Metal retains `fictional-prologue` for symbolic Origins gameplay. |
| `relatedDiscoveries` | Curated topic links, not inferred recipe edges. Documented relationships require verified citations; gameplay associations are labeled separately. Unknown targets, self-links and duplicates fail validation. |
| `approximateDates` | Optional regional dates labeled as dated evidence, earliest known evidence, regional development, widespread adoption, or undated; each has a precision and explanatory note. An omitted field becomes an empty list, not an inferred invention date. |
| `associatedRegions` | Optional relevant findspots or regions, not necessarily invention locations. An omitted field becomes an empty list, not an inferred origin. |
| `archaeologicalEvidence` | Artifact, excavated-context, textual-evidence or interpretation entries, distinguished as attested, hypothetical or disputed. Historical models render this backward-compatible field under **Intellectual-history evidence**; philosophical texts attest a theory, not its scientific validity. No archaeological artifacts need be invented. |
| `historicalSignificance` | A sourced explanation of why the evidence matters. |
| `independentDevelopments` | Separately referenced regional developments when supported. Writing records Mesopotamian, Egyptian, Chinese and Mesoamerican primary inventions; missing dates are not invented. An empty list means none is established by this source set, not that no independent development occurred. |
| `historicalUncertainty` | Dating, definition, preservation, provenance and interpretation limits, including any gaps in access or regional coverage. |
| `gameplaySimplifications` | What the page assignment, generic element, legacy ID or symbolic combinations omit; these are not historical prerequisites. |
| `furtherResearch` | Open questions and source leads, including inaccessible material that must not support accepted claims. |

## Sources and verification

Each source records its **title, authors (where credited), institution, source type, original URL, publication date when known, and verification receipt**. An unknown publication date is `null`; artifact dates and API metadata-update timestamps are not publication dates. A verified receipt records the check date, actual accessed URL, access level and supporting passage or catalog fields. Museum-owned APIs and legitimate article archives may supply original records when the main site is unavailable.

The source schema also accepts `reference-textbook` for modern scientific context. A textbook is not mislabeled as an archaeological study or museum collection. Aristotle's text is an archived translation (`library-collection`); its ancient composition context is not treated as a web publication date. Philosophical fragments and translated works are `textual-evidence`, not invented archaeological objects or demonstrations of scientific validity.

For philosophical concepts, distinguish the **primary work accessed in translation** from **modern scholarly interpretation**. The SEP *Empedocles* receipt locates Roots and Forces and fragments B6/B17; the separate SEP *Aristotle* receipt locates biographical and surviving-text context. The four entries cite that latter source for fourth-century chronology, while their elemental qualities cite Aristotle's Book II, Parts 2-3 in Joachim's translation. Interpretation limits, disputed readings and translation wording remain explicit. A verified historical model attests an idea held in a particular intellectual context, not modern scientific validity or a date for the physical phenomenon.

Verification is **claim- and passage-specific**, not blanket approval of an entire website or paper. The Met API entries establish catalog metadata, not unread descriptive essays. The Sion ploughing study was checked through its publisher-deposited abstract in Crossref; the full paper was not accessible. The British Museum scribal palette returned HTTP 403 and remains pending. Reference links in the [chronology guide](historical-interpretation.md#historical-references) do not automatically become verified research sources.

Prioritize excavation publications, peer-reviewed archaeology/archaeometry, museum collections and institutional research. World History Encyclopedia is supplementary regional context, not a replacement for primary evidence. AI-assisted searches may find leads, but **read the original supporting passage before accepting a claim or updating game content**. Check the title, credited author/institution, geography, dating method and alternative interpretations. Retain discrepancies and limitations rather than resolving them through an AI summary.

## Authoring and validation

For new records, add sources and their receipts first, then reference verified source IDs from overviews, dates, evidence, significance and independent developments. Pending sources may appear only in `furtherResearch`. Validation rejects duplicate records/source IDs, dangling references, missing required fields, invalid web URLs/dates and historical dates without sources or geography. Year-resolved dates are reserved for specific dated evidence, such as the Sweet Track's construction, not exact invention/adoption claims. Unknown beginnings and Origins gameplay chronology remain undated; first surviving evidence is not widespread adoption.

Chronology and geographical metadata may be omitted when unsupported. This never relaxes required claims, citations, uncertainty, or gameplay caveats. If dated evidence or independent regional developments are supplied, their regions must appear in `associatedRegions`; duplicate regions and unsupported references fail validation. Atlas explicitly identifies absent date or geographical metadata rather than displaying empty labels or inventing facts.

Run the focused authoring checks with `npm test -- src\game\content\research.test.ts` from the repository root, then the [normal validation commands](../README.md#validate). These checks enforce the research structure and citation relationships, **not historical truth or live URL availability**; original-source review remains necessary.

See [Gameplay and Atlas](gameplay.md#historical-encyclopedia) for the player-facing encyclopedia and [recipe review](recipe-review.md) for recipe-specific metadata.

The [educational QA report](educational-qa.md) records the passage-level review, remaining evidence and representation gaps, and a human-playtest protocol. Automated checks do not establish learning outcomes.

## Phase 8: optional future expansion

These are **lower-priority possibilities for later releases**, not requirements for the next update, scheduled work, or accepted historical claims. Classical Antiquity is now a fifth gameplay chapter; this list concerns possible additions beyond its initial seven discoveries.

| Direction | Possible scope |
| --- | --- |
| Additional Iron Age technologies | Initial optional batch implemented: Rotary Quern, Lathe, and Alphabet, distinguishing earlier precedents from regional evidence. Further additions remain optional; Lock is deferred pending suitable original evidence. |
| Further Classical Antiquity research | Consider additional region-specific evidence and institutions without treating the current Athenian and Egyptian examples as representative of every Mediterranean community. |
| Regional technological histories | Explore different local sequences and independent developments, including gaps identified by educational QA. |
| Archaeological discoveries | Add optional research entries about particular finds, their contexts, dating methods and contested interpretations. |
| Historical trade networks | Explore documented exchange networks without assuming that imported objects prove formal markets or a single trade route. |
| Spread of technologies | Examine evidence for transmission, adaptation and independent development without presenting resemblance alone as proof of diffusion. |
| Knowledge-related discoveries | Consider more discoveries involving knowledge and practices alongside material technologies, with explicit gameplay abstractions. |
| Regional collections and challenges | Consider source-backed regional collections or research challenges that reward experimentation, not memorization of historical facts. |

Any selected expansion should use the existing source-verification standards and distinguish evidence from hypotheses. Historical reading must remain optional and free, undiscovered recipes must stay hidden, and changes to progression must be checked for reachability and save compatibility. The open QA findings and pending human playtests remain separate from these future possibilities.
