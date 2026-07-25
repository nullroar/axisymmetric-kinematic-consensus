import {
  micrometers,
  streamVersion,
} from "../domain/brands.js";
import type { EventEnvelope } from "../domain/events.js";
import { IntegrityViolation, InvariantViolation } from "../domain/errors.js";
import { inspectInvariants } from "../domain/invariants.js";
import { initialState, type AggregateState } from "../domain/state.js";

export const evolve = (
  state: AggregateState,
  envelope: EventEnvelope,
): AggregateState => {
  const expectedVersion = state.version + 1;
  if (envelope.streamVersion !== expectedVersion) {
    throw new IntegrityViolation(
      `Reducer expected version ${expectedVersion}, received ${envelope.streamVersion}`,
    );
  }
  if (envelope.previousDigest !== state.lastDigest) {
    throw new IntegrityViolation("Reducer detected a discontinuous digest chain");
  }
  if (state.id !== null && envelope.streamId !== state.id) {
    throw new IntegrityViolation("Envelope stream identifier changed in flight");
  }

  let next: AggregateState;
  switch (envelope.event.type) {
    case "PrimitiveInitialized":
      if (state.lifecycle !== "void") {
        throw new IntegrityViolation("Initialization event follows materialization");
      }
      next = {
        ...state,
        id: envelope.event.aggregateId,
        lifecycle: "stationary",
        radius: envelope.event.radius,
      };
      break;
    case "AngularPhaseAdvanced":
      if (state.lifecycle !== "stationary") {
        throw new IntegrityViolation("Phase event requires a stationary primitive");
      }
      if (envelope.event.previousPhase !== state.phase) {
        throw new IntegrityViolation("Phase event has a stale origin");
      }
      next = {
        ...state,
        phase: envelope.event.nextPhase,
        displacement: micrometers(
          state.displacement + envelope.event.displacementDelta,
        ),
        residual: envelope.event.nextResidual,
      };
      break;
    case "RadialMetricReconfigured":
      if (envelope.event.previousRadius !== state.radius) {
        throw new IntegrityViolation("Radial event has a stale origin");
      }
      next = {
        ...state,
        radius: envelope.event.nextRadius,
      };
      break;
    case "PrimitiveRetired":
      next = {
        ...state,
        lifecycle: "retired",
      };
      break;
  }

  next = {
    ...next,
    version: streamVersion(envelope.streamVersion),
    lastDigest: envelope.digest,
  };
  const violations = inspectInvariants(next);
  if (violations.length > 0) {
    throw new InvariantViolation(violations);
  }
  return next;
};

export const replay = (
  envelopes: readonly EventEnvelope[],
  seed = initialState(),
): AggregateState => envelopes.reduce(evolve, seed);
