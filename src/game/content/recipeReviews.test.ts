import { describe, expect, it } from 'vitest'
import { recipes } from './index'
import { createRecipeReviewsSchema, recipeReviews, reviewsByRecipeId } from './recipeReviews'
import { historicalResearch } from './research'

const schema = createRecipeReviewsSchema(recipes, historicalResearch.sources)
const fixture = () => structuredClone(recipeReviews)

describe('historical recipe review', () => {
  it('covers every recipe exactly once, including alternate routes', () => {
    expect(schema.parse(recipeReviews)).toEqual(recipeReviews)
    expect(recipeReviews.reviews).toHaveLength(recipes.length)
    expect(new Set(recipeReviews.reviews.map((review) => review.recipeId)))
      .toEqual(new Set(recipes.map((recipe) => recipe.id)))
    expect(recipeReviews.reviews.filter((review) => review.classification === 'material-process')).toHaveLength(16)
    expect(recipeReviews.reviews.filter((review) => review.classification === 'simplified-process')).toHaveLength(114)
    expect(recipeReviews.reviews.filter((review) => review.classification === 'symbolic')).toHaveLength(161)
  })

  it('preserves the pre-audit IDs, input pairs, results and order', async () => {
    const graph = recipes.slice(0, 178).map((recipe) => [recipe.id, ...recipe.inputs, recipe.result])
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(graph)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
      .toBe('2b61adfef961ea0ef755f72bdfe192766d3082184dd5cd59b0480badef2674a9')
  })

  it('preserves every recipe from the initial Classical Antiquity chapter', async () => {
    const graph = recipes.slice(0, 194).map((recipe) => [recipe.id, ...recipe.inputs, recipe.result])
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(graph)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
      .toBe('ca18166cc2bd9e1877998d8a861cb1acb998003abe0af1cf3e27100396ef4ec4')
  })

  it('preserves all routes preceding the optional Citizenship addition', async () => {
    const graph = recipes.slice(0, 211).map((recipe) => [recipe.id, ...recipe.inputs, recipe.result])
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(graph)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
      .toBe('ed57607d760c4a44fd4b0cf63a114d3c20c836f9db47a259e4b6a38ba1899872')
  })

  it('reviews every expansion route as symbolic with verified historical background', () => {
    const expansion = recipes.slice(194, 216)
    expect(expansion).toHaveLength(22)
    for (const recipe of expansion) {
      const review = reviewsByRecipeId.get(recipe.id)!
      expect(review.classification).toBe('symbolic')
      expect(review.sourceIds.length).toBeGreaterThan(0)
    }
    expect(reviewsByRecipeId.get('studied-birds')?.caution).toContain('modern scientific findings')
    expect(reviewsByRecipeId.get('spanning-masonry')?.caution).toContain('Not every aqueduct uses arches')
    expect(reviewsByRecipeId.get('republican-institutions')?.caution).toContain('unequal civic rights')
  })

  it('preserves all routes through Citizenship before the intellectual expansion', async () => {
    const graph = recipes.slice(0, 212).map((recipe) => [recipe.id, ...recipe.inputs, recipe.result])
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(graph)))
    expect(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
      .toBe('39e35d79f129fc54bf82bdf8f76fc33f544da451582da30b54c317cb00c32e8e')
  })

  it.each(['missing', 'duplicate', 'unknown'] as const)('rejects %s recipe reviews', (kind) => {
    const data = fixture()
    if (kind === 'missing') data.reviews.pop()
    if (kind === 'duplicate') data.reviews.push(structuredClone(data.reviews[0]))
    if (kind === 'unknown') data.reviews[0].recipeId = 'unreviewed-recipe'
    expect(schema.safeParse(data).success).toBe(false)
  })

  it.each(['unknown', 'pending', 'duplicate'] as const)('rejects %s source references', (kind) => {
    const data = fixture()
    data.reviews[0].sourceIds = kind === 'unknown' ? ['unknown-source']
      : kind === 'pending' ? ['bm-scribal-palette']
        : ['smithsonian-hearths', 'smithsonian-hearths']
    expect(schema.safeParse(data).success).toBe(false)
  })

  it('rejects empty cautions, unsupported classifications, versions and extra fields', () => {
    const data = fixture()
    data.reviews[0].caution = ' '
    expect(schema.safeParse(data).success).toBe(false)
    expect(schema.safeParse({
      ...recipeReviews,
      reviews: [{ ...recipeReviews.reviews[0], classification: 'verified-invention' }, ...recipeReviews.reviews.slice(1)],
    }).success).toBe(false)
    expect(schema.safeParse({ ...recipeReviews, schemaVersion: 2 }).success).toBe(false)
    expect(schema.safeParse({ ...recipeReviews, inventedDate: '5000 BCE' }).success).toBe(false)
  })

  it.each([
    ['concentrated-flame', 'symbolic', 'fire-making', 'smithsonian-hearths'],
    ['first-edge', 'simplified-process', 'hominin', 'smithsonian-stone-tools'],
    ['baked-dough', 'material-process', 'farming', 'prehistoric-bread'],
    ['shaped-clay', 'simplified-process', 'before farming', 'xianrendong-pottery'],
    ['smelted-copper', 'simplified-process', 'reduction', 'penn-metallurgy'],
    ['alloyed-bronze', 'simplified-process', 'composition', 'penn-tin'],
    ['written-marks', 'simplified-process', 'clay', 'writing-origins'],
    ['bound-scroll', 'simplified-process', 'join sheets', 'um-papyrus'],
    ['guided-voyage', 'simplified-process', 'not a magnetic compass', 'rmg-wayfinding'],
    ['smelted-iron', 'simplified-process', 'slag', 'nps-bloomery'],
    ['opened-road', 'simplified-process', 'without iron', 'sweet-track'],
    ['roadside-market', 'symbolic', 'predate', 'whe-trade'],
    ['rotating-grindstone', 'symbolic', 'not a vehicle component', 'northampton-quern'],
    ['turning-workshop', 'symbolic', 'proposed identification', 'sitry-lathe-pivots'],
    ['alphabetic-signs', 'symbolic', 'not an inevitable progression', 'penn-alphabet'],
    ['rotary-flour', 'material-process', 'not every cultivated plant', 'northampton-quern'],
    ['alphabetic-manuscript', 'simplified-process', 'not universal prerequisites', 'um-papyrus'],
    ['fossilized-remains', 'symbolic', 'geological time', 'nhm-fossils'],
    ['avian-lineage', 'symbolic', 'not all birds fly', 'nhm-bird-evolution'],
    ['transport-amphora', 'symbolic', 'predate Classical Antiquity', 'aha-amphora-trade'],
    ['calcined-lime', 'simplified-process', 'calcium oxide and carbon dioxide', 'epa-lime-manufacturing'],
    ['athenian-agora', 'symbolic', 'describe every Mediterranean city', 'ascsa-agora'],
    ['recorded-academy', 'symbolic', 'founded Plato', 'sep-aristotle'],
    ['lyceum-studies', 'symbolic', 'neither founded the school', 'sep-aristotle'],
    ['attentive-cloud', 'symbolic', 'single scientific method', 'sep-presocratics'],
    ['nature-and-record', 'symbolic', 'should not flatten differences', 'sep-presocratics'],
    ['archived-fossil', 'symbolic', 'does not recreate its collection', 'mycenae-fossil-study'],
    ['examined-remains', 'symbolic', 'does not establish that fossils inspired', 'herodotus-winged-serpents'],
    ['civic-membership', 'symbolic', 'not a procedure for granting it', 'sep-aristotle-politics'],
  ])('qualifies the priority chain %s without inventing chronology', (recipeId, classification, caution, sourceId) => {
    const review = reviewsByRecipeId.get(recipeId)!
    expect(review.classification).toBe(classification)
    expect(review.caution).toContain(caution)
    expect(review.sourceIds).toContain(sourceId)
  })

  it('corrects carburization versus tempering without attaching an unrelated source', () => {
    const review = reviewsByRecipeId.get('carbon-tempered-iron')!
    expect(review.caution).toContain('carburization; tempering is a separate heat treatment')
    expect(review.sourceIds).toEqual([])
    expect(recipes.find((recipe) => recipe.id === review.recipeId)?.flavor)
      .toContain('carburization is not tempering')
  })
})
