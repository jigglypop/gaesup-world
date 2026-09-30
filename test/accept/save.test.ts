import {
  createBuildingPlugin,
  createGaesupRuntime,
  createNPCPlugin,
  createWeatherPlugin,
  type SaveAdapter,
  type SaveBlob,
} from 'gaesup-world';

import { acceptScenario } from './scenario';

function memoryAdapter(): SaveAdapter {
  const slots = new Map<string, SaveBlob>();
  return {
    read: async (slot) => slots.get(slot) ?? null,
    write: async (slot, blob) => { slots.set(slot, blob); },
    list: async () => [...slots.keys()],
    remove: async (slot) => { slots.delete(slot); },
  };
}

acceptScenario('S-H10', async () => {
  const runtime = createGaesupRuntime({
    saveOptions: { adapter: memoryAdapter() },
    plugins: [createBuildingPlugin(), createNPCPlugin(), createWeatherPlugin()],
  });
  await runtime.setup();
  try {
    const calls = new Map<string, number>();
    for (const binding of runtime.save.getBindings()) {
      const serialize = binding.serialize;
      binding.serialize = () => {
        calls.set(binding.key, (calls.get(binding.key) ?? 0) + 1);
        return serialize();
      };
    }
    const autosave = () => runtime.save.save('accept', { skipUnchanged: true });

    await autosave();
    calls.clear();
    await autosave();
    const unchangedSerializeCalls = [...calls.values()].reduce((sum, count) => sum + count, 0);

    calls.clear();
    runtime.weatherStore.getState().setWeather('rain', 0.8, 3);
    await autosave();
    const changedDomainsSerialized = [...calls.values()].filter((count) => count > 0).length;

    return { unchangedSerializeCalls, changedDomainsSerialized };
  } finally {
    await runtime.dispose();
  }
});
