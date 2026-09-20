import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

import { exerciseWorldKeyboard } from './keyboard-driver.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:5191/performance';
const output = path.resolve('.artifacts/performance', `lab-ui-${new Date().toISOString().replace(/[:.]/g, '-')}`);
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const bundledRunIds = readdirSync('examples/performance/baselines').filter(name => name.endsWith('.json'))
  .flatMap(name => JSON.parse(readFileSync(path.join('examples/performance/baselines', name), 'utf8')).runs.map(run => run.runId));
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(ids => ids.every(id => window.performanceLab?.runs().some(run => run.runId === id)), bundledRunIds);
  await page.getByRole('button', { name: /^R01 / }).click();
  const row = page.getByRole('row').filter({ hasText: 'time-renders' });
  assert.equal(await row.locator('td').nth(4).textContent(), '1');
  assert.equal(await row.locator('td').nth(6).textContent(), '19');
  assert.equal(await row.locator('td').nth(7).textContent(), '-18');
  await page.screenshot({ path: path.join(output, 'hook-comparison.png'), fullPage: true });
  await page.getByRole('button', { name: /^R26 / }).click();
  const clockRow = page.getByRole('row').filter({ hasText: 'elapsed/144Hz/2-consumers' });
  assert.equal(await clockRow.locator('td').nth(4).textContent(), '1,000');
  assert.equal(await clockRow.locator('td').nth(6).textContent(), '2,000');
  assert.equal(await clockRow.locator('td').nth(7).textContent(), '-1,000');
  await page.screenshot({ path: path.join(output, 'clock-comparison.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-configuration');
  const configurationRow = page.getByRole('row').filter({ hasText: 'configuration-mismatches' });
  assert.equal(await configurationRow.locator('td').nth(4).textContent(), '0');
  assert.equal(await configurationRow.locator('td').nth(6).textContent(), '2');
  assert.equal(await configurationRow.locator('td').nth(7).textContent(), '-2');
  await page.screenshot({ path: path.join(output, 'world-configuration.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-domains');
  const domainsRow = page.getByRole('row').filter({ hasText: 'domain-save-mismatches' });
  assert.equal(await domainsRow.locator('td').nth(4).textContent(), '0');
  assert.equal(await domainsRow.locator('td').nth(6).textContent(), '2');
  assert.equal(await domainsRow.locator('td').nth(7).textContent(), '-2');
  await page.screenshot({ path: path.join(output, 'world-domains.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-gameplay');
  assert.equal(await page.getByRole('button', { name: /^R25 / }).getAttribute('class'), 'selected');
  for (const metric of ['reward-balance-mismatches', 'gameplay-save-mismatches']) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), '2');
    assert.equal(await row.locator('td').nth(7).textContent(), '-2');
  }
  await page.screenshot({ path: path.join(output, 'world-gameplay.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-life');
  for (const metric of ['crafting-owner-mismatches', 'mail-owner-mismatches', 'life-save-mismatches']) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), '2');
  }
  await page.screenshot({ path: path.join(output, 'world-life.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('catalog-tracking');
  for (const [metric, candidate, baseline] of [['active-catalog-subscriptions', '1', '2'], ['catalog-restore-overcount', '0', '6'], ['catalog-subscriptions-after-dispose', '0', '2']]) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), candidate);
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
  }
  await page.screenshot({ path: path.join(output, 'catalog-tracking.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-character-scene');
  for (const metric of ['character-state-leaks', 'parallel-scene-mismatches', 'scene-after-dispose-mismatches']) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), '1');
  }
  await page.screenshot({ path: path.join(output, 'world-character-scene.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-audio');
  for (const [metric, candidate, baseline] of [['ambient-active-subscriptions', '1', '2'], ['audio-settings-contexts', '0', '1'], ['ambient-unmount-mismatches', '0', '2']]) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), candidate);
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
  }
  await page.screenshot({ path: path.join(output, 'world-audio.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-keyboard-focus');
  for (const [metric, baseline] of [['dom-keyboard-cross-world-leaks', '1'], ['held-keys-after-focus-change', '2'], ['disposed-world-keyboard-leaks', '2']]) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
  }
  await page.screenshot({ path: path.join(output, 'world-keyboard-focus.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('editor-shortcuts');
  const shortcutRow = page.getByRole('row').filter({ hasText: 'unregistered-shortcut-executions' });
  assert.equal(await shortcutRow.locator('td').nth(4).textContent(), '0');
  assert.equal(await shortcutRow.locator('td').nth(6).textContent(), '3');
  await page.screenshot({ path: path.join(output, 'editor-shortcuts.png'), fullPage: true });
  await page.getByLabel('재현 시나리오', { exact: true }).selectOption('world-grass');
  for (const [metric, baseline] of [['grass-cross-world-updates', '1'], ['grass-weather-mismatches', '1'], ['grass-missed-frame-updates', '144']]) {
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
  }
  await page.screenshot({ path: path.join(output, 'world-grass.png'), fullPage: true });
  for (const [scenario, metric, baseline] of [['world-objects', 'blueprint-cross-world-leaks', '2'], ['world-snapshot', 'world-stale-command-snapshots', '2'], ['npc-adapter-isolation', 'npc-policy-response-world-leaks', '2'], ['npc-policy-lifetime', 'npc-removed-entity-response-leaks', '1'], ['world-custom-input', 'input-consumer-port-mismatches', '3'], ['interaction-target-ownership', 'interaction-target-world-mismatches', '2'], ['tool-action-ownership', 'tool-duplicate-dom-actions', '1'], ['cinematic-lifetime', 'cinematic-cancel-pending', '1'], ['world-cinematic-lifecycle', 'cinematic-effects-after-dispose', '1'], ['cinematic-editor-ownership', 'cinematic-editor-owner-mismatches', '2']]) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenario);
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
    await page.screenshot({ path: path.join(output, `${scenario}.png`), fullPage: true });
  }
  await page.getByLabel('실행 역할', { exact: true }).selectOption('candidate');
  const liveMetrics = { 'world-storage': 'save-state-mismatches', 'clock-lifecycle': 'lifecycle-mismatches', 'world-navigation': 'route-state-leaks', 'world-interactions': 'automation-state-leaks', 'world-domains': 'domain-save-mismatches', 'world-obstacle-registry': 'reactive-removal-misses', 'world-gameplay': 'gameplay-save-mismatches', 'world-life': 'life-save-mismatches', 'catalog-tracking': 'catalog-restore-overcount', 'world-character-scene': 'scene-after-dispose-mismatches', 'world-audio': 'audio-contexts-after-dispose', 'world-keyboard-focus': 'dom-keyboard-cross-world-leaks', 'editor-shortcuts': 'unregistered-shortcut-executions', 'world-grass': 'grass-missed-frame-updates', 'grass-rendering': 'grass-render-dispose-mismatches' };
  Object.assign(liveMetrics, { 'world-objects': 'blueprint-cross-world-leaks', 'world-snapshot': 'world-stale-command-snapshots', 'world-view-picking': 'world-cursor-position-mismatches' });
  Object.assign(liveMetrics, { 'npc-adapter-isolation': 'npc-policy-response-world-leaks', 'npc-policy-lifetime': 'npc-removed-entity-response-leaks', 'npc-frame-ownership': 'npc-frame-world-owner-mismatches' });
  Object.assign(liveMetrics, { 'world-custom-input': 'input-consumer-port-mismatches', 'world-input-source-lifecycle': 'input-source-final-cleanup-mismatches' });
  Object.assign(liveMetrics, { 'interaction-target-ownership': 'interaction-target-world-mismatches', 'tool-action-ownership': 'tool-duplicate-dom-actions', 'interaction-world-tracking': 'interaction-world-position-mismatches' });
  Object.assign(liveMetrics, { 'cinematic-lifetime': 'cinematic-cancel-pending', 'world-cinematic-lifecycle': 'cinematic-effects-after-dispose', 'cinematic-editor-ownership': 'cinematic-editor-owner-mismatches' });
  for (const [scenario, metric, baseline] of [['hardware-gamepad-routing', 'gamepad-connection-misses', '1'], ['gamepad-motion-scene', 'gamepad-analog-motion-misses', '2']]) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenario);
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
    await page.screenshot({ path: path.join(output, `${scenario}-comparison.png`), fullPage: true });
  }
  Object.assign(liveMetrics, { 'hardware-gamepad-routing': 'gamepad-connection-misses', 'gamepad-motion-scene': 'gamepad-analog-motion-misses' });
  for (const [scenario, metric, baseline] of [['world-restore-observers', 'restore-observer-work', '6'], ['world-restore-races', 'restore-mid-apply-abort-mismatches', '3'], ['world-paused-time-restore', 'restore-paused-clock-lost', '1']]) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenario);
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), '0');
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
    await page.screenshot({ path: path.join(output, `${scenario}-comparison.png`), fullPage: true });
  }
  Object.assign(liveMetrics, { 'world-restore-observers': 'restore-observer-work', 'world-restore-races': 'restore-mid-apply-abort-mismatches', 'world-paused-time-restore': 'restore-paused-clock-lost' });
  for (const [scenario, metric, baseline, candidate] of [['world-save-hooks', 'save-hook-global-writes', '3', '0'], ['save-hook-sharing', 'save-hook-burst-writes', '12', '2']]) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenario);
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), candidate);
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
    await page.screenshot({ path: path.join(output, `${scenario}-comparison.png`), fullPage: true });
  }
  Object.assign(liveMetrics, { 'world-save-hooks': 'save-hook-global-writes', 'save-hook-sharing': 'save-hook-initial-data-loss' });
  for (const [scenario, metric, baseline, candidate] of [['minihome-lifecycle', 'miniroom-idle-callbacks', '30', '0'], ['minihome-rendering', 'draw-calls', '623', '75']]) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenario);
    const row = page.getByRole('row').filter({ hasText: metric });
    assert.equal(await row.locator('td').nth(4).textContent(), candidate);
    assert.equal(await row.locator('td').nth(6).textContent(), baseline);
    await page.screenshot({ path: path.join(output, `${scenario}-comparison.png`), fullPage: true });
  }
  Object.assign(liveMetrics, { 'minihome-api': 'miniroom-api-failures', 'minihome-lifecycle': 'miniroom-idle-callbacks' });
  for (const [scenarioId, metric] of Object.entries(liveMetrics)) {
    await page.getByLabel('재현 시나리오', { exact: true }).selectOption(scenarioId);
    const before = await page.evaluate(() => window.performanceLab.runs().length);
    await page.getByRole('button', { name: '재현 실행', exact: true }).click();
    if (scenarioId === 'world-keyboard-focus') await exerciseWorldKeyboard(page, async step => {
      if (step === 'focus-b') await page.screenshot({ path: path.join(output, 'keyboard-live-input.png'), fullPage: true });
    });
    await page.waitForFunction(count => window.performanceLab.runs().length > count, before);
    const live = await page.evaluate(id => window.performanceLab.runs().find(run => run.scenarioId === id), scenarioId);
    assert.equal(live.status, 'passed');
    assert.equal(live.metrics[metric].p95, 0);
    if (scenarioId === 'grass-rendering' || scenarioId === 'world-view-picking' || scenarioId === 'npc-frame-ownership' || scenarioId === 'interaction-world-tracking' || scenarioId === 'gamepad-motion-scene') await page.screenshot({ path: path.join(output, `${scenarioId}.png`), fullPage: true });
  }
  await page.getByLabel('표시할 실행', { exact: true }).selectOption('abaca3d4-ef5a-4f3d-9108-24de2a011092');
  await page.getByText(/동일 조건 반복 5회 중 유효 측정 5회/).waitFor();
  assert.match(await page.locator('.lab-main').textContent(), /9,000표본/);
  const run = await page.evaluate(() => window.performanceLab.run({ scenarioId: 'state-hooks', role: 'candidate', config: { warmupMs: 250, durationMs: 1500 } }));
  assert.equal(run.status, 'passed');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON 내보내기' }).click();
  const download = await downloadPromise;
  const filename = path.join(output, 'exported-run.json');
  await download.saveAs(filename);
  assert.equal(JSON.parse(readFileSync(filename, 'utf8')).runId, run.runId);
  await context.close();

  // A clean browser context has no IndexedDB history; import the actual exported run.
  const fresh = await browser.newContext();
  const restored = await fresh.newPage();
  restored.on('pageerror', error => errors.push(error.message));
  await restored.goto(url);
  await restored.waitForFunction(ids => ids.every(id => window.performanceLab?.runs().some(run => run.runId === id)), bundledRunIds);
  assert.equal(await restored.evaluate(id => window.performanceLab.runs().some(entry => entry.runId === id), run.runId), false);
  await restored.locator('input[type=file]').setInputFiles(filename);
  await restored.waitForFunction(id => window.performanceLab.runs().some(entry => entry.runId === id), run.runId);
  await restored.reload();
  await restored.waitForFunction(id => window.performanceLab?.runs().some(entry => entry.runId === id), run.runId);
  const imported = await restored.evaluate(id => window.performanceLab.runs().find(entry => entry.runId === id), run.runId);
  assert.deepEqual(imported, run);
  assert.deepEqual(errors, []);
  writeFileSync(path.join(output, 'summary.json'), JSON.stringify({ status: 'passed', bundledRuns: bundledRunIds.length, comparison: '19 -> 1', clockElapsed: '2000 -> 1000', configurationMismatches: '2 -> 0', domainSaveMismatches: '2 -> 0', gameplaySaveMismatches: '2 -> 0', rewardBalanceMismatches: '2 -> 0', lifeSaveMismatches: '2 -> 0', catalogSubscriptions: '2 -> 1', catalogRestoreOvercount: '6 -> 0', characterSceneMismatches: '1 -> 0', audioSubscriptions: '2 -> 1', audioSettingsContexts: '1 -> 0', heldKeysAfterFocusChange: '2 -> 0', unregisteredShortcuts: '3 -> 0', liveScenarios: Object.keys(liveMetrics), formalRepetitions: 5, samples: 9000, roundTripRunId: run.runId, errors }, null, 2));
  console.log(`Lab UI, 5-run summary, JSON export/import and IndexedDB reload passed: ${output}`);
} finally { await browser.close(); }
