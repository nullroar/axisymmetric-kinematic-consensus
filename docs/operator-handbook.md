# Operator handbook

## Preflight

1. Confirm Node.js 22 or later.
2. Run `npm run verify`.
3. Select an event-store adapter appropriate to the concurrency domain.
4. Establish a durable backup and terminal-digest anchoring policy.
5. Configure telemetry scraping if the Prometheus adapter is used.

## Inspecting state

```bash
akcp inspect primary-axis --journal /var/lib/akcp/events.jsonl
```

Inspection verifies the complete lineage before returning state. An integrity
failure is not a warning; the command terminates without projecting state from
the invalid history.

## Handling failures

| Error | Operator action |
| --- | --- |
| `AKCP_DOMAIN_REJECTION` | Correct intent or lifecycle assumptions |
| `AKCP_CONCURRENCY_CONFLICT` | Reload state and retry with bounded backoff |
| `AKCP_INTEGRITY_VIOLATION` | Quarantine the journal and restore from trusted media |
| `AKCP_INVARIANT_VIOLATION` | Stop writes and preserve the offending stream |
| `AKCP_PROTOCOL_VIOLATION` | Validate producer version and representation |

## Recovery

1. Copy the affected journal without modifying it.
2. Identify the first failing stream version.
3. Compare its digest material against a trusted replica or digest anchor.
4. Restore the last complete trusted stream.
5. Replay from the beginning and compare terminal state.
6. Resume writes only after the complete verification suite passes.

Never “repair” a digest in place. A corrected fact should be represented by an
explicit compensating event in a future protocol revision.

## Capacity

The reference engine performs full replay for every command. This makes behavior
easy to audit but creates linear read amplification. Introduce signed snapshots
when stream length or latency objectives require them, and retain the terminal
event digest used by the snapshot.
