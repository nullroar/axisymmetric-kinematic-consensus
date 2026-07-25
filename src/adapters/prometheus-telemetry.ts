import type {
  MetricLabels,
  Telemetry,
} from "../ports/telemetry.js";

interface MetricSample {
  readonly name: string;
  readonly labels: MetricLabels;
  value: number;
}

const keyFor = (name: string, labels: MetricLabels): string =>
  `${name}:${Object.entries(labels)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(",")}`;

const renderLabels = (labels: MetricLabels): string => {
  const entries = Object.entries(labels).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (entries.length === 0) {
    return "";
  }
  const body = entries
    .map(
      ([key, value]) =>
        `${key}="${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`,
    )
    .join(",");
  return `{${body}}`;
};

export class PrometheusTelemetry implements Telemetry {
  readonly #counters = new Map<string, MetricSample>();
  readonly #observations = new Map<string, MetricSample[]>();

  increment(
    metric: string,
    value = 1,
    labels: MetricLabels = {},
  ): void {
    const key = keyFor(metric, labels);
    const sample = this.#counters.get(key) ?? {
      name: metric,
      labels,
      value: 0,
    };
    sample.value += value;
    this.#counters.set(key, sample);
  }

  observe(
    metric: string,
    value: number,
    labels: MetricLabels = {},
  ): void {
    const key = keyFor(metric, labels);
    const observations = this.#observations.get(key) ?? [];
    observations.push({ name: metric, labels, value });
    this.#observations.set(key, observations);
  }

  exposition(): string {
    const lines: string[] = [];
    for (const sample of this.#counters.values()) {
      lines.push(
        `${sample.name}${renderLabels(sample.labels)} ${sample.value}`,
      );
    }
    for (const samples of this.#observations.values()) {
      const first = samples[0];
      if (first === undefined) {
        continue;
      }
      const sum = samples.reduce((total, sample) => total + sample.value, 0);
      lines.push(
        `${first.name}_count${renderLabels(first.labels)} ${samples.length}`,
      );
      lines.push(`${first.name}_sum${renderLabels(first.labels)} ${sum}`);
    }
    return `${lines.sort().join("\n")}\n`;
  }
}
