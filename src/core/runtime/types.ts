import type { AssetSource } from '../assets';
import type { GaesupPlugin, PluginRegistry } from '../plugins';
import type { DomainBinding, SaveSystem, SaveSystemOptions, SerializedDomainValue } from '../save';

export type RuntimeDomainBinding = DomainBinding<SerializedDomainValue>;

export type RuntimeAssetOptions = {
  source?: AssetSource;
  loadOnCreate?: boolean;
};

export type GaesupRuntimeOptions = {
  plugins?: GaesupPlugin[];
  saveSystem?: SaveSystem;
  saveOptions?: SaveSystemOptions;
  saveBindings?: RuntimeDomainBinding[];
  assets?: RuntimeAssetOptions;
};

export type GaesupRuntime = {
  plugins: PluginRegistry;
  save: SaveSystem;
  loadAssets: () => Promise<void>;
  setup: () => Promise<void>;
  dispose: () => Promise<void>;
};
