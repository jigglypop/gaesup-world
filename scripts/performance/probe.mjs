import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { exerciseWorldKeyboard } from './keyboard-driver.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const role = option('--role', 'candidate');
const externalUrl = option('--url', null);
const url = externalUrl ?? 'http://127.0.0.1:5192/performance';
const benchmark = args.includes('--benchmark');
const paired = args.includes('--paired');
const backend = option('--backend', 'webgpu');
const count = Number(option('--count', '1000'));
if (!Number.isInteger(count) || count < 1 || count > 100000) throw new Error('--count must be an integer from 1 to 100000');
const repeat = Number(option('--repeat', '1'));
const output = path.join(root, '.artifacts/performance', new Date().toISOString().replace(/[:.]/g, '-'));
mkdirSync(output, { recursive: true });
const serverLog = [];
let server;
let browser;
const summary = [];
const pageErrors = [];
try {
  if (!externalUrl) {
    server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5192', '--strictPort'], {
      cwd: root, env: { ...process.env, BROWSER: 'none' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.stdout.on('data', (data) => serverLog.push(String(data)));
    server.stderr.on('data', (data) => serverLog.push(String(data)));
  }
  for (let i = 0; ; i++) {
    try { if ((await fetch(url)).ok) break; } catch { /* Poll the owned process or supplied server. */ }
    if (i >= 100 || (server && server.exitCode !== null)) throw new Error(`Vite unavailable: ${serverLog.join('')}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const browserFlags = ['--enable-unsafe-webgpu', '--enable-gpu'];
  browser = await chromium.launch({ channel: process.env.GAESUP_BROWSER_CHANNEL ?? 'chrome', headless: true, args: browserFlags });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.addInitScript((flags) => { window.performanceBrowserFlags = flags; }, browserFlags);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => window.performanceLab, undefined, { timeout: 60000 });
  // Establish a real document interaction for the AudioContext permission policy.
  await page.getByRole('heading', { name: 'Runtime performance lab' }).click();
  const available = await page.evaluate(() => window.performanceLab.scenarioIds);
  const selected = option('--scenario', '') ? option('--scenario', '').split(',') : available;
  for (const scenarioId of selected) {
    for (let i = 0; i < repeat; i++) {
      for (const currentRole of paired ? (i % 2 ? ['candidate', 'baseline'] : ['baseline', 'candidate']) : [role]) {
      const running = page.evaluate(async ({ scenarioId, role, benchmark, backend, count }) => window.performanceLab.run({
        scenarioId, role, config: { backend, count, warmupMs: benchmark ? 10000 : 250, durationMs: benchmark ? 30000 : 1500 },
      }), { scenarioId, role: currentRole, benchmark, backend, count });
      const run = scenarioId === 'world-keyboard-focus' ? (await Promise.all([running, exerciseWorldKeyboard(page, async step => {
        if (step === 'focus-b') await page.screenshot({ path: path.join(output, `keyboard-active-${i}.png`), fullPage: true });
      })]))[0] : await running;
      writeFileSync(path.join(output, `${run.runId}.json`), JSON.stringify(run, null, 2));
      await page.screenshot({ path: path.join(output, `${scenarioId}-${paired ? `${currentRole}-` : ''}${i}.png`), fullPage: true });
      const result = {
        scenarioId, runId: run.runId, status: run.status, kind: run.kind, role: run.role,
        source: run.source.contentHash, backend: run.environment.backend, adapter: run.environment.adapter,
        failed: run.assertions.filter((assertion) => !assertion.pass), errors: run.errors,
        metrics: Object.fromEntries(Object.entries(run.metrics).map(([name, metric]) => [name, { p50: metric.p50, p95: metric.p95, samples: metric.samples.length }])),
      };
      summary.push(result);
      console.log(JSON.stringify(result));
      }
    }
  }
  if (pageErrors.length || summary.some((run) => run.errors.length || run.status === 'aborted' || (run.role !== 'baseline' && run.status !== 'passed'))) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync(path.join(output, 'summary.json'), JSON.stringify({ url, role, benchmark, repeat, summary, pageErrors }, null, 2));
  writeFileSync(path.join(output, 'vite.log'), serverLog.join(''));
  console.log(`Evidence: ${output}`);
  await browser?.close();
  if (server && server.exitCode === null) server.kill();
}
