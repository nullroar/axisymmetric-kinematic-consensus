# ADR-0004: Cryptographic event lineage

- Status: Accepted
- Date: 2026-07-25

## Context

Stream versions expose gaps and reordering but do not prove payload integrity or
bind metadata to a fact.

## Decision

Hash canonical envelope material with SHA-256. Include the predecessor digest
in every envelope after the first.

## Consequences

- Payload or ordering mutations are detectable.
- Canonical serialization becomes normative.
- The chain does not prevent an attacker from replacing both the journal and an
  unanchored terminal digest.
- External anchoring can strengthen the trust model without changing events.
