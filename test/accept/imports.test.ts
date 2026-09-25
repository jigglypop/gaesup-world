/** @jest-environment jsdom */
import { acceptScenario, type Metrics } from './scenario';

const ENTRIES = ['gaesup-world', 'gaesup-world/runtime', 'gaesup-world/network', 'gaesup-world/server-contracts'];

/** Observable effects of importing one entry into a fresh module registry. */
async function importEffects(entry: string): Promise<Metrics> {
  const listeners = [jest.spyOn(window, 'addEventListener'), jest.spyOn(document, 'addEventListener')];
  const timers = [jest.spyOn(window, 'setTimeout'), jest.spyOn(window, 'setInterval'), jest.spyOn(window, 'requestAnimationFrame')];
  const reads = jest.spyOn(Storage.prototype, 'getItem');
  const globals = new Set(Object.getOwnPropertyNames(globalThis));
  try {
    await jest.isolateModulesAsync(async () => {
      await import(entry);
    });
    return {
      listeners: listeners.reduce((sum, spy) => sum + spy.mock.calls.length, 0),
      timers: timers.reduce((sum, spy) => sum + spy.mock.calls.length, 0),
      storageReads: reads.mock.calls.length,
      globalWrites: Object.getOwnPropertyNames(globalThis).filter((name) => !globals.has(name)).length,
    };
  } finally {
    jest.restoreAllMocks();
  }
}

acceptScenario('S-H14', async () => {
  const total: Metrics = { listeners: 0, timers: 0, storageReads: 0, globalWrites: 0 };
  for (const entry of ENTRIES) {
    const effects = await importEffects(entry);
    for (const [name, value] of Object.entries(effects)) total[name] = (total[name] as number) + (value as number);
  }
  return total;
}, 180_000);
