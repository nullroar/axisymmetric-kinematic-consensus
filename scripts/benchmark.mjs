import { performance } from "node:perf_hooks";
import {
  aggregateId,
  commandId,
  ConsensusEngine,
  correlationId,
  isoTimestamp,
  MemoryEventStore,
  micrometers,
  nanoradians,
} from "../dist/src/index.js";

class MonotonicClock {
  tick = 0;

  now() {
    const timestamp = new Date(
      Date.UTC(2026, 0, 1, 0, 0, 0, this.tick),
    ).toISOString();
    this.tick += 1;
    return isoTimestamp(timestamp);
  }
}

const transitions = Number.parseInt(
  process.env["AKCP_BENCHMARK_TRANSITIONS"] ?? "10000",
  10,
);
if (!Number.isSafeInteger(transitions) || transitions < 1) {
  throw new Error("AKCP_BENCHMARK_TRANSITIONS must be a positive integer");
}

const streamId = aggregateId("benchmark-axis");
const engine = new ConsensusEngine(new MemoryEventStore(), new MonotonicClock());
await engine.execute(streamId, {
  type: "InitializePrimitive",
  aggregateId: streamId,
  radius: micrometers(100_000n),
  commandId: commandId("benchmark-initialize"),
  correlationId: correlationId("benchmark-correlation"),
});

const startedAt = performance.now();
for (let index = 0; index < transitions; index += 1) {
  await engine.execute(streamId, {
    type: "AdvanceAngularPhase",
    delta: nanoradians(1_000_000n),
    commandId: commandId(`benchmark-command-${index}`),
    correlationId: correlationId("benchmark-correlation"),
  });
}
const elapsed = performance.now() - startedAt;
const state = await engine.inspect(streamId);
const throughput = transitions / (elapsed / 1_000);

process.stdout.write(
  [
    `transitions=${transitions}`,
    `elapsed_ms=${elapsed.toFixed(3)}`,
    `commands_per_second=${throughput.toFixed(2)}`,
    `terminal_version=${state.version}`,
    `terminal_displacement_um=${state.displacement}`,
    "",
  ].join("\n"),
);
