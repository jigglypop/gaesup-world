import type { SerializedDomainValue } from '../save';

export const WORLD_SNAPSHOT_DOMAINS = [
  'building',
  'scene',
  'character',
  'assets',
  'npc',
  'time',
  'weather',
  'audio',
] as const;

export const PLAYER_PROGRESS_DOMAINS = [
  'inventory',
  'wallet',
  'shop',
  'relations',
  'quests',
  'mail',
  'catalog',
  'crafting',
  'farming',
  'events',
  'town',
  'i18n',
] as const;

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

export function pickDomains<TDomain extends string>(
  domains: Record<string, SerializedDomainValue>,
  allowed: readonly TDomain[],
): Partial<Record<TDomain, SerializedDomainValue>> {
  const next: Partial<Record<TDomain, SerializedDomainValue>> = {};
  for (const key of allowed) {
    if (key in domains) {
      next[key] = domains[key];
    }
  }
  return next;
}

export function createWorldSnapshot(
  worldId: string,
  domains: Record<string, SerializedDomainValue>,
  options: CreateWorldSnapshotOptions = {},
): WorldSnapshot {
  return {
    kind: 'world',
    worldId,
    version: options.version ?? 1,
    savedAt: options.savedAt ?? Date.now(),
    domains: pickDomains(domains, WORLD_SNAPSHOT_DOMAINS),
  };
}

export function createPlayerProgress(
  playerId: string,
  domains: Record<string, SerializedDomainValue>,
  options: CreatePlayerProgressOptions = {},
): PlayerProgress {
  return {
    kind: 'player',
    playerId,
    ...(options.worldId ? { worldId: options.worldId } : {}),
    version: options.version ?? 1,
    savedAt: options.savedAt ?? Date.now(),
    domains: pickDomains(domains, PLAYER_PROGRESS_DOMAINS),
  };
}
