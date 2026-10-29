import type * as Decision from 'effect/ai/Decision'

/**
 * The decision kinds Discern routes on: classify, rate and probability. Effect
 * 4.1.0 added `Decision.Locate`, which answers with an image bounding box, not a
 * verdict a pattern can match, so Discern does not accept it.
 */
export type SupportedDecision = Exclude<Decision.Any, Decision.Locate>
