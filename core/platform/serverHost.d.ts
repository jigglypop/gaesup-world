import { type CommandAuthorityResult, type CommandAuthorityRouter, type CommandAuthorityRouterOptions, type GameCommand } from '../networks/adapter';
import { type GaesupPlugin, type PluginLogger, type PluginRegistry } from '../plugins';
import type { DomainBinding, SaveSystem, SerializedDomainValue } from '../save';
import { type CreatePlayerProgressOptions, type CreateWorldSnapshotOptions, type PlayerProgress, type WorldSnapshot } from './snapshot';
export declare const DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID = "server.commandAuthority";
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
export declare function createServerPluginHost(options?: PlatformServerPluginHostOptions): PlatformServerPluginHost;
