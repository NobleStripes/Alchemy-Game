# Historical research

[Back to the project overview](../README.md)

Research lives in [`src/game/content/research.json`](../src/game/content/research.json), not inside element definitions or a hosted database. Schema version 2 adds educational Atlas fields. Historical source, chronology, entry, and database schemas are exported from [`schema.ts`](../src/game/content/schema.ts); [`research.ts`](../src/game/content/research.ts) adds catalog-aware validation and loads the database. [`research.test.ts`](../src/game/content/research.test.ts) tests both layers.

This separation keeps factual entries and bibliographic references out of gameplay definitions and save-game progression. Research entries refer to stable element IDs; they do not define recipe dependencies, unlock conditions, or rewards. Version 7 saves remain compatible and store only explicit reading IDs, never copies of research text or sources. No age assignments or recipe routes change with this schema update.

Research covers **13 of 147 elements**: the original ten entries for Wayfinding (legacy Compass), Lens, Polity (legacy Nation), Metal, Writing Reed (legacy Quill), Writing, Road, Market, Ard (legacy Plow), and Glass, plus Rotary Quern, Lathe, and Alphabet. The registry contains **26 consulted sources and one pending source**, including recipe-review background. These are focused research records, not exhaustive histories or certification of every claim in an existing description. The remaining 134 elements have no research record yet.

The optional Iron Age batch uses Northampton Museums' regional quern account, the V&A's contextual turning essay, Yigal Sitry's original 2022 journal abstract, and inspected sections of Penn Museum's alphabet essay. The lathe pivots are a proposed identification, not confirmed worldwide first-use evidence; the full study remains unread. Alphabetic precedents predate their gameplay page, and a displayed cast is distinguished from its ancient original. No source establishes uniform adoption across all societies. **Lock remains deferred** because an appropriate original archaeological account was not verified; reconstructions, medieval key guides and search summaries were not accepted as ancient evidence.

## Record format

| Record field | Meaning |
| --- | --- |
| `elementId`, `elementName` | Stable gameplay ID and current display name; stale names and unknown IDs fail validation. |
| `historicalOverview` | A sourced overview, with references to the central source registry. |
| `manufactureOrUse` | Sourced material, production or usage context; gaps in reconstruction remain explicit. |
| `agePlacement` | Cited earlier precedents or regional gameplay placement, or an explicitly fictional prologue. This does not infer chronology from date strings. |
| `relatedDiscoveries` | Curated topic links, not inferred recipe edges. Documented relationships require verified citations; gameplay associations are labeled separately. Unknown targets, self-links and duplicates fail validation. |
| `approximateDates` | Optional regional dates labeled as dated evidence, earliest known evidence, regional development, widespread adoption, or undated; each has a precision and explanatory note. An omitted field becomes an empty list, not an inferred invention date. |
| `associatedRegions` | Optional relevant findspots or regions, not necessarily invention locations. An omitted field becomes an empty list, not an inferred origin. |
| `archaeologicalEvidence` | Artifact, excavated-context, textual-evidence or interpretation entries, distinguished as attested, hypothetical or disputed. This can be empty when no material evidence is established. |
| `historicalSignificance` | A sourced explanation of why the evidence matters. |
| `independentDevelopments` | Separately referenced regional developments when supported. Writing records Mesopotamian, Egyptian, Chinese and Mesoamerican primary inventions; missing dates are not invented. An empty list means none is established by this source set, not that no independent development occurred. |
| `historicalUncertainty` | Dating, definition, preservation, provenance and interpretation limits, including any gaps in access or regional coverage. |
| `gameplaySimplifications` | What the page assignment, generic element, legacy ID or symbolic combinations omit; these are not historical prerequisites. |
| `furtherResearch` | Open questions and source leads, including inaccessible material that must not support accepted claims. |

## Sources and verification

Each source records its **title, authors (where credited), institution, source type, original URL, publication date when known, and verification receipt**. An unknown publication date is `null`; artifact dates and API metadata-update timestamps are not publication dates. A verified receipt records the check date, actual accessed URL, access level and supporting passage or catalog fields. Museum-owned APIs and legitimate article archives may supply original records when the main site is unavailable.

Verification is **claim- and passage-specific**, not blanket approval of an entire website or paper. The Met API entries establish catalog metadata, not unread descriptive essays. The Sion ploughing study was checked through its publisher-deposited abstract in Crossref; the full paper was not accessible. The British Museum scribal palette returned HTTP 403 and remains pending. Reference links in the [chronology guide](historical-interpretation.md#historical-references) do not automatically become verified research sources.

Prioritize excavation publications, peer-reviewed archaeology/archaeometry, museum collections and institutional research. World History Encyclopedia is supplementary regional context, not a replacement for primary evidence. AI-assisted searches may find leads, but **read the original supporting passage before accepting a claim or updating game content**. Check the title, credited author/institution, geography, dating method and alternative interpretations. Retain discrepancies and limitations rather than resolving them through an AI summary.

## Authoring and validation

For new records, add sources and their receipts first, then reference verified source IDs from overviews, dates, evidence, significance and independent developments. Pending sources may appear only in `furtherResearch`. Validation rejects duplicate records/source IDs, dangling references, missing required fields, invalid web URLs/dates and historical dates without sources or geography. Year-resolved dates are reserved for specific dated evidence, such as the Sweet Track's construction, not exact invention/adoption claims. Unknown beginnings and fictional Origins remain undated; first surviving evidence is not widespread adoption.

Chronology and geographical metadata may be omitted when unsupported. This never relaxes required claims, citations, uncertainty, or gameplay caveats. If dated evidence or independent regional developments are supplied, their regions must appear in `associatedRegions`; duplicate regions and unsupported references fail validation. The Guide explicitly identifies absent date or geographical metadata rather than displaying empty labels or inventing facts.

Run the focused authoring checks with `npm test -- src\game\content\research.test.ts` from the repository root, then the [normal validation commands](../README.md#validate). These checks enforce the research structure and citation relationships, **not historical truth or live URL availability**; original-source review remains necessary.

See [Gameplay and Atlas](gameplay.md#historical-encyclopedia) for the player-facing encyclopedia and [recipe review](recipe-review.md) for recipe-specific metadata.

The [educational QA report](educational-qa.md) records the passage-level review, remaining evidence and representation gaps, and a human-playtest protocol. Automated checks do not establish learning outcomes.

## Phase 8: optional future expansion

These are **lower-priority possibilities for later releases**, not requirements for the next update, scheduled work, or accepted historical claims. The current four-age scope remains unchanged.

| Direction | Possible scope |
| --- | --- |
| Additional Iron Age technologies | Initial optional batch implemented: Rotary Quern, Lathe, and Alphabet, distinguishing earlier precedents from regional evidence. Further additions remain optional; Lock is deferred pending suitable original evidence. |
| Classical Antiquity | Consider a later chapter with an explicitly regional chronology rather than treating it as a universal successor to the Iron Age. |
| Regional technological histories | Explore different local sequences and independent developments, including gaps identified by educational QA. |
| Archaeological discoveries | Add optional research entries about particular finds, their contexts, dating methods and contested interpretations. |
| Historical trade networks | Explore documented exchange networks without assuming that imported objects prove formal markets or a single trade route. |
| Spread of technologies | Examine evidence for transmission, adaptation and independent development without presenting resemblance alone as proof of diffusion. |
| Knowledge-related discoveries | Consider more discoveries involving knowledge and practices alongside material technologies, with explicit gameplay abstractions. |
| Regional collections and challenges | Consider source-backed regional collections or research challenges that reward experimentation, not memorization of historical facts. |

Any selected expansion should use the existing source-verification standards and distinguish evidence from hypotheses. Historical reading must remain optional and free, undiscovered recipes must stay hidden, and changes to progression must be checked for reachability and save compatibility. The open QA findings and pending human playtests remain separate from these future possibilities.
