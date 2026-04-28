import type { AssetRecord } from '../assets';
import type { GameplayEventBlueprint } from '../gameplay';
import type { SerializedDomainValue } from '../save';

export type ManifestResource = {
  id: string;
  url?: string;
  hash?: string;
  version?: string;
};

export type ManifestRef<TResource extends ManifestResource | string = ManifestResource | string> = TResource;

export type WorldManifest = {
  id: string;
  name: string;
  version: string;
  domains: Record<string, SerializedDomainValue>;
};

export type AssetManifest = {
  version: string;
  assets: AssetRecord[];
};

export type BlueprintManifest = {
  version: string;
  blueprints: ManifestResource[];
};

export type GameplayManifest = {
  version: string;
  items?: ManifestResource[];
  quests?: ManifestResource[];
  dialogs?: ManifestResource[];
  recipes?: ManifestResource[];
  events?: GameplayEventBlueprint[];
};

export type ContentBundle = {
  id: string;
  name: string;
  version: string;
  world: WorldManifest;
  assets: AssetManifest;
  blueprints?: BlueprintManifest;
  gameplay?: GameplayManifest;
};

export type ContentBundleManifest = {
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
