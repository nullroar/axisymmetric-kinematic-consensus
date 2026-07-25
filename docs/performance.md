# Performance model

## Complexity

For a stream of `n` events and a command yielding `k` events:

| Operation | Time | Additional memory |
| --- | ---: | ---: |
| Integrity verification | O(n) | O(1) |
| Replay | O(n) | O(1) |
| Decision | O(1) | O(k) |
| Append | adapter-defined | O(k) |
| Inspection | O(n) | O(1) |

The in-memory adapter copies stream arrays on load and append, making its
practical additional memory O(n). It prioritizes isolation over throughput.

## Benchmark

Run:

```bash
npm run benchmark
```

The benchmark warms the runtime, executes a fixed number of phase transitions,
verifies final state, and reports commands per second. It is a regression
instrument, not a universal capacity claim.

## Snapshot threshold

A production adapter can choose a threshold from:

```text
snapshot when replay_cost(n) > tolerated_read_latency
```

Snapshots must be treated as acceleration data. The event stream remains the
authoritative record, and restoration must verify the snapshot digest before
folding its suffix.

## Numeric cost

Bigint multiplication is more expensive than IEEE-754 multiplication, but the
operands are small and fixed-width in typical protocol use. The determinism and
partition-equivalence guarantees are intentionally prioritized over peak scalar
throughput.
