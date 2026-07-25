import type { KernelCommand } from "../domain/commands.js";
import type { DomainEvent } from "../domain/events.js";
import { DomainRejection } from "../domain/errors.js";
import type { AggregateState } from "../domain/state.js";
import { composePhase } from "../math/cyclotomic.js";
import { projectArc } from "../math/projection.js";

const requireMaterialized = (state: AggregateState): void => {
  if (state.lifecycle === "void") {
    throw new DomainRejection("Primitive has not been initialized");
  }
  if (state.lifecycle === "retired") {
    throw new DomainRejection("Retired primitive cannot accept commands");
  }
};

export const decide = (
  state: AggregateState,
  command: KernelCommand,
): readonly DomainEvent[] => {
  switch (command.type) {
    case "InitializePrimitive": {
      if (state.lifecycle !== "void") {
        throw new DomainRejection("Primitive is already initialized");
      }
      if (command.radius <= 0n) {
        throw new DomainRejection("Radial metric must be positive");
      }
      return [
        {
          type: "PrimitiveInitialized",
          aggregateId: command.aggregateId,
          radius: command.radius,
        },
      ];
    }
    case "AdvanceAngularPhase": {
      requireMaterialized(state);
      if (command.delta === 0n) {
        throw new DomainRejection("Angular transition must be non-zero");
      }
      const projection = projectArc(
        state.radius,
        command.delta,
        state.residual,
      );
      return [
        {
          type: "AngularPhaseAdvanced",
          delta: command.delta,
          previousPhase: state.phase,
          nextPhase: composePhase(state.phase, command.delta),
          displacementDelta: projection.displacement,
          nextResidual: projection.residual,
        },
      ];
    }
    case "ReconfigureRadialMetric": {
      requireMaterialized(state);
      if (command.radius <= 0n) {
        throw new DomainRejection("Radial metric must be positive");
      }
      if (command.radius === state.radius) {
        return [];
      }
      return [
        {
          type: "RadialMetricReconfigured",
          previousRadius: state.radius,
          nextRadius: command.radius,
        },
      ];
    }
    case "RetirePrimitive": {
      requireMaterialized(state);
      const reason = command.reason.trim();
      if (reason.length < 3) {
        throw new DomainRejection(
          "Retirement requires a reason of at least three characters",
        );
      }
      return [{ type: "PrimitiveRetired", reason }];
    }
  }
};
