import {
  streamVersion,
  type AggregateId,
  type EventDigest,
} from "../domain/brands.js";
import type { KernelCommand } from "../domain/commands.js";
import type { DomainEvent, EventEnvelope } from "../domain/events.js";
import type { AggregateState } from "../domain/state.js";
import type { Clock } from "../ports/clock.js";
import type { EventStore } from "../ports/event-store.js";
import {
  nullTelemetry,
  type Telemetry,
} from "../ports/telemetry.js";
import { decide } from "./decider.js";
import { materializeEnvelope, verifyHashChain } from "./hash.js";
import { replay } from "./reducer.js";

export interface ExecutionReceipt {
  readonly state: AggregateState;
  readonly appended: readonly EventEnvelope[];
  readonly idempotentReplay: boolean;
}

export class ConsensusEngine {
  constructor(
    private readonly store: EventStore,
    private readonly clock: Clock,
    private readonly telemetry: Telemetry = nullTelemetry,
  ) {}

  async inspect(streamId: AggregateId): Promise<AggregateState> {
    const envelopes = await this.store.load(streamId);
    verifyHashChain(envelopes);
    return replay(envelopes);
  }

  async execute(
    streamId: AggregateId,
    command: KernelCommand,
  ): Promise<ExecutionReceipt> {
    const startedAt = performance.now();
    const envelopes = await this.store.load(streamId);
    verifyHashChain(envelopes);

    if (
      envelopes.some((envelope) => envelope.commandId === command.commandId)
    ) {
      this.telemetry.increment("akcp_command_idempotent_total", 1, {
        command: command.type,
      });
      return {
        state: replay(envelopes),
        appended: [],
        idempotentReplay: true,
      };
    }

    const state = replay(envelopes);
    const events = decide(state, command);
    const appended = this.envelop(
      streamId,
      state.version,
      state.lastDigest,
      command,
      events,
    );
    await this.store.append(streamId, state.version, appended);
    const nextState = replay(appended, state);

    this.telemetry.increment("akcp_command_total", 1, {
      command: command.type,
    });
    this.telemetry.observe(
      "akcp_command_duration_milliseconds",
      performance.now() - startedAt,
      { command: command.type },
    );

    return {
      state: nextState,
      appended,
      idempotentReplay: false,
    };
  }

  private envelop(
    streamId: AggregateId,
    initialVersion: number,
    initialDigest: EventDigest | null,
    command: KernelCommand,
    events: readonly DomainEvent[],
  ): readonly EventEnvelope[] {
    let previousDigest = initialDigest;
    return events.map((event, index) => {
      const envelope = materializeEnvelope({
        streamId,
        streamVersion: streamVersion(initialVersion + index + 1),
        event,
        commandId: command.commandId,
        correlationId: command.correlationId,
        occurredAt: this.clock.now(),
        previousDigest,
      });
      previousDigest = envelope.digest;
      return envelope;
    });
  }
}
