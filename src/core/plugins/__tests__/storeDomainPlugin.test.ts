import { createInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import type { InventorySerialized } from '../../inventory/types';
import type { DomainBinding } from '../../save';
import { createPluginRegistry } from '../PluginRegistry';
import { createStoreDomainPlugin } from '../storeDomainPlugin';

test('a shared plugin resolves each owner for custom serialization, hydration, and prepared commit', async () => {
  const fallback = createInventoryStore();
  const a = createInventoryStore(); const b = createInventoryStore();
  a.getState().add('a', 1); b.getState().add('b', 1);
  const hydrate = jest.fn((data: InventorySerialized | null | undefined, store: InventoryStore) => store.getState().hydrate(data));
  const plugin = createStoreDomainPlugin({
    id: 'owned-store', name: 'Owned store', store: fallback, saveExtensionId: 'owned-save', storeServiceId: 'owned-service', readyEvent: 'owned-ready',
    resolveStore: context => context.services.require<InventoryStore>('owner'),
    serialize: store => store.getState().serialize(), hydrate,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
  const first = createPluginRegistry(); const second = createPluginRegistry();
  first.context.services.register('owner', a); second.context.services.register('owner', b);
  first.register(plugin); second.register(plugin);
  await first.setup(plugin.id); await second.setup(plugin.id);
  try {
    const bindingA = first.context.save.require<DomainBinding<InventorySerialized>>('owned-save');
    const bindingB = second.context.save.require<DomainBinding<InventorySerialized>>('owned-save');
    const snapshot = bindingA.serialize();
    expect(bindingB.serialize().slots[0]?.itemId).toBe('b');
    const commit = bindingB.prepareHydrate!(snapshot);
    snapshot.slots[0]!.itemId = 'mutated-after-prepare';
    expect(b.getState().countOf('a')).toBe(0);
    commit();
    expect(b.getState().countOf('a')).toBe(1);
    bindingA.hydrate(bindingB.serialize());
    expect(hydrate).toHaveBeenCalledWith(expect.anything(), a);
    expect(fallback.getState().slots.every(slot => slot === null)).toBe(true);
    await first.dispose(plugin.id);
    expect(second.context.services.has('owned-service')).toBe(true);
  } finally { await first.dispose(plugin.id); await second.dispose(plugin.id); }
});
