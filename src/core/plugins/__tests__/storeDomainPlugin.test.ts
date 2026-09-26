import type { DomainBinding } from '../../save';
import { createWeatherStore, type WeatherStore } from '../../weather/stores/weatherStore';
import type { WeatherSerialized } from '../../weather/types';
import { createPluginRegistry } from '../PluginRegistry';
import { createStoreDomainPlugin } from '../storeDomainPlugin';

test('a shared plugin resolves each owner for custom serialization, hydration, and prepared commit', async () => {
  const fallback = createWeatherStore();
  const untouched = fallback.getState();
  const a = createWeatherStore(); const b = createWeatherStore();
  a.getState().setWeather('rain', 0.5, 1); b.getState().setWeather('snow', 0.5, 1);
  const hydrate = jest.fn((data: WeatherSerialized | null | undefined, store: WeatherStore) => store.getState().hydrate(data));
  const plugin = createStoreDomainPlugin({
    id: 'owned-store', name: 'Owned store', store: fallback, saveExtensionId: 'owned-save', storeServiceId: 'owned-service', readyEvent: 'owned-ready',
    resolveStore: context => context.services.require<WeatherStore>('owner'),
    serialize: store => store.getState().serialize(), hydrate,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
  const first = createPluginRegistry(); const second = createPluginRegistry();
  first.context.services.register('owner', a); second.context.services.register('owner', b);
  first.register(plugin); second.register(plugin);
  await first.setup(plugin.id); await second.setup(plugin.id);
  try {
    const bindingA = first.context.save.require<DomainBinding<WeatherSerialized>>('owned-save');
    const bindingB = second.context.save.require<DomainBinding<WeatherSerialized>>('owned-save');
    const snapshot = bindingA.serialize();
    expect(bindingB.serialize().current?.kind).toBe('snow');
    const commit = bindingB.prepareHydrate!(snapshot);
    snapshot.current!.kind = 'storm';
    expect(b.getState().current?.kind).toBe('snow');
    commit();
    expect(b.getState().current?.kind).toBe('rain');
    bindingA.hydrate(bindingB.serialize());
    expect(hydrate).toHaveBeenCalledWith(expect.anything(), a);
    expect(fallback.getState()).toBe(untouched);
    await first.dispose(plugin.id);
    expect(second.context.services.has('owned-service')).toBe(true);
  } finally { await first.dispose(plugin.id); await second.dispose(plugin.id); }
});
