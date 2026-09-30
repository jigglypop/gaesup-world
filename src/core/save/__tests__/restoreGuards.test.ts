import { SaveSystem } from '../core/SaveSystem';
import type { SaveBlob, SaveDiagnostic } from '../types';

const blob = (value: number): SaveBlob => ({ version: 1, savedAt: 0, domains: { value } });
function fixture() {
  const diagnostics: SaveDiagnostic[] = [];
  const system = new SaveSystem({ adapter: { read: async () => blob(2), write: async () => {}, remove: async () => {}, list: async () => [] }, onDiagnostic: diagnostic => diagnostics.push(diagnostic) });
  let value = 1;
  system.register({ key: 'value', serialize: () => value, prepareHydrate: data => {
    if (typeof data !== 'number' || data < 0) throw new Error('invalid');
    return () => { value = data; if (data === 99) throw new Error('apply failed'); };
  }, hydrate: data => { value = Number(data); } });
  return { system, diagnostics, value: () => value };
}

test.each([2, 99])('guards enter before application and release after application/rollback (%s)', next => {
  const { system, value } = fixture(); const log: unknown[] = [];
  system.registerRestoreGuard(() => {
    log.push(['enter-a', system.isRestoring(), value()]);
    return () => { log.push(['leave-a', system.isRestoring(), value()]); };
  });
  system.registerRestoreGuard(() => {
    log.push(['enter-b', system.isRestoring(), value()]);
    return () => { log.push(['leave-b', system.isRestoring(), value()]); };
  });
  if (next === 99) expect(() => system.hydrateBlob(blob(next))).toThrow('previous state restored');
  else expect(system.hydrateBlob(blob(next))).toBe(true);
  expect(log).toEqual([['enter-a', true, 1], ['enter-b', true, 1], ['leave-b', false, next === 99 ? 1 : 2], ['leave-a', false, next === 99 ? 1 : 2]]);
});

test('invalid data and failed preparation leave live effects untouched', () => {
  const { system, value } = fixture(); const guard = jest.fn(); system.registerRestoreGuard(guard);
  expect(() => system.hydrateBlob(blob(-1))).toThrow(); expect(value()).toBe(1);
  expect(guard).not.toHaveBeenCalled(); expect(system.isRestoring()).toBe(false);
});

test('a failing guard prevents data application and releases already entered owners', () => {
  const { system, value, diagnostics } = fixture(); const release = jest.fn();
  const offA = system.registerRestoreGuard(() => release);
  const offB = system.registerRestoreGuard(() => { throw new Error('guard failed'); });
  expect(() => system.hydrateBlob(blob(2))).toThrow('guard failed');
  expect(value()).toBe(1); expect(release).toHaveBeenCalledTimes(1); expect(diagnostics[0]?.key).toBe('$restore-effects');
  offA(); offB(); expect(system.hydrateBlob(blob(2))).toBe(true);
});

test('cleanup failures retain the original error and never skip other cleanups', () => {
  const { system, value, diagnostics } = fixture(); const release = jest.fn();
  system.registerRestoreGuard(() => release);
  system.registerRestoreGuard(() => () => { throw new Error('release failed'); });
  let failure: AggregateError | undefined;
  try { system.hydrateBlob(blob(99)); } catch (error) { failure = error as AggregateError; }
  expect(failure?.errors).toHaveLength(2); expect(release).toHaveBeenCalledTimes(1);
  expect(value()).toBe(1); expect(system.isRestoring()).toBe(false); expect(diagnostics.some(d => d.key === '$restore-effects')).toBe(true);
});

test('each registration owns one lease; removal during entry preserves entered cleanup', () => {
  const { system } = fixture(); const release = jest.fn(); const guard = jest.fn(() => release);
  const first = system.registerRestoreGuard(guard); const second = system.registerRestoreGuard(guard);
  first(); first(); system.hydrateBlob(blob(2)); expect(guard).toHaveBeenCalledTimes(1); expect(release).toHaveBeenCalledTimes(1);
  second();
  let off = () => {};
  off = system.registerRestoreGuard(() => { off(); return release; });
  system.hydrateBlob(blob(3)); system.hydrateBlob(blob(4)); expect(release).toHaveBeenCalledTimes(2);
});

test('cancellation after a guard enters releases it and leaves all domains untouched', () => {
  const { system, value } = fixture(); const release = jest.fn();
  system.registerRestoreGuard(() => { system.cancelPendingLoads(); return release; });
  expect(system.hydrateBlob(blob(2))).toBe(false); expect(value()).toBe(1); expect(release).toHaveBeenCalledTimes(1);
});

test('storage read does not hold effects; guard registration and nested saves during apply are rejected', async () => {
  let resolve!: (value: SaveBlob) => void;
  const system = new SaveSystem({ adapter: { read: () => new Promise(yes => { resolve = yes; }), write: async () => {}, remove: async () => {}, list: async () => [] } });
  const guard = jest.fn(() => {
    expect(() => system.registerRestoreGuard(() => {})).toThrow('already in progress');
    expect(() => system.hydrateBlob(blob(1))).toThrow('already in progress');
  });
  system.registerRestoreGuard(guard); const reading = system.load(); expect(guard).not.toHaveBeenCalled();
  resolve(blob(2)); await expect(reading).resolves.toBe(true); expect(guard).toHaveBeenCalledTimes(1);
});
