import type { EventEnvelope } from "../domain/events.js";
import { ProtocolViolation } from "../domain/errors.js";

const BIGINT_TAG = "$akcp.bigint";

export const serializeEnvelope = (envelope: EventEnvelope): string =>
  JSON.stringify(envelope, (_key, value: unknown) =>
    typeof value === "bigint" ? { [BIGINT_TAG]: value.toString() } : value,
  );

export const deserializeEnvelope = (line: string): EventEnvelope => {
  try {
    return JSON.parse(line, (_key, value: unknown) => {
      if (
        typeof value === "object" &&
        value !== null &&
        BIGINT_TAG in value &&
        typeof (value as Record<string, unknown>)[BIGINT_TAG] === "string"
      ) {
        return BigInt((value as Record<string, string>)[BIGINT_TAG] ?? "0");
      }
      return value;
    }) as EventEnvelope;
  } catch (error) {
    throw new ProtocolViolation("Journal contains an invalid envelope", {
      cause: error,
    });
  }
};

export const stringifyForOperator = (value: unknown): string =>
  JSON.stringify(
    value,
    (_key, node: unknown) =>
      typeof node === "bigint" ? node.toString() : node,
    2,
  );
