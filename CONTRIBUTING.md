# Contributing to discern

This guide outlines prerequisites, repository setup, and conventions for developing in the systemfsoftware/discern monorepo.

## Prerequisites

Development requires the repository's Nix flake and dev shell. The dev shell provides:

- Node.js 24
- pnpm 12 (the repository pins `pnpm@12.9.0`)

## Source Setup

`@systemfsoftware` packages come from npm like any other dependency: package manifests and catalogs name caret ranges and `pnpm-lock.yaml` holds the exact versions. Take newer ones with `pnpm update '@systemfsoftware/*'`. `flake.nix` pins core at a full commit (input `core`) only for its dprint build and its nixpkgs.

To install workspace packages, run:

```sh
nix develop --accept-flake-config --command pnpm install
```

## Running Package Commands

Execute package scripts from the repository root using pnpm workspace filters:

```text
pnpm --filter <pkg> <cmd>
```

Do not change directories (`cd`) into individual package folders to run commands, and do not use `npx`.

## Commit Conventions

Commit messages must adhere to conventional commit syntax:

```text
type(scope): subject
```

## Testing Boundaries

Mutation testing is executed exclusively in continuous integration (CI) environments. Do not run mutation testing locally.
