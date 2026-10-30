import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { test, expect } from '@playwright/test'

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
const [elements, recipes, eras, collections] = await Promise.all([
  load('../src/game/content/elements.json'), load('../src/game/content/recipes.json'),
  load('../src/game/content/eras.json'), load('../src/game/content/collections.json'),
])
const saveKey = 'unwritten-atlas-progress'
const names = new Map(elements.map((element) => [element.id, element.name]))
const steamRecipe = recipes.find((recipe) => recipe.result === 'steam')
const archivedElements = [
  { id: 'achaemenid-satrapy', name: 'Achaemenid Satrapy' },
  { id: 'achaemenid-royal-road', name: 'Achaemenid Royal Road' },
  { id: 'achaemenid-fortification-tablets', name: 'Persepolis Fortification Tablets' },
]
const archivedRecipeIds = archivedElements.map((element) => `${element.id}-combination`)

// Synthetic campaign, never read from a player's browser. No app serializer or
// store methods are used to manufacture the expected roundtrip result.
function legacyFixture() {
  return {
    version: 7,
    discoveredIds: elements.map((element) => element.id),
    discoveredRecipeIds: recipes.map((recipe) => recipe.id),
    insightCredits: 0, insightFailureProgress: 2,
    rewardedChallengeEraIds: eras.map((era) => era.id),
    revealedHintRecipeIds: [], failedPairKeys: [],
    unlockedEraIds: eras.map((era) => era.id), activeEraId: 'classical-antiquity',
    favoriteIds: ['ember', 'clay-tablet'], soundEnabled: false,
    experimentHistory: [{
      id: 10, inputs: steamRecipe.inputs, outcome: 'known',
      resultId: steamRecipe.result, recipeId: steamRecipe.id,
    }],
    rewardedCollectionIds: collections.map((collection) => collection.id),
    challengeRecords: [
      { challengeId: 'rainmaker', completed: true, bestAttemptCount: 6 },
      { challengeId: 'commerce-lab', completed: true, bestAttemptCount: 2 },
    ],
    readHistoricalElementIds: ['ember', 'clay-tablet'],
    hideFinalElements: false, collapsedShelves: ['stone-age'],
  }
}

// Archived IDs and receipts are test data, not installed or playable content.
function archiveFixture(enabled) {
  const core = legacyFixture()
  const elementIds = archivedElements.map((element) => element.id)
  return {
    format: 'unwritten-atlas-module-save', envelopeVersion: 1,
    progress: {
      ...core,
      discoveredIds: [...core.discoveredIds, ...elementIds],
      discoveredRecipeIds: [...core.discoveredRecipeIds, ...archivedRecipeIds],
      favoriteIds: [...core.favoriteIds, ...elementIds],
      readHistoricalElementIds: [...core.readHistoricalElementIds, ...elementIds],
      rewardedCollectionIds: [...core.rewardedCollectionIds, 'achaemenid-connections'],
      challengeRecords: [...core.challengeRecords, {
        challengeId: 'achaemenid-courier-lab', completed: true, bestAttemptCount: 1,
      }],
      revealedHintRecipeIds: [archivedRecipeIds[0]],
      failedPairKeys: ['achaemenid-satrapy::ember'],
      experimentHistory: [...core.experimentHistory, {
        id: 11, inputs: ['ember', elementIds[0]], outcome: 'no-reaction',
      }],
      insightCredits: 2,
    },
    ownership: [{
      moduleId: 'achaemenid', version: '0.1.0', elementIds,
      recipeIds: archivedRecipeIds, researchElementIds: elementIds,
      collectionIds: ['achaemenid-connections'], challengeIds: ['achaemenid-courier-lab'],
    }],
    enabledModuleIds: enabled ? ['achaemenid'] : [],
  }
}

const stored = (page) => page.evaluate((key) => localStorage.getItem(key), saveKey)
const parsed = async (page) => JSON.parse(await stored(page))
const progress = (save) => save.progress ?? save

// Archive rebasing may reorder string-ID arrays; assert membership AND length,
// while keeping ordered experiment records and challenge records exact.
function comparable(save) {
  const copy = structuredClone(save)
  const data = progress(copy)
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) data[key].sort()
  }
  return copy
}

async function openSettings(page) {
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible()
}

async function confirmReload(page, name) {
  // Same-URL reload must really navigate; merely invoking a callback is not enough.
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name, exact: true }).click(),
  ])
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0)
}

async function importFile(page, path, { checkCancel = false } = {}) {
  await openSettings(page)
  const before = await stored(page)
  const input = page.getByLabel(/Import save file/)
  await input.setInputFiles(path)
  await expect(page.getByRole('heading', { name: 'Review save replacement' })).toBeVisible()
  expect(await stored(page)).toBe(before)
  if (checkCancel) {
    await page.getByRole('button', { name: 'Cancel replacement' }).click()
    expect(await stored(page)).toBe(before)
    await expect(page.getByRole('heading', { name: 'Review save replacement' })).toHaveCount(0)
    // Re-select the identical file, exercising the input reset after cancellation.
    await input.setInputFiles(path)
    await expect(page.getByRole('heading', { name: 'Review save replacement' })).toBeVisible()
    expect(await stored(page)).toBe(before)
  }
  await confirmReload(page, 'Replace all progress and reload')
}

async function seed(page, testInfo, fixture = legacyFixture()) {
  await page.goto('/')
  expect(await stored(page)).toBeNull()
  const path = testInfo.outputPath('isolated-v7-input.json')
  await writeFile(path, JSON.stringify(fixture))
  await importFile(page, path)
  expect(await parsed(page)).toEqual(fixture.format ? { ...fixture, enabledModuleIds: [] } : fixture)
  return fixture
}

async function combine(page, recipe) {
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const table = page.getByRole('main', { name: 'What will you make?' })
  const clear = table.getByRole('button', { name: 'Clear table', exact: true })
  if (await clear.count()) await clear.click()
  const search = page.getByRole('searchbox', { name: /^Search discovered elements/ })
  const shelf = page.getByRole('region', { name: 'Matching discovered elements', exact: true })
  for (const id of recipe.inputs) {
    await search.fill(names.get(id))
    await shelf.getByRole('button', { name: names.get(id), exact: true }).click()
  }
  await table.getByRole('button', { name: 'Combine', exact: true }).click()
  await search.fill('')
  await expect.poll(async () => progress(await parsed(page)).discoveredRecipeIds).toContain(recipe.id)
}

async function saveLab(page) {
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  const title = 'Commerce Lab'
  await page.getByRole('button', { name: `Play ${title}`, exact: true }).click()
  const before = await stored(page)
  const route = [['Bronze', 'Market'], ['Coin', 'Forge']]
  for (const pair of route) {
    for (const name of pair) await page.getByRole('button', { name: `Challenge ${name}`, exact: true }).click()
    await page.getByRole('button', { name: 'Combine challenge elements', exact: true }).click()
  }
  expect(await stored(page)).toBe(before) // An isolated run pays only on Save result.
  await page.getByRole('button', { name: 'Save result', exact: true }).click()
  await expect(page.getByText('Result saved. No additional reward.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Return to Challenges', exact: true }).click()
}

async function downloadSave(page, testInfo) {
  await openSettings(page)
  const before = await stored(page)
  const event = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export saved progress', exact: true }).click()
  const download = await event
  expect(download.suggestedFilename()).toBe('unwritten-atlas-save.json')
  expect(await download.failure()).toBeNull()
  const path = testInfo.outputPath('unwritten-atlas-save.json')
  await download.saveAs(path)
  const bytes = await readFile(path)
  expect(bytes.equals(Buffer.from(before, 'utf8'))).toBe(true)
  expect(await stored(page)).toBe(before)
  await testInfo.attach('actual-downloaded-save', { path, contentType: 'application/json' })
  await testInfo.attach('download-evidence', {
    body: JSON.stringify({
      browserVersion: page.context().browser().version(),
      suggestedFilename: download.suggestedFilename(), bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    }, null, 2), contentType: 'application/json',
  })
  return { path, expected: JSON.parse(before), raw: before }
}

async function restoreInFreshContext(browser, baseURL, backup, testInfo, check) {
  const context = await browser.newContext({ baseURL, acceptDownloads: true })
  try {
    const page = await context.newPage()
    await page.goto('/')
    expect(await stored(page)).toBeNull()
    await importFile(page, backup.path, { checkCancel: true })
    expect(comparable(await parsed(page))).toEqual(comparable(backup.expected))
    // Confirm the restored runtime loaded the requested catalog, not just storage.
    await check(page)
    const before = await stored(page)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeVisible()
    expect(await stored(page)).toBe(before)
    expect(comparable(await parsed(page))).toEqual(comparable(backup.expected))
    await check(page)
    await testInfo.attach('restored-browser', { body: await page.screenshot(), contentType: 'image/png' })
    return await parsed(page)
  } finally {
    await context.close()
  }
}

async function checkCoreUI(page) {
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const coreFormulaCount = recipes.filter((recipe) =>
    elements.find((element) => element.id === recipe.result).era === 'classical-antiquity').length
  await expect(page.getByText(`Recorded Formulas (${coreFormulaCount})`, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unfavorite Fire', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unfavorite Clay Tablet', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Atlas', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open historical entry for Fire (read)', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Rainmaker', exact: true })).toContainText('6 attempts')
  await expect(page.getByRole('article', { name: 'Commerce Lab', exact: true })).toContainText('2 attempts')
}

async function checkArchiveUI(page) {
  await checkCoreUI(page)
  const lab = page.getByRole('button', { name: 'Play Imperial Communications', exact: true })
  await expect(lab).toHaveCount(0)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const collection = page.getByRole('list', { name: 'Collection goals', exact: true })
    .getByRole('listitem').filter({ hasText: 'Imperial Connections' })
  await expect(collection).toHaveCount(0)
  await expect(page.getByRole('combobox', { name: 'Region', exact: true })).toHaveCount(0)
  for (const element of archivedElements) {
    const favorite = page.getByRole('button', { name: `Unfavorite ${element.name}`, exact: true })
    await expect(favorite).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Atlas', exact: true }).click()
  for (const element of archivedElements) {
    const entry = page.getByRole('button', { name: `Open historical entry for ${element.name} (read)`, exact: true })
    await expect(entry).toHaveCount(0)
  }
  await openSettings(page)
  await expect(page.getByRole('group', { name: 'Regional Modules', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^(Enable|Disable) / })).toHaveCount(0)
  await page.getByRole('button', { name: 'Close settings', exact: true }).click()
}

test('legacy v7: actual download → file input → confirmed reload → independent reload', async ({ page, browser, baseURL }, testInfo) => {
  const fixture = await seed(page, testInfo)
  const backup = await downloadSave(page, testInfo)
  expect(backup.expected).toEqual(fixture)
  await restoreInFreshContext(browser, baseURL, backup, testInfo, checkCoreUI)
  // A restored receipt must suppress duplicate payouts with room in the wallet.
  await page.getByRole('button', { name: 'Close settings' }).click()
  await importFile(page, backup.path)
  await saveLab(page)
  expect(await parsed(page)).toEqual(fixture)
})

for (const enabled of [true, false]) {
  test(`legacy archive (formerly ${enabled ? 'enabled' : 'disabled'}): real backup preserves inactive progress with base-only gameplay`, async ({ page, browser, baseURL }, testInfo) => {
    const fixture = await seed(page, testInfo, archiveFixture(enabled))
    await checkArchiveUI(page)
    await combine(page, steamRecipe)
    const afterPlay = progress(await parsed(page))
    for (const key of ['discoveredIds', 'discoveredRecipeIds', 'favoriteIds', 'readHistoricalElementIds',
      'rewardedCollectionIds', 'challengeRecords', 'insightCredits', 'revealedHintRecipeIds', 'failedPairKeys',
      'rewardedChallengeEraIds', 'unlockedEraIds', 'activeEraId', 'soundEnabled', 'collapsedShelves']) {
      expect(comparable(afterPlay)[key]).toEqual(comparable(fixture.progress)[key])
    }
    expect(afterPlay.experimentHistory).toContainEqual(fixture.progress.experimentHistory[1])
    const backup = await downloadSave(page, testInfo)
    await restoreInFreshContext(browser, baseURL, backup, testInfo, checkArchiveUI)

    // Replace a different current save too: total replacement, not a hidden merge.
    await page.getByRole('button', { name: 'Close settings' }).click()
    const decoy = structuredClone(backup.expected)
    decoy.progress.favoriteIds = ['tide']
    decoy.progress.readHistoricalElementIds = []
    const decoyPath = testInfo.outputPath('isolated-decoy.json')
    await writeFile(decoyPath, JSON.stringify(decoy))
    await importFile(page, decoyPath)
    expect((await parsed(page)).progress.favoriteIds).toEqual(['tide'])
    await importFile(page, backup.path, { checkCancel: true })
    expect(comparable(await parsed(page))).toEqual(comparable(backup.expected))
    await checkArchiveUI(page)
    const beforeRepeat = await parsed(page)
    await saveLab(page)
    expect(comparable(await parsed(page))).toEqual(comparable(beforeRepeat))
    await combine(page, steamRecipe)
    expect((await parsed(page)).progress.insightCredits).toBe(2)
    expect((await parsed(page)).progress.rewardedCollectionIds).toEqual(beforeRepeat.progress.rewardedCollectionIds)
    await page.reload()
    await checkArchiveUI(page)
    await testInfo.attach('base-only-browser', { body: await page.screenshot(), contentType: 'image/png' })
  })
}
