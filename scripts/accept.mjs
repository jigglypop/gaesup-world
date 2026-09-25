// `pnpm accept`: production demo build → vite preview → Playwright on /accept. The page runs the browser scenarios and
// judges them with test/accept/budgets.json; this script measures S-B01 (route loads) and writes the reports.
// Flags: --software (SwiftShader, CI), --no-build (reuse demo-dist), --only=S-B02,S-B11 (subset).
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');

const { ROOT, collectPageErrors, launchWebGpuBrowser, startPreviewServer } = require('./lib/devServer.cjs');

const BASE = '/gaesup-world/';
const ROUTES = ['', 'world', 'engine', 'performance'];
const VIEWPORT = { width: 1280, height: 900 };
// Modules a route must not load unless it uses them (S-B01), matched against the sourcemap sources of loaded chunks.
const HEAVY = {
  rapier: /@dimforge\/rapier3d/,
  editor: /\/src\/core\/editor\//,
  postprocessing: /\/src\/core\/rendering\/postprocess\/|\/node_modules\/(?:@react-three\/)?postprocessing\//,
};
const FAILING = new Set(['fail', 'fixed', 'error']);

const argv = process.argv.slice(2);
const software = argv.includes('--software');
const only = argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length).split(',');
const selected = (id) => !only || only.includes(id);

/** Scripts each route loads until the network is idle, their gzip size and the heavy chunks among them. */
async function measureRoutes(browser, url) {
  const routes = [];
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: VIEWPORT });
    const scripts = new Set();
    // Built chunks only: blob: workers and other origins are not files of this build.
    page.on('response', (response) => {
      if (response.request().resourceType() === 'script' && response.ok() && response.url().startsWith(`${url}${BASE}`)) scripts.add(new URL(response.url()).pathname);
    });
    const started = Date.now();
    await page.goto(`${url}${BASE}${route}`, { waitUntil: 'networkidle', timeout: 120_000 });
    const loadMs = Date.now() - started;
    await page.close();
    let gzipBytes = 0;
    const heavy = [];
    for (const script of scripts) {
      const file = path.join(ROOT, 'demo-dist', script.slice(BASE.length));
      gzipBytes += gzipSync(readFileSync(file)).length;
      // Rolldown's runtime helper chunk has no sourcemap and holds no modules.
      const map = `${file}.map`;
      const sources = existsSync(map) ? JSON.parse(readFileSync(map, 'utf8')).sources.map((source) => path.posix.normalize(`/${source.replaceAll('\\', '/')}`)) : [];
      const groups = Object.entries(HEAVY).filter(([, pattern]) => sources.some((source) => pattern.test(source))).map(([name]) => name);
      if (groups.length > 0) heavy.push(`${path.basename(file)} (${groups.join(', ')})`);
    }
    routes.push({ route: `/${route}`, scripts: scripts.size, gzipBytes, heavy, loadMs });
  }
  return routes;
}

const metricValues = (run) => Object.fromEntries(Object.entries(run.metrics).map(([name, metric]) => [
  name, metric.samples.length === 1 ? metric.samples[0] : { p50: metric.p50, p95: metric.p95, unit: metric.unit },
]));

const escape = (text) => String(text).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

function writeReports(dir, report) {
  writeFileSync(path.join(dir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  const rows = report.results.map((result) => `<tr class="${escape(result.verdict)}"><td>${escape(result.id)}</td><td>${escape(result.status)}</td>`
    + `<td>${escape(result.verdict)}</td><td>${escape(result.violations.join(' · ') || '예산 안')}</td>`
    + `<td><pre>${escape(JSON.stringify(result.metrics, null, 1))}</pre></td>`
    + `<td>${result.screenshot ? `<a href="${escape(result.screenshot)}"><img src="${escape(result.screenshot)}" alt="${escape(result.id)}"></a>` : ''}</td></tr>`).join('');
  writeFileSync(path.join(dir, 'report.html'), `<!doctype html><meta charset="utf-8"><title>Acceptance ${escape(report.startedAt)}</title>
<style>body{font:14px system-ui;margin:24px;background:#0d1918;color:#e2efea}table{border-collapse:collapse;width:100%}td,th{padding:8px;border-bottom:1px solid #29413c;vertical-align:top;text-align:left}
pre{margin:0;font-size:11px}img{width:240px}.pass{color:#74e1c2}.fail,.error{color:#ffa58f}.known-red{color:#e59b8f}.fixed{color:#e5cf82}</style>
<h1>Acceptance · ${escape(report.backend)}</h1><p>${escape(report.startedAt)} · ${escape(report.browser)}</p>
<table><thead><tr><th>시나리오</th><th>상태</th><th>판정</th><th>위반</th><th>측정</th><th>화면</th></tr></thead><tbody>${rows}</tbody></table>`);
}

async function main() {
  if (!argv.includes('--no-build')) execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-demo.mjs')], { cwd: ROOT, stdio: 'inherit', env: { ...process.env, GAESUP_BASE_URL: BASE } });
  const startedAt = new Date().toISOString();
  const dir = path.join(ROOT, '.artifacts/accept', startedAt.replace(/[:.]/g, '-'));
  mkdirSync(dir, { recursive: true });
  const server = await startPreviewServer(BASE);
  const browser = software
    ? await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'] })
    : await launchWebGpuBrowser();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    const pageErrors = collectPageErrors(page, { console: 'gpu' });
    const screenshots = new Map();
    await page.exposeFunction('__acceptCapture', async (id) => {
      const file = `${id}.png`;
      await page.locator('.lab-viewport').screenshot({ path: path.join(dir, file) });
      screenshots.set(id, file);
    });
    await page.goto(`${server.url}${BASE}accept`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForFunction(() => window.performanceLab?.accept, null, { timeout: 60_000 });
    const judge = (id, metrics) => page.evaluate(([scenario, values]) => window.performanceLab.accept.judge(scenario, values), [id, metrics]);
    const results = [];
    if (selected('S-B01')) {
      const routes = await measureRoutes(browser, server.url);
      const metrics = { rootInitialJsGzipBytes: routes[0].gzipBytes, unusedHeavyChunksOnRoot: routes[0].heavy.length };
      results.push({ id: 'S-B01', ...(await judge('S-B01', metrics)), metrics: { ...metrics, routes }, screenshot: null });
    }
    for (const id of (await page.evaluate(() => window.performanceLab.scenarioIds)).filter(selected)) {
      process.stdout.write(`${id} … `);
      try {
        const run = await page.evaluate((scenarioId) => window.performanceLab.run({ scenarioId }), id);
        const verdict = await page.evaluate((value) => window.performanceLab.accept.verdict(value), run);
        results.push({ id, ...verdict, metrics: metricValues(run), screenshot: screenshots.get(id) ?? null });
      } catch (error) {
        // One broken scenario is its own error verdict; the rest still run.
        results.push({ id, status: null, verdict: 'error', violations: [error instanceof Error ? error.message : String(error)], metrics: {}, screenshot: null });
      }
      process.stdout.write(`${results.at(-1).verdict}\n`);
    }
    const backend = await page.evaluate(() => window.performanceLab.runs().find((run) => run.environment.backend !== 'not-used')?.environment.backend ?? 'unknown');
    const report = { startedAt, browser: browser.version(), backend, software, results, pageErrors };
    writeReports(dir, report);
    if (process.env.GITHUB_STEP_SUMMARY) {
      const lines = results.map(({ id, status: registered, verdict, violations }) => `| ${id} | ${registered} | ${verdict} | ${violations.join(' · ') || '예산 안'} |`);
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['### Acceptance (browser)', '', '| 시나리오 | 상태 | 판정 | 위반 |', '|---|---|---|---|', ...lines, ''].join('\n'));
    }
    console.table(results.map(({ id, status: registered, verdict, violations }) => ({ id, status: registered, verdict, violations: violations.join(' · ') })));
    console.log(`Report: ${path.join(dir, 'report.html')}`);
    const failing = results.filter((result) => FAILING.has(result.verdict));
    for (const result of failing.filter((entry) => entry.verdict === 'fixed')) console.error(`${result.id} now fits its budget: set its status to "green" in test/accept/budgets.json.`);
    if (failing.length > 0 || pageErrors.length > 0) process.exitCode = 1;
  } finally {
    await browser.close();
    server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
