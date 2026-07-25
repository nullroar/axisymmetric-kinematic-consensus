import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateId,
  commandId,
  correlationId,
  isoTimestamp,
  micrometers,
  streamVersion,
} from "../src/domain/brands.js";
import { materializeEnvelope } from "../src/kernel/hash.js";
import {
  deserializeEnvelope,
  serializeEnvelope,
} from "../src/kernel/serialization.js";

describe("journal serialization", () => {
  it("preserves bigint-bearing envelopes", () => {
    const original = materializeEnvelope({
      streamId: aggregateId("serialized-axis"),
      streamVersion: streamVersion(1),
      event: {
        type: "PrimitiveInitialized",
        aggregateId: aggregateId("serialized-axis"),
        radius: micrometers(42_000n),
      },
      commandId: commandId("cmd-serialized"),
      correlationId: correlationId("corr-serialized"),
      occurredAt: isoTimestamp("2026-01-01T00:00:00.000Z"),
      previousDigest: null,
    });
    const restored = deserializeEnvelope(serializeEnvelope(original));
    assert.deepEqual(restored, original);
  });
});
