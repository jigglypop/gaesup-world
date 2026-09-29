import type { RuntimeValue } from '@core/boilerplate/types';

import type { QuestId, QuestStatus } from '../../quests/types';

export type NPCPart = {
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
};

export type NPCTemplate = {
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
};

export type ClothingSet = {
  id: string;
  name: string;
  category: 'casual' | 'formal' | 'uniform' | 'fantasy' | 'sports';
  parts: NPCPart[];
  thumbnail?: string;
};

export type NPCNavigationState = {
  waypoints: [number, number, number][];
  currentIndex: number;
  speed: number;
  state: 'idle' | 'moving' | 'arrived';
};

export type NPCBrainMode = 'none' | 'scripted' | 'llm' | 'reinforcement';

export type NPCVolumeConfig = {
  /** Total humanoid capsule height in meters. Defaults close to the player volume. */
  height: number;
  /** Capsule radius in meters. */
  radius: number;
  /** Extra proximity sensor radius for interaction/perception. */
  interactionRadius: number;
};

export type NPCBrainConfig = {
  mode: NPCBrainMode;
  providerId?: string | undefined;
  policyId?: string | undefined;
  blueprintId?: string | undefined;
  prompt?: string;
  memory?: Record<string, RuntimeValue>;
  autoRespond?: boolean;
};

export type NPCPerceptionConfig = {
  enabled: boolean;
  sightRadius: number;
  hearingRadius: number;
  fieldOfView?: number;
};

export type NPCBehaviorMode = 'idle' | 'patrol' | 'wander';

export type NPCBehaviorConfig = {
  mode: NPCBehaviorMode;
  speed: number;
  loop?: boolean;
  waypoints?: [number, number, number][];
  wanderRadius?: number;
  waitSeconds?: number;
  idleAnimation?: string;
  moveAnimation?: string;
  arriveAnimation?: string;
};

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
  | { type: 'questStatus'; questId: QuestId; status: QuestStatus }
  | { type: 'friendshipAtLeast'; npcId?: string; score: number }
  | { type: 'memoryEquals'; key: string; value: RuntimeValue };

export type NPCBrainBlueprintTarget =
  | { type: 'point'; value: [number, number, number] }
  | { type: 'self' }
  | { type: 'nearestPerceived' };

export type NPCBrainBlueprintNode =
  | { id: string; type: 'start'; label?: string }
  | { id: string; type: 'condition'; label?: string; condition: NPCBrainBlueprintCondition }
  | { id: string; type: 'action'; label?: string; action: NPCAction | { type: 'moveToTarget'; target: NPCBrainBlueprintTarget; speed?: number; animationId?: string } };

export type NPCBrainBlueprintEdge = {
  id: string;
  source: string;
  target: string;
  branch?: 'true' | 'false' | 'next';
};

export type NPCBrainBlueprint = {
  id: string;
  name: string;
  description?: string;
  nodes: NPCBrainBlueprintNode[];
  edges: NPCBrainBlueprintEdge[];
};

export type NPCBehaviorBlueprint = {
  id: string;
  name: string;
  description?: string;
  role?: string;
  behavior: NPCBehaviorConfig;
  brain?: NPCBrainConfig;
  perception?: NPCPerceptionConfig;
  events?: NPCEvent[];
  tags?: string[];
};

export type AgentBehaviorOwnerType = 'npc' | 'animal' | 'vendor' | 'service' | 'custom';

export type AgentBehaviorBlueprint = {
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
};

export type NPCObservationTarget = {
  instanceId: string;
  name: string;
  position: [number, number, number];
  distance: number;
  brainMode: NPCBrainMode;
};

export type NPCObservation = {
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
  memory?: Record<string, RuntimeValue>;
};

export type NPCBrainDecision = {
  source: NPCBrainMode | 'external' | 'blueprint';
  actions: NPCAction[];
  reason?: string;
};

export type NPCInstance = {
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
  lastObservation?: NPCObservation;
  lastDecision?: NPCBrainDecision;
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
};

export type NPCEventPayload = 
  | { type: 'dialogue'; text: string; duration?: number }
  | { type: 'animation'; animationId: string; loop?: boolean }
  | { type: 'sound'; soundUrl: string; volume?: number }
  | { type: 'custom'; data: RuntimeValue };

export type NPCEvent = {
  id: string;
  type: 'onClick' | 'onHover' | 'onInteract' | 'onProximity';
  action: 'dialogue' | 'animation' | 'sound' | 'custom';
  payload?: NPCEventPayload;
};

export type NPCCategory = {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
};

export type ClothingCategory = {
  id: string;
  name: string;
  description?: string;
  clothingSetIds: string[];
};

export type NPCAnimation = {
  id: string;
  name: string;
  url?: string;
  loop?: boolean;
  speed?: number;
};

export type NPCSystemState = {
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
  editMode: boolean;
}; 
