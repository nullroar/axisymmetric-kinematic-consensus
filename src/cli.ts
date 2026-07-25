#!/usr/bin/env node

import {
  aggregateId,
  AxisymmetricOrchestrator,
  ConsensusEngine,
  JsonlEventStore,
  stringifyForOperator,
  SystemClock,
} from "./index.js";

interface ParsedArguments {
  readonly operation: string;
  readonly stream: string;
  readonly journal: string;
  readonly value: string | undefined;
}

const usage = (): never => {
  process.stderr.write(
    [
      "Axisymmetric Kinematic Consensus Protocol operator interface",
      "",
      "Usage:",
      "  akcp init <stream> <radius-mm> [--journal <path>]",
      "  akcp advance <stream> <radians> [--journal <path>]",
      "  akcp radius <stream> <radius-mm> [--journal <path>]",
      "  akcp retire <stream> <reason> [--journal <path>]",
      "  akcp inspect <stream> [--journal <path>]",
      "",
    ].join("\n"),
  );
  process.exit(64);
};

const parseArguments = (arguments_: readonly string[]): ParsedArguments => {
  const [operation, stream, value] = arguments_;
  if (operation === undefined || stream === undefined) {
    return usage();
  }
  const journalIndex = arguments_.indexOf("--journal");
  const journal =
    journalIndex >= 0
      ? arguments_[journalIndex + 1]
      : ".akcp/journal.jsonl";
  if (journal === undefined) {
    return usage();
  }
  return { operation, stream, journal, value };
};

const main = async (): Promise<void> => {
  const parsed = parseArguments(process.argv.slice(2));
  const streamId = aggregateId(parsed.stream);
  const engine = new ConsensusEngine(
    new JsonlEventStore(parsed.journal),
    new SystemClock(),
  );
  const orchestrator = new AxisymmetricOrchestrator(engine);

  const receipt = await (async () => {
    switch (parsed.operation) {
      case "init":
        return parsed.value === undefined
          ? usage()
          : orchestrator.initialize(parsed.stream, parsed.value);
      case "advance":
        return parsed.value === undefined
          ? usage()
          : orchestrator.advance(streamId, parsed.value);
      case "radius":
        return parsed.value === undefined
          ? usage()
          : orchestrator.reconfigure(streamId, parsed.value);
      case "retire":
        return parsed.value === undefined
          ? usage()
          : orchestrator.retire(streamId, parsed.value);
      case "inspect":
        return {
          state: await engine.inspect(streamId),
          appended: [],
          idempotentReplay: false,
        };
      default:
        return usage();
    }
  })();

  process.stdout.write(`${stringifyForOperator(receipt)}\n`);
};

await main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`akcp: ${message}\n`);
  process.exitCode = 1;
});
