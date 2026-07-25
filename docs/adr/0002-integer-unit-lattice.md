# ADR-0002: Integer unit lattice

- Status: Accepted
- Date: 2026-07-25

## Context

IEEE-754 arithmetic introduces representation error and cross-language
serialization ambiguity. Consensus state must survive replay across runtimes.

## Decision

Represent angular state in integer nanoradians and linear state in integer
micrometers. Use bigint arithmetic for all projection operations.

## Consequences

- Replay is independent of floating-point behavior.
- JSON persistence needs an explicit bigint codec.
- External decimals are rounded once at ingress.
- Scalar operations are slower than native floating-point arithmetic.
- Unit scales become protocol constants.
