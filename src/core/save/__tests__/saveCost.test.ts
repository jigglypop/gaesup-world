/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import { SaveSystem } from '../core/SaveSystem';
import { useAutoSave } from '../hooks/useAutoSave';
import type { DomainBinding, SaveAdapter, SaveBlob } from '../types';

function memory() {
  const slots = new Map<string, SaveBlob>();
  const adapter = {
    read: jest.fn(async (slot: string) => slots.get(slot) ?? null),
    write: jest.fn(async (slot: string, blob: SaveBlob) => { slots.set(slot, blob); }),
    list: async () => [...slots.keys()],
    remove: jest.fn(async (slot: string) => { slots.delete(slot); }),
  } satisfies SaveAdapter;
  return { adapter, slots };
}

function domain(key: string, withRevision = true) {
  let revision = 1;
  let value = 1;
  const binding = {
    key,
    serialize: jest.fn(() => ({ value })),
    hydrate: jest.fn((data: unknown) => { value = (data as { value: number } | undefined)?.value ?? value; }),
    ...(withRevision ? { revision: () => revision } : {}),
  } satisfies DomainBinding;
  return { binding, edit: () => { revision++; value++; } };
}

test('owned snapshots enter the blob without another clone', () => {
  const sys = new SaveSystem({ adapter: memory().adapter });
  const owned = { value: 1 };
  const shared = { value: 2 };
  sys.register({ key: 'owned', serialize: () => owned, hydrate: () => {}, owned: true });
  sys.register({ key: 'shared', serialize: () => shared, hydrate: () => {} });
  const blob = sys.createBlob();
  expect(blob.domains['owned']).toBe(owned);
  expect(blob.domains['shared']).not.toBe(shared);
  expect(blob.domains['shared']).toEqual(shared);
});

test('an unchanged autosave serializes and writes nothing until a revision changes', async () => {
  const { adapter } = memory();
  const sys = new SaveSystem({ adapter });
  const a = domain('a');
  const b = domain('b');
  sys.register(a.binding);
  sys.register(b.binding);

  await sys.save('main', { skipUnchanged: true });
  await sys.save('main', { skipUnchanged: true });
  await sys.save('main', { skipUnchanged: true });
  expect(adapter.write).toHaveBeenCalledTimes(1);
  expect(a.binding.serialize).toHaveBeenCalledTimes(1);
  expect(b.binding.serialize).toHaveBeenCalledTimes(1);

  b.edit();
  await sys.save('main', { skipUnchanged: true });
  expect(adapter.write).toHaveBeenCalledTimes(2);
  expect(adapter.write.mock.calls[1]?.[1].domains).toEqual({ a: { value: 1 }, b: { value: 2 } });
  // Explicit saves always write; other slots keep their own record.
  await sys.save('main');
  await sys.save('other', { skipUnchanged: true });
  expect(adapter.write).toHaveBeenCalledTimes(4);
});

test.each(['no revision', 'failed write', 'removed slot', 'replaced binding'] as const)(
  'a %s makes the next unchanged autosave write again',
  async (scenario) => {
    const { adapter } = memory();
    const sys = new SaveSystem({ adapter });
    const a = domain('a', scenario !== 'no revision');
    const off = sys.register(a.binding);
    if (scenario === 'failed write') adapter.write.mockRejectedValueOnce(new Error('quota'));
    const first = sys.save('main', { skipUnchanged: true });
    if (scenario === 'failed write') await expect(first).rejects.toThrow('quota');
    else await first;
    if (scenario === 'removed slot') await sys.remove('main');
    if (scenario === 'replaced binding') {
      off();
      // A new store may restart its revision count at the recorded value.
      sys.register(domain('a').binding);
    }
    await sys.save('main', { skipUnchanged: true });
    expect(adapter.write).toHaveBeenCalledTimes(2);
  },
);

test('a removal queued before an unchanged autosave does not leave the slot deleted', async () => {
  const { adapter, slots } = memory();
  const sys = new SaveSystem({ adapter });
  sys.register(domain('a').binding);
  await sys.save('main', { skipUnchanged: true });
  const removal = sys.remove('main');
  const save = sys.save('main', { skipUnchanged: true });
  await Promise.all([removal, save]);
  expect(slots.has('main')).toBe(true);
});

test('rollback state is serialized only once every domain validated', () => {
  const sys = new SaveSystem({ adapter: memory().adapter });
  const a = domain('a');
  let valid = false;
  let cancel = false;
  sys.register(a.binding);
  sys.register({ key: 'b', serialize: () => null, hydrate: () => {}, prepareHydrate: () => {
    if (!valid) throw new Error('invalid');
    if (cancel) sys.cancelPendingLoads();
    return () => {};
  } });
  const blob: SaveBlob = { version: 1, savedAt: 0, domains: { a: { value: 5 } } };

  expect(() => sys.hydrateBlob(blob)).toThrow('Save hydration failed');
  valid = true;
  cancel = true;
  expect(sys.hydrateBlob(blob)).toBe(false);
  expect(a.binding.serialize).not.toHaveBeenCalled();
  expect(a.binding.hydrate).not.toHaveBeenCalled();

  cancel = false;
  expect(sys.hydrateBlob(blob)).toBe(true);
  expect(a.binding.serialize).toHaveBeenCalledTimes(1);
  expect(a.binding.hydrate).toHaveBeenCalledWith({ value: 5 });
});

test('autosave triggers skip serialization while nothing changed', async () => {
  const { adapter } = memory();
  const sys = new SaveSystem({ adapter });
  const a = domain('a');
  sys.register(a.binding);
  const settle = () => act(async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); });
  const view = renderHook(() => useAutoSave({ saveSystem: sys }));
  try {
    for (let i = 0; i < 3; i++) {
      window.dispatchEvent(new Event('beforeunload'));
      await settle();
    }
    expect(a.binding.serialize).toHaveBeenCalledTimes(1);
    expect(adapter.write).toHaveBeenCalledTimes(1);
    a.edit();
    window.dispatchEvent(new Event('beforeunload'));
    await settle();
    expect(a.binding.serialize).toHaveBeenCalledTimes(2);
    expect(adapter.write).toHaveBeenCalledTimes(2);
  } finally {
    view.unmount();
  }
});

test('an autosave serializes only the domains whose revision moved', async () => {
  const { adapter } = memory();
  const sys = new SaveSystem({ adapter });
  const a = domain('a');
  const b = domain('b');
  const plain = domain('plain', false);
  for (const entry of [a, b, plain]) sys.register(entry.binding);

  await sys.save('main', { skipUnchanged: true });
  b.edit();
  await sys.save('main', { skipUnchanged: true });
  expect(a.binding.serialize).toHaveBeenCalledTimes(1);
  expect(b.binding.serialize).toHaveBeenCalledTimes(2);
  // Without a revision nothing proves the domain unchanged, so it is serialized every time.
  expect(plain.binding.serialize).toHaveBeenCalledTimes(2);
  expect(adapter.write.mock.calls[1]?.[1].domains).toEqual({ a: { value: 1 }, b: { value: 2 }, plain: { value: 1 } });
});
