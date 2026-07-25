import {
  aggregateId,
  AxisymmetricOrchestrator,
  ConsensusEngine,
  MemoryEventStore,
  streamVersion,
  SystemClock,
} from "../src/index.js";

const streamId = aggregateId("replicated-axis");
const primaryStore = new MemoryEventStore();
const primary = new ConsensusEngine(primaryStore, new SystemClock());
const protocol = new AxisymmetricOrchestrator(primary);

await protocol.initialize(streamId, "250");
await protocol.advance(streamId, "6.283185307");
await protocol.advance(streamId, "-0.125");

const transportBatch = await primaryStore.load(streamId);
const replicaStore = new MemoryEventStore();
await replicaStore.append(streamId, streamVersion(0), transportBatch);

const replica = new ConsensusEngine(replicaStore, new SystemClock());
const [primaryState, replicaState] = await Promise.all([
  primary.inspect(streamId),
  replica.inspect(streamId),
]);

if (
  primaryState.lastDigest !== replicaState.lastDigest ||
  primaryState.displacement !== replicaState.displacement
) {
  throw new Error("Replica failed deterministic convergence");
}

process.stdout.write(
  `Converged at version ${replicaState.version} with digest ${replicaState.lastDigest}\n`,
);
