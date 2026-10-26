import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { test, expect } from '@playwright/test'

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
const [elements, recipes, eras, collections, pack] = await Promise.all([
  load('../src/game/content/elements.json'), load('../src/game/content/recipes.json'),
  load('../src/game/content/eras.json'), load('../src/game/content/collections.json'),
  load('../src/game/modules/achaemenid/pack.json'),
])
const saveKey = 'unwritten-atlas-progress'
const names = new Map([...elements, ...pack.elements].map((element) => [element.id, element.name]))
const steamRecipe = recipes.find((recipe) => recipe.result === 'steam')

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

async function seed(page, testInfo) {
  await page.goto('/')
  expect(await stored(page)).toBeNull()
  const fixture = legacyFixture()
  const path = testInfo.outputPath('isolated-v7-input.json')
  await writeFile(path, JSON.stringify(fixture))
  await importFile(page, path)
  expect(await parsed(page)).toEqual(fixture)
  return fixture
}

async function switchModule(page, enabled, checkCancel = false) {
  await openSettings(page)
  const before = await stored(page)
  const button = page.getByRole('button', {
    name: `${enabled ? 'Enable' : 'Disable'} ${pack.manifest.title}`, exact: true,
  })
  await button.click()
  await expect(page.getByRole('heading', { name: 'Review regional module change' })).toBeVisible()
  expect(await stored(page)).toBe(before)
  if (checkCancel) {
    await expect(page.getByText(/Older releases cannot read it/)).toBeVisible()
    await page.getByRole('button', { name: 'Cancel replacement' }).click()
    expect(await stored(page)).toBe(before)
    await button.click()
    await expect(page.getByRole('heading', { name: 'Review regional module change' })).toBeVisible()
  }
  await confirmReload(page, 'Confirm module change and reload')
  expect((await parsed(page)).enabledModuleIds).toEqual(enabled ? ['achaemenid'] : [])
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

async function saveLab(page, regional, repeated = false) {
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  const title = regional ? 'Imperial Communications' : 'Commerce Lab'
  await page.getByRole('button', { name: `Play ${title}`, exact: true }).click()
  const before = await stored(page)
  const route = regional
    ? [['Road Network', 'Imperial Bureaucracy']]
    : [['Bronze', 'Market'], ['Coin', 'Forge']]
  for (const pair of route) {
    for (const name of pair) await page.getByRole('button', { name: `Challenge ${name}`, exact: true }).click()
    await page.getByRole('button', { name: 'Combine challenge elements', exact: true }).click()
  }
  expect(await stored(page)).toBe(before) // An isolated run pays only on Save result.
  await page.getByRole('button', { name: 'Save result', exact: true }).click()
  await expect(page.getByText(repeated
    ? 'Result saved. No additional reward.' : 'Result saved. First reward: +1 Insight.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Return to Challenges', exact: true }).click()
}

async function prepareRegionalCampaign(page) {
  await switchModule(page, true, true)
  for (const recipe of pack.recipes) {
    await combine(page, recipe)
    await page.getByRole('button', { name: `Favorite ${names.get(recipe.result)}`, exact: true }).click()
  }
  await page.getByRole('button', { name: 'Atlas', exact: true }).click()
  for (const element of pack.elements) {
    await page.getByRole('button', { name: `Open historical entry for ${element.name}`, exact: true }).click()
    await page.getByRole('button', { name: `Mark ${element.name} as read`, exact: true }).click()
  }
  await saveLab(page, true)
  const result = await parsed(page)
  expect(result.progress.insightCredits).toBe(2) // Collection + lab, below cap to expose double payment.
  expect(result.progress.rewardedCollectionIds).toContain('achaemenid-connections')
  expect(result.progress.challengeRecords).toContainEqual({
    challengeId: 'achaemenid-courier-lab', completed: true, bestAttemptCount: 1,
  })
  for (const element of pack.elements) {
    expect(result.progress.discoveredIds).toContain(element.id)
    expect(result.progress.favoriteIds).toContain(element.id)
    expect(result.progress.readHistoricalElementIds).toContain(element.id)
  }
  return result
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

async function checkCoreUI(page, regionalEnabled = false) {
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const coreFormulaCount = recipes.filter((recipe) =>
    elements.find((element) => element.id === recipe.result).era === 'classical-antiquity').length
  await expect(page.getByText(`Recorded Formulas (${coreFormulaCount + (regionalEnabled ? pack.recipes.length : 0)})`, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unfavorite Fire', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unfavorite Clay Tablet', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Atlas', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open historical entry for Fire (read)', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Challenges', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Rainmaker', exact: true })).toContainText('6 attempts')
  await expect(page.getByRole('article', { name: 'Commerce Lab', exact: true })).toContainText('2 attempts')
}

async function checkRegionalUI(page, enabled) {
  await checkCoreUI(page, enabled)
  const lab = page.getByRole('button', { name: 'Play Imperial Communications', exact: true })
  if (enabled) {
    await expect(lab).toBeVisible()
    await expect(page.getByRole('article', { name: 'Imperial Communications', exact: true })).toContainText('1 attempts')
  }
  else await expect(lab).toHaveCount(0)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const collection = page.getByRole('list', { name: 'Collection goals', exact: true })
    .getByRole('listitem').filter({ hasText: 'Imperial Connections' })
  if (enabled) await expect(collection).toContainText('+1 Insight reward earned')
  else await expect(collection).toHaveCount(0)
  for (const element of pack.elements) {
    const favorite = page.getByRole('button', { name: `Unfavorite ${element.name}`, exact: true })
    if (enabled) await expect(favorite).toBeVisible()
    else await expect(favorite).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Atlas', exact: true }).click()
  for (const element of pack.elements) {
    const entry = page.getByRole('button', { name: `Open historical entry for ${element.name} (read)`, exact: true })
    if (enabled) await expect(entry).toBeVisible()
    else await expect(entry).toHaveCount(0)
  }
}

test('legacy v7: actual download → file input → confirmed reload → independent reload', async ({ page, browser, baseURL }, testInfo) => {
  const fixture = await seed(page, testInfo)
  const backup = await downloadSave(page, testInfo)
  expect(backup.expected).toEqual(fixture)
  await restoreInFreshContext(browser, baseURL, backup, testInfo, checkCoreUI)
  // A restored receipt must suppress duplicate payouts with room in the wallet.
  await page.getByRole('button', { name: 'Close settings' }).click()
  await importFile(page, backup.path)
  await saveLab(page, false, true)
  expect(await parsed(page)).toEqual(fixture)
})

for (const enabled of [true, false]) {
  test(`module archive (${enabled ? 'enabled' : 'disabled'}): real downloaded backup preserves complete regional progress and rewards`, async ({ page, browser, baseURL }, testInfo) => {
    const fixture = await seed(page, testInfo)
    const regional = await prepareRegionalCampaign(page)
    // Core fields survive the deliberate legacy → archive migration and play.
    for (const key of ['rewardedChallengeEraIds', 'unlockedEraIds', 'activeEraId', 'soundEnabled', 'collapsedShelves']) {
      expect(regional.progress[key]).toEqual(fixture[key])
    }
    if (!enabled) {
      await switchModule(page, false)
      expect(comparable(progress(await parsed(page)))).toEqual(comparable(regional.progress))
      await checkRegionalUI(page, false)
      await combine(page, steamRecipe) // Exercise the ordinary dormant rebase writer.
      const afterPlay = progress(await parsed(page))
      for (const key of ['discoveredIds', 'discoveredRecipeIds', 'favoriteIds', 'readHistoricalElementIds', 'rewardedCollectionIds', 'challengeRecords', 'insightCredits']) {
        expect(comparable(afterPlay)[key]).toEqual(comparable(regional.progress)[key])
      }
    }
    const backup = await downloadSave(page, testInfo)
    await restoreInFreshContext(browser, baseURL, backup, testInfo,
      (restored) => checkRegionalUI(restored, enabled))

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
    if (!enabled) {
      await switchModule(page, true)
      expect(comparable((await parsed(page)).progress)).toEqual(comparable(backup.expected.progress))
    }
    await checkRegionalUI(page, true)
    const beforeRepeat = await parsed(page)
    await saveLab(page, true, true)
    expect(comparable(await parsed(page))).toEqual(comparable(beforeRepeat))
    await combine(page, pack.recipes[0])
    expect((await parsed(page)).progress.insightCredits).toBe(2)
    expect((await parsed(page)).progress.rewardedCollectionIds).toEqual(beforeRepeat.progress.rewardedCollectionIds)
    await page.reload()
    await checkRegionalUI(page, true)
    await testInfo.attach('reactivated-browser', { body: await page.screenshot(), contentType: 'image/png' })
  })
}
