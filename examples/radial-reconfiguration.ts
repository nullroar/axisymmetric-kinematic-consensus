import {
  aggregateId,
  AxisymmetricOrchestrator,
  ConsensusEngine,
  MemoryEventStore,
  stringifyForOperator,
  SystemClock,
} from "../src/index.js";

const streamId = aggregateId("variable-metric-axis");
const engine = new ConsensusEngine(
  new MemoryEventStore(),
  new SystemClock(),
);
const protocol = new AxisymmetricOrchestrator(engine);

await protocol.initialize(streamId, "80");
await protocol.advance(streamId, "3.141592654");
await protocol.reconfigure(streamId, "120");
await protocol.advance(streamId, "3.141592653");

process.stdout.write(
  `${stringifyForOperator(await engine.inspect(streamId))}\n`,
);
