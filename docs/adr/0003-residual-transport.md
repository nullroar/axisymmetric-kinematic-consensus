# ADR-0003: Transport projection residual

- Status: Accepted
- Date: 2026-07-25

## Context

Rounding each small displacement independently makes the result depend on how a
producer partitions an angular transition. That violates observational
equivalence under batching.

## Decision

Carry the non-negative Euclidean numerator remainder from every projection into
the next projection.

## Consequences

- Partitioned and aggregate transitions converge.
- Aggregate state contains a precision residual.
- Radial reconfiguration changes how future residual precision is realized but
  does not rewrite historical displacement.
- Tests must cover positive, negative, and mixed transitions.
