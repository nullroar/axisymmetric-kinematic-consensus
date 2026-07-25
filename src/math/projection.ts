import {
  micrometers,
  projectionResidual,
  type Micrometers,
  type Nanoradians,
  type ProjectionResidual,
} from "../domain/brands.js";
import { euclideanDivmod, NANO_SCALE } from "./fixed.js";

export interface ArcProjection {
  readonly displacement: Micrometers;
  readonly residual: ProjectionResidual;
}

/**
 * Projects angular displacement onto a tangent without floating-point state.
 * Residual transport ensures that repeated sub-micrometer transitions converge
 * to the same result as one aggregate transition.
 */
export const projectArc = (
  radius: Micrometers,
  delta: Nanoradians,
  priorResidual: ProjectionResidual,
): ArcProjection => {
  if (radius <= 0n) {
    throw new RangeError("Projection radius must be positive");
  }
  if (priorResidual < 0n || priorResidual >= NANO_SCALE) {
    throw new RangeError("Projection residual exceeds canonical bounds");
  }

  const numerator = radius * delta + priorResidual;
  const { quotient, remainder } = euclideanDivmod(numerator, NANO_SCALE);

  return {
    displacement: micrometers(quotient),
    residual: projectionResidual(remainder),
  };
};
