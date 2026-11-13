# discern

Uncertainty-aware semantic pattern matching and control flow for Effect — forked under systemfsoftware from doeixd/discern.

Extracted from `systemfsoftware/systemfsoftware` (core); package history came with the move.

## Packages

| Package                    | Version | Distributed |
| -------------------------- | ------- | ----------- |
| `@systemfsoftware/discern` | 1.1.3   | yes         |

## Dependencies on core

nix.systemfsoftware.com is the package registry for `@systemfsoftware` packages: producers push package tarballs there from `main`, consumers substitute them through flake inputs, and nothing goes to npm.

Core is a flake input (`core`, pinned at a full commit). `flake.nix` takes its tarballs whole through
`lib.mkProducerTarballs`, and `pnpm-workspace.yaml` maps each one to `file:.deps/<name>.tgz` through `overrides`.
To take newer core packages: bump the `core` input, run `nix flake lock`, regenerate the overrides with
`nix eval --raw .#packages.x86_64-linux.producer-tarballs.overrides`, then run `pnpm install`.

Local setup (the dev shell copies the tarballs into `.deps/`):

```bash
nix develop --accept-flake-config --command pnpm install
```

## Gate

- `pnpm check:local` before delivery: dprint, build, lint, typecheck, type tests, API reports, attw, tests at the
  local conformance profile.
- CI (`.github/workflows/ci.yml`, SYS-1369) calls core's reusable checks at a pinned core commit. It runs on every
  pull request, including stacked ones. A pull request runs the static lane and the affected tests
  (`.github/ci/pr-tests.mjs`: `turbo --affected`, `vitest --changed`) and no packed test job. A Mergify queue draft
  (`mergify/merge-queue/*`) runs the full suite: the static lane and every package's whole suite. Main runs the full
  suite again after each merge. Packages whose content hash already passed whole are skipped as cache hits, not left
  out by name. `nix.yml` builds the flake outputs on main only.
- Never start a local mutation run; mutation runs in CI only.
- Version bumps: every change to a publishable package's packed output advances its version at least a patch.

## Conventions

- Run `pnpm --filter <pkg> <cmd>` from the root; never `cd` into packages, never `npx`.
- Commits: `type(scope): subject` (commitlint).
- Tooling scripts are TypeScript run by the toolchain already in the workspace; no synchronous IO in new scripts.

## Routing

| Doc                                 | Trigger                                                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONSTITUTION.md`                   | architecture changes, rule authoring, or design disputes                                                                                        |
| `repos/constitution/ENFORCEMENT.md` | building or changing an instrument that grades work (lint gates, stream rules, CI checks, thresholds, rubrics, advisors); situational read only |
