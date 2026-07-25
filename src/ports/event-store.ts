import type {
  AggregateId,
  StreamVersion,
} from "../domain/brands.js";
import type { EventEnvelope } from "../domain/events.js";

export interface EventStore {
  load(streamId: AggregateId): Promise<readonly EventEnvelope[]>;
  append(
    streamId: AggregateId,
    expectedVersion: StreamVersion,
    envelopes: readonly EventEnvelope[],
  ): Promise<void>;
}
