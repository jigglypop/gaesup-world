import type { GaesupPlugin } from './types';

export type GaesupPluginTemplate = GaesupPlugin;

export function defineGaesupPlugin<TPlugin extends GaesupPlugin>(plugin: TPlugin): TPlugin {
  return plugin;
}
