# discern

discern provides uncertainty-aware semantic pattern matching and control flow for Effect. It allows developers to evaluate inputs against classification, rating, probability, and deterministic criteria, compose them using logical operators, and explicitly branch on whether an outcome matches, misses, or remains uncertain.

The repository is a TypeScript and ESM monorepo forked under systemfsoftware from [doeixd/discern](https://github.com/doeixd/discern).

## Repository Package Map

This repository manages the following package:

- [`packages/discern`](packages/discern): Contains the source code for `@systemfsoftware/discern` (current source version: 1.1.3). For API reference, procedure routing, recording and replay, caching, budgets, and evaluation workflows, see [`packages/discern/README.md`](packages/discern/README.md).

## Installation

The published consumer artifact is version 1.0.0. You can install it alongside Effect v4:

```sh
npm install @systemfsoftware/discern@1.0.0 'effect@^4'
```

## Quick Start

The following example demonstrates a review policy evaluated against a stand-in Effect DecisionModel provider. This allows you to run the flow locally without configuring external model credentials:

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

## Pattern Matching and Uncertainty

Policies compose classification, rating, probability, and deterministic conditions using combinators such as `and`, `or`, and `when`. In the quick start example, the classification and probability criteria are evaluated in a single model-provider request.

Pattern evaluations resolve to one of three states:

- `Match`: The condition was met.
- `Miss`: The condition was not met.
- `Uncertain`: The model or heuristic evaluation cannot definitively resolve the condition.

Rather than coercing uncertainty silently into a match or miss, discern exposes uncertainty directly in control flow.

## Contributing and Issues

For local development setup, environment prerequisites, and repository conventions, consult [CONTRIBUTING.md](CONTRIBUTING.md).

For bug reports, feature requests, and support, open an [issue](https://github.com/systemfsoftware/discern/issues).

## License

This project is licensed under the Apache-2.0 License. See [`packages/discern/LICENSE`](packages/discern/LICENSE) for the full license text.

Forked from [doeixd/discern](https://github.com/doeixd/discern).
