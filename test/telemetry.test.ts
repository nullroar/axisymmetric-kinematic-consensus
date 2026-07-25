import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PrometheusTelemetry } from "../src/adapters/prometheus-telemetry.js";

describe("telemetry exposition", () => {
  it("aggregates counters and observations", () => {
    const telemetry = new PrometheusTelemetry();
    telemetry.increment("akcp_command_total", 1, { command: "Advance" });
    telemetry.increment("akcp_command_total", 2, { command: "Advance" });
    telemetry.observe("akcp_latency_ms", 2, { command: "Advance" });
    telemetry.observe("akcp_latency_ms", 4, { command: "Advance" });

    const exposition = telemetry.exposition();
    assert.match(
      exposition,
      /akcp_command_total\{command="Advance"\} 3/u,
    );
    assert.match(exposition, /akcp_latency_ms_count\{command="Advance"\} 2/u);
    assert.match(exposition, /akcp_latency_ms_sum\{command="Advance"\} 6/u);
  });
});
