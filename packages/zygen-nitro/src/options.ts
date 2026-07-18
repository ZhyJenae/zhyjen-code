export interface ZygenInsightOptions {
  /**
   * When true, request telemetry is also written to the server console.
   * @default false
   */
  logToConsole?: boolean;

  /**
   * Maximum number of recorded requests kept in memory for the insight view.
   * @default 100
   */
  maxRecords?: number;
}

export interface RequestRecord {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  timestamp: string;
}

export interface InsightState {
  requests: RequestRecord[];
}

export const defaultInsightOptions: Required<ZygenInsightOptions> = {
  logToConsole: false,
  maxRecords: 100,
};
