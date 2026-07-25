# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

## Reporting

Do not open a public issue for a vulnerability that could compromise event
integrity, command authorization in a downstream adapter, or operator data.
Use GitHub private vulnerability reporting when enabled.

Include:

- affected package and protocol versions;
- minimal reproduction;
- expected security property;
- observed impact;
- suggested mitigation, if known.

## Response targets

Maintainers aim to acknowledge complete reports within five business days,
provide an initial assessment within ten business days, and coordinate
disclosure after a fix or mitigation is available.

## Cryptographic scope

SHA-256 lineage detects mutation relative to a trusted terminal digest. It is
not an authentication mechanism and does not prevent wholesale history
replacement when the attacker also controls every digest anchor.
