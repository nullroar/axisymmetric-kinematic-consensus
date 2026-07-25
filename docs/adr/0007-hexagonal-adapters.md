# ADR-0007: Hexagonal infrastructure adapters

- Status: Accepted
- Date: 2026-07-25

## Context

The consensus kernel should not depend on a database, clock implementation, or
metrics backend.

## Decision

Define narrow ports for event storage, time, and telemetry. Keep bundled
implementations in an adapter layer.

## Consequences

- The kernel is independently testable.
- Storage and observation technologies can change without domain changes.
- Port semantics, particularly atomic compare-and-append, must be documented.
- Adapters can provide weaker operational guarantees only when clearly labeled.
