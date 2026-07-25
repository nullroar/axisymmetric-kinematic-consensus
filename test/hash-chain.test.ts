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
import { IntegrityViolation } from "../src/domain/errors.js";
import {
  materializeEnvelope,
  verifyHashChain,
} from "../src/kernel/hash.js";

const envelope = () =>
  materializeEnvelope({
    streamId: aggregateId("digest-axis"),
    streamVersion: streamVersion(1),
    event: {
      type: "PrimitiveInitialized",
      aggregateId: aggregateId("digest-axis"),
      radius: micrometers(20_000n),
    },
    commandId: commandId("cmd-digest"),
    correlationId: correlationId("corr-digest"),
    occurredAt: isoTimestamp("2026-01-01T00:00:00.000Z"),
    previousDigest: null,
  });

describe("cryptographic event lineage", () => {
  it("accepts an intact chain", () => {
    assert.doesNotThrow(() => verifyHashChain([envelope()]));
  });

  it("rejects payload mutation", () => {
    const original = envelope();
    const tampered = {
      ...original,
      event: { ...original.event, radius: micrometers(99_999n) },
    };
    assert.throws(() => verifyHashChain([tampered]), IntegrityViolation);
  });
});
