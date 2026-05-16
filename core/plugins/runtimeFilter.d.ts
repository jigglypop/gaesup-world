import type { GaesupPlugin, PluginRuntime } from './types';
export type PluginRuntimeTarget = Exclude<PluginRuntime, 'both'>;
export declare function shouldSetupPluginForRuntime(pluginRuntime: PluginRuntime | undefined, targetRuntime: PluginRuntimeTarget): boolean;
export declare function filterPluginsForRuntime<TPlugin extends Pick<GaesupPlugin, 'runtime'>>(plugins: readonly TPlugin[], targetRuntime: PluginRuntimeTarget): TPlugin[];
