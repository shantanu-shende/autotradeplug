## Goal
Add a GitHub Actions CI workflow that builds the production bundle on every push and pull request, failing the run if the build does not compile.

## Change
Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
```

Notes:
- Uses `npm ci` for a deterministic install from `package-lock.json`.
- Runs `typecheck` first (added previously) so type errors fail fast before the bundle step.
- `npm run build` (Vite) is the production compile gate; non-zero exit fails the job.

## Verification
Pushing the workflow file is the verification — it runs on the next push/PR. Locally, `npm run build` already exercises the same command.

## Out of scope
Lint, tests, deployment, caching beyond npm, matrix node versions.
