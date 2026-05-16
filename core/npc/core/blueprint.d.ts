import type { AgentBehaviorBlueprint, NPCAction, NPCBehaviorBlueprint, NPCBrainBlueprint, NPCInstance, NPCObservation } from '../types';
export declare function registerNPCBrainBlueprint(blueprint: NPCBrainBlueprint): () => void;
export declare function getNPCBrainBlueprint(id: string): NPCBrainBlueprint | undefined;
export declare function unregisterNPCBrainBlueprint(id: string): void;
export declare function createNPCBehaviorBlueprintFromInstance(instance: NPCInstance, options?: {
    id?: string;
    name?: string;
    description?: string;
    role?: string;
    tags?: string[];
}): NPCBehaviorBlueprint;
export declare function applyNPCBehaviorBlueprint(instance: NPCInstance, blueprint: NPCBehaviorBlueprint): NPCInstance;
export declare function createAgentBehaviorBlueprintFromNPCBehaviorBlueprint(blueprint: NPCBehaviorBlueprint, options?: {
    id?: string;
    name?: string;
    ownerType?: AgentBehaviorBlueprint['ownerType'];
    description?: string;
    role?: string;
    tags?: string[];
}): AgentBehaviorBlueprint;
export declare function createNPCBehaviorBlueprintFromAgentBehaviorBlueprint(blueprint: AgentBehaviorBlueprint): NPCBehaviorBlueprint;
export declare function applyAgentBehaviorBlueprint(instance: NPCInstance, blueprint: AgentBehaviorBlueprint): NPCInstance;
export declare function compileNPCBrainBlueprint(blueprint: NPCBrainBlueprint, observation: NPCObservation): NPCAction[];
