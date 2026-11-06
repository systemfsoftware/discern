# Contributing to discern

This guide outlines prerequisites, repository setup, and conventions for developing in the systemfsoftware/discern monorepo.

## Prerequisites

Development requires the repository's Nix flake and dev shell. The dev shell provides:

- Node.js 24
- pnpm 12 (the repository pins `pnpm@12.9.0`)

## Source Setup

Core dependencies are pinned by `flake.nix` and consumed as local tarballs rather than fetched from a registry. The repository's `pnpm-workspace.yaml` maps these dependencies to `file:.sfs-deps/*.tgz` overrides.

To build the local dependency tarballs and install workspace packages, run:

```sh
mkdir -p .sfs-deps && cp -L --no-preserve=mode "$(nix build --no-link --print-out-paths .#sfs-deps)"/*.tgz .sfs-deps/
pnpm install
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
