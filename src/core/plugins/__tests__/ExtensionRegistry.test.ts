import { InMemoryExtensionRegistry } from '../ExtensionRegistry';
import type { ExtensionRegistry } from '../types';

test('registry observers see committed changes, bulk removals and independent subscription leases', () => {
  const registry = new InMemoryExtensionRegistry();
  const seen: [string | null, number][] = []; const listener = (id: string | null) => { seen.push([id, registry.list().length]); };
  const first = registry.subscribe(listener); const second = registry.subscribe(listener); first();
  registry.register('a', {}, 'plugin'); registry.register('b', {}, 'plugin'); registry.remove('missing');
  expect(registry.removeByPlugin('plugin')).toBe(2); registry.register('c', {}); registry.clear(); registry.clear(); second(); registry.register('d', {});
  expect(seen).toEqual([['a', 1], ['b', 2], [null, 0], ['c', 1], [null, 0]]);
});

test('a throwing observer cannot prevent later notifications or mutate registration outcome', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {}); const registry = new InMemoryExtensionRegistry(); const later = jest.fn();
  const lookup: ExtensionRegistry = registry;
  registry.subscribe(() => { throw new Error('observer'); }); registry.subscribe(later);
  try { expect(() => registry.register('a', 1)).not.toThrow(); expect(lookup.get('a')).toBe(1); expect(later).toHaveBeenCalledWith('a'); }
  finally { error.mockRestore(); }
});
