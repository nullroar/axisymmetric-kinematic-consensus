import {
  nanoradians,
  type Nanoradians,
} from "../domain/brands.js";
import { euclideanDivmod } from "./fixed.js";

/**
 * Integer nanoradian approximation of τ. The protocol chooses a fixed value to
 * make phase normalization bit-for-bit reproducible across runtimes.
 */
export const TAU_NANORADIANS = nanoradians(6_283_185_307n);

export const normalizePhase = (phase: Nanoradians): Nanoradians => {
  const { remainder } = euclideanDivmod(phase, TAU_NANORADIANS);
  return nanoradians(remainder);
};

export const composePhase = (
  phase: Nanoradians,
  delta: Nanoradians,
): Nanoradians => normalizePhase(nanoradians(phase + delta));

export interface WindingDecomposition {
  readonly normalizedPhase: Nanoradians;
  readonly completedRevolutions: bigint;
}

export const decomposeWinding = (
  totalPhase: Nanoradians,
): WindingDecomposition => {
  const { quotient, remainder } = euclideanDivmod(
    totalPhase,
    TAU_NANORADIANS,
  );
  return {
    normalizedPhase: nanoradians(remainder),
    completedRevolutions: quotient,
  };
};
