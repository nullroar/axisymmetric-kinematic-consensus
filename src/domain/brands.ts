declare const brand: unique symbol;

export type Brand<T, Name extends string> = T & {
  readonly [brand]: Name;
};

export type AggregateId = Brand<string, "AggregateId">;
export type CommandId = Brand<string, "CommandId">;
export type CorrelationId = Brand<string, "CorrelationId">;
export type EventDigest = Brand<string, "EventDigest">;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;
export type Micrometers = Brand<bigint, "Micrometers">;
export type Nanoradians = Brand<bigint, "Nanoradians">;
export type ProjectionResidual = Brand<bigint, "ProjectionResidual">;
export type StreamVersion = Brand<number, "StreamVersion">;

export const aggregateId = (value: string): AggregateId => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,127}$/u.test(value)) {
    throw new TypeError(`Invalid aggregate identifier: ${value}`);
  }
  return value as AggregateId;
};

export const commandId = (value: string): CommandId => {
  if (value.length < 3 || value.length > 128) {
    throw new TypeError("Command identifiers must contain 3-128 characters");
  }
  return value as CommandId;
};

export const correlationId = (value: string): CorrelationId => {
  if (value.length < 3 || value.length > 128) {
    throw new TypeError("Correlation identifiers must contain 3-128 characters");
  }
  return value as CorrelationId;
};

export const micrometers = (value: bigint): Micrometers =>
  value as Micrometers;

export const nanoradians = (value: bigint): Nanoradians =>
  value as Nanoradians;

export const projectionResidual = (value: bigint): ProjectionResidual =>
  value as ProjectionResidual;

export const streamVersion = (value: number): StreamVersion => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Invalid stream version: ${value}`);
  }
  return value as StreamVersion;
};

export const isoTimestamp = (value: string): IsoTimestamp => {
  if (Number.isNaN(Date.parse(value))) {
    throw new TypeError(`Invalid timestamp: ${value}`);
  }
  return value as IsoTimestamp;
};

export const eventDigest = (value: string): EventDigest => {
  if (!/^[a-f0-9]{64}$/u.test(value)) {
    throw new TypeError("Event digests must be lowercase SHA-256 hex strings");
  }
  return value as EventDigest;
};
