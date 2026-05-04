import type { AssetRecord } from '../assets';
import type { GameplayEventBlueprint } from '../gameplay';
import type { AgentBehaviorBlueprint, NPCBehaviorBlueprint } from '../npc';
import { WORLD_SNAPSHOT_DOMAINS } from '../platform';
import type { DomainBinding, SerializedDomainValue } from '../save';
import { CONTENT_SCHEMA_VERSION } from './types';
import type { AssetManifest, ContentBundle, WorldManifest } from './types';

export type ContentBundleExportOptions = {
  id: string;
  name: string;
  version: string;
  worldId?: string;
  worldName?: string;
  assetVersion?: string;
  gameplayEvents?: GameplayEventBlueprint[];
  npcBehaviorBlueprints?: NPCBehaviorBlueprint[];
  agentBehaviorBlueprints?: AgentBehaviorBlueprint[];
};

export type SaveBindingProvider = {
  getBindings: () => Iterable<DomainBinding>;
};

function collectWorldDomains(provider: SaveBindingProvider): Record<string, SerializedDomainValue> {
  const allowed = new Set<string>(WORLD_SNAPSHOT_DOMAINS);
  const domains: Record<string, SerializedDomainValue> = {};

  for (const binding of provider.getBindings()) {
    if (!allowed.has(binding.key)) continue;
    try {
      domains[binding.key] = binding.serialize();
    } catch {
      domains[binding.key] = null;
    }
  }

  return domains;
}

export function createContentBundleFromSaveSystem(
  provider: SaveBindingProvider,
  assets: AssetRecord[],
  options: ContentBundleExportOptions,
): ContentBundle {
  const world: WorldManifest = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: options.worldId ?? `${options.id}-world`,
    name: options.worldName ?? options.name,
    version: options.version,
    domains: collectWorldDomains(provider),
  };
  const assetManifest: AssetManifest = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    version: options.assetVersion ?? options.version,
    assets,
  };

  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: options.id,
    name: options.name,
    version: options.version,
    world,
    assets: assetManifest,
    blueprints: {
      schemaVersion: CONTENT_SCHEMA_VERSION,
      version: options.version,
      blueprints: [],
      npcBehavior: options.npcBehaviorBlueprints ?? [],
      agentBehavior: options.agentBehaviorBlueprints ?? [],
    },
    gameplay: {
      schemaVersion: CONTENT_SCHEMA_VERSION,
      version: options.version,
      items: [],
      quests: [],
      dialogs: [],
      recipes: [],
      events: options.gameplayEvents ?? [],
    },
  };
}
