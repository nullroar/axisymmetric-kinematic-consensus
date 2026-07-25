import { readFile } from "node:fs/promises";
import {
  aggregateId,
  commandId,
  correlationId,
  isoTimestamp,
  micrometers,
  streamVersion,
} from "../dist/src/domain/brands.js";
import { digestMaterial } from "../dist/src/kernel/hash.js";

const fixture = JSON.parse(
  await readFile(
    new URL("../spec/conformance-vector.json", import.meta.url),
    "utf8",
  ),
);
const material = fixture.material;
const digest = digestMaterial({
  streamId: aggregateId(material.streamId),
  streamVersion: streamVersion(material.streamVersion),
  event: {
    type: material.event.type,
    aggregateId: aggregateId(material.event.aggregateId),
    radius: micrometers(BigInt(material.event.radius)),
  },
  commandId: commandId(material.commandId),
  correlationId: correlationId(material.correlationId),
  occurredAt: isoTimestamp(material.occurredAt),
  previousDigest: material.previousDigest,
});

if (digest !== fixture.expectedDigest) {
  throw new Error(
    `Conformance digest mismatch: expected ${fixture.expectedDigest}, received ${digest}`,
  );
}

process.stdout.write(`AKCP-1 conformance vector passed: ${digest}\n`);
