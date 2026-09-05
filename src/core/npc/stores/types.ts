import {
    NPCSystemState,
    NPCTemplate,
    NPCInstance,
    NPCCategory,
    NPCAnimation,
    NPCPart,
    NPCVolumeConfig,
    NPCBrainConfig,
    NPCPerceptionConfig,
    NPCBehaviorConfig,
    NPCAction,
    NPCObservation,
    NPCBrainDecision,
    NPCBrainBlueprint,
} from "../types";

export interface NPCStore extends NPCSystemState {
    initialized: boolean;
    initializeDefaults: () => void;
    addTemplate: (template: NPCTemplate) => void;
    updateTemplate: (id: string, updates: Partial<NPCTemplate>) => void;
    removeTemplate: (id: string) => void;
    addInstance: (instance: NPCInstance) => void;
    updateInstance: (id: string, updates: Partial<NPCInstance>) => void;
    removeInstance: (id: string) => void;
    addCategory: (category: NPCCategory) => void;
    updateCategory: (id: string, updates: Partial<NPCCategory>) => void;
    removeCategory: (id: string) => void;
    addAnimation: (animation: NPCAnimation) => void;
    updateAnimation: (id: string, updates: Partial<NPCAnimation>) => void;
    removeAnimation: (id: string) => void;
    addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
    updateBrainBlueprint: (id: string, updates: Partial<NPCBrainBlueprint>) => void;
    removeBrainBlueprint: (id: string) => void;
    setSelectedTemplate: (id: string) => void;
    setSelectedCategory: (id: string) => void;
    setSelectedInstance: (id: string) => void;
    setEditMode: (editMode: boolean) => void;
    createInstanceFromTemplate: (templateId: string, position: [number, number, number]) => void;
    updateInstancePart: (instanceId: string, partId: string, updates: Partial<NPCPart>) => void;
    updateInstanceVolume: (instanceId: string, volume: Partial<NPCVolumeConfig>) => void;
    updateInstanceBrain: (instanceId: string, brain: Partial<NPCBrainConfig>) => void;
    updateInstancePerception: (instanceId: string, perception: Partial<NPCPerceptionConfig>) => void;
    updateInstanceBehavior: (instanceId: string, behavior: Partial<NPCBehaviorConfig>) => void;
    setInstanceObservation: (instanceId: string, observation: NPCObservation) => void;
    setInstanceDecision: (instanceId: string, decision: NPCBrainDecision) => void;
    executeInstanceAction: (instanceId: string, action: NPCAction) => void;
    executeInstanceActions: (instanceId: string, actions: NPCAction[]) => void;
}
