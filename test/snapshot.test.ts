import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateId,
  eventDigest,
  micrometers,
  nanoradians,
  projectionResidual,
  streamVersion,
} from "../src/domain/brands.js";
import { IntegrityViolation } from "../src/domain/errors.js";
import type { AggregateState } from "../src/domain/state.js";
import {
  createSnapshot,
  restoreSnapshot,
} from "../src/kernel/snapshot.js";

const state = (): AggregateState => ({
  id: aggregateId("snapshot-axis"),
  lifecycle: "stationary",
  radius: micrometers(50_000n),
  phase: nanoradians(250_000_000n),
  displacement: micrometers(12_500n),
  residual: projectionResidual(0n),
  version: streamVersion(2),
  lastDigest: eventDigest("a".repeat(64)),
});

describe("signed aggregate snapshots", () => {
  it("round-trips intact state", () => {
    const original = state();
    assert.deepEqual(restoreSnapshot(createSnapshot(original)), original);
  });

  it("rejects modified state", () => {
    const original = createSnapshot(state());
    const tampered = {
      ...original,
      state: { ...original.state, displacement: micrometers(999n) },
    };
    assert.throws(() => restoreSnapshot(tampered), IntegrityViolation);
  });
});
