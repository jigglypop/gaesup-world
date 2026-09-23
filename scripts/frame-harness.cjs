const fs = require('node:fs');

const { chromium } = require('@playwright/test');

const { startDevServer, wait } = require('./lib/devServer.cjs');

const DEFAULT_ROUTE = '/world';
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
const INPUT_TIMELINE = [
  { key: 'KeyW', holdMs: 3000 },
  { key: 'KeyD', holdMs: 1500 },
  { key: 'Space', holdMs: 150 },
  { key: 'KeyS', holdMs: 3000 },
  { key: 'KeyA', holdMs: 1500 },
  { key: null, holdMs: 1000 },
];

function parseArgs(argv) {
  const options = { route: DEFAULT_ROUTE, durationMs: DEFAULT_DURATION_MS, out: null, software: false };
  for (const arg of argv) {
    const [name, value] = arg.split('=');
    if (name === '--route' && value) options.route = value;
    else if (name === '--duration' && value) options.durationMs = Number(value);
    else if (name === '--out' && value) options.out = value;
    else if (name === '--software') options.software = true;
  }
  return options;
}

function browserArgs(software) {
  const memory = ['--enable-precise-memory-info'];
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
  const harness = { recording: false, frames: [], heap: [], calls: [], triangles: [], renderer: null };
  window.__frameHarness = harness;
  const devtools = new EventTarget();
  devtools.addEventListener('observe', (event) => {
    const target = event.detail;
    if (!target) return;
    if (target.isWebGLRenderer || target.isRenderer) harness.renderer = target;
    if (target.isScene && !harness.sceneHooked) {
      harness.sceneHooked = true;
      const previous = target.onAfterRender;
      target.onAfterRender = function onAfterRender(renderer, ...rest) {
        if (harness.recording) {
          harness.calls.push(renderer.info.render.calls);
          harness.triangles.push(renderer.info.render.triangles);
        }
        return previous.call(this, renderer, ...rest);
      };
    }
  });
  window.__THREE_DEVTOOLS__ = devtools;
  const sample = (time) => {
    if (harness.recording) {
      harness.frames.push(time);
      const memory = performance.memory;
      if (memory) harness.heap.push(memory.usedJSHeapSize);
    }
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

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { url, stop } = await startDevServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: browserArgs(options.software) });
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
      const debug = gl?.getExtension('WEBGL_debug_renderer_info');
      return {
        frames: harness.frames,
        heap: harness.heap,
        calls: harness.calls,
        triangles: harness.triangles,
        renderer: {
          gpu: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unknown',
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
    const json = JSON.stringify(report, null, 2);
    console.log(json);
    if (options.out) fs.writeFileSync(options.out, `${json}\n`);
    if (pageErrors.length > 0) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
