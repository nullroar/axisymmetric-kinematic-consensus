# Governance

## Roles

### Contributors

Anyone who submits reviewed code, documentation, tests, protocol analysis, or
conformance vectors.

### Maintainers

Contributors entrusted with issue triage, reviews, releases, and compatibility
decisions.

### Protocol stewards

Maintainers responsible for normative specification changes and conformance
interpretation.

## Decision process

Routine implementation decisions use lazy consensus after review. A maintainer
may merge when checks pass and no unresolved substantive objection remains.

Protocol changes require:

1. a public design issue;
2. a written ADR;
3. conformance and migration evidence;
4. approval from two protocol stewards;
5. a documented protocol-version decision.

If consensus cannot be reached, the repository owner makes the final decision
and records the rationale.

## Releases

Maintainers prepare releases from the default branch after verification.
Release notes must distinguish package changes from protocol changes and link
the relevant issues and ADRs.

## Changes to governance

Governance changes follow the protocol-change review threshold but do not alter
AKCP compatibility.
