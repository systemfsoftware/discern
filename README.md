# discern

discern is a TypeScript library for [Effect](https://effect.website) that lets a program branch on model judgments. You describe what to decide about an input (a label, a rating, or a probability), combine those criteria with `and`, `or` and `when`, and the result is one of three verdicts: the condition matched, missed, or could not be resolved. The uncertain case is a value you handle, not one that gets silently coerced into a yes or a no.

## Install

`@systemfsoftware/discern` is not on npm. Packages of the `@systemfsoftware` scope are distributed as Nix tarballs from [nix.systemfsoftware.com](https://nix.systemfsoftware.com), the registry for these packages, and nothing is published to npm.

Add this repository as a flake input and take its tarball through [pnpm-release-management](https://github.com/systemfsoftware/pnpm-release-management#distribution-through-nix):

```nix
{
  nixConfig = {
    extra-substituters = "https://nix.systemfsoftware.com";
    extra-trusted-public-keys = "nix-cache-1:wXA8I4DayNW9q6enUyQA/P/nT38pGSTLt374t3gsn7M=";
  };

  inputs = {
    nixpkgs.follows = "discern/nixpkgs";
    discern.url = "github:systemfsoftware/discern/<rev>";
    pnpm-release-management.url = "github:systemfsoftware/pnpm-release-management";
  };

  outputs = { self, nixpkgs, discern, pnpm-release-management }:
    let
      lib = nixpkgs.lib;
      forEachSystem = fn: lib.genAttrs [ "x86_64-linux" "aarch64-linux" ] (system: fn nixpkgs.legacyPackages.${system});
    in
    {
      packages = forEachSystem (pkgs: rec {
        producer-tarballs = pnpm-release-management.lib.mkProducerTarballs {
          inherit pkgs;
          producers = { inherit discern; };
        };
        pnpm-store = pnpm-release-management.lib.mkPnpmConsumerStore {
          inherit pkgs;
          src = self;
          files.".deps" = producer-tarballs;
        };
      });

      devShells = forEachSystem (pkgs: {
        default = pkgs.mkShell {
          shellHook = self.packages.${pkgs.stdenv.hostPlatform.system}.producer-tarballs.shellHook;
        };
      });
    };
}
```

Replace `<rev>` with the commit you pin. Nix only applies `nixConfig` for trusted users or with `--accept-flake-config`.

Then point your `package.json` at the tarball and install the peer from npm:

```json
{
  "dependencies": {
    "@systemfsoftware/discern": "file:.deps/discern.tgz",
    "effect": "^4"
  }
}
```

Add `.deps/` to `.gitignore`. Run `pnpm install` inside the dev shell.

## Quick start

The example below runs locally. It uses a stand-in model provider, so it needs no model credentials.

```js
import { Discern } from '@systemfsoftware/discern'
import { Effect, Schema } from 'effect'

const standIn = (answer) =>
  Discern.Model.provider((request) =>
    Effect.succeed({
      answers: Object.fromEntries(Object.entries(request.decisions).map(([key, decision]) => [key, answer(decision)])),
      usage: { inputTokens: undefined, outputTokens: undefined },
    })
  )
const Change = Discern.on(Schema.String)
const impact = Change.classify({
  id: 'impact',
  instructions: 'How does this change affect callers of the API?',
  criteria: {
    none: 'Internal only',
    additive: 'New surface, nothing existing changes',
    breaking: 'Existing callers change',
  },
})
const risk = Change.probability({ id: 'risk', instructions: 'Is this change likely to cause a regression?' })
const review = Discern.type(Schema.String).pipe(
  Discern.when(Discern.and(impact.is('breaking'), risk.above(0.8)), (change) => `block: ${change}`),
  Discern.when(impact.is('breaking'), (change) => `migration guide: ${change}`),
  Discern.orElse((change) => `ship: ${change}`),
)
const cautious = standIn((decision) =>
  decision._tag === 'Classify'
    ? { _tag: 'Classify', label: 'breaking', probabilities: { none: 0.02, additive: 0.08, breaking: 0.9 } }
    : { _tag: 'Probability', probability: 0.93 }
)
const verdict = await Effect.runPromise(
  review('rename User.id to User.key').pipe(Effect.provide(Discern.Model.layer(cautious))),
)
console.log(verdict)
```

Expected output:

```text
block: rename User.id to User.key
```

The classification and the probability are asked in one provider request. The `and` clause matches only when both hold, so the first `when` blocks the change and the second one only writes a migration note.

## How verdicts work

Each condition resolves to one of three states:

- `Match`: the condition was met.
- `Miss`: the condition was not met.
- `Uncertain`: the model or heuristic could not decide.

`Discern.onUncertain` gives the uncertain case its own handler. Model access, replay, caching and budgets are bound at the caller's edge with a `Discern.Model` layer. The [package README](packages/discern/README.md) covers the API, procedure routing, recording and replay, caching, budgets and evaluation.

## Repository

This repository holds one package, [`packages/discern`](packages/discern), which is the source of `@systemfsoftware/discern`.

## Contributing and support

Development setup, the gate and repository conventions are in [CONTRIBUTING.md](CONTRIBUTING.md). Report bugs and request features in the [issue tracker](https://github.com/systemfsoftware/discern/issues).

## License

Apache-2.0. See [`packages/discern/LICENSE`](packages/discern/LICENSE).

discern is forked from [doeixd/discern](https://github.com/doeixd/discern).
