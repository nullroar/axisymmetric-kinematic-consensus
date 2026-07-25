export const NANO_SCALE = 1_000_000_000n;
export const MICROMETERS_PER_METER = 1_000_000n;

export interface QuotientRemainder {
  readonly quotient: bigint;
  readonly remainder: bigint;
}

export const euclideanDivmod = (
  numerator: bigint,
  denominator: bigint,
): QuotientRemainder => {
  if (denominator <= 0n) {
    throw new RangeError("Euclidean denominator must be positive");
  }

  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  if (remainder >= 0n) {
    return { quotient, remainder };
  }

  return {
    quotient: quotient - 1n,
    remainder: remainder + denominator,
  };
};

export const roundHalfAwayFromZero = (
  numerator: bigint,
  denominator: bigint,
): bigint => {
  if (denominator <= 0n) {
    throw new RangeError("Rounding denominator must be positive");
  }

  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = numerator < 0n ? -numerator : numerator;
  const rounded = (magnitude + denominator / 2n) / denominator;
  return sign * rounded;
};

export const parseDecimalToFixed = (
  value: string,
  scale: bigint,
): bigint => {
  if (scale <= 0n) {
    throw new RangeError("Fixed-point scale must be positive");
  }

  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/u.exec(value.trim());
  if (match === null) {
    throw new TypeError(`Invalid decimal value: ${value}`);
  }

  const sign = match[1] === "-" ? -1n : 1n;
  const whole = BigInt(match[2] ?? "0");
  const fractionalText = match[3] ?? "";
  const precision = scale.toString().length - 1;
  const padded = `${fractionalText}${"0".repeat(precision)}`.slice(
    0,
    precision,
  );
  const discarded = fractionalText.slice(precision);
  const base = whole * scale + BigInt(padded || "0");
  const shouldRound =
    discarded.length > 0 && Number.parseInt(discarded[0] ?? "0", 10) >= 5;

  return sign * (base + (shouldRound ? 1n : 0n));
};

export const formatFixed = (
  value: bigint,
  scale: bigint,
  fractionalDigits = scale.toString().length - 1,
): string => {
  if (scale <= 0n) {
    throw new RangeError("Fixed-point scale must be positive");
  }
  if (!Number.isSafeInteger(fractionalDigits) || fractionalDigits < 0) {
    throw new RangeError("Fractional digits must be a non-negative integer");
  }

  const sign = value < 0n ? "-" : "";
  const magnitude = value < 0n ? -value : value;
  const whole = magnitude / scale;
  const fraction = (magnitude % scale)
    .toString()
    .padStart(scale.toString().length - 1, "0")
    .slice(0, fractionalDigits);

  return fractionalDigits === 0
    ? `${sign}${whole}`
    : `${sign}${whole}.${fraction.padEnd(fractionalDigits, "0")}`;
};
