# Contributing

AKCP welcomes implementations, adapters, conformance vectors, documentation,
and protocol analysis.

## Before proposing a change

1. Read [AKCP-1](./spec/AKCP-1.md).
2. Read the [consensus invariants](./docs/invariants.md).
3. Search existing issues and architectural decision records.
4. Open a protocol proposal before changing durable representation or replay.

## Development

```bash
npm install
npm run verify
```

The verification command runs type checking, architectural boundaries, unit and
generative tests, and the protocol conformance vector.

## Change classification

### Implementation change

Does not alter AKCP-1 semantics. Examples include a new storage adapter,
telemetry exporter, performance improvement, or additional test.

### Clarification

Improves normative language without changing a conforming replay result.

### Protocol change

Changes constants, canonicalization, event meaning, lifecycle, digest material,
or projection arithmetic. It requires:

- a tracking issue labeled `protocol`;
- a new or superseding ADR;
- conformance vectors;
- migration analysis;
- explicit protocol-version decision.

## Commit discipline

Prefer small commits that each establish one inspectable fact. Use imperative
subjects, explain architectural motivation in the body when it is not obvious,
and keep generated artifacts out of source control.

## Pull requests

A pull request should state:

- the invariant or operator need being addressed;
- whether consensus output can change;
- tests added or changed;
- compatibility and migration impact;
- performance impact where applicable.

All checks must pass. At least one maintainer review is required for
implementation changes and two for protocol changes.

## Certificate of origin

By contributing, you certify that you have the right to submit the work under
the repository license. Sign off commits with:

```text
Signed-off-by: Your Name <you@example.com>
```
