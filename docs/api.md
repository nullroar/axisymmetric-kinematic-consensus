# API guide

## ConsensusEngine

`ConsensusEngine` coordinates loading, verification, replay, decision, envelope
construction, compare-and-append, and observation.

```ts
const engine = new ConsensusEngine(eventStore, clock, telemetry);
const receipt = await engine.execute(streamId, command);
const state = await engine.inspect(streamId);
```

`execute` returns:

- `state`: consensus state after successful append;
- `appended`: envelopes created by this command;
- `idempotentReplay`: whether an existing command identity suppressed append.

## AxisymmetricOrchestrator

The orchestrator accepts decimal operator units and constructs branded protocol
commands:

- `initialize(id, radiusMillimeters, correlation?)`
- `advance(streamId, radians, correlation?)`
- `reconfigure(streamId, radiusMillimeters, correlation?)`
- `retire(streamId, reason, correlation?)`

Decimals are converted to the protocol lattice once at ingress.

## EventStore

```ts
interface EventStore {
  load(streamId): Promise<readonly EventEnvelope[]>;
  append(streamId, expectedVersion, envelopes): Promise<void>;
}
```

Production implementations must make the version comparison and append atomic.

## Clock

The clock supplies valid timestamps for envelopes. Timestamp does not
participate in transition arithmetic, but it is digest material.

## Telemetry

Telemetry receives command counts and duration observations. Failures in a
production telemetry adapter should not be allowed to invalidate a successfully
persisted event; adapters should buffer or contain their own transport errors.
