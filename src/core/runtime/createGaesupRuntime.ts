import { useAssetStore } from '../assets';
import { createPluginRegistry } from '../plugins';
import { SaveSystem, getSaveSystem } from '../save';
import type { GaesupRuntime, GaesupRuntimeOptions } from './types';

export function createGaesupRuntime(options: GaesupRuntimeOptions = {}): GaesupRuntime {
  const plugins = createPluginRegistry();
  const save = options.saveSystem ?? (
    options.saveOptions ? new SaveSystem(options.saveOptions) : getSaveSystem()
  );
  const unregisterSaveBindings: Array<() => void> = [];

  for (const plugin of options.plugins ?? []) {
    plugins.register(plugin);
  }

  for (const binding of options.saveBindings ?? []) {
    const unregister = save.register({
      key: binding.key,
      serialize: () => binding.serialize() ?? null,
      hydrate: binding.hydrate,
    });
    unregisterSaveBindings.push(unregister);
  }

  const loadAssets = async () => {
    const source = options.assets?.source;
    if (!source) return;
    await useAssetStore.getState().loadAssets(source);
  };

  return {
    plugins,
    save,
    loadAssets,
    setup: async () => {
      if (options.assets?.loadOnCreate) {
        await loadAssets();
      }
      await plugins.setupAll();
    },
    dispose: async () => {
      await plugins.disposeAll();
      for (const unregister of unregisterSaveBindings.splice(0)) {
        unregister();
      }
    },
  };
}
