import type { H3Event } from 'h3';
import type { ZygenInsightOptions, InsightState } from './options.js';
import { createRecorder } from './insight.js';

/**
 * Minimal local type for the Nitro runtime surface we use.
 *
 * nitropack@2.13.4 ships `.d.ts` re-exports without file extensions, which
 * breaks type resolution under `moduleResolution: nodenext`. We declare the
 * small slice we depend on so the package builds cleanly and stays decoupled
 * from that packaging bug. Consumers get full types from nitropack directly.
 */
export interface NitroApp {
  hooks: {
    hook(name: 'request', fn: (event: H3Event) => void | Promise<void>): void;
    hook(
      name: 'response',
      fn: (res: Response, event: H3Event) => void | Promise<void>
    ): void;
  };
}

// nitropack/runtime exports defineNitroPlugin; import the value, tolerate the
// upstream type-resolution quirk under nodenext.
// @ts-expect-error - nitropack subpath types are broken under nodenext
import { defineNitroPlugin } from 'nitropack/runtime';

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
 */
export function defineZygenPlugin(options: ZygenInsightOptions = {}) {
  return defineNitroPlugin((nitroApp: NitroApp) => {
    const recorder = createRecorder(insightState, options);

    nitroApp.hooks.hook('request', (event: H3Event) => {
      recorder.start(event.path);
    });

    nitroApp.hooks.hook('response', (res: Response, event: H3Event) => {
      const record = recorder.finish(event.path, event.method, res.status);
      if (options.logToConsole) {
        // eslint-disable-next-line no-console
        console.log(`[zygen] ${record.method} ${record.path} -> ${record.status} (${record.durationMs}ms)`);
      }
    });
  });
}

export default defineZygenPlugin();
