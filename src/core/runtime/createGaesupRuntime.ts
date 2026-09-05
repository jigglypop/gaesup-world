import { useAssetStore } from '../assets';
import { createPluginLogger, createPluginRegistry, filterPluginsForRuntime } from '../plugins';
export { shouldSetupPluginForRuntime } from '../plugins';
import { SaveSystem, getSaveSystem } from '../save';
import type { DomainBinding, SaveSystemOptions, SerializedDomainValue } from '../save';
import {
  DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  createRuntimeSaveDiagnostics,
} from './saveDiagnostics';
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
  const runtimeLogger = createPluginLogger(options.logger);
  const plugins = createPluginRegistry(options.logger ? { logger: options.logger } : {});
  const pluginRuntime = options.pluginRuntime ?? 'client';
  const save =
    options.saveSystem ??
    (options.saveOptions
      ? new SaveSystem(createRuntimeSaveOptions(options.saveOptions))
      : getSaveSystem());
  const saveDiagnostics = createRuntimeSaveDiagnostics(options.saveDiagnostics);
  const optionSaveBindings = [...(options.saveBindings ?? [])];
  const unregisterSaveBindings = new Map<string, () => void>();
  let unregisterSaveDiagnostics: (() => void) | undefined;
  let ownsSaveDiagnosticsService = false;
  let lifecycleState: 'inactive' | 'setting-up' | 'active' | 'disposing' = 'inactive';
  let lifecycleQueue = Promise.resolve();

  for (const plugin of filterPluginsForRuntime(options.plugins ?? [], pluginRuntime)) {
    plugins.register(plugin);
  }

  const registerSaveBinding = (binding: RuntimeDomainBinding): void => {
    if (unregisterSaveBindings.has(binding.key)) return;
    const unregister = save.register({
      key: binding.key,
      serialize: () => binding.serialize() ?? null,
      hydrate: binding.hydrate,
      ...(binding.prepareHydrate ? { prepareHydrate: (data: Parameters<RuntimeDomainBinding['hydrate']>[0]) => binding.prepareHydrate!(data) } : {}),
    });
    unregisterSaveBindings.set(binding.key, unregister);
  };

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

  const activateSaveDiagnostics = (): void => {
    plugins.context.services.register(
      DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
      saveDiagnostics,
      'gaesup.runtime',
    );
    ownsSaveDiagnosticsService = true;
    unregisterSaveDiagnostics = save.subscribeDiagnostics((diagnostic) => {
      const record = saveDiagnostics.report(diagnostic);
      runtimeLogger.warn(record.message, record);
      plugins.context.events.emit(RUNTIME_SAVE_DIAGNOSTIC_EVENT, record);
    });
  };

  const deactivateGeneration = async (disposeSetupFailures: boolean): Promise<CleanupResult> => {
    let firstError: unknown;
    let hasError = false;
    const captureError = (error: unknown): void => {
      if (hasError) return;
      hasError = true;
      firstError = error;
    };
    const attempt = async (cleanup: () => void | Promise<void>): Promise<void> => {
      try {
        await cleanup();
      } catch (error) {
        captureError(error);
      }
    };
    const setupFailedPluginIds = disposeSetupFailures
      ? new Set(
          plugins
            .list()
            .filter((record) => record.status === 'failed')
            .map((record) => record.manifest.id),
        )
      : new Set<string>();

    await attempt(() => plugins.disposeAll());
    for (const record of [...plugins.list()].reverse()) {
      if (record.status === 'ready' || setupFailedPluginIds.has(record.manifest.id)) {
        await attempt(() => plugins.dispose(record.manifest.id));
      }
    }

    const unregisterDiagnostics = unregisterSaveDiagnostics;
    unregisterSaveDiagnostics = undefined;
    if (unregisterDiagnostics) await attempt(unregisterDiagnostics);

    const unregisterBindings = [...unregisterSaveBindings.values()];
    unregisterSaveBindings.clear();
    for (const unregister of unregisterBindings) {
      await attempt(unregister);
    }

    if (ownsSaveDiagnosticsService) {
      ownsSaveDiagnosticsService = false;
      await attempt(() => {
        plugins.context.services.remove(DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID);
      });
    }

    return hasError ? { failed: true, error: firstError } : { failed: false };
  };

  const setup = async (): Promise<void> => {
    if (lifecycleState === 'active') return;
    lifecycleState = 'setting-up';
    try {
      activateSaveDiagnostics();
      for (const binding of optionSaveBindings) {
        registerSaveBinding(binding);
      }
      if (options.assets?.loadOnCreate) {
        await loadAssets();
      }
      await plugins.setupAll();
      registerPluginSaveBindings();
      lifecycleState = 'active';
    } catch (error) {
      await deactivateGeneration(true);
      lifecycleState = 'inactive';
      throw error;
    }
  };

  const dispose = async (): Promise<void> => {
    if (lifecycleState === 'inactive') return;
    lifecycleState = 'disposing';
    const cleanup = await deactivateGeneration(false);
    lifecycleState = 'inactive';
    if (cleanup.failed) throw cleanup.error;
  };

  const enqueueLifecycle = (operation: () => Promise<void>): Promise<void> => {
    const task = lifecycleQueue.then(operation);
    lifecycleQueue = task.catch(() => undefined);
    return task;
  };

  return {
    pluginRuntime,
    plugins,
    save,
    saveDiagnostics,
    loadAssets,
    getService: (id) => plugins.context.services.get(id),
    requireService: (id) => plugins.context.services.require(id),
    setup: () => enqueueLifecycle(setup),
    dispose: () => enqueueLifecycle(dispose),
  };
}

type CleanupResult =
  | { failed: false }
  | {
      failed: true;
      error: unknown;
    };

function createRuntimeSaveOptions(options: SaveSystemOptions): SaveSystemOptions {
  return {
    ...options,
  };
}
