import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateId,
  commandId,
  correlationId,
  micrometers,
  nanoradians,
} from "../src/domain/brands.js";
import { MemoryEventStore } from "../src/adapters/memory-event-store.js";
import { ConsensusEngine } from "../src/kernel/engine.js";
import { DeterministicClock } from "./support.js";

describe("consensus engine", () => {
  it("materializes and advances a primitive", async () => {
    const streamId = aggregateId("engine-axis");
    const engine = new ConsensusEngine(
      new MemoryEventStore(),
      new DeterministicClock(),
    );

    await engine.execute(streamId, {
      type: "InitializePrimitive",
      aggregateId: streamId,
      commandId: commandId("cmd-initialize"),
      correlationId: correlationId("corr-engine"),
      radius: micrometers(50_000n),
    });
    const receipt = await engine.execute(streamId, {
      type: "AdvanceAngularPhase",
      commandId: commandId("cmd-advance"),
      correlationId: correlationId("corr-engine"),
      delta: nanoradians(2_000_000_000n),
    });

    assert.equal(receipt.state.displacement, 100_000n);
    assert.equal(receipt.state.version, 2);
    assert.equal(receipt.appended.length, 1);
  });

  it("recognizes command-level idempotency", async () => {
    const streamId = aggregateId("idempotent-axis");
    const engine = new ConsensusEngine(
      new MemoryEventStore(),
      new DeterministicClock(),
    );
    const command = {
      type: "InitializePrimitive" as const,
      aggregateId: streamId,
      commandId: commandId("cmd-identical"),
      correlationId: correlationId("corr-identical"),
      radius: micrometers(50_000n),
    };

    await engine.execute(streamId, command);
    const replay = await engine.execute(streamId, command);

    assert.equal(replay.idempotentReplay, true);
    assert.equal(replay.appended.length, 0);
    assert.equal(replay.state.version, 1);
  });
});
