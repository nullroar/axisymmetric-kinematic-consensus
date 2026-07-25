import type { IsoTimestamp } from "../domain/brands.js";

export interface Clock {
  now(): IsoTimestamp;
}
