import { BUILDING_STORE_SERVICE } from '../../building/stores/buildingStore';
import { WALLET_STORE_SERVICE } from '../../economy/stores/walletStore';
import { NPC_STORE_SERVICE } from '../../npc/stores/npcStore';
import { InMemoryExtensionRegistry } from '../../plugins/ExtensionRegistry';
import { defineService } from '../../plugins/serviceKey';
import { WEATHER_STORE_SERVICE } from '../../weather/stores/weatherStore';
import { createGaesupRuntime } from '../createGaesupRuntime';

test('a typed key registers and resolves the same value without a type argument', () => {
  const registry = new InMemoryExtensionRegistry('services');
  const counter = defineService<{ count: number }>('test.counter');
  registry.register(counter, { count: 1 });
  const resolved = registry.require(counter);
  expect(resolved.count).toBe(1);
});

test('runtime registers its domain stores under the keys plugins read', async () => {
  const runtime = createGaesupRuntime();
  await runtime.setup();
  expect(runtime.getService(WEATHER_STORE_SERVICE)).toBe(runtime.weatherStore);
  expect(runtime.getService(WALLET_STORE_SERVICE)).toBe(runtime.walletStore);
  expect(runtime.getService(BUILDING_STORE_SERVICE)).toBe(runtime.buildingStore);
  expect(runtime.getService(NPC_STORE_SERVICE)).toBe(runtime.npcStore);
  await runtime.dispose();
  expect(runtime.getService(WEATHER_STORE_SERVICE)).toBeUndefined();
});
