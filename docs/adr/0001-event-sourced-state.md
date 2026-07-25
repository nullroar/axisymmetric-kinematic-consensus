# ADR-0001: Event-sourced aggregate state

- Status: Accepted
- Date: 2026-07-25

## Context

Current displacement alone cannot explain the radial metric, transition
partitioning, retries, or lifecycle decisions that produced it. Mutable state
also makes deterministic reconstruction and historical mutation detection
external concerns.

## Decision

The authoritative record is a versioned stream of immutable domain events.
Aggregate state is a pure fold over verified envelopes.

## Consequences

- Every state is reproducible and auditable.
- Command decisions can be tested without persistence.
- Storage grows with transition count.
- Full replay is linear until snapshots are introduced.
- Event meaning becomes a protocol compatibility commitment.
