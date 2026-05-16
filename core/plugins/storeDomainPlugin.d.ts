import type { SerializedDomainValue } from '../save';
import type { GaesupPlugin, PluginRuntime } from './types';
export type SerializableStoreState<TSerialized extends SerializedDomainValue> = {
    serialize: () => TSerialized;
    hydrate: (data: TSerialized | null | undefined) => void;
};
export type SerializableStore<TSerialized extends SerializedDomainValue, TState extends SerializableStoreState<TSerialized> = SerializableStoreState<TSerialized>> = {
    getState: () => TState;
};
export type StoreDomainService<TStore extends {
    getState: () => unknown;
}> = {
    useStore: TStore;
    getState: TStore['getState'];
} & (TStore extends {
    setState: infer TSetState;
} ? {
    setState: TSetState;
} : Record<string, never>);
export interface StoreDomainPluginConfig<TSerialized extends SerializedDomainValue, TStore extends SerializableStore<TSerialized>> {
    id: string;
    name: string;
    saveExtensionId: string;
    storeServiceId: string;
    store: TStore;
    readyEvent: string;
    version?: string;
    runtime?: PluginRuntime;
    capabilities?: string[];
    serialize?: () => TSerialized;
    hydrate?: (data: TSerialized | null | undefined) => void;
}
export declare function createStoreDomainPlugin<TSerialized extends SerializedDomainValue, TStore extends SerializableStore<TSerialized>>(config: StoreDomainPluginConfig<TSerialized, TStore>): GaesupPlugin;
