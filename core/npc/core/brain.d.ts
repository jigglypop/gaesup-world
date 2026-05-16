import type { NPCBrainDecision, NPCBrainMode, NPCInstance, NPCObservation } from '../types';
export type NPCBrainAdapterContext = {
    instance: NPCInstance;
    observation: NPCObservation;
};
export type NPCBrainAdapter = (context: NPCBrainAdapterContext) => NPCBrainDecision | undefined;
export declare function registerNPCBrainAdapter(mode: NPCBrainMode, id: string, adapter: NPCBrainAdapter): () => void;
export declare function createNPCObservation(instance: NPCInstance, instances: Map<string, NPCInstance>, timestamp: number): NPCObservation;
export declare function resolveNPCBrainDecision(instance: NPCInstance, observation: NPCObservation): NPCBrainDecision | undefined;
