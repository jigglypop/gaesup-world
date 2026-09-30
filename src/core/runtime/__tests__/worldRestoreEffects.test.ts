import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('valid restore cancels effects even without a scene binding, while another world continues', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  try {
    a.sceneStore.getState().registerScene({ id: 'home', name: 'home', interior: true });
    const aEffect = jest.fn(); const bEffect = jest.fn();
    const oldA = a.cinematics.play([{ kind: 'closeUp', target: [1, 2, 3], durationMs: 100 }, { kind: 'event', name: 'late' }], { onEvent: aEffect });
    const oldB = b.cinematics.play([{ kind: 'closeUp', target: [2, 2, 3], durationMs: 100 }, { kind: 'event', name: 'other' }], { onEvent: bEffect });
    const transition = a.sceneStore.getState().goTo('home');
    expect(a.save.hydrateBlob(a.save.createBlob())).toBe(true);
    await jest.advanceTimersByTimeAsync(600); await Promise.all([oldA.finished, oldB.finished, transition]);
    expect(oldA.state).toBe('cancelled'); expect(aEffect).not.toHaveBeenCalled(); expect(bEffect).toHaveBeenCalledTimes(1);
    expect(a.sceneStore.getState().current).toBe('outdoor'); expect(a.cinematics.getStats().pendingTimers).toBe(0);
    const fresh = a.sceneStore.getState().goTo('home'); await jest.advanceTimersByTimeAsync(600); await fresh;
    expect(a.sceneStore.getState().current).toBe('home');
  } finally { await a.dispose(); await b.dispose(); }
});

test('ten setup/restore/dispose cycles release each restore guard and reject inactive timelines', async () => {
  const runtime = createGaesupRuntime(); let guards = 0;
  const register = runtime.save.registerRestoreGuard.bind(runtime.save);
  runtime.save.registerRestoreGuard = guard => { guards++; const off = register(guard); let released = false; return () => { if (!released) { released = true; guards--; } off(); }; };
  for (let i = 0; i < 10; i++) {
    await runtime.setup(); expect(guards).toBe(1);
    const playback = runtime.cinematics.play([{ kind: 'closeUp', target: [i, 0, 0], durationMs: 1000 }]);
    runtime.save.hydrateBlob(runtime.save.createBlob()); await playback.finished; expect(playback.state).toBe('cancelled');
    await runtime.dispose(); expect(guards).toBe(0); expect(runtime.cinematics.getStats().pendingTimers).toBe(0);
    expect(runtime.cinematics.play([]).state).toBe('cancelled');
  }
});
