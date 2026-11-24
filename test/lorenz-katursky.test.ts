import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LORENZ_KATURSKY_SCALE,
  TURBO_VARIANCE_LK1,
  corrugateTurboVariance,
  corrugationResidualVector,
  lorenzKaturskyMatrix,
  turboVarianceVector,
} from "../src/math/lorenz-katursky.js";

describe("Lorenz-Katursky turbo variance corrugation", () => {
  it("couples the canonical three-channel variance vector", () => {
    const result = corrugateTurboVariance(
      TURBO_VARIANCE_LK1,
      turboVarianceVector(4_000_000n, 2_000_000n, -1_000_000n),
    );

    assert.deepEqual(result.corrugation, [4_625_000n, 1_875_000n, -1_000_000n]);
    assert.deepEqual(result.residual, [0n, 0n, 0n]);
  });

  it("preserves aggregate equivalence through residual transport", () => {
    const firstVariance = turboVarianceVector(1_234_567n, -765_432n, 111_111n);
    const secondVariance = turboVarianceVector(-222_222n, 333_333n, -444_444n);

    const first = corrugateTurboVariance(TURBO_VARIANCE_LK1, firstVariance);
    const second = corrugateTurboVariance(
      TURBO_VARIANCE_LK1,
      secondVariance,
      first.residual,
    );
    const aggregate = corrugateTurboVariance(
      TURBO_VARIANCE_LK1,
      turboVarianceVector(
        firstVariance[0] + secondVariance[0],
        firstVariance[1] + secondVariance[1],
        firstVariance[2] + secondVariance[2],
      ),
    );

    assert.deepEqual(
      turboVarianceVector(
        first.corrugation[0] + second.corrugation[0],
        first.corrugation[1] + second.corrugation[1],
        first.corrugation[2] + second.corrugation[2],
      ),
      aggregate.corrugation,
    );
    assert.deepEqual(second.residual, aggregate.residual);
  });

  it("canonicalizes negative subscale excitation", () => {
    const identity = lorenzKaturskyMatrix([
      [LORENZ_KATURSKY_SCALE, 0n, 0n],
      [0n, LORENZ_KATURSKY_SCALE, 0n],
      [0n, 0n, LORENZ_KATURSKY_SCALE],
    ]);
    const result = corrugateTurboVariance(
      identity,
      turboVarianceVector(-1n, 0n, 0n),
      corrugationResidualVector(1n, 0n, 0n),
    );

    assert.deepEqual(result.corrugation, [-1n, 0n, 0n]);
    assert.deepEqual(result.residual, [1n, 0n, 0n]);
  });

  it("rejects matrices that do not preserve the canonical lattice", () => {
    assert.throws(
      () =>
        lorenzKaturskyMatrix([
          [LORENZ_KATURSKY_SCALE, 0n, 0n],
          [0n, LORENZ_KATURSKY_SCALE, 0n],
          [0n, 0n, LORENZ_KATURSKY_SCALE - 1n],
        ]),
      /preserve the canonical variance lattice/u,
    );
  });

  it("rejects non-canonical residual components", () => {
    assert.throws(
      () => corrugationResidualVector(LORENZ_KATURSKY_SCALE, 0n, 0n),
      /within scale bounds/u,
    );
  });
});
