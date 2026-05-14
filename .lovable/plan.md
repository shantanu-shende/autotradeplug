## Goal
Add a single-command TypeScript typecheck and verify the previously fixed TS2322/TS2503 errors are gone.

## Change
Add a `typecheck` script to `package.json`:

```json
"typecheck": "tsc -p tsconfig.json --noEmit"
```

(Other scripts left untouched.)

## Verification
Run `bun run typecheck` and confirm no `TS2322` or `TS2503` diagnostics in:
- `src/components/strategy/StrategyManager.tsx`
- `src/contexts/LiveForexContext.tsx`
- `src/utils/concurrency.ts`

Report the result inline. If new unrelated errors surface, list them but do not modify code in this task.

## Out of scope
Fixing any unrelated pre-existing type errors.
