import {
  micrometers,
  nanoradians,
  projectionResidual,
  streamVersion,
  type AggregateId,
  type EventDigest,
  type Micrometers,
  type Nanoradians,
  type ProjectionResidual,
  type StreamVersion,
} from "./brands.js";

export type Lifecycle = "void" | "stationary" | "retired";

export interface AggregateState {
  readonly id: AggregateId | null;
  readonly lifecycle: Lifecycle;
  readonly radius: Micrometers;
  readonly phase: Nanoradians;
  readonly displacement: Micrometers;
  readonly residual: ProjectionResidual;
  readonly version: StreamVersion;
  readonly lastDigest: EventDigest | null;
}

export const initialState = (): AggregateState => ({
  id: null,
  lifecycle: "void",
  radius: micrometers(0n),
  phase: nanoradians(0n),
  displacement: micrometers(0n),
  residual: projectionResidual(0n),
  version: streamVersion(0),
  lastDigest: null,
});
