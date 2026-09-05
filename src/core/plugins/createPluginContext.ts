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
    grid: new InMemoryExtensionRegistry('grid'),
    placement: new InMemoryExtensionRegistry('placement'),
    catalog: new InMemoryExtensionRegistry('catalog'),
    assets: new InMemoryExtensionRegistry('assets'),
    rendering: new InMemoryExtensionRegistry('rendering'),
    input: new InMemoryExtensionRegistry('input'),
    interactions: new InMemoryExtensionRegistry('interactions'),
    npc: new InMemoryExtensionRegistry('npc'),
    quests: new InMemoryExtensionRegistry('quests'),
    blueprints: new InMemoryExtensionRegistry('blueprints'),
    editor: new InMemoryExtensionRegistry('editor'),
    save: new InMemoryExtensionRegistry('save'),
    services: new InMemoryExtensionRegistry('services'),
    systems: new InMemoryExtensionRegistry('systems'),
    components: new InMemoryExtensionRegistry('components'),
  };
}
