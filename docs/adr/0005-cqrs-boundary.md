# ADR-0005: Separate decision from reduction

- Status: Accepted
- Date: 2026-07-25

## Context

Combining command validation, state mutation, and persistence makes retries and
failure ordering difficult to reason about.

## Decision

Use a pure decider from `(state, command)` to events and a pure reducer from
`(state, event)` to state. The engine coordinates verification and persistence.

## Consequences

- Domain behavior is independently testable.
- Persistence failures cannot partially mutate in-memory aggregate state.
- Event types carry enough information for deterministic reduction.
- Application orchestration contains additional ceremony.
