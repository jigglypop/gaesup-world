import type { GaesupPlugin, PluginRuntime } from './types';

export type PluginRuntimeTarget = Exclude<PluginRuntime, 'both'>;

export function shouldSetupPluginForRuntime(
  pluginRuntime: PluginRuntime | undefined,
  targetRuntime: PluginRuntimeTarget,
): boolean {
  const runtime = pluginRuntime ?? 'client';
  return runtime === 'both' || runtime === targetRuntime;
}

export function filterPluginsForRuntime<TPlugin extends Pick<GaesupPlugin, 'runtime'>>(
  plugins: readonly TPlugin[],
  targetRuntime: PluginRuntimeTarget,
): TPlugin[] {
  return plugins.filter((plugin) => shouldSetupPluginForRuntime(plugin.runtime, targetRuntime));
}
