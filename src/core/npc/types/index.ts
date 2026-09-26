import type { RuntimeValue } from '@core/boilerplate/types';


export interface NPCPart {
  id: string;
  type: 'body' | 'hair' | 'top' | 'bottom' | 'shoes' | 'glasses' | 'hat' | 'accessory' | 'weapon';
  category?: 'basic' | 'casual' | 'formal' | 'fantasy' | 'military';
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  metadata?: {
    material?: string;
    texture?: string;
  };
}

export interface NPCTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'humanoid' | 'creature' | 'robot';
  fullModelUrl?: string; // 전체 모델 URL (애니메이션 지원)
  baseParts: NPCPart[]; // 기본 파트 (body, hair 등)
  clothingParts: NPCPart[]; // 의상 파트 (top, bottom, shoes 등)
  accessoryParts?: NPCPart[]; // 액세서리 파트 (glasses, hat 등)
  defaultAnimation?: string;
  defaultClothingSet?: string; // 기본 의상 세트 ID
}

export interface ClothingSet {
  id: string;
  name: string;
  category: 'casual' | 'formal' | 'uniform' | 'fantasy' | 'sports';
  parts: NPCPart[];
  thumbnail?: string;
}

export interface NPCNavigationState {
  waypoints: [number, number, number][];
  currentIndex: number;
  speed: number;
  state: 'idle' | 'moving' | 'arrived';
}

export type NPCBrainMode = 'none' | 'scripted' | 'llm' | 'reinforcement';

export interface NPCVolumeConfig {
  /** Total humanoid capsule height in meters. Defaults close to the player volume. */
  height: number;
  /** Capsule radius in meters. */
  radius: number;
  /** Extra proximity sensor radius for interaction/perception. */
  interactionRadius: number;
}

export interface NPCBrainConfig {
  mode: NPCBrainMode;
  providerId?: string | undefined;
  policyId?: string | undefined;
  blueprintId?: string | undefined;
  prompt?: string;
  memory?: Record<string, RuntimeValue>;
  autoRespond?: boolean;
}

export interface NPCPerceptionConfig {
  enabled: boolean;
  sightRadius: number;
  hearingRadius: number;
  fieldOfView?: number;
}

export type NPCBehaviorMode = 'idle' | 'patrol' | 'wander';

export interface NPCBehaviorConfig {
  mode: NPCBehaviorMode;
  speed: number;
  loop?: boolean;
  waypoints?: [number, number, number][];
  wanderRadius?: number;
  /** Wandering stays within `wanderRadius` of this point; without it, of where the NPC was placed. */
  home?: [number, number, number];
  waitSeconds?: number;
  idleAnimation?: string;
  moveAnimation?: string;
  arriveAnimation?: string;
}

export type NPCAction =
  | { type: 'idle'; animationId?: string }
  | { type: 'moveTo'; target: [number, number, number]; speed?: number; animationId?: string }
  | { type: 'patrol'; waypoints: [number, number, number][]; speed?: number; loop?: boolean; animationId?: string }
  | { type: 'wander'; radius?: number; speed?: number; waitSeconds?: number }
  | { type: 'playAnimation'; animationId: string; loop?: boolean; speed?: number }
  | { type: 'lookAt'; target: [number, number, number] }
  | { type: 'speak'; text: string; duration?: number }
  | { type: 'interact'; targetId: string }
  | { type: 'remember'; key: string; value: RuntimeValue };

export type NPCBrainBlueprintCondition =
  | { type: 'always' }
  | { type: 'navigationIdle' }
  | { type: 'perceivedAny' }
  /** A target came into sight since the NPC's previous decision; `actorsOnly` ignores other NPCs. */
  | { type: 'perceivedEntered'; actorsOnly?: boolean }
  | { type: 'memoryEquals'; key: string; value: RuntimeValue };

export type NPCBrainBlueprintTarget =
  | { type: 'point'; value: [number, number, number] }
  | { type: 'self' }
  | { type: 'nearestPerceived' }
  /** The nearest target that came into sight since the previous decision. */
  | { type: 'entered'; actorsOnly?: boolean };

export type NPCBrainBlueprintNode =
  | { id: string; type: 'start'; label?: string }
  | { id: string; type: 'condition'; label?: string; condition: NPCBrainBlueprintCondition }
  | { id: string; type: 'action'; label?: string; action: NPCAction | { type: 'moveToTarget'; target: NPCBrainBlueprintTarget; speed?: number; animationId?: string } | { type: 'lookAtTarget'; target: NPCBrainBlueprintTarget } };

export interface NPCBrainBlueprintEdge {
  id: string;
  source: string;
  target: string;
  branch?: 'true' | 'false' | 'next';
}

export interface NPCBrainBlueprint {
  id: string;
  name: string;
  description?: string;
  nodes: NPCBrainBlueprintNode[];
  edges: NPCBrainBlueprintEdge[];
}

export interface NPCBehaviorBlueprint {
  id: string;
  name: string;
  description?: string;
  role?: string;
  behavior: NPCBehaviorConfig;
  brain?: NPCBrainConfig;
  perception?: NPCPerceptionConfig;
  events?: NPCEvent[];
  tags?: string[];
}

export type AgentBehaviorOwnerType = 'npc' | 'animal' | 'vendor' | 'service' | 'custom';

export interface AgentBehaviorBlueprint {
  id: string;
  name: string;
  description?: string;
  ownerType: AgentBehaviorOwnerType;
  role?: string;
  behavior: NPCBehaviorConfig;
  brain?: NPCBrainConfig;
  perception?: NPCPerceptionConfig;
  events?: NPCEvent[];
  tags?: string[];
}

export interface NPCObservationTarget {
  instanceId: string;
  name: string;
  position: [number, number, number];
  distance: number;
  brainMode: NPCBrainMode;
  /** Set for a non-NPC actor, such as the player, given to `NPCSimulation.setActor`. */
  actor?: boolean;
}

export interface NPCObservation {
  instanceId: string;
  templateId: string;
  timestamp: number;
  position: [number, number, number];
  rotation: [number, number, number];
  currentAnimation: string;
  navigationState: NPCNavigationState['state'] | 'none';
  behaviorMode: NPCBehaviorMode;
  brainMode: NPCBrainMode;
  perceptionEnabled: boolean;
  perceived: NPCObservationTarget[];
  /** The point wandering stays around. */
  home?: [number, number, number];
  /** Ids perceived now that were not perceived at this NPC's previous decision. */
  entered?: string[];
  memory?: Record<string, RuntimeValue>;
}

export interface NPCBrainDecision {
  source: NPCBrainMode | 'external' | 'blueprint';
  actions: NPCAction[];
  reason?: string;
}

/** One NPC's result of a decision tick; a tick's entries apply in a single store update. */
export type NPCDecisionEntry = {
  instanceId: string;
  observation: NPCObservation;
  /** Recorded and executed only when it has actions. */
  decision?: NPCBrainDecision;
};

export interface NPCInstance {
  id: string;
  templateId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  currentAnimation?: string;
  currentClothingSetId?: string;
  customParts?: NPCPart[];
  volume?: NPCVolumeConfig;
  brain?: NPCBrainConfig;
  perception?: NPCPerceptionConfig;
  behavior?: NPCBehaviorConfig;
  navigation?: NPCNavigationState;
  metadata?: {
    modelUrl?: string;
    nameTag?: string;
    health?: number;
    level?: number;
    faction?: string;
    dialogue?: string[];
    lastInteractionTargetId?: string;
  };
  events?: NPCEvent[];
}

export type NPCEventPayload = 
  | { type: 'dialogue'; text: string; duration?: number }
  | { type: 'animation'; animationId: string; loop?: boolean }
  | { type: 'sound'; soundUrl: string; volume?: number }
  | { type: 'custom'; data: RuntimeValue };

export interface NPCEvent {
  id: string;
  type: 'onClick' | 'onHover' | 'onInteract' | 'onProximity';
  action: 'dialogue' | 'animation' | 'sound' | 'custom';
  payload?: NPCEventPayload;
}

export interface NPCCategory {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
}

export interface ClothingCategory {
  id: string;
  name: string;
  description?: string;
  clothingSetIds: string[];
}

export interface NPCAnimation {
  id: string;
  name: string;
  url?: string;
  loop?: boolean;
  speed?: number;
}

export interface NPCSystemState {
  templates: Map<string, NPCTemplate>;
  instances: Map<string, NPCInstance>;
  categories: Map<string, NPCCategory>;
  clothingSets: Map<string, ClothingSet>;
  clothingCategories: Map<string, ClothingCategory>;
  animations: Map<string, NPCAnimation>;
  brainBlueprints: Map<string, NPCBrainBlueprint>;
  selectedTemplateId?: string;
  selectedCategoryId?: string;
  selectedClothingSetId?: string;
  selectedClothingCategoryId?: string;
  selectedInstanceId?: string;
} 
