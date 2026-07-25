export interface MetricLabels {
  readonly [key: string]: string;
}

export interface Telemetry {
  increment(
    metric: string,
    value?: number,
    labels?: MetricLabels,
  ): void;
  observe(metric: string, value: number, labels?: MetricLabels): void;
}

export const nullTelemetry: Telemetry = {
  increment: () => undefined,
  observe: () => undefined,
};
