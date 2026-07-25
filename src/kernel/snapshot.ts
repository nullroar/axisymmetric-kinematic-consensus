import { createHash, timingSafeEqual } from "node:crypto";
import { eventDigest, type EventDigest } from "../domain/brands.js";
import { IntegrityViolation } from "../domain/errors.js";
import type { AggregateState } from "../domain/state.js";
import { canonicalize } from "./canonical.js";

export interface SignedSnapshot {
  readonly state: AggregateState;
  readonly stateDigest: EventDigest;
}

const digestState = (state: AggregateState): EventDigest =>
  eventDigest(
    createHash("sha256").update(canonicalize(state), "utf8").digest("hex"),
  );

export const createSnapshot = (state: AggregateState): SignedSnapshot => ({
  state,
  stateDigest: digestState(state),
});

export const restoreSnapshot = (snapshot: SignedSnapshot): AggregateState => {
  const expected = Buffer.from(digestState(snapshot.state), "hex");
  const actual = Buffer.from(snapshot.stateDigest, "hex");
  if (
    expected.byteLength !== actual.byteLength ||
    !timingSafeEqual(expected, actual)
  ) {
    throw new IntegrityViolation("Snapshot state digest is invalid");
  }
  return snapshot.state;
};
