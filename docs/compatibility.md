# Compatibility policy

AKCP separates package compatibility from protocol compatibility.

## Package API

The npm package follows semantic versioning:

- patch: compatible corrections and internal improvements;
- minor: additive exports, commands, adapters, or event types;
- major: incompatible TypeScript or runtime API changes.

## Protocol

The envelope and consensus semantics are versioned as `AKCP-N`. A package major
version does not automatically imply a protocol revision.

Compatible AKCP-1 changes may:

- add optional non-consensus operator metadata;
- add schemas for already normative structures;
- clarify language without changing replay;
- improve adapters while preserving port semantics.

AKCP-2 is required to:

- change τ or numeric scales;
- alter rounding or residual transport;
- reinterpret an existing event;
- change digest material or canonicalization;
- permit lifecycle transitions currently rejected;
- modify stream version or lineage rules.

## Runtime support

The reference package supports maintained Node.js releases with bigint,
`node:crypto`, ESM, and the built-in test runner. The minimum runtime is stated
in `package.json`.
