import { Schema } from 'effect'
import { EvalRecord } from './EvalReport.schema.js'

export class UncertainMatchError
  extends Schema.TaggedError<UncertainMatchError, { readonly brand: unique symbol }>()('UncertainMatchError', {
    caseId: Schema.String,
    reason: Schema.String,
  })
{
  override get message(): string {
    return `Semantic case "${this.caseId}" was uncertain: ${this.reason}`
  }
}

export class ExhaustiveMatchError
  extends Schema.TaggedError<ExhaustiveMatchError, { readonly brand: unique symbol }>()('ExhaustiveMatchError', {})
{
  override get message(): string {
    return 'A supposedly exhaustive semantic classification had no matching case'
  }
}

export class DecisionIdCollisionError
  extends Schema.TaggedError<DecisionIdCollisionError, { readonly brand: unique symbol }>()(
    'DecisionIdCollisionError',
    {
      decisionId: Schema.String,
    },
  )
{
  override get message(): string {
    return `Decision id collision for "${this.decisionId}": definitions differ`
  }
}

export class InvalidThresholdError
  extends Schema.TaggedError<InvalidThresholdError, { readonly brand: unique symbol }>()(
    'InvalidThresholdError',
    {
      threshold: Schema.String,
      value: Schema.Finite,
      limit: Schema.Finite,
      message: Schema.String,
    },
  )
{}

/**
 * A span names its ends in the wrong order. `low` and `high` carry the ends as
 * numbers or level names, so the refusal names both ends the caller wrote.
 */
export class InvalidRangeError extends Schema.TaggedError<InvalidRangeError>()(
  'InvalidRangeError',
  {
    range: Schema.String,
    low: Schema.Union([Schema.Finite, Schema.String]),
    high: Schema.Union([Schema.Finite, Schema.String]),
    message: Schema.String,
  },
) {}

export class CalibrationValuesRefused extends Schema.TaggedError<CalibrationValuesRefused>()(
  'CalibrationValuesRefused',
  {},
) {
  override get message(): string {
    return 'Calibration needs at least one candidate value; the list was empty'
  }
}

/**
 * The policy run's command was rejected before any case could be answered.
 * Carries the cases the read had evaluated, so the refusal names the run it
 * belonged to, and the rejection itself as `cause` (C2, mirrored from
 * `await-readiness.cell.ts`).
 */
export class PolicyCommandRejected
  extends Schema.TaggedError<PolicyCommandRejected, { readonly brand: unique symbol }>()('PolicyCommandRejected', {
    caseIds: Schema.Array(Schema.String),
    cause: Schema.optional(Schema.Unknown),
  })
{
  override get message(): string {
    return `The policy run rejected its command for the cases [${this.caseIds.join(', ')}]`
  }
}

/**
 * The eval run's command was rejected before the example could be scored.
 * Carries the measurement record the read had built, plus the rejection as
 * `cause` (C2, mirrored from `await-readiness.cell.ts`).
 */
export class MeasureCommandRejected
  extends Schema.TaggedError<MeasureCommandRejected, { readonly brand: unique symbol }>()('MeasureCommandRejected', {
    record: EvalRecord,
    cause: Schema.optional(Schema.Unknown),
  })
{
  override get message(): string {
    return `The eval run rejected its command for the example scored ${this.record['status']}`
  }
}

/**
 * A labelled example's input could not be encoded as JSON, so the measurement
 * record cannot be written. The refusal names what the example expected and
 * carries the encoding issue as `cause`.
 */
export class MeasureInputRefused
  extends Schema.TaggedError<MeasureInputRefused, { readonly brand: unique symbol }>()('MeasureInputRefused', {
    expected: Schema.Boolean,
    cause: Schema.optional(Schema.Unknown),
  })
{
  override get message(): string {
    return `The labelled example the measurement expected to ${
      this.expected ? 'match' : 'miss'
    } is not encodable as JSON`
  }
}
