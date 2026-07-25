import {
  aggregateId,
  AxisymmetricOrchestrator,
  ConsensusEngine,
  MemoryEventStore,
  PrometheusTelemetry,
  stringifyForOperator,
  SystemClock,
} from "../src/index.js";

const telemetry = new PrometheusTelemetry();
const engine = new ConsensusEngine(
  new MemoryEventStore(),
  new SystemClock(),
  telemetry,
);
const protocol = new AxisymmetricOrchestrator(engine);

await protocol.initialize("reference-axis", "100");
await protocol.advance(aggregateId("reference-axis"), "1.570796327");
await protocol.advance(aggregateId("reference-axis"), "1.570796327");

const state = await engine.inspect(aggregateId("reference-axis"));

process.stdout.write("Consensus state\n");
process.stdout.write(`${stringifyForOperator(state)}\n\n`);
process.stdout.write("Prometheus exposition\n");
process.stdout.write(telemetry.exposition());
