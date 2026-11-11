# Contributing to discern

This guide outlines prerequisites, repository setup, and conventions for developing in the systemfsoftware/discern monorepo.

## Prerequisites

Development requires the repository's Nix flake and dev shell. The dev shell provides:

- Node.js 24
- pnpm 12 (the repository pins `pnpm@12.9.0`)

## Source Setup

nix.systemfsoftware.com is the package registry for `@systemfsoftware` packages: producers push package tarballs there from `main`, consumers substitute them through flake inputs, and nothing goes to npm. Core's tarballs reach this repository through the `core` flake input, and `pnpm-workspace.yaml` maps them to `file:.deps/*.tgz` overrides.

To copy the tarballs into `.deps/` and install workspace packages, run:

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
