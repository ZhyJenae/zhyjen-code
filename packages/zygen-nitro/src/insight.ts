import type { ZygenInsightOptions, RequestRecord, InsightState } from './options.js';
import { defaultInsightOptions } from './options.js';

/**
 * Pure telemetry recorder — no Nitro runtime dependency, so it is unit-testable
 * in isolation. `plugin.ts` wires this into Nitro's request/response hooks.
 */
export function createRecorder(
  state: InsightState,
  options: ZygenInsightOptions = {}
) {
  const opts = { ...defaultInsightOptions, ...options };
  const startTimes = new Map<string, number>();

  return {
    start(eventPath: string) {
      startTimes.set(eventPath, Date.now());
    },
    finish(eventPath: string, method: string, status: number) {
      const start = startTimes.get(eventPath);
      startTimes.delete(eventPath);
      const durationMs = start ? Date.now() - start : 0;

      const record: RequestRecord = {
        method,
        path: eventPath,
        status,
        durationMs,
        timestamp: new Date().toISOString(),
      };

      state.requests.push(record);
      if (state.requests.length > opts.maxRecords) {
        state.requests.shift();
      }

      return record;
    },
  };
}
