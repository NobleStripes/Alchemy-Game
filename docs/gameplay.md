# Gameplay and Atlas

[Back to the project overview](../README.md)

The game has 147 elements and 183 recipes across four ages in a persistent historical Atlas. The simple two-slot workspace, inspectable Guide, local progress, and pointer, touch, and keyboard controls remain available across every unlocked age.

Desktop keeps Elements, Combine, and Guide visible together. Mobile uses a fixed three-tab navigator; choosing an element returns directly to Combine, while the Elements list marks occupied slots. Search matches names and categories, and the Guide separates collections from optional element research with native disclosure controls.

## Main navigation

The persistent **The Unwritten Atlas** header offers **Play** and **Atlas**. Play is the default on load. The keyboard-accessible buttons identify the active section and the section they control; inactive sections are hidden from display, keyboard navigation, and assistive technology.

**Play** contains the existing Elements, Combine, and Guide layout, including its age switcher and the three mobile gameplay tabs. **Atlas** opens the Historical Encyclopedia directly and can browse all discovered entries regardless of the selected gameplay age. It is not a fourth mobile tab, and it does not include recipe hints.

Atlas has its own page heading and introduction. Desktop uses the full application-shell width, with a viewport-sized, independently scrollable discovery index beside an article capped at a readable 80-character measure. Mobile stacks browsing above reading and scrolls the full page without fixed gameplay tabs covering its bibliography. Long references wrap, and reduced-motion preferences suppress transitions and animations. Research explanations, citations, and explicit **Mark as Read / Mark as Unread** controls remain available without Insight.

Ordinary section switches focus the Atlas heading or the remembered Play panel heading; returning to an active challenge focuses its **Return to Play** control. Initial load and mobile-tab selection do not steal focus. Choosing a historical entry focuses its heading, and citation anchors lead to focusable bibliography entries below the persistent header. The Guide's **View History** shortcut still returns focus to its originating control.

The Guide keeps the Insight wallet and hints, Open Leads, Recorded Formulas, Recent Experiments, recipe-related Element research, age challenges and landmarks, collections and rewards, and Learning Challenges. Gameplay research stays in the Guide; only the Historical Encyclopedia moves to Atlas.

Switching sections does not spend Insight, perform experiments, change the selected age, or write a save. The prepared slots, last result, element filters, Guide selection, mobile tab, and Atlas search/entry remain in memory while switching. Explicit reading markers still use shared saved progress. The chosen top-level section and reading selection are not saved; a reload begins on Play.

The header also remains available during isolated challenges. Visiting Atlas does not abandon the run; returning to Play resumes it. **Return to Play** exits the challenge using its existing discard-confirmation rules and restores focus to its launch control. Campaign reset and starting another run are disabled while a challenge is active.

## Four ages

Origins is an explicitly fictional, undated prologue, not an archaeological period or a scientific account of creation. The historical pages draw on several traditions; their approximate dates are explained in the [chronology guide](historical-interpretation.md), not a single worldwide timeline.

**Origins** is the fictional natural-world prologue. Discovering Life, Land, Tree, Rock, and Animal unlocks **Stone Age** (c. 3.3 million years ago–c. 3300 BCE), grants Human as that page's starting element, and keeps all earlier matter available. Stone Age landmarks are Stone Tool, Hearth, Art, and Village; optional discoveries remain open after its challenge is complete.

Origins has 41 elements, with optional waterways, aquatic life, and marine minerals: River, Lake, Algae, Fish, Salt, and Limestone deepen the natural world.

Stone Age spreads across hunting, cooking, shelter, art, fibres, clothing, pottery, farming, bread, and settlement. Stone Tool opens Field and Quarry without metal. Generic Metal Tool requires Stone Tool + Metal, so pre-metal human craft has its own foundation. Spear, Hearth, Shelter, Basket, Pottery, and Art now lead into Hunt, Home, Storage, Meal, and Cave Painting.

Stone Age has 42 elements. Bone, Needle, Leather, Tent, Flute, and Net broaden portable shelter, fine craft, and music. Wayfinding means reading landmarks and the sky, not using a magnetic navigation compass.

**Bronze Age** (c. 3300 BCE–c. 1200 BCE) unlocks after Village, Pottery, Metal, and Quarry, then grants Copper Ore. Its page branches through Copper and Tin into Bronze and Bronze Tool; through Metal Tool into Wheel and Cart; through Trade into Town and City; and through Papyrus into Writing and Scribe. Metalworking, records, and maritime trade extend through Forge, Anvil, Law, Harbor, and Voyage. Its seven landmarks are Bronze, Wheel, Writing, City, Forge, Law, and Voyage; completing its age challenge requires all seven and 23 Bronze Age discoveries.

Bronze Age has 41 elements. Irrigation, Canal, Granary, Loom, Textile, and Balance extend water management, shared harvests, weaving, and measured exchange. Polity covers political communities without implying modern nations; Writing Reed covers early reed brushes and clay styluses rather than feather quills.

**Iron Age** (from c. 1200 BCE, with regional end dates) spans twenty-three elements and twenty-three recipes with Iron Age results, including Lens as an optional later discovery rather than a Stone Age glass technology. Discovering Bronze, Forge, Law, and City unlocks it and grants Iron Ore. Ironworking, roads, markets, Steel, Coin, Aqueduct, Empire, and Manuscript are joined by Blacksmith, Nail, Saw, Timber, Bridge, and Wagon for specialized workshops and heavier construction. Optional Rotary Quern, Lathe, and Alphabet branches add researched grinding, woodworking, and writing themes; their notes distinguish earlier precedents from regional evidence rather than dating all three inventions to this page. The age challenge still requires Iron, Iron Tool, Road, and Market plus six Iron Age discoveries, including the granted ore. All earlier matter remains available.

The expanded branches are optional: existing age unlocks, landmarks, discovery goals, and collection reward rules are unchanged. Existing saves retain their earned progress; catalog completion percentages now include the additional discoveries. Classical Antiquity is reserved for a later update, not a fifth playable age yet. Age assignments organize gameplay rather than claim exact invention dates.

## Gameplay Guide features

Society, Knowledge, and Transport join the original categories. Village and City are Society; Papyrus, Map, Writing, and Scribe are Knowledge; Wheel and Cart are Transport. Legacy saves containing reclassified Metal Tool, Glass, Papyrus, Map, or City unlock Bronze Age automatically.

The Guide includes active-era category completion, **Unstudied** markers for elements with unresolved outgoing uses, and a three-credit **Insight** wallet. Insights unlock after Origins or three distinct failures. Five new unique failures earn one credit, new discoveries reset the visible `0/5` stall meter, repeats do nothing, and a full wallet pauses at `4/5`. Unlocking an age and completing an age challenge each award one credit up to the cap.

Spending Insight reveals one lead without automatically performing it. Selection prioritizes unknown results from the active age, then cross-age formulas using active-age elements, then other unlocked discoveries. Every revealed but unperformed formula remains under **Open leads** regardless of the selected page.

Recorded formulas, eligible Open Leads, and Recent Experiments have prepare-only actions: they fill both slots without combining, spending Insight, or recording an attempt. Locked leads keep their result hidden and their prepare action disabled until the required age unlocks. The Guide retains the latest 50 complete experiments, including repeated pairs, with discovery, known-result, no-reaction, or locked outcomes. Empty-slot submissions and hint requests are excluded; locked outcomes do not reveal the result.

The searchable **Recorded Formulas** archive lists every performed formula whose result belongs to the active age, including alternate routes. Formula records remain available after their attempts leave Recent Experiments. Older saves with performed recipe IDs populate the archive without inventing experiment history; element-only saves do not imply that a formula was performed.

Five themed collections appear separately from category completion: **Stormwatch** (Mist, Cloud, Rain, Storm, Lightning), **Harvest Table** (Field, Crop, Flour, Dough, Bread), **Ironworkers** (Iron Ore, Bellows, Bloomery, Iron, Iron Tool), **Bronze Workshop**, and **Marks and Materials**. Each first completion awards +1 Insight, capped at three. Completing a collection with a full wallet still consumes its one-time reward; overflow is not banked. Loading a save does not award collection rewards. Educational objectives are described below.

<details>
<summary>Food-processing recipe example (spoilers)</summary>

Agriculture branches from Field into Crop. Crop + Heat creates broad Food, while Bread has one authored route: Crop + Tool → Flour, Flour + Water → Dough, and Dough + Heat → Bread.

</details>

## Rainmaker

Rainmaker is an isolated replay challenge targeting Rain, starting with only Fire, Water, Earth, and Air and allowing only recipes with Origins results, including the expanded Origins content. The existing four-attempt winning route is unchanged; the run still ends when Rain is discovered. Each complete combination counts as an attempt, including repeats and failures; empty submissions do not count. It has no campaign age unlocks or hints.

Challenge discoveries, formulas, experiments, and occupied slots do not change the campaign. A completed run changes campaign metadata only through explicit **Save result**: the first saved completion awards +1 Insight up to the three-credit cap and records the best attempt count. The reward is consumed even at a full wallet; later saved wins can improve the best score but never award another Insight. Returning, abandoning, or retrying does not copy challenge discoveries into the Atlas. Runs are transient: reloading abandons the run and returns to the campaign, with no active-run resume.

Save result waits for confirmed storage before acknowledging completion or granting its reward. Saving, Return, and Retry are disabled while confirmation is pending; a failed write leaves records and rewards untouched and permits retry unless save protection is latched.

## Historical Encyclopedia

Select **Atlas** in the application header to search and revisit discovered elements from any age in the **Historical Encyclopedia**. This optional section is independent of recipe research, formulas and hints. Undiscovered entries and their related-discovery links stay hidden. Following a related discovery changes only the local reading selection, not the active gameplay age or worktable.

Alternatively, inspect a discovered element in the Guide's **Element research** and choose **View History**. This opens that entry directly, clears any old historical search filter, and focuses its heading. Returning to Play restores the Guide selection, its View History control, and both worktable slots. The shortcut works with zero Insight and does not mark the entry as read; unresearched discoveries show the same honest missing-history message.

The total discovered encyclopedia count is independent of search results and the researched-entry reading counter. Desktop keeps the browsing index in a separate panel beside a wider historical article; mobile stacks the panels. Age/category labels, dated evidence, uncertainty, abstraction disclosures, and supporting sources remain distinct from gameplay formulas.

Search covers names, historical topics, regions, dates, and cited source titles, institutions, and authors. Matching is case-insensitive and every search word must match. Only discovered entries and their visible research are indexed: undiscovered related context, references used only by those hidden links, and pending further-research leads are excluded. Search and reading do not perform formulas or alter progression. Keyboard users can switch sections, search, select entries, and follow references; selection focuses the entry heading, search results are announced politely, and citation targets support focus. The layout wraps long research text and source titles on mobile.

The thirteen researched entries show regional dates and their meaning, geographical associations, manufacture/use, significance, evidence, independent developments, historical uncertainty and numbered references. Citations link each supported passage to source titles, authors/institutions, publication dates when known, and original URLs. Verification disclosures distinguish catalog metadata, selected passages and abstract-only access; pending sources do not support displayed references. Historical vocabulary and source titles can mention materials, but no unperformed formula pairs or preparation controls appear in this section.

Indicators distinguish documented evidence, hypotheses, contested interpretations, documented topic relationships and gameplay associations. Symbolic combinations are explicitly gameplay abstractions; age-placement notes identify earlier precedents or regional simplifications rather than imposing a worldwide timeline. Origins stays fictional and undated.

The remaining 134 discoveries show an honest **historical notes not yet researched** state, not invented dates or citations. Their existing description is labeled as gameplay text, not verified history. Reading costs no Insight and changes no discoveries or rewards. Opening a note never automatically records reading; the optional explicit marker described below is saved separately. Discovered notes remain available after reloading existing saves; resetting discoveries hides the corresponding entries immediately. Rainmaker remains separate from the campaign Guide.

## Educational gameplay

The Guide's **Learning Challenges** offers three optional, isolated labs from any age: **Harvest Lab**, **Bronze Lab**, and **Records Lab**. They reuse existing combinations and supplied discoveries to explore food processing, metallurgy, and record keeping without quizzes or memorized historical facts. Alternate routes remain valid, including a shorter records route and a longer writing-focused route. Supplied materials and earlier gameplay pages are puzzle foundations, not universal historical prerequisites.

Each lab has optional, free theme notes with existing verified references and their access limits. A successful combination unlocks that route's historical-context disclosure within the run. These notes distinguish documented background from simplified or symbolic combinations; they are not manufacturing instructions. Lab discoveries, attempts, and formulas never enter the campaign or unlock its encyclopedia entries. Rainmaker remains the same gameplay-only challenge and four-attempt route.

Saving a first completion earns the existing **one-time +1 Insight**, subject to the three-credit cap; later completions update the best attempt count without another reward. Reading is never required. Failed saves do not commit a completion or reward. In-flight runs are still unsaved.

Harvest Table gains educational context; Bronze Workshop and Marks and Materials connect later discoveries to earlier gameplay foundations. Undiscovered members remain anonymous, and only discovered members show their earlier page. Collection completion still means discovering every member, with the existing one-time capped +1 Insight reward, not reading notes.

In the Historical Encyclopedia, explicitly choose **Mark as read** or **Mark as unread** on a researched, discovered entry. The optional counter includes only discovered entries with researched notes, not unresearched gameplay descriptions. Opening entries, navigating related topics, and following references never automatically mark reading. Successfully saved markers survive reload and clear on reset; they cost no Insight and earn no reward. A failed marker write leaves the error visible in both Play and Atlas, and an in-memory reading marker is not a guarantee that it will survive reload. Historical explanations are available to everyone with the corresponding discovery; **Insight purchases recipe leads, never factual information**.

See [historical research](research.md) for evidence standards, [recipe review](recipe-review.md) for combination classifications, and [saves and settings](saves.md) for persistence behavior.
