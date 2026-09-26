import type { Draft } from 'immer';

import type {
  ClothingCategory,
  ClothingSet,
  NPCAction,
  NPCAnimation,
  NPCBehaviorConfig,
  NPCBrainBlueprint,
  NPCBrainConfig,
  NPCCategory,
  NPCDecisionEntry,
  NPCEvent,
  NPCInstance,
  NPCPart,
  NPCPerceptionConfig,
  NPCSystemState,
  NPCTemplate,
  NPCVolumeConfig,
} from '../types';

export interface NPCStore extends NPCSystemState {
  initialized: boolean;
  initializeDefaults: () => void;
  
  // Temporary selection states for preview
  previewAccessories: {
    hat?: string;
    glasses?: string;
  };
  setPreviewAccessory: (type: 'hat' | 'glasses', id: string | undefined) => void;
  
  // Template management
  addTemplate: (template: NPCTemplate) => void;
  updateTemplate: (id: string, updates: Partial<NPCTemplate>) => void;
  removeTemplate: (id: string) => void;
  
  // Instance management
  addInstance: (instance: NPCInstance) => void;
  updateInstance: (id: string, updates: Partial<NPCInstance>) => void;
  removeInstance: (id: string) => void;
  
  // Category management
  addCategory: (category: NPCCategory) => void;
  updateCategory: (id: string, updates: Partial<NPCCategory>) => void;
  removeCategory: (id: string) => void;
  
  // Clothing management
  addClothingSet: (set: ClothingSet) => void;
  updateClothingSet: (id: string, updates: Partial<ClothingSet>) => void;
  removeClothingSet: (id: string) => void;
  
  addClothingCategory: (category: ClothingCategory) => void;
  updateClothingCategory: (id: string, updates: Partial<ClothingCategory>) => void;
  removeClothingCategory: (id: string) => void;
  
  // Animation management
  addAnimation: (animation: NPCAnimation) => void;
  updateAnimation: (id: string, updates: Partial<NPCAnimation>) => void;
  removeAnimation: (id: string) => void;
  addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
  updateBrainBlueprint: (id: string, updates: Partial<NPCBrainBlueprint>) => void;
  removeBrainBlueprint: (id: string) => void;
  
  // Selection
  setSelectedTemplate: (id: string) => void;
  setSelectedCategory: (id: string) => void;
  setSelectedInstance: (id: string) => void;
  setSelectedClothingSet: (id: string) => void;
  setSelectedClothingCategory: (id: string) => void;
  
  // Helper functions
  createInstanceFromTemplate: (templateId: string, position: [number, number, number]) => void;
  updateInstancePart: (instanceId: string, partId: string, updates: Partial<NPCPart>) => void;
  changeInstanceClothing: (instanceId: string, clothingSetId: string) => void;
  updateInstanceVolume: (instanceId: string, volume: Partial<NPCVolumeConfig>) => void;
  updateInstanceBrain: (instanceId: string, brain: Partial<NPCBrainConfig>) => void;
  updateInstancePerception: (instanceId: string, perception: Partial<NPCPerceptionConfig>) => void;
  updateInstanceBehavior: (instanceId: string, behavior: Partial<NPCBehaviorConfig>) => void;
  /** Executes the actions of a decision tick's decisions in one update; entries without a decision are skipped. */
  applyNPCDecisions: (entries: ReadonlyArray<NPCDecisionEntry>) => void;
  executeInstanceAction: (instanceId: string, action: NPCAction) => void;
  executeInstanceActions: (instanceId: string, actions: NPCAction[]) => void;
  addInstanceEvent: (instanceId: string, event: NPCEvent) => void;
  removeInstanceEvent: (instanceId: string, eventId: string) => void;

  // Navigation
  setNavigation: (instanceId: string, waypoints: [number, number, number][], speed?: number) => void;
  /** Moves to the next waypoint; `position`, when given, is where the NPC stands, in the same update. */
  advanceNavigation: (instanceId: string, position?: [number, number, number]) => void;
  clearNavigation: (instanceId: string) => void;
  updateNavigationPosition: (instanceId: string, position: [number, number, number]) => void;
}

/** The immer `set` and `get` the store's action groups share. */
export type NPCSet = (recipe: (state: Draft<NPCStore>) => void) => void;
export type NPCGet = () => NPCStore;

/** What a store instance was built with: the legacy global blueprint registry and its brain request invalidation. */
export type NPCStoreContext = {
  legacyBlueprintRegistry: boolean;
  invalidateBrainRequests: (id?: string) => void;
};
