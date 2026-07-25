import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  AggregateId,
  StreamVersion,
} from "../domain/brands.js";
import type { EventEnvelope } from "../domain/events.js";
import { ConcurrencyConflict, IntegrityViolation } from "../domain/errors.js";
import {
  deserializeEnvelope,
  serializeEnvelope,
} from "../kernel/serialization.js";
import type { EventStore } from "../ports/event-store.js";

export class JsonlEventStore implements EventStore {
  constructor(private readonly journalPath: string) {}

  async load(streamId: AggregateId): Promise<readonly EventEnvelope[]> {
    let source: string;
    try {
      source = await readFile(this.journalPath, "utf8");
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return [];
      }
      throw error;
    }

    return source
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map(deserializeEnvelope)
      .filter((envelope) => envelope.streamId === streamId);
  }

  async append(
    streamId: AggregateId,
    expectedVersion: StreamVersion,
    envelopes: readonly EventEnvelope[],
  ): Promise<void> {
    const current = await this.load(streamId);
    if (current.length !== expectedVersion) {
      throw new ConcurrencyConflict(expectedVersion, current.length);
    }
    if (envelopes.some((envelope) => envelope.streamId !== streamId)) {
      throw new IntegrityViolation("Journal append attempted stream crossover");
    }
    if (envelopes.length === 0) {
      return;
    }

    await mkdir(dirname(this.journalPath), { recursive: true });
    const payload = `${envelopes.map(serializeEnvelope).join("\n")}\n`;
    await appendFile(this.journalPath, payload, "utf8");
  }
}
