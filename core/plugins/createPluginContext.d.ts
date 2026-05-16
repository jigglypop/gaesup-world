import type { PluginContext, PluginContextOptions, PluginLogger } from './types';
export declare function createPluginLogger(overrides?: Partial<PluginLogger>): PluginLogger;
export declare function createPluginContext(plugins: PluginContext['plugins'], options?: PluginContextOptions): PluginContext;
