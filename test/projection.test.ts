import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  micrometers,
  nanoradians,
  projectionResidual,
} from "../src/domain/brands.js";
import { projectArc } from "../src/math/projection.js";

describe("tangential arc projection", () => {
  it("projects one radian at the configured radius", () => {
    const projected = projectArc(
      micrometers(100_000n),
      nanoradians(1_000_000_000n),
      projectionResidual(0n),
    );
    assert.equal(projected.displacement, 100_000n);
    assert.equal(projected.residual, 0n);
  });

  it("transports residual precision across tiny transitions", () => {
    let residual = projectionResidual(0n);
    let displacement = 0n;

    for (let index = 0; index < 10; index += 1) {
      const projected = projectArc(
        micrometers(1n),
        nanoradians(100_000_000n),
        residual,
      );
      residual = projected.residual;
      displacement += projected.displacement;
    }

    assert.equal(displacement, 1n);
    assert.equal(residual, 0n);
  });

  it("preserves inverse transitions", () => {
    const forward = projectArc(
      micrometers(12_345n),
      nanoradians(987_654_321n),
      projectionResidual(0n),
    );
    const reverse = projectArc(
      micrometers(12_345n),
      nanoradians(-987_654_321n),
      forward.residual,
    );
    assert.equal(forward.displacement + reverse.displacement, 0n);
    assert.equal(reverse.residual, 0n);
  });
});
