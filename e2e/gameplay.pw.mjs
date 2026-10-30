import { readFile } from 'node:fs/promises'
import { test as base, expect } from '@playwright/test'
import { learningChallenges, rainmakerChallenge } from '../src/game/content/challenges.ts'

const load = async (name) => JSON.parse(await readFile(new URL(`../src/game/content/${name}.json`, import.meta.url), 'utf8'))
const [elements, recipes, eras, collections] = await Promise.all(['elements', 'recipes', 'eras', 'collections'].map(load))
const names = new Map(elements.map((element) => [element.id, element.name]))
const elementEras = new Map(elements.map((element) => [element.id, element.era]))
const saveKey = 'unwritten-atlas-progress'
const stored = (page) => page.evaluate((key) => localStorage.getItem(key), saveKey)
const progress = async (page) => JSON.parse(await stored(page))
const shelf = (page) => page.getByRole('complementary', { name: 'Element shelf' })
const result = (page) => page.locator('.attempt-result')
const navigation = (page) => page.getByRole('navigation', { name: 'Main navigation' })

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await use(page)
    expect(errors, 'uncaught browser errors').toEqual([])
  },
})

async function select(page, id, { keyboard = false, touch = false } = {}) {
  const mobileElements = page.getByRole('button', { name: 'Show Elements panel' })
  if (await mobileElements.isVisible()) await mobileElements.click()
  await page.getByRole('searchbox', { name: 'Search discovered elements' }).fill(names.get(id))
  const tile = shelf(page).getByRole('button', { name: names.get(id), exact: true })
  if (keyboard) {
    await tile.focus()
    await page.keyboard.press('Enter')
  } else if (touch) {
    await tile.tap()
  } else {
    await tile.click()
  }
}

async function combine(page, inputs, options) {
  const clear = page.getByRole('button', { name: 'Clear table', exact: true })
  if (await clear.isVisible()) await clear.click()
  for (const id of inputs) await select(page, id, options)
  await page.getByRole('button', { name: 'Combine', exact: true }).click()
}

function challengeRoute(challenge) {
  const known = new Set(challenge.starterIds)
  const route = []
  while (!known.has(challenge.targetId)) {
    const recipe = recipes.find((candidate) =>
      !known.has(candidate.result) &&
      challenge.allowedResultEraIds.includes(elementEras.get(candidate.result)) &&
      candidate.inputs.every((id) => known.has(id)),
    )
    expect(recipe, `reachable target for ${challenge.name}`).toBeTruthy()
    route.push(recipe)
    known.add(recipe.result)
  }
  return route
}

test('fresh campaign: keyboard discovery, failures, leads, formulas, Atlas, settings and reset', async ({ page }) => {
  await page.goto('/')
  await expect(shelf(page).locator('.element-tile')).toHaveCount(4)
  const pristine = await stored(page)
  for (const section of ['Atlas', 'Challenges', 'Play']) {
    await navigation(page).getByRole('button', { name: section, exact: true }).click()
  }
  expect(await stored(page)).toBe(pristine)

  await page.getByRole('button', { name: 'Combine', exact: true }).click()
  await expect(result(page)).toContainText('Two essences are required')
  expect(await stored(page)).toBe(pristine)
  await combine(page, ['ember', 'tide'], { keyboard: true })
  await expect(result(page)).toContainText('Discovered Steam')
  await combine(page, ['tide', 'ember'])
  await expect(result(page)).toHaveAttribute('data-kind', 'known')
  const discovery = await progress(page)
  expect(discovery.discoveredRecipeIds).toHaveLength(1)
  expect(discovery.experimentHistory.map((entry) => entry.outcome)).toEqual(['discovery', 'known'])

  for (const inputs of [['ember', 'steam'], ['tide', 'gale'], ['tide', 'steam']]) {
    await combine(page, inputs)
    await expect(result(page)).toContainText('No resonance')
  }
  await combine(page, ['steam', 'ember'])
  await expect(result(page)).toContainText('already tested')
  expect((await progress(page)).failedPairKeys).toHaveLength(3)
  await page.getByRole('button', { name: 'Reveal lead', exact: true }).click()
  expect((await progress(page)).insightCredits).toBe(2)
  const openLead = page.locator('.open-leads li').first()
  await openLead.getByRole('button', { name: /^Prepare / }).click()
  await page.getByRole('button', { name: 'Combine', exact: true }).click()
  await expect(result(page)).not.toHaveAttribute('data-kind', 'failure')

  await page.getByText(/^Recorded Formulas \(/).click()
  await page.getByRole('searchbox', { name: 'Search formulas' }).fill('Steam')
  const formula = page.getByRole('list', { name: 'Recorded formula archive' })
  await expect(formula.locator('li.formula-card')).toHaveCount(1)
  await formula.getByRole('button', { name: /^Prepare / }).click()
  await expect(page.getByRole('button', { name: 'Remove Fire', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remove Water', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear table', exact: true }).click()

  await page.getByRole('button', { name: 'Inspect Fire', exact: true }).click()
  await page.getByRole('button', { name: 'View history of Fire', exact: true }).click()
  await expect(page.locator('#atlas-history-title')).toBeFocused()
  const beforeReading = await progress(page)
  await page.getByRole('button', { name: 'Mark Fire as read', exact: true }).click()
  expect((await progress(page)).insightCredits).toBe(beforeReading.insightCredits)
  await expect(page.getByRole('button', { name: 'Open historical entry for Fire (read)', exact: true })).toBeVisible()
  const citation = page.locator('.history-entry a[href^="#history-source-"]').first()
  const target = await citation.getAttribute('href')
  await citation.click()
  await expect(page.locator(target)).toBeFocused()
  await navigation(page).getByRole('button', { name: 'Challenges', exact: true }).click()
  await navigation(page).getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByRole('button', { name: 'View history of Fire', exact: true })).toBeFocused()

  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Close settings', exact: true })).toBeFocused()
  await page.getByRole('checkbox', { name: 'Sound', exact: true }).uncheck()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Unmute sound', exact: true })).toBeVisible()
  expect((await progress(page)).readHistoricalElementIds).toContain('ember')
  const beforeReset = await stored(page)
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'Reset journal', exact: true }).click()
  expect(await stored(page)).toBe(beforeReset)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset journal', exact: true }).click()
  await expect(shelf(page).locator('.element-tile')).toHaveCount(4)
  expect((await progress(page)).discoveredRecipeIds).toEqual([])
  expect((await progress(page)).soundEnabled).toBe(false)
})

test('shelf preferences, repeat, pointer dragging and keyboard dragging reach both vessels', async ({ page }) => {
  await page.goto('/')
  await shelf(page).getByRole('button', { name: 'Favorite Fire', exact: true }).click()
  await shelf(page).getByRole('button', { name: 'Starred', exact: true }).click()
  await expect(shelf(page).locator('.element-tile')).toHaveCount(1)
  await shelf(page).getByRole('button', { name: 'Compact layout', exact: true }).click()
  await select(page, 'tide')
  await expect(shelf(page).getByRole('button', { name: 'Water', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Use Water again', exact: true }).click()
  await expect(page.locator('.table-slot[data-filled="true"]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Remove Water', exact: true }).first().click()
  await expect(page.locator('.table-slot[data-filled="true"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Clear table', exact: true }).click()
  await shelf(page).getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(shelf(page).locator('.element-tile')).toHaveCount(4)
  await shelf(page).getByRole('button', { name: 'Hide Mastered', exact: true }).click()
  const drawer = shelf(page).getByRole('button', { name: /^Origins/ })
  await drawer.click()
  await expect(drawer).toHaveAttribute('aria-expanded', 'false')
  await page.reload()
  await expect(shelf(page).getByRole('button', { name: 'Hide Mastered', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(shelf(page).getByRole('button', { name: /^Origins/ })).toHaveAttribute('aria-expanded', 'false')
  await shelf(page).getByRole('button', { name: 'Clear filters', exact: true }).click()
  await shelf(page).getByRole('button', { name: /^Origins/ }).click()

  const tile = shelf(page).getByRole('button', { name: 'Fire', exact: true })
  const firstSlot = page.locator('.table-slot').first()
  const secondSlot = page.locator('.table-slot').last()
  await tile.scrollIntoViewIfNeeded()
  const from = await tile.boundingBox()
  const to = await firstSlot.boundingBox()
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 })
  await expect(page.locator('.drag-preview')).toBeVisible()
  expect(await shelf(page).locator('.codex-results').evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true)
  await page.mouse.up()
  await expect(firstSlot).toContainText('Fire')

  await tile.focus()
  await page.keyboard.press('Space')
  await expect(tile).toHaveAttribute('data-dragging', 'true')
  const destination = await secondSlot.boundingBox()
  const origin = await tile.boundingBox()
  const dx = Math.round((destination.x + destination.width / 2 - origin.x - origin.width / 2) / 25)
  const dy = Math.round((destination.y + destination.height / 2 - origin.y - origin.height / 2) / 25)
  for (let step = 0; step < Math.abs(dx); step++) await page.keyboard.press(dx > 0 ? 'ArrowRight' : 'ArrowLeft', { delay: 50 })
  for (let step = 0; step < Math.abs(dy); step++) await page.keyboard.press(dy > 0 ? 'ArrowDown' : 'ArrowUp', { delay: 50 })
  await expect(secondSlot).toHaveAttribute('data-over', 'true')
  await page.keyboard.press('Space')
  await expect(secondSlot).toContainText('Fire')
  await expect(page.locator('.drag-preview')).toHaveCount(0)
})

test('a fresh campaign can perform every formula and complete all five ages through rendered controls', async ({ page }) => {
  test.setTimeout(360_000)
  await page.goto('/')
  const known = new Set(elements.filter((element) => element.starter).map((element) => element.id))
  const unlocked = new Set([eras[0].id])
  const performed = new Set()
  while (performed.size < recipes.length) {
    const recipe = recipes.find((candidate) =>
      !performed.has(candidate.id) &&
      unlocked.has(elementEras.get(candidate.result)) &&
      candidate.inputs.every((id) => known.has(id)),
    )
    expect(recipe, `a playable formula after ${performed.size} attempts`).toBeTruthy()
    await combine(page, recipe.inputs)
    await expect(result(page)).toHaveAttribute('data-kind', known.has(recipe.result) ? 'known' : 'discovery')
    await expect(result(page)).toContainText(names.get(recipe.result))
    known.add(recipe.result)
    performed.add(recipe.id)
    for (const era of eras) {
      if (era.unlockRequires.every((id) => known.has(id))) {
        unlocked.add(era.id)
        era.grants.forEach((id) => known.add(id))
      }
    }
  }
  const completed = await progress(page)
  expect(new Set(completed.discoveredIds)).toEqual(new Set(elements.map((element) => element.id)))
  expect(new Set(completed.discoveredRecipeIds)).toEqual(new Set(recipes.map((recipe) => recipe.id)))
  expect(completed.rewardedChallengeEraIds).toEqual(eras.map((era) => era.id))
  expect(completed.unlockedEraIds).toEqual(eras.map((era) => era.id))
  expect(new Set(completed.rewardedCollectionIds)).toEqual(new Set(collections.map((collection) => collection.id)))
  expect(completed.insightCredits).toBeLessThanOrEqual(3)
  expect(completed.experimentHistory).toHaveLength(50)
  expect(completed.readHistoricalElementIds).toEqual([])
  await page.reload()
  expect(await progress(page)).toEqual(completed)
  await shelf(page).getByRole('button', { name: 'Hide Mastered', exact: true }).click()
  await expect(shelf(page).locator('.element-tile')).toHaveCount(0)
  await select(page, 'dome')
  await expect(page.getByRole('button', { name: 'Remove Dome', exact: true })).toBeVisible()
})

test('all isolated challenges complete, resume, save and replay without changing campaign discoveries', async ({ page }) => {
  test.setTimeout(240_000)
  await page.goto('/')
  await navigation(page).getByRole('button', { name: 'Challenges', exact: true }).click()
  const before = await stored(page)
  for (const challenge of [rainmakerChallenge, ...learningChallenges]) {
    await page.getByRole('button', { name: `Play ${challenge.name}`, exact: true }).click()
    await expect(page.getByRole('button', { name: 'Reset journal', exact: true })).toBeDisabled()
    const route = challengeRoute(challenge)
    for (const [index, recipe] of route.entries()) {
      for (const id of recipe.inputs) await page.getByRole('button', { name: `Challenge ${names.get(id)}`, exact: true }).click()
      if (index === 0) {
        await navigation(page).getByRole('button', { name: 'Atlas', exact: true }).click()
        await navigation(page).getByRole('button', { name: 'Play', exact: true }).click()
        await navigation(page).getByRole('button', { name: 'Challenges', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Return to Challenges', exact: true })).toBeFocused()
        await expect(page.locator('.challenge-slot').first()).toContainText(names.get(recipe.inputs[0]))
      }
      await page.getByRole('button', { name: 'Combine challenge elements', exact: true }).click()
    }
    await expect(page.getByRole('button', { name: 'Save result', exact: true })).toBeEnabled()
    if (challenge.id === 'rainmaker') expect(await stored(page)).toBe(before)
    await page.getByRole('button', { name: 'Save result', exact: true }).click()
    await expect(page.getByText(/Result saved\./)).toBeVisible()
    await page.getByRole('button', { name: 'Return to Challenges', exact: true }).click()
    await expect(page.getByRole('button', { name: `Play ${challenge.name}`, exact: true })).toBeFocused()
    const save = await progress(page)
    expect(save.discoveredIds).toHaveLength(4)
    expect(save.discoveredRecipeIds).toEqual([])
    expect(save.challengeRecords.find((entry) => entry.challengeId === challenge.id).bestAttemptCount).toBe(route.length)
  }
  const completed = await progress(page)
  expect(completed.challengeRecords).toHaveLength(12)
  await page.reload()
  await navigation(page).getByRole('button', { name: 'Challenges', exact: true }).click()
  await expect(page.locator('.challenge-card-record', { hasText: /^Completed$/ })).toHaveCount(12)
  await page.getByRole('button', { name: 'Play Commerce Lab', exact: true }).click()
  for (const recipe of challengeRoute(learningChallenges.find((challenge) => challenge.id === 'commerce-lab'))) {
    for (const id of recipe.inputs) await page.getByRole('button', { name: `Challenge ${names.get(id)}`, exact: true }).click()
    await page.getByRole('button', { name: 'Combine challenge elements', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Save result', exact: true }).click()
  await expect(page.getByText('Result saved. No additional reward.')).toBeVisible()
  expect((await progress(page)).insightCredits).toBe(completed.insightCredits)
})

test('clean tabs adopt discoveries and preferences without dropping occupied slots', async ({ page, context }) => {
  await page.goto('/')
  const other = await context.newPage()
  await other.goto('/')
  await select(other, 'ember')
  await other.getByRole('searchbox', { name: 'Search discovered elements' }).fill('')
  await combine(page, ['ember', 'tide'])
  await page.getByRole('searchbox', { name: 'Search discovered elements' }).fill('')
  await expect(shelf(other).getByRole('button', { name: 'Steam', exact: true })).toBeVisible()
  await expect(other.getByRole('button', { name: 'Remove Fire', exact: true })).toBeVisible()
  await shelf(page).getByRole('button', { name: 'Favorite Steam', exact: true }).click()
  await expect(shelf(other).getByRole('button', { name: 'Unfavorite Steam', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Mute sound', exact: true }).click()
  await expect(other.getByRole('button', { name: 'Unmute sound', exact: true })).toBeVisible()
  await shelf(page).getByRole('button', { name: 'Hide Mastered', exact: true }).click()
  await expect(shelf(other).getByRole('button', { name: 'Hide Mastered', exact: true })).toHaveAttribute('aria-pressed', 'true')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset journal', exact: true }).click()
  await expect(shelf(other).locator('.element-tile')).toHaveCount(4)
  await expect(other.getByRole('button', { name: 'Remove Fire', exact: true })).toBeVisible()
  await other.close()
})

test('storage quota failures remain explicit and a later write can save in-memory progress', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key && !window.allowTestSave) throw new DOMException('Test quota exhausted', 'QuotaExceededError')
      return original.call(this, name, value)
    }
  }, saveKey)
  await combine(page, ['ember', 'tide'])
  await expect(page.getByRole('alert')).toContainText('Progress could not be saved')
  await expect(result(page)).toContainText('Discovered Steam')
  expect(await stored(page)).toBeNull()
  await page.evaluate(() => { window.allowTestSave = true })
  await page.getByRole('searchbox', { name: 'Search discovered elements' }).fill('Steam')
  await shelf(page).getByRole('button', { name: 'Favorite Steam', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  const save = await progress(page)
  expect(save.discoveredIds).toContain('steam')
  expect(save.favoriteIds).toContain('steam')
  await page.reload()
  await expect(shelf(page).getByRole('button', { name: 'Unfavorite Steam', exact: true })).toBeVisible()
})

test('future saves are protected from gameplay, preferences and reset, and errors stay visible in every section', async ({ page }) => {
  const future = JSON.stringify({ version: 999, futureProgress: 'preserve these exact bytes' })
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: saveKey, raw: future })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Autosaving is paused')
  await combine(page, ['ember', 'tide'])
  await page.getByRole('searchbox', { name: 'Search discovered elements' }).fill('Steam')
  await shelf(page).getByRole('button', { name: 'Favorite Steam', exact: true }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset journal', exact: true }).click()
  expect(await stored(page)).toBe(future)
  for (const section of ['Atlas', 'Challenges', 'Play']) {
    await navigation(page).getByRole('button', { name: section, exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Autosaving is paused')
  }
  await page.getByRole('button', { name: 'Open settings', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export saved progress', exact: true })).toBeEnabled()
  await expect(page.getByLabel(/Import save file/)).toBeDisabled()
  expect(await stored(page)).toBe(future)
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 800 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`layout and navigation remain usable at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 741, reducedMotion: 'reduce' })
    const page = await context.newPage()
    try {
      await page.goto('/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await combine(page, ['ember', 'tide'], { touch: viewport.width < 741 })
      await expect(result(page)).toContainText('Discovered Steam')
      expect(await page.locator('canvas').count(), 'no confetti under reduced motion').toBe(0)
      if (viewport.width < 741) {
        await expect(page.getByRole('navigation', { name: 'Game panels' }).getByRole('button')).toHaveCount(3)
        await page.getByRole('button', { name: 'Show Guide panel' }).click()
      }
      await page.getByRole('button', { name: 'Inspect Fire', exact: true }).click()
      await page.getByRole('button', { name: 'View history of Fire', exact: true }).click()
      await expect(page.locator('#atlas-history-title')).toBeFocused()
      await page.getByRole('button', { name: 'Mark Fire as read', exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await navigation(page).getByRole('button', { name: 'Challenges', exact: true }).click()
      await page.getByRole('button', { name: 'Play Rainmaker', exact: true }).click()
      await page.getByRole('button', { name: 'Challenge Fire', exact: true }).click()
      page.once('dialog', (dialog) => dialog.dismiss())
      await page.getByRole('button', { name: 'Return to Challenges', exact: true }).click()
      await expect(page.locator('.challenge-slot').first()).toContainText('Fire')
      page.once('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: 'Return to Challenges', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Play Rainmaker', exact: true })).toBeFocused()
    } finally {
      await context.close()
    }
  })
}
