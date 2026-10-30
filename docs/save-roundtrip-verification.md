# Downloaded save restoration verification

## Current base-only merge verification

The browser suite has been reconciled with the DLC rollback. It no longer
imports a removed pack or attempts activation/reactivation. All three cases
pass on Windows with Node 24.15.0, Playwright 1.62.1 and Playwright-managed
Chromium, using the production build and no retries:

- Legacy v7 actual download, fresh-context import, confirmed reload and an
  independent reload.
- An archive whose original metadata selected Achaemenid content, restored as
  base-only with inactive records preserved.
- An archive whose original metadata disabled that content, with the same
  base-only preservation behavior.

The archive inputs contain synthetic ownership metadata and earned records,
not playable DLC definitions. All core discoveries/formulas, preferences,
receipts, archived favorites, reading marks, hints, failed pairs and inactive
history survive import, ordinary core play, download and restoration. Imported
archives have an empty enabled set. Tests assert the absence of the module
manager, Region filter, regional lab, collection and Atlas entries, and confirm
that repeating a core lab does not repay its reward.

Actual downloaded bytes still match stored bytes exactly. Cancellation,
reselecting the same file, total replacement of a different current save,
real reload events and independently isolated destination storage remain
covered. The suite does not access player profiles or a deployed origin.

Reproduce with `npm ci`, `npx playwright install chromium` and
`npm run test:e2e`. Typecheck, lint and the production build also pass.
The original October 26 evidence below is retained as a **historical
pre-rollback snapshot**; its activation behavior, counts, hashes and environment
are not current results.

## Historical October 26 verification

Verification date: **October 26, 2026**. Gameplay/save implementation tested:
`2eb81db263d27c23c0459d64df4b4a4593c6d936` (main at checkout).
The accompanying changes add tests, development tooling and documentation only.

This follows the [Phase 11 integration audit](phase-11-integration.md), whose
browser could not provide a download event. The new
[Playwright regression suite](../e2e/save-roundtrip.pw.mjs) requires an actual
browser download; it does not mock the anchor, Blob, object URL, file reader,
save manager, storage, Web Locks or reload callback.

### Isolation and procedure

The suite builds the application and starts a dedicated production preview on
`http://127.0.0.1:4187`. An existing server on that port causes failure rather
than reuse. Every test uses disposable, nonpersistent browser contexts. Both
source and destination assert that `unwritten-atlas-progress` is initially
absent. No deployed game, existing browser profile or player save is accessed.

The generated v7 input contains every current core discovery and performed
recipe, two favorites, two explicit reading markers, all core collection and
age receipts, Rainmaker and Commerce Lab records, an experiment, shelf and
sound preferences, and an empty Insight wallet. This is a schema-valid test
campaign, not evidence that those core recipes were all played manually in
this run. The regional cases start with that same legacy file, then use
rendered controls to migrate, discover all three regional items, star them,
mark their histories read and complete/save the regional lab.

Each restoration case:

1. Imports the generated input through the actual Settings file input and
   confirms replacement/reload. Migration preview and cancellation preserve
   the legacy bytes; migration happens only after explicit confirmation.
2. Uses Settings **Export saved progress**, waits for a real `download` event,
   checks the suggested filename `unwritten-atlas-save.json`, checks download
   success, and saves the downloaded file to disk.
3. Compares the downloaded bytes with the complete stored UTF-8 save, records
   byte length/SHA-256/browser version as a test attachment, and checks that
   exporting did not change storage.
4. Imports that exact downloaded path into a second context with empty storage.
   Preview, cancellation and reselecting the same file leave storage unchanged.
   Explicit confirmation must trigger a real browser load event.
5. Compares every restored save field, checks the rendered catalog, favorites,
   reading markers, formula counts and challenge results, then reloads a second
   time and repeats the storage/UI checks. String-ID arrays are compared as
   sets with their lengths preserved where archive rebasing may reorder them;
   ordered history and challenge records remain exact.

The archive cases also replace a different test save with altered favorites
and reading markers before restoring the downloaded backup. This checks total
replacement as well as restoration into initially empty storage.

### Findings

| Downloaded format | Discoveries / performed recipes in file | Favorites / reading markers | Collection / age / lab receipts | Insight |
| --- | --- | --- | --- | --- |
| Legacy v7 | 225 / 291 | 2 / 2 | 14 / 5 / 2 | 0 |
| Archive, Achaemenid enabled | 228 / 294 | 5 / 5 | 15 / 5 / 3 | 2 |
| Archive, Achaemenid disabled | 228 / 294 stored; 225 / 291 visible | 5 / 5 stored; 2 / 2 visible | 15 / 5 / 3 stored | 2 |

The disabled case preserves all three regional discoveries, formulas, favorites
and reading markers, plus the Imperial Connections collection receipt and
one-attempt Imperial Communications result. They remain in the downloaded file
and restored storage while hidden in the active catalog. An ordinary core
combination is performed and saved while the module is disabled, exercising
the archive rebase writer before export. Re-enabling after restoration returns
the regional controls and records without changing their saved progress.

The collection and saved regional lab each award one Insight before export.
The wallet therefore holds two of its three possible credits, so a duplicate
reward would be observable rather than hidden by the cap. Replaying/saving
the restored regional lab reports **No additional reward**; repeating a regional
campaign formula does not repay its collection. Restored legacy Commerce Lab
completion also pays no extra Insight. Original Rainmaker best attempts, core
age/collection receipts and preferences survive.

No save-loss or duplicate-reward defect was reproduced in these scenarios.

Actual downloaded file evidence from the final three-case run:

| Case | UTF-8 bytes | SHA-256 |
| --- | ---: | --- |
| Legacy v7 | 8,536 | `64ad95d7e1b9c51e0779dfd2a5b63b8df8dbcdb84dcfa9d2579ea140699736e3` |
| Enabled archive | 10,072 | `5d17b7737c9f9c6c6e5bd4aff339c43961bf7f509157a4a790a7a1b3876da21b` |
| Disabled archive | 10,158 | `874498e78252814300028b35c2c76785056dfd21305d433b44509aad77e56598` |

These identify the synthetic backups from this run, not permanent file sizes
for future content or campaigns.

### Reproduce

From a fresh checkout with the project's supported Node environment:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

The configuration builds production assets itself. It runs three cases with
one worker and no retries, stops its preview server afterwards, and closes the
additional restoration contexts in `finally` blocks. Downloaded JSON inputs,
download copies and attachments are kept in ignored `test-results/` output;
failure screenshots and traces are retained there. There is no test connection
to a production origin and no persistent browser profile setting.

For an already available compatible Chromium binary, the optional
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable selects its executable
without changing application code or weakening assertions. For example, in a
POSIX shell:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/absolute/path/to/chromium npm run test:e2e
```

### Environment and limits

Executed with Node **24.22.1**, Playwright **1.62.1** and Linux headless Chromium
**153.0.8010.0**. The normal Playwright browser installer returned an HTML
“Site Unavailable” response instead of its browser ZIP in this environment.
The successful runs used the Chromium binary packaged by
`@sparticuz/chromium` **153.0.0**, installed in a temporary test runtime and
selected through the executable override. That package is not a project
dependency. Default Playwright launch options were used; no Blob/download
interception, disabled web security or custom browser flags were added.

This demonstrates browser download-to-file-to-import on the production build.
It does not demonstrate a headed operating-system Save As dialog, a physical
mobile device, Firefox, WebKit/Safari, browser-extension interference or every
browser's download policy. The default Playwright-managed Chromium installation
was not executable here because its browser download was unavailable. The older
integrated cloud browser could not reach the local preview; the successful
evidence comes from the local Playwright browser, not that browser surface.

Corrupt/future/oversized files, storage failure, competing tabs, unavailable or
incompatible modules and near-limit archives retain their existing lower-level
coverage; they are not additional downloaded-file cases in this suite. This
test did not publish a release, create a tag or change a real campaign.

### Validation

- Production build, TypeScript check and lint pass.
- Existing Vitest suite: **39 files, 1,538 tests passed** with two workers.
- Browser suite: legacy, enabled archive and disabled archive downloaded-file
  restoration cases pass: **3/3 in 50.6 seconds**, with no retries.

See [Saves and settings](saves.md#manual-backup-and-restore) for player-facing
backup and replacement behavior.
