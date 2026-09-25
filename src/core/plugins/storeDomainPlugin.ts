import type { DomainBinding, SerializedDomainValue } from '../save';
import type { GaesupPlugin, PluginContext, PluginRuntime } from './types';
import { createIdentityRevision } from '../save/core/revision';

export type SerializableStoreState<TSerialized extends SerializedDomainValue> = {
  serialize: () => TSerialized;
  hydrate: (data: TSerialized | null | undefined) => void;
};

export type SerializableStore<
  TSerialized extends SerializedDomainValue,
  TState extends SerializableStoreState<TSerialized> = SerializableStoreState<TSerialized>,
> = {
  getState: () => TState;
};

export type StoreDomainService<TStore extends { getState: () => unknown }> = {
  useStore: TStore;
  getState: TStore['getState'];
} & (
  TStore extends { setState: infer TSetState }
    ? { setState: TSetState }
    : Record<string, never>
);

export interface StoreDomainPluginConfig<
  TSerialized extends SerializedDomainValue,
  TStore extends SerializableStore<TSerialized>,
> {
  id: string;
  name: string;
  saveExtensionId: string;
  storeServiceId: string;
  store: TStore;
  resolveStore?: (context: PluginContext) => TStore;
  readyEvent: string;
  version?: string;
  runtime?: PluginRuntime;
  capabilities?: string[];
  serialize?: (store: TStore) => TSerialized;
  hydrate?: (data: TSerialized | null | undefined, store: TStore) => void;
  prepareHydrate?: (data: TSerialized | null | undefined, store: TStore) => ReturnType<NonNullable<DomainBinding<TSerialized>['prepareHydrate']>>;
}

function createStoreService<TStore extends { getState: () => unknown }>(
  store: TStore,
): StoreDomainService<TStore> {
  const service = {
    useStore: store,
    getState: store.getState,
  };

  if ('setState' in store && typeof store.setState === 'function') {
    return {
      ...service,
      setState: store.setState,
    } as unknown as StoreDomainService<TStore>;
  }

  return service as StoreDomainService<TStore>;
}

export function createStoreDomainPlugin<
  TSerialized extends SerializedDomainValue,
  TStore extends SerializableStore<TSerialized>,
>(config: StoreDomainPluginConfig<TSerialized, TStore>): GaesupPlugin {
  return {
    id: config.id,
    name: config.name,
    version: config.version ?? '0.1.0',
    runtime: config.runtime ?? 'client',
    capabilities: config.capabilities ?? [config.saveExtensionId],
    setup(ctx: PluginContext) {
      const store = config.resolveStore?.(ctx) ?? config.store;
      const { serialize, hydrate, prepareHydrate } = config;
      const binding: DomainBinding<TSerialized> = {
        key: config.saveExtensionId,
        serialize: () => serialize ? serialize(store) : store.getState().serialize(),
        hydrate: data => hydrate ? hydrate(data, store) : store.getState().hydrate(data),
        ...(prepareHydrate ? { prepareHydrate: (data: TSerialized | null | undefined) => prepareHydrate(data, store) } : {}),
        // Zustand replaces the state object on every set, so an unchanged identity means nothing to save.
        revision: createIdentityRevision(() => [store.getState()]),
      };

      ctx.save.register(config.saveExtensionId, binding, config.id);
      ctx.services.register(config.storeServiceId, createStoreService(store), config.id);
      ctx.events.emit(config.readyEvent, {
        pluginId: config.id,
        saveExtensionId: config.saveExtensionId,
        storeServiceId: config.storeServiceId,
      });
    },
    dispose(ctx: PluginContext) {
      ctx.save.remove(config.saveExtensionId);
      ctx.services.remove(config.storeServiceId);
    },
  };
}
