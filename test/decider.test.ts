import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateId,
  commandId,
  correlationId,
  micrometers,
  nanoradians,
  projectionResidual,
  streamVersion,
} from "../src/domain/brands.js";
import { DomainRejection } from "../src/domain/errors.js";
import type { AggregateState } from "../src/domain/state.js";
import { decide } from "../src/kernel/decider.js";

const materializedState = (): AggregateState => ({
  id: aggregateId("primary-axis"),
  lifecycle: "stationary",
  radius: micrometers(100_000n),
  phase: nanoradians(0n),
  displacement: micrometers(0n),
  residual: projectionResidual(0n),
  version: streamVersion(1),
  lastDigest: null,
});

describe("domain command decider", () => {
  it("rejects motion before materialization", () => {
    assert.throws(
      () =>
        decide(
          {
            ...materializedState(),
            id: null,
            lifecycle: "void",
            radius: micrometers(0n),
            version: streamVersion(0),
          },
          {
            type: "AdvanceAngularPhase",
            commandId: commandId("cmd-advance"),
            correlationId: correlationId("corr-advance"),
            delta: nanoradians(1n),
          },
        ),
      DomainRejection,
    );
  });

  it("emits a deterministic phase transition", () => {
    const [event] = decide(materializedState(), {
      type: "AdvanceAngularPhase",
      commandId: commandId("cmd-advance"),
      correlationId: correlationId("corr-advance"),
      delta: nanoradians(1_000_000_000n),
    });
    assert.equal(event?.type, "AngularPhaseAdvanced");
    assert.equal(
      event?.type === "AngularPhaseAdvanced"
        ? event.displacementDelta
        : undefined,
      100_000n,
    );
  });

  it("elides no-op radial reconfiguration", () => {
    const events = decide(materializedState(), {
      type: "ReconfigureRadialMetric",
      commandId: commandId("cmd-radius"),
      correlationId: correlationId("corr-radius"),
      radius: micrometers(100_000n),
    });
    assert.deepEqual(events, []);
  });
});
