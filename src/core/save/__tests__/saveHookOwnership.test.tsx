import { act, render, renderHook } from '@testing-library/react';

import { GaesupRuntimeProvider } from '../../runtime/context';
import { createGaesupRuntime } from '../../runtime/createGaesupRuntime';
import { logger } from '../../utils/logger';
import { getSaveSystem, SaveSystem } from '../core/SaveSystem';
import { useAutoSave, useLoadOnMount, type AutoSaveOptions } from '../hooks/useAutoSave';
import type { SaveBlob } from '../types';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const blob = (counter: number): SaveBlob => ({ version: 1, savedAt: 0, domains: { counter } });
function fixture() {
  let value = 1;
  const adapter = {
    read: jest.fn<Promise<SaveBlob | null>, [string]>(async () => blob(7)),
    write: jest.fn<Promise<void>, [string, SaveBlob]>(async () => undefined),
    list: async () => [], remove: async () => undefined,
  };
  const system = new SaveSystem({ adapter, defaultSlot: 'owned' });
  const serialize = jest.fn(() => value);
  system.register({ key: 'counter', serialize, hydrate: data => { value = Number(data); } });
  return { system, adapter, serialize, get value() { return value; }, set value(next: number) { value = next; } };
}
const unload = () => window.dispatchEvent(new Event('beforeunload'));
const settle = async () => { await act(async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); }); };

test('default-slot aliases share initial read, protect pending data, preserve late edits, and notify each owner once', async () => {
  const f = fixture(); const gate = deferred<SaveBlob>(); f.adapter.read.mockReturnValue(gate.promise);
  const first = jest.fn(); const second = jest.fn(); const late = jest.fn();
  function Consumer({ explicit, notify }: { explicit: boolean; notify: (loaded: boolean) => void }) {
    useAutoSave({ saveSystem: f.system });
    useLoadOnMount(explicit ? 'owned' : undefined, notify, f.system); return null;
  }
  const content = (extra: boolean) => <><Consumer explicit={false} notify={first} /><Consumer explicit notify={second} />{extra && <Consumer explicit notify={late} />}</>;
  const view = render(content(false));
  try {
    expect(f.adapter.read).toHaveBeenCalledTimes(1); unload(); await settle(); expect(f.adapter.write).not.toHaveBeenCalled();
    await act(async () => { gate.resolve(blob(7)); }); expect(f.value).toBe(7);
    expect(first).toHaveBeenCalledWith(true); expect(second).toHaveBeenCalledWith(true);
    f.value = 42; view.rerender(content(true)); await settle();
    expect(f.value).toBe(42); expect(f.adapter.read).toHaveBeenCalledTimes(1); expect(first).toHaveBeenCalledTimes(1); expect(late).toHaveBeenCalledWith(true);
  } finally { view.unmount(); }
});

test('removing one read owner preserves the remaining owner; removing the last aborts and remount starts a fresh read', async () => {
  const f = fixture(); const old = deferred<SaveBlob>(); const fresh = deferred<SaveBlob>();
  f.adapter.read.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  const first = jest.fn(); const second = jest.fn();
  const a = renderHook(() => useLoadOnMount(undefined, first, f.system));
  const b = renderHook(() => useLoadOnMount('owned', second, f.system));
  a.unmount(); expect(f.system.isLoading()).toBe(true); b.unmount(); expect(f.system.isLoading()).toBe(false);
  const c = renderHook(() => useLoadOnMount(undefined, second, f.system));
  try {
    await act(async () => { old.resolve(blob(3)); }); expect(f.value).toBe(1); expect(f.system.isLoading()).toBe(true);
    await act(async () => { fresh.resolve(blob(9)); }); expect(f.value).toBe(9); expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledTimes(1);
  } finally { c.unmount(); }
});

test('a read still completes for another consumer after its first owner leaves', async () => {
  const f = fixture(); const gate = deferred<SaveBlob>(); f.adapter.read.mockReturnValue(gate.promise); const notify = jest.fn();
  const a = renderHook(() => useLoadOnMount(undefined, undefined, f.system)); const b = renderHook(() => useLoadOnMount(undefined, notify, f.system));
  a.unmount();
  try { await act(async () => { gate.resolve(blob(8)); }); expect(f.value).toBe(8); expect(notify).toHaveBeenCalledWith(true); expect(f.adapter.read).toHaveBeenCalledTimes(1); }
  finally { b.unmount(); }
});

test('callback failure is isolated from other consumers and does not block automatic saves', async () => {
  const f = fixture(); const report = jest.spyOn(logger, 'error').mockImplementation(() => {}); const notify = jest.fn();
  const a = renderHook(() => { useLoadOnMount(undefined, () => { throw new Error('callback'); }, f.system); useAutoSave({ saveSystem: f.system }); });
  const b = renderHook(() => useLoadOnMount(undefined, notify, f.system));
  try { await settle(); expect(notify).toHaveBeenCalledWith(true); unload(); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1); expect(report).toHaveBeenCalledTimes(1); }
  finally { a.unmount(); b.unmount(); report.mockRestore(); }
});

test('initial read failures suspend auto writes and a fresh mount can retry', async () => {
  const f = fixture(); f.adapter.read.mockRejectedValueOnce(new Error('read')); const report = jest.spyOn(logger, 'error').mockImplementation(() => {});
  const mount = () => renderHook(() => { useLoadOnMount(undefined, undefined, f.system); useAutoSave({ saveSystem: f.system }); });
  const a = mount(); const b = mount(); await settle(); unload(); await settle();
  expect(f.adapter.read).toHaveBeenCalledTimes(1); expect(f.adapter.write).not.toHaveBeenCalled(); expect(report).toHaveBeenCalledTimes(1);
  a.unmount(); b.unmount(); const c = mount();
  try { await settle(); unload(); await settle(); expect(f.value).toBe(7); expect(f.adapter.read).toHaveBeenCalledTimes(2); expect(f.adapter.write).toHaveBeenCalledTimes(1); }
  finally { c.unmount(); report.mockRestore(); }
});

test.each([false, true])('event bursts serialize at most one current and one latest snapshot, including write failure: %s', async fail => {
  const f = fixture(); const gate = deferred<void>(); f.adapter.write.mockReturnValueOnce(gate.promise);
  const report = jest.spyOn(logger, 'error').mockImplementation(() => {});
  const a = renderHook(() => useAutoSave({ saveSystem: f.system })); const b = renderHook(() => useAutoSave({ saveSystem: f.system, slot: 'owned' }));
  try {
    for (let i = 0; i < 6; i++) { f.value = i + 1; unload(); }
    await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1); expect(f.serialize).toHaveBeenCalledTimes(1);
    await act(async () => { if (fail) gate.reject(new Error('write')); else gate.resolve(); }); await settle();
    expect(f.adapter.write).toHaveBeenCalledTimes(2); expect(f.serialize).toHaveBeenCalledTimes(2);
    expect(f.adapter.write.mock.calls.map(([, saved]) => saved.domains['counter'])).toEqual([1, 6]);
    expect(report).toHaveBeenCalledTimes(fail ? 1 : 0);
  } finally { a.unmount(); b.unmount(); report.mockRestore(); }
});

test('in-flight writes survive final release without a queued followup; a remount shares the existing writer', async () => {
  const f = fixture(); const gate = deferred<void>(); f.adapter.write.mockReturnValueOnce(gate.promise);
  const a = renderHook(() => useAutoSave({ saveSystem: f.system })); unload(); unload(); await settle(); a.unmount();
  const b = renderHook(() => useAutoSave({ saveSystem: f.system })); f.value = 9; unload(); await settle();
  expect(f.serialize).toHaveBeenCalledTimes(1);
  await act(async () => { gate.resolve(); }); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(2);
  expect(f.adapter.write.mock.calls[1]?.[1].domains['counter']).toBe(9); b.unmount();
  const secondGate = deferred<void>(); f.adapter.write.mockReturnValueOnce(secondGate.promise);
  const c = renderHook(() => useAutoSave({ saveSystem: f.system })); unload(); unload(); await settle(); c.unmount();
  await act(async () => { secondGate.resolve(); }); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(3);
});

test('autosave also waits for an explicit storage read and ignores writes triggered by restoration', async () => {
  const f = fixture(); const gate = deferred<SaveBlob>(); f.adapter.read.mockReturnValue(gate.promise);
  const off = f.system.register({ key: 'events', serialize: () => 1, hydrate: unload });
  const view = renderHook(() => useAutoSave({ saveSystem: f.system }));
  try {
    const loading = f.system.load(); unload(); await settle(); expect(f.adapter.write).not.toHaveBeenCalled();
    gate.resolve({ ...blob(9), domains: { counter: 9, events: 2 } }); await loading;
    await settle(); expect(f.adapter.write).not.toHaveBeenCalled(); unload(); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1);
  } finally { view.unmount(); off(); }
});

test('duplicate owners share timers and event listeners without resetting an unchanged interval', async () => {
  jest.useFakeTimers(); const f = fixture();
  const mount = (options: AutoSaveOptions) => renderHook(() => useAutoSave({ saveSystem: f.system, ...options }));
  const a = mount({ intervalMs: 2000, saveOnUnload: false, saveOnVisibilityChange: false });
  await jest.advanceTimersByTimeAsync(1500); const b = mount({ intervalMs: 2000 });
  try {
    expect(jest.getTimerCount()).toBe(1); await jest.advanceTimersByTimeAsync(500); expect(f.adapter.write).toHaveBeenCalledTimes(1);
    b.unmount(); unload(); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1);
    const c = mount({ intervalMs: 1000, saveOnUnload: false, saveOnVisibilityChange: false });
    await jest.advanceTimersByTimeAsync(1000); expect(f.adapter.write).toHaveBeenCalledTimes(2); c.unmount();
    await jest.advanceTimersByTimeAsync(1000); expect(f.adapter.write).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1000); expect(f.adapter.write).toHaveBeenCalledTimes(3);
  } finally { a.unmount(); b.unmount(); expect(jest.getTimerCount()).toBe(0); jest.useRealTimers(); }
});

test('visibility preferences share one active listener and ignore visible or removed consumers', async () => {
  const f = fixture(); const visibility = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  const a = renderHook(() => useAutoSave({ saveSystem: f.system, saveOnVisibilityChange: false }));
  const b = renderHook(() => useAutoSave({ saveSystem: f.system }));
  try {
    document.dispatchEvent(new Event('visibilitychange')); await settle(); expect(f.adapter.write).not.toHaveBeenCalled();
    visibility.mockReturnValue('hidden'); document.dispatchEvent(new Event('visibilitychange')); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1);
    b.unmount(); document.dispatchEvent(new Event('visibilitychange')); await settle(); expect(f.adapter.write).toHaveBeenCalledTimes(1);
  } finally { a.unmount(); b.unmount(); visibility.mockRestore(); }
});

test('a missing initial slot allows saving, and a slow slot does not block another slot writer', async () => {
  const f = fixture(); f.adapter.read.mockResolvedValue(null); const gate = deferred<void>();
  f.adapter.write.mockImplementation(async slot => { if (slot === 'owned') await gate.promise; });
  const notify = jest.fn(); const a = renderHook(() => { useLoadOnMount(undefined, notify, f.system); useAutoSave({ saveSystem: f.system }); });
  const b = renderHook(() => useAutoSave({ saveSystem: f.system, slot: 'other' }));
  try {
    await settle(); expect(notify).toHaveBeenCalledWith(false); unload(); await settle();
    expect(f.adapter.write.mock.calls.map(([slot]) => slot)).toEqual(['owned', 'other']); unload(); await settle();
    expect(f.adapter.write.mock.calls.map(([slot]) => slot)).toEqual(['owned', 'other', 'other']);
  } finally { a.unmount(); b.unmount(); gate.resolve(); await settle(); }
});

test.each([NaN, Infinity])('invalid interval %s uses the default period without a busy loop', async intervalMs => {
  jest.useFakeTimers(); const f = fixture(); const view = renderHook(() => useAutoSave({ saveSystem: f.system, intervalMs }));
  try { await jest.advanceTimersByTimeAsync(299999); expect(f.adapter.write).not.toHaveBeenCalled(); await jest.advanceTimersByTimeAsync(1); expect(f.adapter.write).toHaveBeenCalledTimes(1); }
  finally { view.unmount(); jest.useRealTimers(); }
});

test('each Provider selects its own save system and lifecycle without touching the legacy singleton', async () => {
  const a = fixture(); const b = fixture(); const ra = createGaesupRuntime({ saveSystem: a.system }); const rb = createGaesupRuntime({ saveSystem: b.system });
  await ra.setup(); await rb.setup(); const globalSave = jest.spyOn(getSaveSystem(), 'save');
  function Consumer() { useLoadOnMount(); useAutoSave(); return null; }
  const view = render(<><GaesupRuntimeProvider runtime={ra}><Consumer /><Consumer /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={rb}><Consumer /></GaesupRuntimeProvider></>);
  try {
    await settle(); expect(a.value).toBe(7); expect(b.value).toBe(7); expect(a.adapter.read).toHaveBeenCalledTimes(1);
    unload(); await settle(); expect(a.adapter.write).toHaveBeenCalledTimes(1); expect(b.adapter.write).toHaveBeenCalledTimes(1); expect(globalSave).not.toHaveBeenCalled();
    await act(async () => { await ra.dispose(); unload(); }); await settle(); expect(a.adapter.write).toHaveBeenCalledTimes(1); expect(b.adapter.write).toHaveBeenCalledTimes(2);
    await act(async () => { await ra.setup(); }); await settle(); expect(a.adapter.read).toHaveBeenCalledTimes(2); expect(b.adapter.read).toHaveBeenCalledTimes(1);
  } finally { view.unmount(); await ra.dispose(); await rb.dispose(); globalSave.mockRestore(); }
});

test('an explicit external save system is owned by its Provider and its pending read is aborted on disposal', async () => {
  const f = fixture(); const gate = deferred<SaveBlob>(); f.adapter.read.mockReturnValueOnce(gate.promise);
  const runtime = createGaesupRuntime(); await runtime.setup(); const ownRead = jest.spyOn(runtime.save, 'load'); const notify = jest.fn();
  function Consumer() { useLoadOnMount(undefined, notify, f.system); useAutoSave({ saveSystem: f.system }); return null; }
  const view = render(<GaesupRuntimeProvider runtime={runtime}><Consumer /></GaesupRuntimeProvider>);
  try {
    expect(f.system.isLoading()).toBe(true); await act(async () => { await runtime.dispose(); gate.resolve(blob(8)); unload(); });
    expect(f.value).toBe(1); expect(notify).not.toHaveBeenCalled(); expect(f.adapter.write).not.toHaveBeenCalled(); expect(f.system.isLoading()).toBe(false);
    await act(async () => { await runtime.setup(); }); await settle(); expect(f.value).toBe(7); expect(notify).toHaveBeenCalledTimes(1); expect(ownRead).not.toHaveBeenCalled();
  } finally { view.unmount(); await runtime.dispose(); ownRead.mockRestore(); }
});
