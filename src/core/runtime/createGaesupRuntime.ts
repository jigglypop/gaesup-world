import { useAssetStore } from '../assets';
import { createPluginRegistry } from '../plugins';
import { SaveSystem, getSaveSystem } from '../save';
import type { DomainBinding, SerializedDomainValue } from '../save';
import type { GaesupRuntime, GaesupRuntimeOptions, RuntimeDomainBinding } from './types';

function isRuntimeDomainBinding(value: unknown): value is RuntimeDomainBinding {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DomainBinding<SerializedDomainValue>>;
  return (
    typeof candidate.key === 'string' &&
    typeof candidate.serialize === 'function' &&
    typeof candidate.hydrate === 'function'
  );
}

export function createGaesupRuntime(options: GaesupRuntimeOptions = {}): GaesupRuntime {
  const plugins = createPluginRegistry();
  const save = options.saveSystem ?? (
    options.saveOptions ? new SaveSystem(options.saveOptions) : getSaveSystem()
  );
  const unregisterSaveBindings = new Map<string, () => void>();

  for (const plugin of options.plugins ?? []) {
    plugins.register(plugin);
  }

  const registerSaveBinding = (binding: RuntimeDomainBinding): void => {
    if (unregisterSaveBindings.has(binding.key)) return;
    const unregister = save.register({
      key: binding.key,
      serialize: () => binding.serialize() ?? null,
      hydrate: binding.hydrate,
    });
    unregisterSaveBindings.set(binding.key, unregister);
  };

  for (const binding of options.saveBindings ?? []) {
    registerSaveBinding(binding);
  }

  const registerPluginSaveBindings = (): void => {
    for (const entry of plugins.context.save.list()) {
      if (isRuntimeDomainBinding(entry.value)) {
        registerSaveBinding(entry.value);
      }
    }
  };

  const loadAssets = async () => {
    const source = options.assets?.source;
    if (!source) return;
    await useAssetStore.getState().loadAssets(source);
  };

  return {
    plugins,
    save,
    loadAssets,
    getService: (id) => plugins.context.services.get(id),
    requireService: (id) => plugins.context.services.require(id),
    setup: async () => {
      if (options.assets?.loadOnCreate) {
        await loadAssets();
      }
      await plugins.setupAll();
      registerPluginSaveBindings();
    },
    dispose: async () => {
      await plugins.disposeAll();
      for (const unregister of unregisterSaveBindings.values()) {
        unregister();
      }
      unregisterSaveBindings.clear();
    },
  };
}
