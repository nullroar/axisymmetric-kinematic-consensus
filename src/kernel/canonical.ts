import { ProtocolViolation } from "../domain/errors.js";

const canonicalizeNode = (value: unknown): string => {
  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "bigint":
      return JSON.stringify({ $bigint: value.toString() });
    case "boolean":
    case "string":
      return JSON.stringify(value);
    case "number":
      if (!Number.isFinite(value)) {
        throw new ProtocolViolation("Non-finite numbers are not canonicalizable");
      }
      return JSON.stringify(value);
    case "object": {
      if (Array.isArray(value)) {
        return `[${value.map(canonicalizeNode).join(",")}]`;
      }
      const record = value as Readonly<Record<string, unknown>>;
      const members = Object.keys(record)
        .sort((left, right) => left.localeCompare(right, "en-US"))
        .map((key) => `${JSON.stringify(key)}:${canonicalizeNode(record[key])}`);
      return `{${members.join(",")}}`;
    }
    case "undefined":
    case "function":
    case "symbol":
      throw new ProtocolViolation(
        `Unsupported canonical value type: ${typeof value}`,
      );
  }

  throw new ProtocolViolation("Unreachable canonical value");
};

export const canonicalize = (value: unknown): string =>
  canonicalizeNode(value);
