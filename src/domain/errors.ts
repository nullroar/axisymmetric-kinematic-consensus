export abstract class ConsensusKernelError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class DomainRejection extends ConsensusKernelError {
  readonly code = "AKCP_DOMAIN_REJECTION";
}

export class ConcurrencyConflict extends ConsensusKernelError {
  readonly code = "AKCP_CONCURRENCY_CONFLICT";

  constructor(
    readonly expectedVersion: number,
    readonly actualVersion: number,
  ) {
    super(
      `Optimistic concurrency conflict: expected ${expectedVersion}, received ${actualVersion}`,
    );
  }
}

export class IntegrityViolation extends ConsensusKernelError {
  readonly code = "AKCP_INTEGRITY_VIOLATION";
}

export class InvariantViolation extends ConsensusKernelError {
  readonly code = "AKCP_INVARIANT_VIOLATION";

  constructor(readonly violations: readonly string[]) {
    super(`Aggregate invariant violation: ${violations.join("; ")}`);
  }
}

export class ProtocolViolation extends ConsensusKernelError {
  readonly code = "AKCP_PROTOCOL_VIOLATION";
}
