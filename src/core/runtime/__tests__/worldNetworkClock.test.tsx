import { act, renderHook } from '@testing-library/react';
import { Vector3 } from 'three';
import { createGaesupRuntime } from '../createGaesupRuntime';
import { GaesupRuntimeProvider } from '../context';
import { useNetworkBridge } from '../../networks/hooks/useNetworkBridge';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test.each([30, 60, 144])('two real hooks share a network clock at %i Hz and publish current snapshots', async rate => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const view = renderHook(() => [useNetworkBridge({ config: { updateFrequency: 30 } }), useNetworkBridge({ config: { updateFrequency: 30 } })], {
    wrapper: ({ children }) => <GaesupRuntimeProvider runtime={runtime}>{children}</GaesupRuntimeProvider>,
  });
  try {
    expect(view.result.current[0]?.bridge).toBe(runtime.networkBridge);
    expect(view.result.current[1]?.bridge).toBe(runtime.networkBridge);
    expect(runtime.clockLoop.ownerCount).toBe(1);
    const system = runtime.networkBridge.getEngine('main')!.system;
    const updates = system.updateRevision;
    const snapshots: number[] = [];
    const off = runtime.networkBridge.subscribe(value => { snapshots.push(value.nodeCount); });
    for (let frame = 0; frame < rate; frame++) { view.rerender(); runtime.clockLoop.clock.advance(1 / rate); }
    expect(system.updateRevision - updates).toBe(30); expect(snapshots).toHaveLength(30);
    system.registerNPC('one', new Vector3()); runtime.clockLoop.clock.stepTicks(2);
    system.registerNPC('two', new Vector3(1, 0, 0)); runtime.clockLoop.clock.stepTicks(2);
    expect(snapshots.slice(-2)).toEqual([1, 2]); off();
    // Public replacement of an engine must preserve the mounted hooks' shared update lease.
    runtime.networkBridge.register('main');
    const replacement = runtime.networkBridge.getEngine('main')!.system;
    expect(replacement).not.toBe(system); expect(system.getState().isRunning).toBe(false);
    runtime.clockLoop.clock.stepTicks(60); expect(replacement.updateRevision).toBe(30);
    view.unmount(); expect(runtime.clockLoop.ownerCount).toBe(0);
    // An owned network never falls back to an independent timeout after its last UI consumer leaves.
    expect(jest.getTimerCount()).toBe(0);
  } finally { view.unmount(); await runtime.dispose(); }
  expect(runtime.clockLoop.clock.systemCount).toBe(1); expect(jest.getTimerCount()).toBe(0);
});

test('Provider replacement and mounted setup/dispose cycles replace only the owned bridge', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  let active = a;
  const view = renderHook(() => useNetworkBridge(), {
    wrapper: ({ children }) => <GaesupRuntimeProvider runtime={active}>{children}</GaesupRuntimeProvider>,
  });
  try {
    const bridgeA = a.networkBridge;
    active = b; view.rerender(); expect(view.result.current.bridge).toBe(b.networkBridge);
    expect(b.networkBridge).not.toBe(bridgeA); expect(a.clockLoop.ownerCount).toBe(0);
    for (let cycle = 0; cycle < 10; cycle++) {
      const previous = b.networkBridge;
      await act(() => b.dispose());
      expect(view.result.current.isReady).toBe(false); expect(view.result.current.bridge).toBeNull();
      expect(previous.getEngine('main')).toBeUndefined(); expect(b.clockLoop.clock.systemCount).toBe(1);
      await act(() => b.setup());
      expect(view.result.current.isReady).toBe(true); expect(view.result.current.bridge).toBe(b.networkBridge);
      expect(b.networkBridge).not.toBe(previous); expect(b.clockLoop.ownerCount).toBe(1);
      b.clockLoop.clock.stepTicks(60); expect(b.networkBridge.getEngine('main')!.system.updateRevision).toBe(30);
    }
    expect(bridgeA.getEngine('main')!.system.getState().isRunning).toBe(true);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
  jest.runAllTicks(); expect(jest.getTimerCount()).toBe(0);
});

test('network start, stop and frequency changes stay on the same world clock', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  try {
    runtime.networkBridge.ensureMainEngine();
    const system = runtime.networkBridge.getEngine('main')!.system;
    expect(jest.getTimerCount()).toBe(0);
    runtime.clockLoop.clock.stepTicks(60); expect(system.updateRevision).toBe(30);
    system.stop(); runtime.clockLoop.clock.stepTicks(60); expect(system.updateRevision).toBe(30);
    system.updateConfig({ updateFrequency: 20 }); system.start();
    runtime.clockLoop.clock.stepTicks(60); expect(system.updateRevision).toBe(50);
    system.updateConfig({ updateFrequency: 60 });
    runtime.clockLoop.clock.stepTicks(60); expect(system.updateRevision).toBe(110);
    system.updateConfig({ updateFrequency: 30 });
    for (let frame = 0; frame < 60; frame++) { system.updateConfig({ updateFrequency: 30 }); runtime.clockLoop.clock.stepTicks(); }
    expect(system.updateRevision).toBe(140);
    expect(jest.getTimerCount()).toBe(0);
  } finally { await runtime.dispose(); }
});
