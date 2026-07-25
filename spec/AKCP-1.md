# AKCP-1: Axisymmetric Kinematic Consensus Protocol

Status: **Reference**

## 1. Scope

AKCP-1 defines deterministic state transition, event lineage, replay, and
tangential displacement semantics for an axisymmetric primitive. It specifies
consensus behavior, not transport or storage technology.

Normative terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
are interpreted as described by RFC 2119 and RFC 8174.

## 2. Primitive types

| Type | Representation | Constraint |
| --- | --- | --- |
| Aggregate identifier | UTF-8 string | 3–128 protocol-safe characters |
| Command identifier | UTF-8 string | 3–128 characters |
| Correlation identifier | UTF-8 string | 3–128 characters |
| Micrometers | signed integer | arbitrary precision |
| Nanoradians | signed integer | arbitrary precision |
| Residual | integer | `0 ≤ ε < 10⁹` |
| Stream version | integer | `v ≥ 0`, safe for host representation |
| Digest | lowercase hex | 64 SHA-256 hex characters |
| Timestamp | RFC 3339 string | valid instant |

Consensus integers MUST NOT transit through a representation that can lose
integer precision.

## 3. Constants

```text
NANO_SCALE = 1,000,000,000
TAU_NANORADIANS = 6,283,185,307
```

Conforming implementations MUST use the protocol constant and MUST NOT derive
it from a runtime π constant.

## 4. State

An aggregate state contains:

```text
id: AggregateId | null
lifecycle: void | stationary | retired
radius: Micrometers
phase: Nanoradians
displacement: Micrometers
residual: ProjectionResidual
version: StreamVersion
lastDigest: EventDigest | null
```

Initial state is:

```text
(null, void, 0, 0, 0, 0, 0, null)
```

## 5. Phase normalization

Phase belongs to ℝ/τℤ and MUST be stored in `[0, τ)`.

For signed integer `p`, normalization is the Euclidean remainder:

```text
normalize(p) = p - floor(p / τ)τ
```

Host-language signed remainder MUST NOT be used without correcting negative
results.

## 6. Tangential projection

For radius `r > 0`, angular delta `θ`, and prior residual `ε`:

```text
n = rθ + ε
Δx = floor(n / NANO_SCALE)
ε′ = n - Δx·NANO_SCALE
```

Division is Euclidean: the residual is always non-negative and strictly below
the scale. The residual is carried to the next transition. State evolves:

```text
displacement′ = displacement + Δx
phase′ = normalize(phase + θ)
residual′ = ε′
```

## 7. Commands

Every command carries a command identity and correlation identity.

### 7.1 InitializePrimitive

Carries aggregate identity and positive radial metric. It is admissible only in
void state and emits `PrimitiveInitialized`.

### 7.2 AdvanceAngularPhase

Carries a non-zero nanoradian delta. It is admissible only in stationary state
and emits `AngularPhaseAdvanced` with prior phase, next phase, projected
displacement delta, and next residual.

### 7.3 ReconfigureRadialMetric

Carries a positive radial metric. It is admissible only in stationary state. An
unchanged metric emits no event; otherwise it emits
`RadialMetricReconfigured`.

### 7.4 RetirePrimitive

Carries a non-trivial operator reason. It is admissible only in stationary
state and emits `PrimitiveRetired`.

## 8. Event envelopes

Every domain event MUST be enclosed with:

```text
streamId
streamVersion
event
commandId
correlationId
occurredAt
previousDigest
digest
```

The digest is SHA-256 over canonical UTF-8 serialization of all fields except
`digest`.

## 9. Canonical serialization

Canonical serialization follows these rules:

1. null, booleans, finite numbers, and strings use JSON token syntax;
2. bigint `n` becomes the object `{"$bigint":"n"}`;
3. arrays preserve order;
4. object keys are sorted using the reference `en-US` lexical order;
5. unsupported values cause protocol rejection;
6. no insignificant whitespace is emitted.

Protocol implementations SHOULD consume the conformance vectors before
claiming AKCP-1 compatibility.

## 10. Stream lineage

The first event MUST have version 1 and null predecessor. For every later
event:

```text
versionᵢ = versionᵢ₋₁ + 1
previousDigestᵢ = digestᵢ₋₁
```

Complete lineage MUST be verified before replay influences a decision.

## 11. Idempotency and concurrency

A command identity already present in a stream MUST NOT append another event.
Compare-and-append MUST fail when the current terminal version differs from the
version used for decision.

## 12. Replay

Implementations MUST apply events in ascending contiguous version order. Replay
from the empty state over an intact stream MUST produce the same consensus state
for all conforming implementations.

## 13. Compatibility

Changing constants, projection arithmetic, canonicalization, digest material,
event interpretation, or lifecycle admissibility requires a new protocol
identifier.
