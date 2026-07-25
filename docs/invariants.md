# Consensus invariants

This document describes properties that every state transition and compatible
adapter must preserve.

## I-001 — Materialization identity

A void aggregate has no identifier. A materialized or retired aggregate has
exactly one identifier, and the identifier never changes.

## I-002 — Positive radial metric

Every materialized aggregate has a radial metric greater than zero micrometers.
Zero and negative metrics are rejected at the command boundary.

## I-003 — Canonical phase

Phase always inhabits the half-open interval:

```text
0 ≤ phase < 6,283,185,307 nanoradians
```

Backward traversal uses Euclidean normalization, not the signed remainder
operator exposed directly by JavaScript.

## I-004 — Bounded residual

The transported projection residual always satisfies:

```text
0 ≤ residual < 10⁹
```

The residual is the Euclidean remainder of the exact projection numerator.

## I-005 — Version contiguity

The first event has version 1. Every subsequent event increments the version by
exactly one. Aggregate state version equals the terminal event version.

## I-006 — Digest lineage

The first event has a null predecessor. Every later event cites the exact digest
of its immediate predecessor. State retains the terminal digest.

## I-007 — Partition equivalence

For a fixed radial metric, projecting any finite sequence of angular deltas with
residual transport produces the same displacement and residual as projecting
their sum once.

## I-008 — Retirement finality

No command can produce domain events after retirement. Historical replay
remains available.

## I-009 — Command idempotency

Re-presenting a previously persisted command identity yields current state
without appending events.

## I-010 — Numeric closure

Consensus quantities are integers. NaN, infinities, negative zero, locale
formatting, binary floating-point rounding modes, and platform math libraries
cannot affect replay.

## Verification

Runtime checks cover structural state invariants. Hash-chain verification covers
history integrity. Generative tests cover partition equivalence over 500
deterministic scenarios per run. Protocol fixtures cover cross-boundary
representation.
