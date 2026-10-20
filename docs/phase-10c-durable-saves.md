# Phase 10C — durable module-save integration foundation

**Phase 11 status:** production regional sessions now use this service through
`internalProgressPersistence.ts`. Settings offers validated previews, backups,
confirmed migration, module selection and import. Legacy campaigns retain their
v7 writer until confirmed migration. The [integration audit](phase-11-integration.md)
and [save guide](saves.md) record current behavior and validation.

The original Phase 10C slice introduced transactional archive writes using the
existing `unwritten-atlas-progress` key only when explicitly opted in. Its
original boundaries below are historical; Phase 11 makes migration explicit
and preserves disabled-module progress in ordinary production archive writes.

## Added

- `src/game/state/moduleArchiveRules.ts`: checks claimed ownership against core IDs; rejects undeclared references; requires exact module ownership/version compatibility before reactivation; rebases active progress on archived disabled-module records; preserves dormant rewards, reading marks, formulas, favorites and experiments; distinguishes a deliberate total reset.
- `src/game/state/durableModulePersistence.ts`: accepts existing v1–v7 saves, prepares a versioned module archive, and writes only while holding the **same Web Lock** as the old writer. It compares raw bytes on disk with its accepted baseline before every write and refuses conflicting updates, invalid formats, oversized archives, and missing lock support.
- `src/game/state/durableModulePersistence.test.ts`: tests atomic legacy migration, preserved dormant progress, old-parser rejection, conflicting tabs, invalid inputs, and absent-lock failure.

## Original Phase 10C safety boundaries

1. **No live activation:** the active game still reads/writes v7. These functions are not imported by the live store. A deployment that switches the store must be atomic across loading, writing, synchronization and rollback.
2. **Downgrade behavior:** the new envelope is intentionally not parsed by existing v7 readers; old clients must refuse the new save instead of stripping unknown module fields. A future user-facing migration should offer a manual backup and clear compatibility warning before the first write.
3. **Do not blindly trust ownership claims:** archive shape and core-ID exclusions are necessary but do not authenticate historical rewards. The caller must derive the enabled ownership inventory from vetted, installed first-party module manifests and verify referenced recipes, research, collections and challenge minimums before activation.
4. **No full module support yet:** research, challenges and recipe reviews are not composed into an active runtime registry. Module IDs are not runtime-installed or enabled; the test modules are synthetic.
5. **Further edge cases:** scenario tests are needed for cross-module inputs, alternate recipes producing core results, nonmodule experiment history after 50-entry truncation, cross-tab archive synchronization after disabling modules, module upgrades/migrations, and failed storage writes.
6. **Reset:** disabled modules retain progress on ordinary writes, but a deliberate all-progress reset clears them.

## Required validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

See the Phase 11 audit for executed validation. Production core content, five
ages, version 7 persistence, and the free-access policy remain unchanged.
