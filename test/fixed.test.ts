import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  euclideanDivmod,
  formatFixed,
  parseDecimalToFixed,
  roundHalfAwayFromZero,
} from "../src/math/fixed.js";

describe("fixed-point arithmetic", () => {
  it("parses and formats decimals without binary floating point", () => {
    assert.equal(parseDecimalToFixed("17.250001", 1_000_000n), 17_250_001n);
    assert.equal(parseDecimalToFixed("-0.125", 1_000n), -125n);
    assert.equal(formatFixed(17_250_001n, 1_000_000n), "17.250001");
  });

  it("rounds discarded precision deterministically", () => {
    assert.equal(parseDecimalToFixed("1.23456", 1_000n), 1_235n);
    assert.equal(parseDecimalToFixed("-1.23456", 1_000n), -1_235n);
    assert.equal(roundHalfAwayFromZero(5n, 2n), 3n);
    assert.equal(roundHalfAwayFromZero(-5n, 2n), -3n);
  });

  it("uses Euclidean rather than truncating division", () => {
    assert.deepEqual(euclideanDivmod(-1n, 10n), {
      quotient: -1n,
      remainder: 9n,
    });
  });
});
