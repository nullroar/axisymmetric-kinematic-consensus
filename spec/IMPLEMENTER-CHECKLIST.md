# AKCP-1 implementer checklist

An implementation should not claim AKCP-1 conformance until each item is
demonstrated by executable evidence.

## Representation

- [ ] Consensus integers use an arbitrary-precision representation.
- [ ] Decimal operator input is converted once at ingress.
- [ ] Durable integers never transit through an IEEE-754 JSON number.
- [ ] τ is the exact protocol constant `6,283,185,307`.
- [ ] Identifiers, timestamps, and digests enforce AKCP-1 constraints.

## Arithmetic

- [ ] Negative phase uses Euclidean normalization into `[0, τ)`.
- [ ] Projection uses Euclidean division by `1,000,000,000`.
- [ ] Projection residual remains in `[0, 1,000,000,000)`.
- [ ] Partitioned projection equals aggregate projection.
- [ ] Forward and exact inverse transitions restore displacement and residual.

## Decision and replay

- [ ] Void state accepts only initialization.
- [ ] Stationary state accepts transition, reconfiguration, and retirement.
- [ ] Retired state rejects every new domain command.
- [ ] No-op radial reconfiguration does not append a fact.
- [ ] Reusing a persisted command identity is idempotent.
- [ ] Reducer output depends only on prior state and the current event.

## Integrity

- [ ] Canonical object keys use the AKCP-1 ordering rule.
- [ ] Bigints canonicalize as `{"$bigint":"n"}`.
- [ ] Every envelope digest commits to all fields except itself.
- [ ] Stream versions are one-based and contiguous.
- [ ] Predecessor digests form an unbroken chain.
- [ ] Complete lineage is verified before replay affects a decision.
- [ ] Snapshot restoration verifies its state digest.

## Persistence

- [ ] Compare-and-append is atomic for the adapter concurrency domain.
- [ ] Stale expected versions fail without a partial append.
- [ ] Cross-stream append is impossible.
- [ ] Serialization round-trips every event without precision loss.
- [ ] Recovery behavior is documented and tested.

## Evidence

- [ ] All published conformance vectors pass.
- [ ] Mutation, deletion, insertion, and reordering are rejected.
- [ ] Boundary and negative-traversal cases are covered.
- [ ] Runtime and package versions are recorded with results.
- [ ] An independent implementation reproduces terminal state and digests.
