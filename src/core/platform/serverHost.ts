import {
  createCommandAuthorityRouter,
  type CommandAuthorityResult,
  type CommandAuthorityRouter,
  type CommandAuthorityRouterOptions,
  type GameCommand,
} from '../networks/adapter';
import {
  createPluginLogger,
  createPluginRegistry,
  filterPluginsForRuntime,
  type GaesupPlugin,
  type PluginLogger,
  type PluginRegistry,
} from '../plugins';
import type { DomainBinding, SaveSystem, SerializedDomainValue } from '../save';
import {
  collectSaveDomains,
  createPlayerProgress,
  createWorldSnapshot,
  type CreatePlayerProgressOptions,
  type CreateWorldSnapshotOptions,
  type PlayerProgress,
  type WorldSnapshot,
} from './snapshot';

export const DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID = 'server.commandAuthority';

export type ServerHostDomainBinding = DomainBinding<SerializedDomainValue>;

export type PlatformServerPluginHostOptions = {
  plugins?: GaesupPlugin[];
  saveSystem?: SaveSystem;
  saveBindings?: ServerHostDomainBinding[];
  commandAuthority?: CommandAuthorityRouterOptions;
  logger?: Partial<PluginLogger>;
};

export type PlatformServerPluginHost = {
  pluginRuntime: 'server';
  plugins: PluginRegistry;
  commandAuthority: CommandAuthorityRouter;
  saveSystem?: SaveSystem;
  setup: () => Promise<void>;
  dispose: () => Promise<void>;
  handleCommand: (command: GameCommand) => Promise<CommandAuthorityResult>;
  getService: <TService = unknown>(id: string) => TService | undefined;
  requireService: <TService = unknown>(id: string) => TService;
  getSaveBindings: () => Iterable<DomainBinding>;
  createWorldSnapshot: (worldId: string, options?: CreateWorldSnapshotOptions) => WorldSnapshot;
  createPlayerProgress: (playerId: string, options?: CreatePlayerProgressOptions) => PlayerProgress;
};

function isServerHostDomainBinding(value: unknown): value is ServerHostDomainBinding {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DomainBinding<SerializedDomainValue>>;
  return (
    typeof candidate.key === 'string' &&
    typeof candidate.serialize === 'function' &&
    typeof candidate.hydrate === 'function'
  );
}

export function createServerPluginHost(
  options: PlatformServerPluginHostOptions = {},
): PlatformServerPluginHost {
  const logger = createPluginLogger(options.logger);
  const plugins = createPluginRegistry(options.logger ? { logger: options.logger } : {});
  const commandAuthority = createCommandAuthorityRouter(options.commandAuthority);
  const unregisterSaveBindings = new Map<string, () => void>();

  plugins.context.services.register(
    DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
    commandAuthority,
    'platform.server-host',
  );

  for (const plugin of filterPluginsForRuntime(options.plugins ?? [], 'server')) {
    plugins.register(plugin);
  }

  const registerSaveBinding = (binding: ServerHostDomainBinding): void => {
    const saveSystem = options.saveSystem;
    if (!saveSystem) {
      logger.warn('Server plugin host ignored save binding because no SaveSystem was provided.', {
        key: binding.key,
      });
      return;
    }
    if (unregisterSaveBindings.has(binding.key)) return;
    unregisterSaveBindings.set(binding.key, saveSystem.register(binding));
  };

  for (const binding of options.saveBindings ?? []) {
    registerSaveBinding(binding);
  }

  const registerPluginSaveBindings = (): void => {
    for (const entry of plugins.context.save.list()) {
      if (isServerHostDomainBinding(entry.value)) {
        registerSaveBinding(entry.value);
      }
    }
  };

  const collectDomains = (): Record<string, SerializedDomainValue> => (
    options.saveSystem ? collectSaveDomains(options.saveSystem) : {}
  );

  return {
    pluginRuntime: 'server',
    plugins,
    commandAuthority,
    ...(options.saveSystem ? { saveSystem: options.saveSystem } : {}),
    setup: async () => {
      await plugins.setupAll();
      registerPluginSaveBindings();
    },
    dispose: async () => {
      await plugins.disposeAll();
      for (const unregister of unregisterSaveBindings.values()) {
        unregister();
      }
      unregisterSaveBindings.clear();
      commandAuthority.clear();
      plugins.context.services.remove(DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID);
    },
    handleCommand: (command) => commandAuthority.handle(command),
    getService: (id) => plugins.context.services.get(id),
    requireService: (id) => plugins.context.services.require(id),
    getSaveBindings: () => options.saveSystem?.getBindings() ?? [],
    createWorldSnapshot: (worldId, snapshotOptions = {}) => (
      createWorldSnapshot(worldId, collectDomains(), snapshotOptions)
    ),
    createPlayerProgress: (playerId, snapshotOptions = {}) => (
      createPlayerProgress(playerId, collectDomains(), snapshotOptions)
    ),
  };
}
