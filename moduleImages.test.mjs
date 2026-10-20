import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import pack from './src/game/modules/achaemenid/pack.json' with { type: 'json' }

const root = dirname(fileURLToPath(import.meta.url))
const asset = (path) => readFileSync(resolve(root, 'public', path))

it('bundles complete licensed JPEGs and notices within a 200 KiB photo budget', () => {
  const notice = asset('images/achaemenid/CREDITS.txt').toString('utf8')
  let total = 0
  for (const { image } of pack.elements) {
    expect(notice).toContain(image.sourceUrl)
    expect(notice).toContain(image.licenseUrl)
    for (const path of [image.src, image.thumbnailSrc].filter((path) => path !== undefined)) {
      const bytes = asset(path)
      expect([...bytes.subarray(0, 2)]).toEqual([0xff, 0xd8])
      expect([...bytes.subarray(-2)]).toEqual([0xff, 0xd9])
      expect(bytes.length).toBeLessThan(100 * 1024)
      total += bytes.length
    }
  }
  expect(total).toBeLessThan(200 * 1024)
  for (const credit of ['Bahar019', 'Pfa16', 'The Metropolitan Museum of Art', 'not an identified satrap', 'no Invariant Sections']) {
    expect(notice).toContain(credit)
  }
  expect(asset('images/achaemenid/GFDL-1.3.txt').toString('utf8')).toContain('Version 1.3, 3 November 2008')
})
