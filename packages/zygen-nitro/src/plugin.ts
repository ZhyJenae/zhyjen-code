import type { ZygenInsightOptions, InsightState } from './options.js';
import { createRecorder } from './insight.js';
import { defineNitroPlugin, useNitroApp } from 'nitro/runtime';
import type { NitroApp } from 'nitro/types';

export { useNitroApp };

/**
 * Minimal view of the Nitro v3 request event we read.
 *
 * `HTTPEvent` exposes `path`/`method` getters at runtime, but h3 v3's
 * published types omit them. We declare the slice we use so the package
 * type-checks cleanly against the real runtime shape.
 */
export interface ZygenEvent {
  path: string;
  method: string;
}

/**
 * Shared insight state, populated by the plugin's request/response hooks.
 * Consumed by the v2 `/zygen` debug route (a Nitro module/preset, not yet shipped).
 */
export const insightState: InsightState = {
  requests: [],
};

/**
 * Create the Zygen dev/insight telemetry plugin.
 *
 * Hooks into the Nitro runtime to record per-request telemetry
 * (method, path, status, duration) so young creators can *see* how
 * the server behaves. v1 is telemetry-only; the visible debug route
 * is deferred to a v2 module/preset.
 *
 * Built for Nitro v3 — uses `defineNitroPlugin` from `nitro/runtime`.
 */
export function defineZygenPlugin(options: ZygenInsightOptions = {}) {
  return defineNitroPlugin((nitroApp: NitroApp) => {
    const recorder = createRecorder(insightState, options);

    nitroApp.hooks.hook('request', (event) => {
      const e = event as unknown as ZygenEvent;
      recorder.start(e.path);
    });

    nitroApp.hooks.hook('response', (res, event) => {
      const e = event as unknown as ZygenEvent;
      const record = recorder.finish(e.path, e.method, res.status);
      if (options.logToConsole) {
        // eslint-disable-next-line no-console
        console.log(`[zygen] ${record.method} ${record.path} -> ${record.status} (${record.durationMs}ms)`);
      }
    });
  });
}

export default defineZygenPlugin();
