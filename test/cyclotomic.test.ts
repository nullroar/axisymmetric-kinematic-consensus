import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nanoradians } from "../src/domain/brands.js";
import {
  composePhase,
  decomposeWinding,
  normalizePhase,
  TAU_NANORADIANS,
} from "../src/math/cyclotomic.js";

describe("cyclotomic phase topology", () => {
  it("normalizes both traversal directions", () => {
    assert.equal(normalizePhase(TAU_NANORADIANS), 0n);
    assert.equal(normalizePhase(nanoradians(-1n)), TAU_NANORADIANS - 1n);
  });

  it("decomposes winding number from canonical phase", () => {
    const decomposition = decomposeWinding(
      nanoradians(TAU_NANORADIANS * 3n + 42n),
    );
    assert.equal(decomposition.completedRevolutions, 3n);
    assert.equal(decomposition.normalizedPhase, 42n);
  });

  it("composes phase transitions modulo τ", () => {
    assert.equal(
      composePhase(
        nanoradians(TAU_NANORADIANS - 10n),
        nanoradians(20n),
      ),
      10n,
    );
  });
});
