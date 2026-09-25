const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const VITE_BIN = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const HOST = '127.0.0.1';
const SERVER_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 250;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function findPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, HOST, () => {
      const address = server.address();
      server.close(() => {
        if (!address || typeof address === 'string') {
          reject(new Error('Unable to reserve a dev server port.'));
          return;
        }
        resolve(address.port);
      });
    });
  });
}

async function waitForServer(url, logs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < SERVER_TIMEOUT_MS) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still booting.
    }
    await wait(POLL_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for Vite dev server at ${url}.\n${logs.join('')}`);
}

/** Runs `vite <args>` on a free port and resolves once `readyPath` answers. */
async function startVite(args = [], readyPath = '/') {
  const port = await findPort();
  const url = `http://${HOST}:${port}`;
  const logs = [];
  const server = spawn(process.execPath, [VITE_BIN, ...args, '--host', HOST, '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => logs.push(chunk.toString()));
  const stop = () => server.kill();
  // A probe that fails before its finally block (e.g. no browser installed) must still exit and stop Vite.
  for (const handle of [server, server.stdout, server.stderr]) handle.unref();
  process.once('exit', stop);
  try {
    await waitForServer(`${url}${readyPath}`, logs);
  } catch (error) {
    stop();
    throw error;
  }
  return { url, logs, stop };
}

function startDevServer() {
  return startVite();
}

/** Serves the production demo build (scripts/build-demo.mjs) the way GitHub Pages does, under `base`. */
function startPreviewServer(base) {
  return startVite(['preview', '--outDir', 'demo-dist', '--base', base], base);
}

/** GAESUP_PROBE_URL targets an already running server; otherwise start one on a free port. */
async function startProbeServer() {
  const url = process.env.GAESUP_PROBE_URL;
  return url ? { url: url.replace(/\/+$/, ''), logs: [], stop: () => {} } : startDevServer();
}

/** Headless Chrome with WebGPU enabled; GAESUP_BROWSER_CHANNEL selects another channel. */
function launchWebGpuBrowser() {
  const { chromium } = require('@playwright/test');
  return chromium.launch({
    channel: process.env.GAESUP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-gpu'],
  });
}

// GPU validation failures reach the page only as console messages.
const GPU_ERROR_PATTERN = /GPUValidationError|Invalid RenderPipeline|WebGL: INVALID/;

/**
 * Uncaught page errors, recorded into `errors` for the probe to assert on before it reports success. `console: 'gpu'`
 * also records GPU validation messages; `console: 'all'` records every console error as well.
 */
function collectPageErrors(page, { console: level, errors = [] } = {}) {
  page.on('pageerror', (error) => errors.push(error.message));
  if (level) {
    page.on('console', (message) => {
      if ((level === 'all' && message.type() === 'error') || GPU_ERROR_PATTERN.test(message.text())) errors.push(message.text());
    });
  }
  return errors;
}

module.exports = { ROOT, wait, startDevServer, startPreviewServer, startProbeServer, launchWebGpuBrowser, collectPageErrors };
