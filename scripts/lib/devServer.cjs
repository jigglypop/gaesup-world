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

async function startDevServer() {
  const port = await findPort();
  const url = `http://${HOST}:${port}`;
  const logs = [];
  const server = spawn(process.execPath, [VITE_BIN, '--host', HOST, '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => logs.push(chunk.toString()));
  const stop = () => server.kill();
  try {
    await waitForServer(url, logs);
  } catch (error) {
    stop();
    throw error;
  }
  return { url, logs, stop };
}

module.exports = { ROOT, wait, startDevServer };
