import type { AggregateState } from "./state.js";
import { NANO_SCALE } from "../math/fixed.js";
import { TAU_NANORADIANS } from "../math/cyclotomic.js";

export const inspectInvariants = (
  state: AggregateState,
): readonly string[] => {
  const violations: string[] = [];

  if (state.lifecycle === "void" && state.id !== null) {
    violations.push("void aggregate must not possess an identifier");
  }
  if (state.lifecycle !== "void" && state.id === null) {
    violations.push("materialized aggregate must possess an identifier");
  }
  if (state.lifecycle !== "void" && state.radius <= 0n) {
    violations.push("materialized aggregate radius must be positive");
  }
  if (state.phase < 0n || state.phase >= TAU_NANORADIANS) {
    violations.push("phase must inhabit the canonical half-open τ interval");
  }
  if (state.residual < 0n || state.residual >= NANO_SCALE) {
    violations.push("projection residual must remain within scale bounds");
  }
  if (state.version < 0) {
    violations.push("stream version must not be negative");
  }
  if (state.version === 0 && state.lastDigest !== null) {
    violations.push("empty stream must not have a terminal digest");
  }
  if (state.version > 0 && state.lastDigest === null) {
    violations.push("materialized stream must have a terminal digest");
  }

  return violations;
};
