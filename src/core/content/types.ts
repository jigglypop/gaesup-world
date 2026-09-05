import type { AssetRecord } from '../assets';
import type { GameplayEventBlueprint } from '../gameplay';
import type { AgentBehaviorBlueprint, NPCBehaviorBlueprint } from '../npc';
import type { SerializedDomainValue } from '../save';

export const CONTENT_SCHEMA_VERSION = 1;

export type ContentSchemaVersion = typeof CONTENT_SCHEMA_VERSION;

export type ManifestResource = {
  id: string;
  url?: string;
  hash?: string;
  version?: string;
};

export type ManifestRef<TResource extends ManifestResource | string = ManifestResource | string> = TResource;

export type WorldManifest = {
  schemaVersion: ContentSchemaVersion;
  id: string;
  name: string;
  version: string;
  domains: Record<string, SerializedDomainValue>;
};

export type AssetManifest = {
  schemaVersion: ContentSchemaVersion;
  version: string;
  assets: AssetRecord[];
};

export type BlueprintManifest = {
  schemaVersion: ContentSchemaVersion;
  version: string;
  blueprints: ManifestResource[];
  npcBehavior?: NPCBehaviorBlueprint[];
  agentBehavior?: AgentBehaviorBlueprint[];
};

export type GameplayManifest = {
  schemaVersion: ContentSchemaVersion;
  version: string;
  items?: ManifestResource[];
  quests?: ManifestResource[];
  dialogs?: ManifestResource[];
  recipes?: ManifestResource[];
  events?: GameplayEventBlueprint[];
};

export type ContentBundle = {
  schemaVersion: ContentSchemaVersion;
  id: string;
  name: string;
  version: string;
  world: WorldManifest;
  assets: AssetManifest;
  blueprints?: BlueprintManifest;
  gameplay?: GameplayManifest;
};

export type ContentBundleManifest = {
  schemaVersion: ContentSchemaVersion;
  id: string;
  name: string;
  version: string;
  world: ManifestRef;
  assets: ManifestRef;
  blueprints?: ManifestRef;
  gameplay?: ManifestRef;
};

export type ContentBundleSource = {
  loadBundle: (id: string) => Promise<ContentBundle>;
};

export type ContentBundleValidation = {
  ok: boolean;
  errors: string[];
};
