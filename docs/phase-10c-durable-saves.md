# Phase 10C — durable module-save integration foundation

**Status: draft, opt-in persistence service, not live runtime integration.**

Phase 10A and Phase 10B are merged. This branch introduces transactional archive writes using the existing `unwritten-atlas-progress` key **only when the new opt-in service is explicitly used**. The current Zustand store still uses version 7 and is unchanged.

## Added

- `src/game/state/moduleArchiveRules.ts`: checks claimed ownership against core IDs; rejects undeclared references; requires exact module ownership/version compatibility before reactivation; rebases active progress on archived disabled-module records; preserves dormant rewards, reading marks, formulas, favorites and experiments; distinguishes a deliberate total reset.
- `src/game/state/durableModulePersistence.ts`: accepts existing v1–v7 saves, prepares a versioned module archive, and writes only while holding the **same Web Lock** as the old writer. It compares raw bytes on disk with its accepted baseline before every write and refuses conflicting updates, invalid formats, oversized archives, and missing lock support.
- `src/game/state/durableModulePersistence.test.ts`: tests atomic legacy migration, preserved dormant progress, old-parser rejection, conflicting tabs, invalid inputs, and absent-lock failure.

## Explicit safety boundaries

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

These commands have not run in the connector environment. This PR must remain draft until CI and review pass. The existing game content, five ages, version 7 runtime persistence, and free-access policy are unchanged.
