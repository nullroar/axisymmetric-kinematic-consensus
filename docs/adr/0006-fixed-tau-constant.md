# ADR-0006: Fix τ at the protocol boundary

- Status: Accepted
- Date: 2026-07-25

## Context

Deriving τ from platform `Math.PI` creates a hidden dependency on binary
floating-point conversion and cross-language rounding.

## Decision

AKCP-1 defines τ as exactly `6,283,185,307` nanoradians.

## Consequences

- Phase normalization is portable.
- The value is an approximation with a maximum sub-nanoradian angular error.
- Changing the constant requires a new protocol version.
- Implementations must not substitute a more “accurate” local value.
