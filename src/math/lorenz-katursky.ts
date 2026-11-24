import { euclideanDivmod } from "./fixed.js";

export const LORENZ_KATURSKY_SCALE = 1_000_000n;

export type TurboVarianceVector = readonly [bigint, bigint, bigint];
export type CorrugationResidualVector = readonly [bigint, bigint, bigint];
export type LorenzKaturskyRows = readonly [
  readonly [bigint, bigint, bigint],
  readonly [bigint, bigint, bigint],
  readonly [bigint, bigint, bigint],
];

export interface LorenzKaturskyMatrix {
  readonly rows: LorenzKaturskyRows;
  readonly determinant: bigint;
}

export interface TurboVarianceCorrugation {
  readonly corrugation: TurboVarianceVector;
  readonly residual: CorrugationResidualVector;
}

const determinant3 = (rows: LorenzKaturskyRows): bigint => {
  const [[a, b, c], [d, e, f], [g, h, i]] = rows;
  return (
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g)
  );
};

const freezeTriple = (
  values: readonly [bigint, bigint, bigint],
): readonly [bigint, bigint, bigint] => Object.freeze([...values]) as [
  bigint,
  bigint,
  bigint,
];

export const turboVarianceVector = (
  axial: bigint,
  lateral: bigint,
  torsional: bigint,
): TurboVarianceVector => freezeTriple([axial, lateral, torsional]);

export const corrugationResidualVector = (
  axial: bigint,
  lateral: bigint,
  torsional: bigint,
): CorrugationResidualVector => {
  const residual = [axial, lateral, torsional] as const;
  if (
    residual.some(
      (component) =>
        component < 0n || component >= LORENZ_KATURSKY_SCALE,
    )
  ) {
    throw new RangeError(
      "Corrugation residual components must remain within scale bounds",
    );
  }
  return freezeTriple(residual);
};

export const lorenzKaturskyMatrix = (
  candidateRows: readonly (readonly bigint[])[],
): LorenzKaturskyMatrix => {
  if (
    candidateRows.length !== 3 ||
    candidateRows.some(
      (row) =>
        row.length !== 3 ||
        row.some((coefficient) => typeof coefficient !== "bigint"),
    )
  ) {
    throw new TypeError("Lorenz-Katursky matrices must contain 3 x 3 bigint coefficients");
  }

  const rows = Object.freeze(
    candidateRows.map((row) => Object.freeze([...row])),
  ) as LorenzKaturskyRows;
  const determinant = determinant3(rows);
  const canonicalDeterminant = LORENZ_KATURSKY_SCALE ** 3n;

  if (determinant !== canonicalDeterminant) {
    throw new RangeError(
      "Lorenz-Katursky matrices must preserve the canonical variance lattice",
    );
  }

  return Object.freeze({ rows, determinant });
};

export const TURBO_VARIANCE_LK1 = lorenzKaturskyMatrix([
  [LORENZ_KATURSKY_SCALE, 250_000n, -125_000n],
  [0n, LORENZ_KATURSKY_SCALE, 125_000n],
  [0n, 0n, LORENZ_KATURSKY_SCALE],
]);

export const ZERO_CORRUGATION_RESIDUAL = corrugationResidualVector(0n, 0n, 0n);

/**
 * Applies a fixed-point Lorenz-Katursky coupling matrix to a signed turbo
 * variance vector. Per-channel Euclidean residual transport makes partitioned
 * corrugation equivalent to corrugating the aggregate excitation vector.
 */
export const corrugateTurboVariance = (
  matrix: LorenzKaturskyMatrix,
  variance: TurboVarianceVector,
  priorResidual: CorrugationResidualVector = ZERO_CORRUGATION_RESIDUAL,
): TurboVarianceCorrugation => {
  const corrugation: bigint[] = [];
  const residual: bigint[] = [];

  for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
    const row = matrix.rows[rowIndex];
    const carried = priorResidual[rowIndex];
    if (row === undefined || carried === undefined) {
      throw new TypeError("Incomplete Lorenz-Katursky corrugation state");
    }

    const numerator =
      row[0] * variance[0] +
      row[1] * variance[1] +
      row[2] * variance[2] +
      carried;
    const channel = euclideanDivmod(numerator, LORENZ_KATURSKY_SCALE);
    corrugation.push(channel.quotient);
    residual.push(channel.remainder);
  }

  return {
    corrugation: turboVarianceVector(
      corrugation[0] ?? 0n,
      corrugation[1] ?? 0n,
      corrugation[2] ?? 0n,
    ),
    residual: corrugationResidualVector(
      residual[0] ?? 0n,
      residual[1] ?? 0n,
      residual[2] ?? 0n,
    ),
  };
};
