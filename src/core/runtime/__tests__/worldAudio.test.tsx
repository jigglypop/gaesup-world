import { act, render } from '@testing-library/react';

import { useAmbientBgm } from '../../audio/hooks/useAmbientBgm';
import { createAudioPlugin } from '../../audio/plugin';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

function fakeContext() {
  const parameter = () => ({ value: 1, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });
  const gain = () => ({ gain: parameter(), connect: jest.fn(), disconnect: jest.fn() });
  const source = () => ({ frequency: parameter(), connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn(), onended: null });
  const context = { state: 'suspended', currentTime: 0, destination: {}, createGain: jest.fn(gain), createOscillator: jest.fn(source),
    resume: jest.fn(async () => { context.state = 'running'; }), close: jest.fn(async () => { context.state = 'closed'; }),
  };
  return context;
}
const previousContext = window.AudioContext;
let contexts: ReturnType<typeof fakeContext>[];
beforeEach(() => {
  jest.useFakeTimers(); contexts = [];
  window.AudioContext = jest.fn(() => { const value = fakeContext(); contexts.push(value); return value; }) as unknown as typeof AudioContext;
});
afterEach(() => { window.AudioContext = previousContext; jest.useRealTimers(); });

test('world audio settings and save restoration stay lazy; disposal closes only its context and rejects stale playback', async () => {
  const a = createGaesupRuntime({ plugins: [createAudioPlugin()] }); const b = createGaesupRuntime({ plugins: [createAudioPlugin()] });
  try {
    await a.setup(); await b.setup();
    a.audioStore.getState().setMaster(0.2); b.audioStore.getState().setMaster(0.8);
    const save = a.save.createBlob(); a.audioStore.getState().setMaster(0.3); a.save.hydrateBlob(save);
    expect(save.domains['audio']).not.toHaveProperty('bgmRevision');
    expect(a.audioStore.getState().masterVolume).toBe(0.2); expect(b.audioStore.getState().masterVolume).toBe(0.8);
    expect(contexts).toHaveLength(0);
    a.audioStore.getState().playSfx({ id: 'a' }); b.audioStore.getState().playSfx({ id: 'b' });
    expect(contexts).toHaveLength(2);
    expect(contexts[0]!.createGain.mock.results[0]!.value.gain.value).toBe(0.2);
    expect(contexts[0]!.resume).toHaveBeenCalledTimes(1);
    await a.dispose(); expect(contexts[0]!.close).toHaveBeenCalledTimes(1); expect(contexts[1]!.state).toBe('running');
    a.audioStore.getState().playSfx({ id: 'stale' }); a.audioStore.getState().playBgm({ id: 'stale-bgm' });
    expect(contexts).toHaveLength(2); expect(a.audioStore.getState().currentBgmId).toBeNull();
    await a.setup(); a.audioStore.getState().playSfx({ id: 'fresh' });
    expect(contexts).toHaveLength(3); expect(contexts[2]!.createGain.mock.results[0]!.value.gain.value).toBe(0.2);
  } finally { await a.dispose(); await b.dispose(); }
  expect(jest.getTimerCount()).toBe(0);
});

test('ambient consumers share subscriptions; partial removal, other-world disposal and restart retain the right track', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  a.timeStore.getState().setTotalMinutes(720); b.timeStore.getState().setTotalMinutes(0);
  await a.setup(); await b.setup();
  let active = 0; const originalSubscribe = a.timeStore.subscribe;
  a.timeStore.subscribe = listener => { active++; const off = originalSubscribe(listener); return () => { active--; off(); }; };
  function Consumer() { useAmbientBgm(); return null; }
  const tree = (count: number) => <><GaesupRuntimeProvider runtime={a}>{Array.from({ length: count }, (_, id) => <Consumer key={id} />)}</GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer /></GaesupRuntimeProvider></>;
  const view = render(tree(2));
  try {
    expect(active).toBe(1); expect(contexts).toHaveLength(2);
    expect(a.audioEngine.getCurrentBgmId()).toContain('bgm.day.'); expect(b.audioEngine.getCurrentBgmId()).toContain('bgm.night.');
    view.rerender(tree(1)); expect(active).toBe(1); expect(a.audioEngine.getCurrentBgmId()).toContain('bgm.day.');
    await act(async () => { await a.dispose(); });
    expect(active).toBe(0); expect(contexts[0]!.state).toBe('closed'); expect(contexts[1]!.state).toBe('running');
    expect(b.audioEngine.getCurrentBgmId()).toContain('bgm.night.');
    await act(async () => { await a.setup(); });
    expect(active).toBe(1); expect(contexts).toHaveLength(3); expect(a.audioEngine.getCurrentBgmId()).toContain('bgm.day.');
  } finally { view.unmount(); await a.dispose(); await b.dispose(); a.timeStore.subscribe = originalSubscribe; }
  await jest.advanceTimersByTimeAsync(0);
  expect(active).toBe(0); expect(jest.getTimerCount()).toBe(0);
});

test.each([false, true])('ambient cleanup preserves a manual same-ID replacement, including reentrant commands (%s)', async reentrant => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  let replaced = false;
  const off = runtime.audioStore.subscribe(state => {
    if (reentrant && state.currentBgmId && !replaced) { replaced = true; state.playBgm({ id: state.currentBgmId }); }
  });
  function Consumer() { useAmbientBgm(); return null; }
  const view = render(<GaesupRuntimeProvider runtime={runtime}><Consumer /></GaesupRuntimeProvider>);
  try {
    const id = runtime.audioStore.getState().currentBgmId!;
    if (!reentrant) runtime.audioStore.getState().playBgm({ id });
    view.unmount(); expect(runtime.audioEngine.getCurrentBgmId()).toBe(id);
  } finally { off(); view.unmount(); await runtime.dispose(); }
});
