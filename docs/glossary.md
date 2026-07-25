# Glossary

**Aggregate**  
The consistency boundary representing one axisymmetric primitive.

**Angular phase**  
The canonical location on the quotient space ℝ/τℤ, encoded in integer
nanoradians.

**Command**  
An expression of intent that may be rejected, accepted without facts, or
translated into one or more domain events.

**Consensus state**  
The integer and symbolic state on which all conforming replayers must agree.
This project uses “consensus” in the deterministic state-machine sense; it does
not implement Byzantine quorum consensus.

**Correlation identity**  
An identifier grouping causally related commands across a workflow.

**Cyclotomic normalization**  
Reduction of an unbounded angular coordinate into the canonical interval
`[0, τ)`.

**Displacement**  
Signed linear distance accumulated by tangential projection.

**Envelope**  
A domain event plus stream identity, version, command metadata, timestamp,
predecessor digest, and current digest.

**Lineage**  
The SHA-256 predecessor chain proving event ordering and mutation visibility.

**Materialization**  
The transition from void state to an identified aggregate with a positive
radial metric.

**Projection residual**  
The exact numerator remainder transported between projections to prevent
partition-dependent precision loss.

**Radial metric**  
The positive distance between the axis and the projected boundary.

**Replay**  
Reconstruction of state by folding verified events in stream-version order.

**Stream version**  
The one-based position of an event in an aggregate history.

**Tangential projection**  
Conversion of angular phase delta to linear displacement under a radial metric.

**Winding number**  
The signed number of complete τ traversals removed during phase normalization.
