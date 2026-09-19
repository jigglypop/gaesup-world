import { SaveSystem } from '../core/SaveSystem';
import type { SaveAdapter, SaveBlob, SaveDiagnostic } from '../types';

const blob = (domains: SaveBlob['domains']): SaveBlob => ({ version: 1, savedAt: 0, domains });
function memory() {
  const values = new Map<string, SaveBlob>();
  const adapter: SaveAdapter = { read: async slot => values.get(slot) ?? null, write: async (slot, value) => { values.set(slot, value); }, list: async () => [...values.keys()], remove: async slot => { values.delete(slot); } };
  return { adapter, values };
}

test.each(['cancel', 'replace', 'remove'] as const)('%s invalidates a pending read without applying it to another binding generation', async operation => {
  const { adapter } = memory(); let finish!: (value: SaveBlob) => void; adapter.read = () => new Promise(resolve => { finish = resolve; });
  const sys = new SaveSystem({ adapter }); let value = 1; const hydrate = jest.fn((data: unknown) => { value = Number(data); });
  const off = sys.register({ key: 'counter', serialize: () => value, hydrate }); const reading = sys.load();
  if (operation === 'cancel') sys.cancelPendingLoads(); else { off(); if (operation === 'replace') sys.register({ key: 'counter', serialize: () => value, hydrate }); }
  finish(blob({ counter: 99 })); await expect(reading).resolves.toBe(false); expect(value).toBe(1); expect(hydrate).not.toHaveBeenCalled();
});

test('cancellation rolls back already applied domains, stops later domains and clears the restore guard', async () => {
  const { adapter } = memory(); adapter.read = async () => blob({ a: 10, b: 20, c: 30 });
  const sys = new SaveSystem({ adapter }); const controller = new AbortController(); const order: string[] = []; const restoring: boolean[] = []; let a = 1; let b = 2;
  sys.register({ key: 'a', serialize: () => a, hydrate: data => { order.push(`a:${data}`); restoring.push(sys.isRestoring()); a = Number(data); } });
  sys.register({ key: 'b', serialize: () => b, hydrate: data => { order.push(`b:${data}`); restoring.push(sys.isRestoring()); b = Number(data); if (b === 20) controller.abort(); } });
  const later = jest.fn(); sys.register({ key: 'c', serialize: () => 3, hydrate: later });
  await expect(sys.load('main', controller.signal)).resolves.toBe(false);
  expect([a, b]).toEqual([1, 2]); expect(order).toEqual(['a:10', 'b:20', 'b:2', 'a:1']); expect(restoring).toEqual([true, true, true, true]); expect(later).not.toHaveBeenCalled(); expect(sys.isRestoring()).toBe(false);
});

test('cancellation before application does not hydrate an untouched domain', () => {
  const sys = new SaveSystem({ adapter: memory().adapter }); const hydrate = jest.fn();
  sys.register({ key: 'counter', serialize: () => 1, prepareHydrate: () => { sys.cancelPendingLoads(); return hydrate; }, hydrate });
  expect(sys.hydrateBlob(blob({ counter: 2 }))).toBe(false); expect(hydrate).not.toHaveBeenCalled(); expect(sys.isRestoring()).toBe(false);
});

test('cancellation with failed rollback rejects and reports the unrecovered domain', async () => {
  const { adapter } = memory(); adapter.read = async () => blob({ counter: 2 }); const reports: SaveDiagnostic[] = [];
  const sys = new SaveSystem({ adapter, onDiagnostic: diagnostic => reports.push(diagnostic) }); let value = 1;
  sys.register({ key: 'counter', serialize: () => value, hydrate: data => { if (data === 1) throw new Error('rollback'); value = Number(data); sys.cancelPendingLoads(); } });
  await expect(sys.load()).rejects.toThrow('rollback incomplete'); expect(value).toBe(2); expect(sys.isRestoring()).toBe(false); expect(reports).toHaveLength(1); expect(reports[0]).toMatchObject({ operation: 'rollback', key: 'counter' });
});

test.each(['serialize', 'prepare', 'apply'] as const)('binding changes during %s cannot alter the transaction registry', phase => {
  const sys = new SaveSystem({ adapter: memory().adapter }); let value = 1; let off = () => {}; let duringRestore = false;
  const mutate = () => { if (!duringRestore) return; expect(() => sys.register({ key: 'new', serialize: () => 3, hydrate: () => {} })).toThrow('already in progress'); expect(() => off()).toThrow('already in progress'); };
  off = sys.register({ key: 'counter', serialize: () => { if (phase === 'serialize') mutate(); return value; }, prepareHydrate: data => { if (phase === 'prepare') mutate(); return () => { if (phase === 'apply') mutate(); value = Number(data); }; }, hydrate: data => { value = Number(data); } });
  duringRestore = true; expect(sys.hydrateBlob(blob({ counter: 2 }))).toBe(true); expect(value).toBe(2); expect(sys.has('counter')).toBe(true); expect(sys.has('new')).toBe(false); off(); expect(sys.has('counter')).toBe(false);
});

test('load waits for earlier writes and removes in its slot without blocking another slot', async () => {
  const { adapter, values } = memory(); values.set('a', blob({ counter: 1 })); values.set('b', blob({ counter: 7 }));
  let finish!: () => void; const gate = new Promise<void>(resolve => { finish = resolve; }); const write = adapter.write; adapter.write = async (slot, value) => { await gate; await write(slot, value); };
  const read = jest.spyOn(adapter, 'read'); const sys = new SaveSystem({ adapter }); let value = 10; sys.register({ key: 'counter', serialize: () => value, hydrate: data => { value = Number(data); } });
  const saving = sys.save('a'); const loading = sys.load('a'); await Promise.resolve(); expect(read).not.toHaveBeenCalled();
  finish(); await saving; await expect(loading).resolves.toBe(true); expect(value).toBe(10);
  const removing = sys.remove('a'); const empty = sys.load('a'); await removing; await expect(empty).resolves.toBe(false);
  await expect(sys.load('b')).resolves.toBe(true); expect(value).toBe(7);
});

test('a queued write does not block loads of another slot or obsolete-read failures', async () => {
  const { adapter, values } = memory(); values.set('b', blob({ counter: 7 })); let finish!: () => void; adapter.write = () => new Promise(resolve => { finish = resolve; });
  const sys = new SaveSystem({ adapter }); let value = 1; sys.register({ key: 'counter', serialize: () => value, hydrate: data => { value = Number(data); } });
  const saving = sys.save('a'); await Promise.resolve(); await expect(sys.load('b')).resolves.toBe(true); expect(value).toBe(7); finish(); await saving;
  let fail!: (error: Error) => void; adapter.read = () => new Promise((_resolve, reject) => { fail = reject; }); const loading = sys.load(); sys.cancelPendingLoads(); fail(new Error('obsolete I/O')); await expect(loading).resolves.toBe(false);
  adapter.read = async () => { throw new Error('current I/O'); }; await expect(sys.load()).rejects.toThrow('current I/O');
});

test('hydration/migration works on a detached input snapshot and always releases its guard after failure', () => {
  const raw = blob({ counter: { nested: 2 } }); const sys = new SaveSystem({ adapter: memory().adapter, currentVersion: 2, migrations: { 1: input => { (input.domains['counter'] as { nested: number }).nested = 3; return { ...input, version: 2 }; } } });
  sys.register({ key: 'counter', serialize: () => ({ nested: 1 }), hydrate: () => {}, prepareHydrate: data => { expect(sys.isRestoring()).toBe(true); expect(data).toEqual({ nested: 3 }); return () => {}; } });
  expect(sys.hydrateBlob(raw)).toBe(true); expect(raw).toEqual(blob({ counter: { nested: 2 } }));
  expect(() => sys.hydrateBlob({ ...raw, version: 9 })).toThrow('Unsupported'); expect(sys.isRestoring()).toBe(false);
});
