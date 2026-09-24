const fs = require('node:fs');

const { chromium } = require('@playwright/test');

const { startDevServer, wait } = require('./lib/devServer.cjs');

// examples/main.tsx serves minihome at the root, the seeded R3F world at /world?size=s|m|l.
const DEFAULT_ROUTE = '/';
const DEFAULT_DURATION_MS = 20_000;
const WARMUP_MS = 8_000;
const CANVAS_TIMEOUT_MS = 90_000;
const VIEWPORT = { width: 1280, height: 720 };
const RANDOM_SEED = 20_260_923;
const LONG_FRAME_MS = 1000 / 30;
const GC_DROP_BYTES = 1024 * 1024;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
const SECONDS_TO_MS = 1000;
// Relative regression allowed per compared metric before --baseline fails the run.
const DEFAULT_TOLERANCE = 0.15;
const INPUT_TIMELINE = [
  { key: 'KeyW', holdMs: 3000 },
  { key: 'KeyD', holdMs: 1500 },
  { key: 'Space', holdMs: 150 },
  { key: 'KeyS', holdMs: 3000 },
  { key: 'KeyA', holdMs: 1500 },
  { key: null, holdMs: 1000 },
];

function parseArgs(argv) {
  const options = {
    route: DEFAULT_ROUTE, durationMs: DEFAULT_DURATION_MS, out: null, software: false,
    webgpu: false, runs: 1, baseline: null, tolerance: DEFAULT_TOLERANCE,
  };
  for (const arg of argv) {
    // Split on the first '=' only: routes carry query strings such as /world?size=s.
    const [name, value] = arg.split(/=(.*)/s);
    if (name === '--route' && value) options.route = value;
    else if (name === '--duration' && value) options.durationMs = Number(value);
    else if (name === '--out' && value) options.out = value;
    else if (name === '--software') options.software = true;
    else if (name === '--webgpu') options.webgpu = true;
    else if (name === '--runs' && value) options.runs = Math.max(1, Number(value));
    else if (name === '--baseline' && value) options.baseline = value;
    else if (name === '--tolerance' && value) options.tolerance = Number(value);
  }
  return options;
}

function browserArgs(software, webgpu) {
  const memory = ['--enable-precise-memory-info', ...(webgpu ? ['--enable-unsafe-webgpu'] : [])];
  if (software) return [...memory, '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  const angle = process.platform === 'win32' ? ['--use-angle=d3d11'] : [];
  return [...memory, ...angle, '--ignore-gpu-blocklist', '--enable-gpu'];
}

function installProbe(seed) {
  let state = seed >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const harness = {
    recording: false, frames: [], heap: [], calls: [], renderCalls: [], triangles: [], renderer: null,
    frameDraws: 0, frameRenders: 0, frameTriangles: 0,
  };
  window.__frameHarness = harness;
  const devtools = new EventTarget();
  devtools.addEventListener('observe', (event) => {
    const target = event.detail;
    if (!target || harness.renderer || !(target.isWebGLRenderer || target.isRenderer)) return;
    harness.renderer = target;
    // render.calls is cumulative on the common renderer. Sum the per-pass counters at every reset into the rAF frame,
    // which is correct whether the renderer resets once per frame or once per render() call.
    const info = target.info;
    const reset = info.reset.bind(info);
    info.reset = () => {
      const render = info.render;
      harness.frameDraws += typeof render.drawCalls === 'number' ? render.drawCalls : render.calls;
      harness.frameRenders += typeof render.frameCalls === 'number' ? render.frameCalls : 1;
      harness.frameTriangles += render.triangles;
      return reset();
    };
  });
  window.__THREE_DEVTOOLS__ = devtools;
  const sample = (time) => {
    if (harness.recording) {
      harness.frames.push(time);
      const memory = performance.memory;
      if (memory) harness.heap.push(memory.usedJSHeapSize);
      harness.calls.push(harness.frameDraws);
      harness.renderCalls.push(harness.frameRenders);
      harness.triangles.push(harness.frameTriangles);
    }
    harness.frameDraws = 0;
    harness.frameRenders = 0;
    harness.frameTriangles = 0;
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

async function driveInput(page, durationMs) {
  const endAt = Date.now() + durationMs;
  let index = 0;
  while (Date.now() < endAt) {
    const step = INPUT_TIMELINE[index % INPUT_TIMELINE.length];
    const holdMs = Math.min(step.holdMs, Math.max(0, endAt - Date.now()));
    if (step.key) await page.keyboard.down(step.key);
    await wait(holdMs);
    if (step.key) await page.keyboard.up(step.key);
    index += 1;
  }
}

function percentile(sorted, ratio) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

function mean(values) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, digits = 2) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function summarize(samples, cpu, durationMs) {
  const deltas = [];
  for (let i = 1; i < samples.frames.length; i++) deltas.push(samples.frames[i] - samples.frames[i - 1]);
  const sorted = [...deltas].sort((a, b) => a - b);
  let allocated = 0;
  let gcCount = 0;
  for (let i = 1; i < samples.heap.length; i++) {
    const delta = samples.heap[i] - samples.heap[i - 1];
    if (delta > 0) allocated += delta;
    else if (-delta > GC_DROP_BYTES) gcCount += 1;
  }
  const frames = deltas.length;
  return {
    frames,
    fps: round(frames / (durationMs / SECONDS_TO_MS), 1),
    frameMs: {
      mean: round(mean(deltas)),
      p50: round(percentile(sorted, 0.5)),
      p95: round(percentile(sorted, 0.95)),
      p99: round(percentile(sorted, 0.99)),
      max: round(sorted.at(-1) ?? 0),
    },
    longFrames: deltas.filter((delta) => delta > LONG_FRAME_MS).length,
    drawCalls: { mean: round(mean(samples.calls), 1), max: Math.max(0, ...samples.calls) },
    renderCallsPerFrame: round(mean(samples.renderCalls)),
    triangles: { mean: Math.round(mean(samples.triangles)) },
    heap: {
      allocatedKBPerFrame: frames === 0 ? 0 : round(allocated / frames / BYTES_PER_KB),
      gcCount,
      endMB: round((samples.heap.at(-1) ?? 0) / BYTES_PER_MB),
    },
    cpuMsPerFrame: {
      script: frames === 0 ? 0 : round((cpu.script * SECONDS_TO_MS) / frames),
      task: frames === 0 ? 0 : round((cpu.task * SECONDS_TO_MS) / frames),
    },
    renderer: samples.renderer,
  };
}

async function readCpu(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const value = (name) => metrics.find((metric) => metric.name === name)?.value ?? 0;
  return { script: value('ScriptDuration'), task: value('TaskDuration') };
}

async function measure(options, url) {
  let browser;
  try {
    // chrome-headless-shell cannot create a WebGPU device on Windows (dxil.dll); the full chromium channel can.
    browser = await chromium.launch({ headless: true, ...(options.webgpu ? { channel: 'chromium' } : {}), args: browserArgs(options.software, options.webgpu) });
    const page = await browser.newPage({ viewport: VIEWPORT });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript(installProbe, RANDOM_SEED);
    await page.goto(`${url}${options.route}`, { waitUntil: 'domcontentloaded', timeout: CANVAS_TIMEOUT_MS });
    await page.waitForSelector('canvas', { timeout: CANVAS_TIMEOUT_MS });
    await wait(WARMUP_MS);
    await page.mouse.click(VIEWPORT.width / 2, VIEWPORT.height / 2);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    const cpuBefore = await readCpu(cdp);
    await page.evaluate(() => {
      window.__frameHarness.recording = true;
    });
    await driveInput(page, options.durationMs);
    const samples = await page.evaluate(() => {
      const harness = window.__frameHarness;
      harness.recording = false;
      const info = harness.renderer?.info;
      const gl = harness.renderer?.getContext?.();
      // WebGPU returns a GPUCanvasContext here, which has no WebGL extensions.
      const debug = typeof gl?.getExtension === 'function' ? gl.getExtension('WEBGL_debug_renderer_info') : null;
      const adapterInfo = harness.renderer?.backend?.device?.adapterInfo;
      return {
        frames: harness.frames,
        heap: harness.heap,
        calls: harness.calls,
        renderCalls: harness.renderCalls,
        triangles: harness.triangles,
        renderer: {
          backend: harness.renderer?.backend?.isWebGPUBackend
            ? 'webgpu'
            : harness.renderer?.backend?.isWebGLBackend ? 'webgl2-fallback' : harness.renderer?.isWebGLRenderer ? 'webgl' : 'unknown',
          gpu: debug
            ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
            : adapterInfo ? `${adapterInfo.vendor} ${adapterInfo.architecture}`.trim() : 'unknown',
          programs: info?.programs?.length ?? 0,
          geometries: info?.memory?.geometries ?? 0,
          textures: info?.memory?.textures ?? 0,
        },
      };
    });
    const cpuAfter = await readCpu(cdp);
    const cpu = { script: cpuAfter.script - cpuBefore.script, task: cpuAfter.task - cpuBefore.task };
    const report = {
      route: options.route,
      durationMs: options.durationMs,
      seed: RANDOM_SEED,
      ...summarize(samples, cpu, options.durationMs),
      pageErrors,
    };
    return report;
  } finally {
    if (browser) await browser.close();
  }
}

// vsync hides CPU wins on fast GPUs, so regressions are judged on CPU time, allocation and draws.
const COMPARED_METRICS = [
  ['cpuScriptMs', (report) => report.cpuMsPerFrame.script],
  ['allocatedKBPerFrame', (report) => report.heap.allocatedKBPerFrame],
  ['drawCallsMean', (report) => report.drawCalls.mean],
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length / 2)];
}

function findRegressions(baselineFile, medians, tolerance) {
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')).medians ?? {};
  return COMPARED_METRICS
    .map(([name]) => name)
    .filter((name) => baseline[name] > 0 && medians[name] > baseline[name] * (1 + tolerance))
    .map((name) => `${name}: ${baseline[name]} -> ${medians[name]}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { url, stop } = await startDevServer();
  try {
    const runs = [];
    for (let run = 0; run < options.runs; run++) runs.push(await measure(options, url));
    const medians = Object.fromEntries(COMPARED_METRICS.map(([name, read]) => [name, round(median(runs.map(read)))]));
    const report = { route: options.route, runs: options.runs, medians, reports: runs };
    const json = JSON.stringify(report, null, 2);
    console.log(json);
    if (options.out) fs.writeFileSync(options.out, `${json}\n`);
    if (runs.some((entry) => entry.pageErrors.length > 0)) process.exitCode = 1;
    if (options.baseline) {
      const regressions = findRegressions(options.baseline, medians, options.tolerance);
      if (regressions.length > 0) {
        console.error(`frame harness regression (> ${options.tolerance * 100}%):\n  ${regressions.join('\n  ')}`);
        process.exitCode = 1;
      }
    }
  } finally {
    stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
