# Historical technology and recipe review

[Back to the project overview](../README.md)

The current catalog contains **178 recipes**, rather than the earlier 146. Every route has an individual review in [`recipeReviews.json`](../src/game/content/recipeReviews.json), validated by [`recipeReviews.ts`](../src/game/content/recipeReviews.ts). This companion dataset changes no recipe IDs, pairs, results, age gates, rewards or save fields, and preserves alternate discovery routes.

## Classifications

| Classification | Count | Meaning |
| --- | ---: | --- |
| Material process | 13 | The pair evokes an actual transformation or working operation, not a complete procedure or an invention date. |
| Simplified process | 90 | A plausible operation is abbreviated, with missing conditions, stages or materials stated explicitly. |
| Symbolic association | 75 | A conceptual, social or fictional link; it must not be read as historical causation. |

## Player-facing context

Performed formulas have an optional **Historical context** disclosure in both Recorded Formulas and selected-element research. Each formula unlocks its own note; discovering a result does not reveal unperformed alternate routes. Notes do not appear in Open Leads or locked/unsuccessful experiments, and stay separate from the element encyclopedia. Reading changes no worktable slots, Insight, progress or storage.

The audit separates maintaining fire from making it; stone tool evidence from identifying its makers; food processing and early pottery from agricultural prerequisites; drying mud brick from firing ceramics; ore reduction from ordinary heating; alloy composition, casting and working from universal strength claims; papyrus sheets and joined rolls from writing's independent traditions; and maritime knowledge from magnetic navigation. It distinguishes bloomery iron from liquid cast iron and carburization from tempering, and flags earlier precedents for harvesting implements, roads, exchange and worked timber. Institutional recipes remain abstractions, not automatic city, currency or empire creation.

## Reference limits

References reuse the central source registry and show the original URL, credited authors/institutions and passage-access limits. **73 recipe notes have background references; 105 have no attached source.** The Xianrendong paper was reviewed only through its abstract; proposed cooking use is not established. The Viking ship page is a later comparison, not evidence for a Bronze Age construction method. Sources support the specific background discussed, **not proof of an exact two-input recipe**. Uncited technical or interpretive cautions explicitly say they are not sourced historical reconstructions. Auditing all routes does not mean all element histories have been researched.

Validation rejects missing, duplicate or unknown recipe reviews, empty cautions, invalid classifications and dangling, duplicate or pending source references. [`recipeReviews.test.ts`](../src/game/content/recipeReviews.test.ts) also pins the pre-audit recipe graph and checks priority-chain cautions. Original-source checking remains necessary; schema validation cannot establish historical truth.

See [historical research](research.md) for evidence standards and [educational gameplay](gameplay.md#educational-gameplay) for optional learning labs.
