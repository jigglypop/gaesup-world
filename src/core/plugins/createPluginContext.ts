import { InMemoryEventBus } from './EventBus';
import { InMemoryExtensionRegistry } from './ExtensionRegistry';
import type { PluginContext, PluginContextOptions, PluginLogger } from './types';

const noopLogger: PluginLogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

export function createPluginLogger(overrides: Partial<PluginLogger> = {}): PluginLogger {
  return {
    debug: overrides.debug ?? noopLogger.debug,
    info: overrides.info ?? noopLogger.info,
    warn: overrides.warn ?? noopLogger.warn,
    error: overrides.error ?? noopLogger.error,
  };
}

export function createPluginContext(
  plugins: PluginContext['plugins'],
  options: PluginContextOptions = {},
): PluginContext {
  return {
    plugins,
    events: new InMemoryEventBus(),
    logger: createPluginLogger(options.logger),
    grid: new InMemoryExtensionRegistry(),
    placement: new InMemoryExtensionRegistry(),
    catalog: new InMemoryExtensionRegistry(),
    assets: new InMemoryExtensionRegistry(),
    rendering: new InMemoryExtensionRegistry(),
    input: new InMemoryExtensionRegistry(),
    interactions: new InMemoryExtensionRegistry(),
    npc: new InMemoryExtensionRegistry(),
    quests: new InMemoryExtensionRegistry(),
    blueprints: new InMemoryExtensionRegistry(),
    editor: new InMemoryExtensionRegistry(),
    save: new InMemoryExtensionRegistry(),
  };
}

