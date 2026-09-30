/** @jest-environment jsdom */
import { createGaesupRuntime, createPluginRegistry, type AssetSource, type DialogTree } from 'gaesup-world';

import { acceptScenario } from './scenario';

type Scheduler = 'setTimeout' | 'setInterval' | 'requestAnimationFrame';
const CANCELLERS = { setTimeout: 'clearTimeout', setInterval: 'clearInterval', requestAnimationFrame: 'cancelAnimationFrame' } as const;

/** Counts window/document listeners and timers created from now on that are still live when read. */
function trackLeaks() {
  // jsdom's selector engine adds its own document listeners on first use; start it before counting.
  document.body.matches('*');
  const listeners = new Set<string>();
  const timers = new Set<string>();
  const ids = new WeakMap<object, number>();
  let nextId = 0;
  const idOf = (value: object) => {
    let id = ids.get(value);
    if (id === undefined) ids.set(value, (id = ++nextId));
    return id;
  };
  const restores: (() => void)[] = [];
  // jsdom's window has its own listener methods, so each target is wrapped rather than EventTarget.prototype.
  for (const [name, target] of [['window', window], ['document', document]] as const) {
    for (const method of ['addEventListener', 'removeEventListener'] as const) {
      const own = Object.getOwnPropertyDescriptor(target, method);
      const original = target[method];
      Object.defineProperty(target, method, {
        configurable: true,
        writable: true,
        value(this: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
          if (!listener) return; // The DOM ignores a null listener too.
          const key = `${name}|${type}|${idOf(listener)}|${typeof options === 'boolean' ? options : Boolean(options?.capture)}`;
          if (method === 'addEventListener') listeners.add(key);
          else listeners.delete(key);
          original.call(this, type, listener, options);
        },
      });
      restores.push(() => (own ? Object.defineProperty(target, method, own) : Reflect.deleteProperty(target, method)));
    }
  }
  const scope = globalThis as unknown as Record<string, (...args: unknown[]) => unknown>;
  const originals = new Map<string, (...args: unknown[]) => unknown>();
  for (const [schedule, cancel] of Object.entries(CANCELLERS) as [Scheduler, string][]) {
    const scheduleOriginal = scope[schedule];
    const cancelOriginal = scope[cancel];
    if (!scheduleOriginal || !cancelOriginal) continue;
    originals.set(schedule, scheduleOriginal).set(cancel, cancelOriginal);
    scope[schedule] = (callback: unknown, ...rest: unknown[]) => {
      const handle = scheduleOriginal.call(globalThis, (...args: unknown[]) => {
        if (schedule !== 'setInterval') timers.delete(`${schedule}:${String(handle)}`);
        (callback as (...values: unknown[]) => void)(...args);
      }, ...rest);
      timers.add(`${schedule}:${String(handle)}`);
      return handle;
    };
    scope[cancel] = (handle: unknown) => {
      timers.delete(`${schedule}:${String(handle)}`);
      return cancelOriginal.call(globalThis, handle);
    };
  }
  return {
    count: () => ({ leakedListeners: listeners.size, leakedTimers: timers.size }),
    restore: () => {
      for (const restore of restores) restore();
      for (const [name, original] of originals) scope[name] = original;
    },
  };
}

const source = (name: string, delay?: Promise<void>): AssetSource => ({
  listAssets: async () => { await delay; return [{ id: 'shared', name, kind: 'weapon' }]; },
  getAsset: async () => undefined,
  listByKind: async () => [],
  listBySlot: async () => [],
});
const tree: DialogTree = { id: 'only-a', startId: 'hello', nodes: { hello: { id: 'hello', text: 'A' } } };
const throwing = (id: string) => ({ id, phase: 'simulation' as const, update: () => { throw new Error(id); } });
const pad = { id: 'pad', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: [], timestamp: 0 };

acceptScenario('S-H08', async () => {
  const leaks = trackLeaks();
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [pad] });
  try {
    const errorsA: string[] = [];
    const errorsB: string[] = [];
    const a = createGaesupRuntime({ worldId: 'accept-a', onError: (error) => errorsA.push(error.message) });
    const b = createGaesupRuntime({ worldId: 'accept-b', onError: (error) => errorsB.push(error.message) });
    await a.setup();
    await b.setup();
    // What a mounted world does: physics holds the clock loop, and a gamepad world polls the browser.
    for (const runtime of [a, b]) {
      runtime.clockLoop.acquire();
      runtime.store.getState().setMode({ controller: 'gamepad' });
    }

    let releaseA!: () => void;
    const slowA = a.assetStore.getState().loadAssets(source('A', new Promise((resolve) => { releaseA = resolve; })));
    await b.assetStore.getState().loadAssets(source('B'));
    releaseA();
    await slowA;
    a.dialogRegistry.register(tree);
    a.npcStore.getState().initializeDefaults();
    b.clockLoop.clock.addSystem(throwing('b-clock'));
    b.clockLoop.clock.stepTicks(1);
    a.plugins.context.events.on('a-event', () => { throw new Error('a-event'); });
    a.plugins.context.events.emit('a-event', null);

    const checks = {
      assetRecords: a.assetStore.getState().getAsset('shared')?.name === 'A' && b.assetStore.getState().getAsset('shared')?.name === 'B',
      assetLoads: a.assetStore.getState().catalogStatus.state === 'loaded' && b.assetStore.getState().catalogStatus.state === 'loaded',
      dialogTrees: !b.dialogRegistry.get(tree.id) && !b.dialogStore.getState().start(tree.id) && a.dialogStore.getState().start(tree.id),
      npcStores: a.npcStore.getState().templates.size > 0 && b.npcStore.getState().templates.size === 0,
      activeErrors: errorsA.join() === 'a-event' && errorsB.join() === 'b-clock',
    };

    // Live while both run, so a zero after disposal means released, not unseen.
    const { leakedListeners: activeListeners, leakedTimers: activeTimers } = leaks.count();
    await a.dispose();
    await b.dispose();
    // Disposing in setup order used to hand the page sink back to the first, already disposed, runtime.
    const page = createPluginRegistry();
    page.context.events.on('page', () => { throw new Error('page'); });
    page.context.events.emit('page', null);
    a.reportError(new Error('late'), { source: 'accept' });
    const disposedErrors = errorsA.join() === 'a-event' && errorsB.join() === 'b-clock';
    await new Promise((resolve) => setTimeout(resolve, 0));

    const isolation = { ...checks, disposedErrors };
    const sharedState = Object.values(isolation).filter((isolated) => !isolated).length;
    return { sharedState, ...leaks.count(), activeListeners, activeTimers, ...isolation };
  } finally {
    leaks.restore();
    delete (navigator as { getGamepads?: unknown }).getGamepads;
  }
});
