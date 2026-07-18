# @zygen/nitro

A small, education-themed **Nitro plugin** from [Zygen](https://github.com/ZhyJenae/zhyjen-code) — part of the [ZhyJen CodeLab](https://github.com/ZhyJenae) open source ecosystem.

`@zygen/nitro` is a **dev/insight telemetry plugin**: it hooks into the Nitro server runtime to record per-request telemetry (method, path, status, duration) so young creators can _see_ how their server works.

> **v1** is telemetry-only. The visible `/zygen` debug route is planned for a future v2 module/preset.

## Install

```bash
npm install @zygen/nitro
# peer dependency
npm install nitropack
```

## Usage

Create `server/plugins/zygen.ts` in your Nitro app:

```ts
import zygenPlugin from '@zygen/nitro';

export default zygenPlugin({
  logToConsole: true, // also print telemetry to the server console
  maxRecords: 100, // max in-memory request records kept
});
```

The plugin collects telemetry on every request via Nitro's `request`/`response` hooks. Access the collected records through the shared `insightState` export if you build your own debug view.

## API

- `defineZygenPlugin(options?)` — returns a Nitro plugin. `options`:
  - `logToConsole?: boolean` (default `false`)
  - `maxRecords?: number` (default `100`)
- `insightState` — `{ requests: RequestRecord[] }`, the live telemetry buffer.
- `ZygenInsightOptions`, `RequestRecord` — exported types.

## License

MIT
