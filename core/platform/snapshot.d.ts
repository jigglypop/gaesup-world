import type { DomainBinding, SerializedDomainValue } from '../save';
export declare const WORLD_SNAPSHOT_DOMAINS: readonly ["building", "scene", "character", "assets", "npc", "camera", "time", "weather", "audio"];
export declare const PLAYER_PROGRESS_DOMAINS: readonly ["inventory", "wallet", "shop", "relations", "quests", "mail", "catalog", "crafting", "farming", "events", "town", "i18n"];
export type WorldSnapshotDomain = typeof WORLD_SNAPSHOT_DOMAINS[number];
export type PlayerProgressDomain = typeof PLAYER_PROGRESS_DOMAINS[number];
export type DomainSnapshot<TDomain extends string = string> = {
    version: number;
    savedAt: number;
    domains: Partial<Record<TDomain, SerializedDomainValue>>;
};
export type WorldSnapshot = DomainSnapshot<WorldSnapshotDomain> & {
    kind: 'world';
    worldId: string;
};
export type PlayerProgress = DomainSnapshot<PlayerProgressDomain> & {
    kind: 'player';
    playerId: string;
    worldId?: string;
};
export type CreateWorldSnapshotOptions = {
    version?: number;
    savedAt?: number;
};
export type CreatePlayerProgressOptions = CreateWorldSnapshotOptions & {
    worldId?: string;
};
export type PlatformSaveBindingProvider = {
    getBindings: () => Iterable<DomainBinding>;
};
export declare function pickDomains<TDomain extends string>(domains: Record<string, SerializedDomainValue>, allowed: readonly TDomain[]): Partial<Record<TDomain, SerializedDomainValue>>;
export declare function createWorldSnapshot(worldId: string, domains: Record<string, SerializedDomainValue>, options?: CreateWorldSnapshotOptions): WorldSnapshot;
export declare function createPlayerProgress(playerId: string, domains: Record<string, SerializedDomainValue>, options?: CreatePlayerProgressOptions): PlayerProgress;
export declare function collectSaveDomains(provider: PlatformSaveBindingProvider): Record<string, SerializedDomainValue>;
export declare function createWorldSnapshotFromSaveSystem(provider: PlatformSaveBindingProvider, worldId: string, options?: CreateWorldSnapshotOptions): WorldSnapshot;
export declare function createPlayerProgressFromSaveSystem(provider: PlatformSaveBindingProvider, playerId: string, options?: CreatePlayerProgressOptions): PlayerProgress;
