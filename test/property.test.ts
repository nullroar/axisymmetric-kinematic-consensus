import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  micrometers,
  nanoradians,
  projectionResidual,
} from "../src/domain/brands.js";
import { projectArc } from "../src/math/projection.js";

const pseudoRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state;
  };
};

describe("deterministic projection properties", () => {
  it("makes partitioned projection equivalent to aggregate projection", () => {
    const random = pseudoRandom(0xa11ce);

    for (let scenario = 0; scenario < 500; scenario += 1) {
      const radius = micrometers(BigInt((random() % 1_000_000) + 1));
      const deltas = Array.from({ length: 20 }, () =>
        nanoradians(BigInt((random() % 2_000_001) - 1_000_000)),
      );

      let partitionedDisplacement = 0n;
      let residual = projectionResidual(0n);
      for (const delta of deltas) {
        const projection = projectArc(radius, delta, residual);
        partitionedDisplacement += projection.displacement;
        residual = projection.residual;
      }

      const aggregate = projectArc(
        radius,
        nanoradians(deltas.reduce((sum, delta) => sum + delta, 0n)),
        projectionResidual(0n),
      );

      assert.equal(partitionedDisplacement, aggregate.displacement);
      assert.equal(residual, aggregate.residual);
    }
  });
});
