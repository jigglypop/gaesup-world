import type { GaesupPlugin } from '../plugins';
import type { ClothingCategory, ClothingSet, NPCAnimation, NPCBrainBlueprint, NPCCategory, NPCInstance, NPCTemplate } from './types';
export type NPCSerializedState = {
    version: 1;
    templates: NPCTemplate[];
    instances: NPCInstance[];
    categories: NPCCategory[];
    clothingSets: ClothingSet[];
    clothingCategories: ClothingCategory[];
    animations: NPCAnimation[];
    brainBlueprints: NPCBrainBlueprint[];
    editMode: boolean;
};
export interface NPCPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeNPCState(): NPCSerializedState;
export declare function hydrateNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined): void;
export declare function createNPCPlugin(options?: NPCPluginOptions): GaesupPlugin;
export declare const npcPlugin: GaesupPlugin;
