import { act, render } from '@testing-library/react';

import { useKeyboard } from '../../hooks/useKeyboard';
import { createMemoryInputBackend, type InputBackend, type InputStateListener } from '../../interactions/core/adapter';
import { useInputBackend } from '../../interactions/hooks/useInputBackend';
import { createMotionsPlugin, type MotionsRuntimeService } from '../../motions/plugin';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

test('mounted custom inputs, store commands and all motion consumers share one world port', async () => {
  const factory = jest.fn(() => createMemoryInputBackend()); const release = jest.fn();
  const a = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: factory, disposeInputAdapter: release })] });
  const b = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: factory, disposeInputAdapter: release })] });
  const ports: InputBackend[] = [];
  function Consumer({ index }: { index: number }) { ports[index] = useInputBackend(); useKeyboard(); return null; }
  await a.setup(); await b.setup();
  const view = render(<><GaesupRuntimeProvider runtime={a}><Consumer index={0} /><Consumer index={1} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer index={2} /></GaesupRuntimeProvider></>);
  try {
    expect(factory).toHaveBeenCalledTimes(2); expect(ports[0]).toBe(ports[1]); expect(ports[0]).toBe(a.inputAdapter);
    const motions = a.requireService<MotionsRuntimeService>('motions.runtime');
    expect(motions.create().inputAdapter).toBe(ports[0]); expect(a.motions.inputAdapter).toBe(ports[0]); expect(factory).toHaveBeenCalledTimes(2);
    act(() => { a.inputScope.dispatchKey('keydown', 'w'); });
    expect(a.store.getState().interaction.keyboard.forward).toBe(true); expect(ports[1]!.getKeyboard().forward).toBe(true); expect(ports[2]!.getKeyboard().forward).toBe(false);
    act(() => { a.store.getState().updateKeyboard({ keyF: true }); });
    expect(ports[0]!.getKeyboard().keyF).toBe(true);
    await act(async () => { await a.dispose(); });
    expect(release).toHaveBeenCalledTimes(1); expect(ports[0]!.getKeyboard().forward).toBe(false);
    act(() => { ports[0]!.updateKeyboard({ forward: true }); }); expect(a.store.getState().interaction.keyboard.forward).toBe(false);
    await act(async () => { await a.setup(); }); expect(factory).toHaveBeenCalledTimes(3); expect(ports[0]).toBe(a.inputAdapter);
    act(() => { a.inputScope.dispatchKey('keydown', 'w'); }); expect(ports[0]!.getKeyboard().forward).toBe(true);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
  expect(release).toHaveBeenCalledTimes(3);
});

test('hot plugin installation and removal rebind a stable port and unsubscribe the old source', async () => {
  const runtime = createGaesupRuntime(); const port = runtime.inputAdapter;
  let activeSubscriptions = 0; let oldCallback: InputStateListener = () => {};
  const source = createMemoryInputBackend(); const subscribe = source.subscribe!;
  source.subscribe = listener => {
    activeSubscriptions++; oldCallback = listener; const cleanup = subscribe(listener);
    return () => { activeSubscriptions--; cleanup(); };
  };
  const createInputAdapter = jest.fn(() => source);
  try {
    await runtime.setup(); runtime.plugins.register(createMotionsPlugin({ createInputAdapter }));
    await runtime.plugins.setup('gaesup.motions'); expect(createInputAdapter).toHaveBeenCalledTimes(1); expect(activeSubscriptions).toBe(1);
    source.updateKeyboard({ forward: true }); expect(runtime.store.getState().interaction.keyboard.forward).toBe(true);
    await runtime.plugins.dispose('gaesup.motions'); expect(activeSubscriptions).toBe(0);
    oldCallback({ keyboard: { ...source.getKeyboard(), forward: true }, mouse: source.getMouse() });
    expect(port.getKeyboard().forward).toBe(false); expect(runtime.store.getState().interaction.keyboard.forward).toBe(false);
    await runtime.plugins.setup('gaesup.motions'); expect(createInputAdapter).toHaveBeenCalledTimes(2); expect(activeSubscriptions).toBe(1);
    expect(runtime.inputAdapter).toBe(port); expect(port.getKeyboard().forward).toBe(false);
    port.updateKeyboard({ leftward: true }); expect(source.getKeyboard().leftward).toBe(true);
  } finally { await runtime.dispose(); }
  expect(activeSubscriptions).toBe(0);
});

test('setup and teardown failures leave input inert and do not retain source subscriptions', async () => {
  let failSetup = true; let failDispose = false; let active = 0;
  const factory = jest.fn(() => {
    if (failSetup) throw new Error('source failed');
    const source = createMemoryInputBackend(); const subscribe = source.subscribe!;
    source.subscribe = listener => { active++; const cleanup = subscribe(listener); return () => { active--; cleanup(); }; };
    return source;
  });
  const release = jest.fn(() => { if (failDispose) throw new Error('release failed'); });
  const runtime = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: factory, disposeInputAdapter: release })] });
  try {
    await expect(runtime.setup()).rejects.toThrow('source failed'); expect(active).toBe(0);
    runtime.inputAdapter.updateKeyboard({ forward: true }); expect(runtime.inputAdapter.getKeyboard().forward).toBe(false);
    failSetup = false; await runtime.setup(); expect(active).toBe(1); failDispose = true;
    await expect(runtime.dispose()).rejects.toThrow(); expect(active).toBe(0); expect(runtime.isActive()).toBe(false);
    expect(runtime.inputAdapter.getKeyboard().forward).toBe(false);
    failDispose = false; await runtime.setup(); expect(active).toBe(1);
  } finally { failDispose = false; await runtime.dispose(); }
  expect(active).toBe(0);
});

test('50 generations create and release exactly one custom source each', async () => {
  const createInputAdapter = jest.fn(() => createMemoryInputBackend()); const disposeInputAdapter = jest.fn();
  const runtime = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter, disposeInputAdapter })] });
  const port = runtime.inputAdapter;
  for (let i = 0; i < 50; i++) {
    await runtime.setup(); port.updateKeyboard({ forward: true });
    expect(runtime.store.getState().interaction.keyboard.forward).toBe(true);
    await runtime.dispose(); expect(runtime.store.getState().interaction.keyboard.forward).toBe(false);
  }
  expect(createInputAdapter).toHaveBeenCalledTimes(50); expect(disposeInputAdapter).toHaveBeenCalledTimes(50); expect(runtime.inputAdapter).toBe(port);
});

test('a failed shared-source world cannot dispose the input still owned by another world', async () => {
  const source = createMemoryInputBackend(); const releaseA = jest.fn(); const releaseB = jest.fn();
  const a = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: () => source, disposeInputAdapter: releaseA })] });
  const b = createGaesupRuntime({ plugins: [createMotionsPlugin({ createInputAdapter: () => source, disposeInputAdapter: releaseB })] });
  try {
    await a.setup(); a.inputAdapter.updateKeyboard({ forward: true });
    await expect(b.setup()).rejects.toThrow('two active worlds'); expect(releaseB).not.toHaveBeenCalled(); expect(a.inputAdapter.getKeyboard().forward).toBe(true);
  } finally { await b.dispose(); await a.dispose(); }
  expect(releaseA).toHaveBeenCalledTimes(1); expect(releaseB).not.toHaveBeenCalled();
});

test('a failing hot source makes input neutral until a valid replacement is installed', async () => {
  const runtime = createGaesupRuntime(); const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await runtime.setup(); runtime.inputAdapter.updateKeyboard({ forward: true });
    runtime.plugins.context.input.register('interaction.input', { createAdapter: () => { throw new Error('failed hot source'); } });
    expect(error).toHaveBeenCalled(); expect(runtime.inputAdapter.getKeyboard().forward).toBe(false);
    runtime.plugins.context.input.remove('interaction.input');
    runtime.inputAdapter.updateKeyboard({ leftward: true }); expect(runtime.store.getState().interaction.keyboard.leftward).toBe(true);
  } finally { await runtime.dispose(); error.mockRestore(); }
});

test('an explicit primary extension ID remains consistent across store, hooks and motion service', async () => {
  const source = createMemoryInputBackend(); const createInputAdapter = jest.fn(() => source);
  const runtime = createGaesupRuntime({ inputExtensionId: 'custom.controls', plugins: [createMotionsPlugin({ inputExtensionId: 'custom.controls', createInputAdapter })] });
  try {
    await runtime.setup(); const service = runtime.requireService<MotionsRuntimeService>('motions.runtime');
    expect(service.create().inputAdapter).toBe(runtime.inputAdapter); expect(createInputAdapter).toHaveBeenCalledTimes(1);
    source.updateKeyboard({ forward: true }); expect(runtime.store.getState().interaction.keyboard.forward).toBe(true);
    await runtime.plugins.dispose('gaesup.motions'); expect(runtime.inputAdapter.getKeyboard().forward).toBe(false);
  } finally { await runtime.dispose(); }
});
