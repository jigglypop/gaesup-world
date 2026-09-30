import { NamespacedSaveAdapter } from '../adapters/NamespacedSaveAdapter';
import type { SaveAdapter, SaveBlob } from '../types';

describe('NamespacedSaveAdapter', () => {
  it('isolates reads, writes, listing, removal and recreations even for overlapping identities', async () => {
    const slots = new Map<string, SaveBlob>();
    const adapter: SaveAdapter = {
      read: async slot => slots.get(slot) ?? null,
      write: async (slot, value) => { slots.set(slot, value); },
      list: async () => [...slots.keys()], remove: async slot => { slots.delete(slot); },
    };
    const a = new NamespacedSaveAdapter(adapter, 'a');
    const b = new NamespacedSaveAdapter(adapter, 'a:b');
    const c = new NamespacedSaveAdapter(adapter, 'a%3Ab');
    const blob = (value: number): SaveBlob => ({ version: 1, savedAt: 1, domains: { time: value } });
    await adapter.write('legacy', blob(0));
    await a.write('b:slot', blob(1)); await b.write('slot', blob(2)); await c.write('slot', blob(3));
    expect(await a.list()).toEqual(['b:slot']); expect(await b.list()).toEqual(['slot']);
    expect(await a.read('slot')).toBeNull(); expect(await b.read('slot')).toEqual(blob(2));
    expect(await new NamespacedSaveAdapter(adapter, 'a%3Ab').read('slot')).toEqual(blob(3));
    await b.remove('slot'); expect(await b.list()).toEqual([]);
    expect(await a.read('b:slot')).toEqual(blob(1)); expect(await c.read('slot')).toEqual(blob(3));
    expect(await adapter.read('legacy')).toEqual(blob(0));
  });
  it('rejects empty identities', () => {
    expect(() => new NamespacedSaveAdapter({} as SaveAdapter, ' ')).toThrow('must not be empty');
  });
});
