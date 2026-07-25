import type {
  AggregateId,
  CommandId,
  CorrelationId,
  Micrometers,
  Nanoradians,
} from "./brands.js";

interface CommandMetadata {
  readonly commandId: CommandId;
  readonly correlationId: CorrelationId;
}

export interface InitializePrimitive extends CommandMetadata {
  readonly type: "InitializePrimitive";
  readonly aggregateId: AggregateId;
  readonly radius: Micrometers;
}

export interface AdvanceAngularPhase extends CommandMetadata {
  readonly type: "AdvanceAngularPhase";
  readonly delta: Nanoradians;
}

export interface ReconfigureRadialMetric extends CommandMetadata {
  readonly type: "ReconfigureRadialMetric";
  readonly radius: Micrometers;
}

export interface RetirePrimitive extends CommandMetadata {
  readonly type: "RetirePrimitive";
  readonly reason: string;
}

export type KernelCommand =
  | InitializePrimitive
  | AdvanceAngularPhase
  | ReconfigureRadialMetric
  | RetirePrimitive;
