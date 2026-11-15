# discern

discern is a TypeScript library for [Effect](https://effect.website) that lets a program branch on model judgments. You describe what to decide about an input (a label, a rating, or a probability), combine those criteria with `and`, `or` and `when`, and the result is one of three verdicts: the condition matched, missed, or could not be resolved. The uncertain case is a value you handle, not one that gets silently coerced into a yes or a no.

## Install

```sh
pnpm add @systemfsoftware/discern effect
```

`effect@^4` is a peer dependency: you bring your own.

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
