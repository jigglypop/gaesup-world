import type { AssetSource } from '../assets';
import type { GaesupPlugin, PluginLogger, PluginRegistry, PluginRuntimeTarget } from '../plugins';
import type { DomainBinding, SaveSystem, SaveSystemOptions, SerializedDomainValue } from '../save';
import type { RuntimeSaveDiagnosticsOptions, RuntimeSaveDiagnosticsService } from './saveDiagnostics';

export type RuntimeDomainBinding = DomainBinding<SerializedDomainValue>;
export type RuntimePluginTarget = PluginRuntimeTarget;

export type RuntimeAssetOptions = {
  source?: AssetSource;
  loadOnCreate?: boolean;
};

export type GaesupRuntimeOptions = {
  plugins?: GaesupPlugin[];
  pluginRuntime?: RuntimePluginTarget;
  saveSystem?: SaveSystem;
  saveOptions?: SaveSystemOptions;
  saveBindings?: RuntimeDomainBinding[];
  saveDiagnostics?: RuntimeSaveDiagnosticsOptions;
  assets?: RuntimeAssetOptions;
  logger?: Partial<PluginLogger>;
};

export type GaesupRuntime = {
  pluginRuntime: RuntimePluginTarget;
  plugins: PluginRegistry;
  save: SaveSystem;
  saveDiagnostics: RuntimeSaveDiagnosticsService;
  loadAssets: () => Promise<void>;
  getService: <TService = unknown>(id: string) => TService | undefined;
  requireService: <TService = unknown>(id: string) => TService;
  setup: () => Promise<void>;
  dispose: () => Promise<void>;
};
