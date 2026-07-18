import { describe, it, expect } from 'vitest';
import { defaultInsightOptions, type InsightState } from './options';
import { createRecorder } from './insight';

describe('zygen nitro recorder', () => {
  it('exposes sane default options', () => {
    expect(defaultInsightOptions.logToConsole).toBe(false);
    expect(defaultInsightOptions.maxRecords).toBe(100);
  });

  it('records a finished request with duration', () => {
    const state: InsightState = { requests: [] };
    const recorder = createRecorder(state);
    recorder.start('/hello');
    const record = recorder.finish('/hello', 'GET', 200);
    expect(record).toMatchObject({ method: 'GET', path: '/hello', status: 200 });
    expect(typeof record.durationMs).toBe('number');
    expect(state.requests).toHaveLength(1);
  });

  it('caps the buffer at maxRecords', () => {
    const state: InsightState = { requests: [] };
    const recorder = createRecorder(state, { maxRecords: 2 });
    recorder.start('/a'); recorder.finish('/a', 'GET', 200);
    recorder.start('/b'); recorder.finish('/b', 'GET', 200);
    recorder.start('/c'); recorder.finish('/c', 'GET', 200);
    expect(state.requests).toHaveLength(2);
    expect(state.requests[1].path).toBe('/c');
  });
});
