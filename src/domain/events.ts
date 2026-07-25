import type {
  AggregateId,
  CommandId,
  CorrelationId,
  EventDigest,
  IsoTimestamp,
  Micrometers,
  Nanoradians,
  ProjectionResidual,
  StreamVersion,
} from "./brands.js";

export interface PrimitiveInitialized {
  readonly type: "PrimitiveInitialized";
  readonly aggregateId: AggregateId;
  readonly radius: Micrometers;
}

export interface AngularPhaseAdvanced {
  readonly type: "AngularPhaseAdvanced";
  readonly delta: Nanoradians;
  readonly previousPhase: Nanoradians;
  readonly nextPhase: Nanoradians;
  readonly displacementDelta: Micrometers;
  readonly nextResidual: ProjectionResidual;
}

export interface RadialMetricReconfigured {
  readonly type: "RadialMetricReconfigured";
  readonly previousRadius: Micrometers;
  readonly nextRadius: Micrometers;
}

export interface PrimitiveRetired {
  readonly type: "PrimitiveRetired";
  readonly reason: string;
}

export type DomainEvent =
  | PrimitiveInitialized
  | AngularPhaseAdvanced
  | RadialMetricReconfigured
  | PrimitiveRetired;

export interface EventEnvelope<E extends DomainEvent = DomainEvent> {
  readonly streamId: AggregateId;
  readonly streamVersion: StreamVersion;
  readonly event: E;
  readonly commandId: CommandId;
  readonly correlationId: CorrelationId;
  readonly occurredAt: IsoTimestamp;
  readonly previousDigest: EventDigest | null;
  readonly digest: EventDigest;
}
