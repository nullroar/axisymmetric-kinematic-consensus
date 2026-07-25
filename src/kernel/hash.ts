import { createHash, timingSafeEqual } from "node:crypto";
import {
  eventDigest,
  type EventDigest,
  type IsoTimestamp,
  type StreamVersion,
  type AggregateId,
  type CommandId,
  type CorrelationId,
} from "../domain/brands.js";
import type { DomainEvent, EventEnvelope } from "../domain/events.js";
import { IntegrityViolation } from "../domain/errors.js";
import { canonicalize } from "./canonical.js";

export interface EnvelopeMaterial {
  readonly streamId: AggregateId;
  readonly streamVersion: StreamVersion;
  readonly event: DomainEvent;
  readonly commandId: CommandId;
  readonly correlationId: CorrelationId;
  readonly occurredAt: IsoTimestamp;
  readonly previousDigest: EventDigest | null;
}

export const digestMaterial = (material: EnvelopeMaterial): EventDigest =>
  eventDigest(
    createHash("sha256").update(canonicalize(material), "utf8").digest("hex"),
  );

export const materializeEnvelope = (
  material: EnvelopeMaterial,
): EventEnvelope => ({
  ...material,
  digest: digestMaterial(material),
});

export const verifyEnvelopeDigest = (envelope: EventEnvelope): void => {
  const expected = digestMaterial({
    streamId: envelope.streamId,
    streamVersion: envelope.streamVersion,
    event: envelope.event,
    commandId: envelope.commandId,
    correlationId: envelope.correlationId,
    occurredAt: envelope.occurredAt,
    previousDigest: envelope.previousDigest,
  });
  const expectedBytes = Buffer.from(expected, "hex");
  const actualBytes = Buffer.from(envelope.digest, "hex");

  if (
    expectedBytes.byteLength !== actualBytes.byteLength ||
    !timingSafeEqual(expectedBytes, actualBytes)
  ) {
    throw new IntegrityViolation(
      `Digest mismatch at stream version ${envelope.streamVersion}`,
    );
  }
};

export const verifyHashChain = (
  envelopes: readonly EventEnvelope[],
): void => {
  let previousDigest: EventDigest | null = null;
  let expectedVersion = 1;

  for (const envelope of envelopes) {
    if (envelope.streamVersion !== expectedVersion) {
      throw new IntegrityViolation(
        `Non-contiguous stream version: expected ${expectedVersion}, received ${envelope.streamVersion}`,
      );
    }
    if (envelope.previousDigest !== previousDigest) {
      throw new IntegrityViolation(
        `Broken hash-chain predecessor at version ${envelope.streamVersion}`,
      );
    }
    verifyEnvelopeDigest(envelope);
    previousDigest = envelope.digest;
    expectedVersion += 1;
  }
};
