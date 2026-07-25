# Threat model

## Assets

AKCP protects:

- deterministic aggregate reconstruction;
- event ordering and predecessor lineage;
- command retry safety;
- numeric portability across runtimes;
- detection of persisted event and snapshot mutation.

## Trust boundaries

The command producer, event store, clock, telemetry sink, and operator interface
are separate trust boundaries. The reference kernel validates domain intent and
persisted lineage but does not authenticate external principals.

## Addressed threats

### Historical event mutation

Every envelope digest commits to the domain event and all routing metadata.
Every event after version 1 also commits to its predecessor digest. Mutation,
reordering, deletion within a loaded stream, or insertion is detected before
replay.

### Duplicate delivery

Persisted command identities are searched before decision. An exact retry does
not append another event.

### Lost update

Stores compare the caller's expected version with the current stream length.
Production adapters must make this comparison atomic with append.

### Floating-point divergence

Consensus arithmetic uses bigint quantities and a protocol-fixed τ constant.
Durable state never depends on `Math.PI`, trigonometric libraries, CPU rounding
modes, or JSON number precision.

### Snapshot mutation

Snapshots commit to canonical state serialization and are verified with a
constant-time digest comparison before restoration.

## Non-goals

AKCP does not provide:

- authentication, authorization, or transport encryption;
- signatures proving which principal authored an event;
- Byzantine fault tolerance or distributed leader election;
- tamper prevention when an attacker can rewrite both data and trusted digest
  anchors;
- cross-process locking for the JSONL demonstration adapter;
- real-time control-system safety certification.

For hostile persistence, anchor terminal digests in an independently controlled
transparency service or sign them with a protected key.
