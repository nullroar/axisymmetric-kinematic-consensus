import type {
  AggregateId,
  StreamVersion,
} from "../domain/brands.js";
import type { EventEnvelope } from "../domain/events.js";
import { ConcurrencyConflict, IntegrityViolation } from "../domain/errors.js";
import type { EventStore } from "../ports/event-store.js";

export class MemoryEventStore implements EventStore {
  readonly #streams = new Map<AggregateId, readonly EventEnvelope[]>();

  async load(streamId: AggregateId): Promise<readonly EventEnvelope[]> {
    return [...(this.#streams.get(streamId) ?? [])];
  }

  async append(
    streamId: AggregateId,
    expectedVersion: StreamVersion,
    envelopes: readonly EventEnvelope[],
  ): Promise<void> {
    const current = this.#streams.get(streamId) ?? [];
    if (current.length !== expectedVersion) {
      throw new ConcurrencyConflict(expectedVersion, current.length);
    }
    if (envelopes.some((envelope) => envelope.streamId !== streamId)) {
      throw new IntegrityViolation("Cross-stream append is prohibited");
    }
    if (
      envelopes.some(
        (envelope, index) =>
          envelope.streamVersion !== current.length + index + 1,
      )
    ) {
      throw new IntegrityViolation("Append batch is not version-contiguous");
    }

    this.#streams.set(streamId, [...current, ...envelopes]);
  }
}
