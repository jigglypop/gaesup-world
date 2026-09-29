import type { Draft } from 'immer';

import type { NPCStore } from './npcStoreTypes';
import { registerNPCBrainBlueprint } from '../core/blueprint';
import type {
  NPCBehaviorConfig,
  NPCBrainBlueprint,
  NPCBrainConfig,
  NPCPart,
  NPCPerceptionConfig,
  NPCVolumeConfig,
} from '../types';

/** New NPCs are drawn at this scale: villagers stand a little shorter than the player character. */
export const DEFAULT_NPC_SCALE = 0.75;

export const DEFAULT_NPC_VOLUME: NPCVolumeConfig = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6,
};

export const DEFAULT_NPC_BRAIN: NPCBrainConfig = {
  mode: 'reinforcement',
  policyId: 'openai',
  autoRespond: false,
  prompt: 'Respond as an in-world NPC when a dialogue system is connected.',
};

export const DEFAULT_NPC_PERCEPTION: NPCPerceptionConfig = {
  enabled: true,
  sightRadius: 8,
  hearingRadius: 4,
  fieldOfView: 110,
};

export const DEFAULT_NPC_BEHAVIOR: NPCBehaviorConfig = {
  mode: 'idle',
  speed: 2.2,
  loop: true,
  wanderRadius: 4,
  waitSeconds: 1.5,
  idleAnimation: 'idle',
  moveAnimation: 'walk',
  arriveAnimation: 'idle',
};

/** Default villager models: one skinned mesh each, with `idle`, `walk` and `run` clips. */
const DEFAULT_NPC_MODELS = { green: '/gltf/trainer_green.glb', red: '/gltf/trainer_red.glb' } as const;
export const DEFAULT_NPC_TEMPLATE_ID = 'trainer-green';

/** Part models removed with the ally character; saves that still name them fall back to a default model. */
const REMOVED_PART_URL = /(^|\/)gltf\/(ally[^/]*|formal|hat_[abc]|glass_a|super_glass)\.glb$/;
const withoutRemovedParts = (parts: NPCPart[]) => parts.filter((part) => !REMOVED_PART_URL.test(part.url));

function repairRemovedAssets(state: NPCStore): void {
  state.templates.forEach((template) => {
    const baseParts = withoutRemovedParts(template.baseParts);
    if (baseParts.length === template.baseParts.length) return;
    template.baseParts = baseParts;
    template.fullModelUrl ??= template.id === 'oneyee' ? DEFAULT_NPC_MODELS.red : DEFAULT_NPC_MODELS.green;
  });
  state.clothingSets.forEach((set, id) => {
    set.parts = withoutRemovedParts(set.parts);
    if (set.parts.length) return;
    state.clothingSets.delete(id);
    state.clothingCategories.forEach((category) => { category.clothingSetIds = category.clothingSetIds.filter((setId) => setId !== id); });
  });
  state.instances.forEach((instance) => {
    if (instance.customParts) instance.customParts = withoutRemovedParts(instance.customParts);
  });
}

/**
 * Gives NPCs without a brain the default one; a brain the author picked, including 'none', is kept. A reinforcement
 * brain that names no policy gets the default policy; one that names its own keeps it.
 */
function attachDefaultBrainToInstances(state: NPCStore): void {
  state.instances.forEach((instance, id) => {
    const brain = instance.brain;
    if (!brain) {
      state.instances.set(id, { ...instance, brain: { ...DEFAULT_NPC_BRAIN } });
      return;
    }
    if (brain.mode !== 'reinforcement' || brain.policyId !== undefined) return;
    state.instances.set(id, { ...instance, brain: { ...brain, policyId: DEFAULT_NPC_BRAIN.policyId } });
  });
}

/** Seeds the default NPC catalog once; later calls only drop removed part models and attach missing brains. */
export function seedNPCDefaults(state: Draft<NPCStore>, legacyBlueprintRegistry: boolean): void {
  if (state.initialized) {
    repairRemovedAssets(state);
    attachDefaultBrainToInstances(state);
    return;
  }
  
  // Default animations
  state.animations.set('idle', {
    id: 'idle',
    name: '대기',
    loop: true,
    speed: 1
  });
  
  state.animations.set('walk', {
    id: 'walk',
    name: '걷기',
    loop: true,
    speed: 1
  });
  
  state.animations.set('run', {
    id: 'run',
    name: '달리기',
    loop: true,
    speed: 1.5
  });

  const wanderBlueprint: NPCBrainBlueprint = {
    id: 'npc-blueprint-wander',
    name: '주변 돌아다니기',
    description: '이동을 쉬고 있을 때 주변의 새 목적지로 이동합니다.',
    nodes: [
      { id: 'start', type: 'start', label: '시작' },
      { id: 'idle-check', type: 'condition', label: '이동 대기 중', condition: { type: 'navigationIdle' } },
      { id: 'wander', type: 'action', label: '돌아다니기', action: { type: 'wander', radius: 4, speed: 2.2, waitSeconds: 1.5 } },
    ],
    edges: [
      { id: 'start-idle', source: 'start', target: 'idle-check', branch: 'next' },
      { id: 'idle-wander', source: 'idle-check', target: 'wander', branch: 'true' },
    ],
  };
  const greetBlueprint: NPCBrainBlueprint = {
    id: 'npc-blueprint-greet-nearest',
    name: '가까운 이웃에게 인사',
    description: '발견한 NPC 중 가장 가까운 대상에게 다가가 인사합니다.',
    nodes: [
      { id: 'start', type: 'start', label: '시작' },
      { id: 'see-any', type: 'condition', label: '발견한 대상 있음', condition: { type: 'perceivedAny' } },
      { id: 'look', type: 'action', label: '가까운 대상에게 이동', action: { type: 'moveToTarget', target: { type: 'nearestPerceived' }, speed: 1.2, animationId: 'walk' } },
      { id: 'speak', type: 'action', label: '말하기', action: { type: 'speak', text: '안녕?', duration: 2 } },
    ],
    edges: [
      { id: 'start-see', source: 'start', target: 'see-any', branch: 'next' },
      { id: 'see-look', source: 'see-any', target: 'look', branch: 'true' },
      { id: 'look-speak', source: 'look', target: 'speak', branch: 'next' },
    ],
  };
  state.brainBlueprints.set(wanderBlueprint.id, wanderBlueprint);
  state.brainBlueprints.set(greetBlueprint.id, greetBlueprint);
  if (legacyBlueprintRegistry) {
    registerNPCBrainBlueprint(wanderBlueprint);
    registerNPCBrainBlueprint(greetBlueprint);
  }
  
  state.categories.set('humanoid', {
    id: 'humanoid',
    name: '캐릭터',
    description: '사람 형태의 캐릭터',
    templateIds: [DEFAULT_NPC_TEMPLATE_ID, 'trainer-red'],
  });
  state.templates.set(DEFAULT_NPC_TEMPLATE_ID, {
    id: DEFAULT_NPC_TEMPLATE_ID,
    name: '초록 트레이너',
    category: 'humanoid',
    fullModelUrl: DEFAULT_NPC_MODELS.green,
    baseParts: [],
    clothingParts: [],
    defaultAnimation: 'idle',
  });
  state.templates.set('trainer-red', {
    id: 'trainer-red',
    name: '빨간 트레이너',
    category: 'humanoid',
    fullModelUrl: DEFAULT_NPC_MODELS.red,
    baseParts: [],
    clothingParts: [],
    defaultAnimation: 'idle',
  });

  state.selectedCategoryId = 'humanoid';
  state.selectedTemplateId = DEFAULT_NPC_TEMPLATE_ID;
  attachDefaultBrainToInstances(state);
  state.initialized = true;
}
