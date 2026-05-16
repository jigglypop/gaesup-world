import type { GaesupPlugin } from './types';
export type GaesupPluginTemplate = GaesupPlugin;
export declare function defineGaesupPlugin<TPlugin extends GaesupPlugin>(plugin: TPlugin): TPlugin;
