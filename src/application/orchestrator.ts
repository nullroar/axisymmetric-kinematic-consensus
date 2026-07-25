import { randomUUID } from "node:crypto";
import {
  aggregateId,
  commandId,
  correlationId,
  micrometers,
  nanoradians,
  type AggregateId,
  type CorrelationId,
} from "../domain/brands.js";
import type { KernelCommand } from "../domain/commands.js";
import type { ConsensusEngine, ExecutionReceipt } from "../kernel/engine.js";
import { parseDecimalToFixed, NANO_SCALE } from "../math/fixed.js";

export class AxisymmetricOrchestrator {
  constructor(private readonly engine: ConsensusEngine) {}

  initialize(
    id: string,
    radiusMillimeters: string,
    correlation = randomUUID(),
  ): Promise<ExecutionReceipt> {
    const streamId = aggregateId(id);
    return this.engine.execute(
      streamId,
      this.withMetadata(
        {
          type: "InitializePrimitive",
          aggregateId: streamId,
          radius: micrometers(
            parseDecimalToFixed(radiusMillimeters, 1_000n),
          ),
        },
        correlationId(correlation),
      ),
    );
  }

  advance(
    streamId: AggregateId,
    radians: string,
    correlation = randomUUID(),
  ): Promise<ExecutionReceipt> {
    return this.engine.execute(
      streamId,
      this.withMetadata(
        {
          type: "AdvanceAngularPhase",
          delta: nanoradians(parseDecimalToFixed(radians, NANO_SCALE)),
        },
        correlationId(correlation),
      ),
    );
  }

  reconfigure(
    streamId: AggregateId,
    radiusMillimeters: string,
    correlation = randomUUID(),
  ): Promise<ExecutionReceipt> {
    return this.engine.execute(
      streamId,
      this.withMetadata(
        {
          type: "ReconfigureRadialMetric",
          radius: micrometers(
            parseDecimalToFixed(radiusMillimeters, 1_000n),
          ),
        },
        correlationId(correlation),
      ),
    );
  }

  retire(
    streamId: AggregateId,
    reason: string,
    correlation = randomUUID(),
  ): Promise<ExecutionReceipt> {
    return this.engine.execute(
      streamId,
      this.withMetadata(
        { type: "RetirePrimitive", reason },
        correlationId(correlation),
      ),
    );
  }

  private withMetadata<T extends Omit<KernelCommand, "commandId" | "correlationId">>(
    command: T,
    correlation: CorrelationId,
  ): T & Pick<KernelCommand, "commandId" | "correlationId"> {
    return {
      ...command,
      commandId: commandId(randomUUID()),
      correlationId: correlation,
    };
  }
}
