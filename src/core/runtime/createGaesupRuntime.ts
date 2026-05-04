import { useAssetStore } from '../assets';
import {
  createPluginLogger,
  createPluginRegistry,
  filterPluginsForRuntime,
} from '../plugins';
export { shouldSetupPluginForRuntime } from '../plugins';
import { SaveSystem, getSaveSystem } from '../save';
import type { DomainBinding, SaveSystemOptions, SerializedDomainValue } from '../save';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  createRuntimeSaveDiagnostics,
} from './saveDiagnostics';
import type {
  GaesupRuntime,
  GaesupRuntimeOptions,
  RuntimeDomainBinding,
} from './types';

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
  const runtimeLogger = createPluginLogger(options.logger);
  const plugins = createPluginRegistry(options.logger ? { logger: options.logger } : {});
  const pluginRuntime = options.pluginRuntime ?? 'client';
  const save = options.saveSystem ?? (
    options.saveOptions ? new SaveSystem(createRuntimeSaveOptions(options.saveOptions)) : getSaveSystem()
  );
  const saveDiagnostics = createRuntimeSaveDiagnostics(options.saveDiagnostics);
  const unregisterSaveDiagnostics = save.subscribeDiagnostics((diagnostic) => {
    const record = saveDiagnostics.report(diagnostic);
    runtimeLogger.warn(record.message, record);
    plugins.context.events.emit(RUNTIME_SAVE_DIAGNOSTIC_EVENT, record);
  });
  const unregisterSaveBindings = new Map<string, () => void>();

  plugins.context.services.register(
    DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
    saveDiagnostics,
    'gaesup.runtime',
  );

  for (const plugin of filterPluginsForRuntime(options.plugins ?? [], pluginRuntime)) {
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
    pluginRuntime,
    plugins,
    save,
    saveDiagnostics,
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
      unregisterSaveDiagnostics();
      for (const unregister of unregisterSaveBindings.values()) {
        unregister();
      }
      unregisterSaveBindings.clear();
      plugins.context.services.remove(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID);
    },
  };
}

function createRuntimeSaveOptions(options: SaveSystemOptions): SaveSystemOptions {
  return {
    ...options,
  };
}
