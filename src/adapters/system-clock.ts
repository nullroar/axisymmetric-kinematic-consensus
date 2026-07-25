import { isoTimestamp } from "../domain/brands.js";
import type { Clock } from "../ports/clock.js";

export class SystemClock implements Clock {
  now() {
    return isoTimestamp(new Date().toISOString());
  }
}
