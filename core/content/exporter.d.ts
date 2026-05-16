import type { AssetRecord } from '../assets';
import type { GameplayEventBlueprint } from '../gameplay';
import type { AgentBehaviorBlueprint, NPCBehaviorBlueprint } from '../npc';
import type { DomainBinding } from '../save';
import type { ContentBundle } from './types';
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
export declare function createContentBundleFromSaveSystem(provider: SaveBindingProvider, assets: AssetRecord[], options: ContentBundleExportOptions): ContentBundle;
