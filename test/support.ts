import {
  isoTimestamp,
  type IsoTimestamp,
} from "../src/domain/brands.js";
import type { Clock } from "../src/ports/clock.js";

export class DeterministicClock implements Clock {
  #tick = 0;

  now(): IsoTimestamp {
    const value = new Date(
      Date.UTC(2026, 0, 1, 0, 0, 0, this.#tick),
    ).toISOString();
    this.#tick += 1;
    return isoTimestamp(value);
  }
}
