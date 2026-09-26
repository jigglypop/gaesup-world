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

const DEFAULT_NPC_ASSET_URLS = {
  body: '/gltf/ally_body.glb',
  cloth: '/gltf/ally_cloth.glb',
  rabbitCloth: '/gltf/ally_cloth_rabbit.glb',
  hat: '/gltf/ally_hat.glb',
  glasses: '/gltf/ally_glass.glb',
} as const;

const NPC_ASSET_URL_REPLACEMENTS = new Map<string, string>([
  ['gltf/formal.glb', DEFAULT_NPC_ASSET_URLS.cloth],
  ['gltf/hat_a.glb', DEFAULT_NPC_ASSET_URLS.hat],
  ['gltf/hat_b.glb', DEFAULT_NPC_ASSET_URLS.hat],
  ['gltf/hat_c.glb', DEFAULT_NPC_ASSET_URLS.hat],
  ['gltf/glass_a.glb', DEFAULT_NPC_ASSET_URLS.glasses],
  ['gltf/super_glass.glb', DEFAULT_NPC_ASSET_URLS.glasses],
]);

function repairNPCPartAssetUrl(part: NPCPart): NPCPart {
  const repairedUrl = NPC_ASSET_URL_REPLACEMENTS.get(part.url) ?? part.url;
  return {
    ...part,
    url: repairedUrl.startsWith('gltf/') ? `/${repairedUrl}` : repairedUrl,
  };
}

function repairDefaultNPCAssetUrls(state: NPCStore): void {
  const assetUrlByPartId = new Map<string, string>([
    ['rabbit-cloth', DEFAULT_NPC_ASSET_URLS.rabbitCloth],
    ['basic-suit-cloth', DEFAULT_NPC_ASSET_URLS.cloth],
    ['formal-suit-cloth', DEFAULT_NPC_ASSET_URLS.cloth],
    ['hat-a', DEFAULT_NPC_ASSET_URLS.hat],
    ['hat-b', DEFAULT_NPC_ASSET_URLS.hat],
    ['hat-c', DEFAULT_NPC_ASSET_URLS.hat],
    ['glass-a', DEFAULT_NPC_ASSET_URLS.glasses],
    ['super-glass', DEFAULT_NPC_ASSET_URLS.glasses],
    ['ally-body', DEFAULT_NPC_ASSET_URLS.body],
    ['oneyee-body', DEFAULT_NPC_ASSET_URLS.body],
  ]);

  state.clothingSets.forEach((set) => {
    set.parts = set.parts.map((part) => {
      const repairedPart = repairNPCPartAssetUrl(part);
      return {
        ...repairedPart,
        url: assetUrlByPartId.get(part.id) ?? repairedPart.url,
      };
    });
  });
  state.templates.forEach((template) => {
    template.baseParts = template.baseParts.map((part) => {
      const repairedPart = repairNPCPartAssetUrl(part);
      return {
        ...repairedPart,
        url: assetUrlByPartId.get(part.id) ?? repairedPart.url,
      };
    });
  });
  state.instances.forEach((instance) => {
    if (!instance.customParts) return;
    instance.customParts = instance.customParts.map(repairNPCPartAssetUrl);
  });
}

/** Gives NPCs without a brain the default one; a brain the author picked, including 'none', is kept. */
function attachDefaultBrainToInstances(state: NPCStore): void {
  state.instances.forEach((instance, id) => {
    if (instance.brain) return;
    state.instances.set(id, { ...instance, brain: { ...DEFAULT_NPC_BRAIN } });
  });
}

/** Seeds the default NPC catalog once; later calls only repair stale asset URLs and attach missing brains. */
export function seedNPCDefaults(state: Draft<NPCStore>, legacyBlueprintRegistry: boolean): void {
  if (state.initialized) {
    repairDefaultNPCAssetUrls(state);
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
  
  state.animations.set('greet', {
    id: 'greet',
    name: '인사',
    loop: false,
    speed: 1
  });
  
  state.animations.set('jump', {
    id: 'jump',
    name: '점프',
    loop: false,
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
      { id: 'quest-check', type: 'condition', label: '진행 중인 퀘스트', condition: { type: 'questStatus', questId: 'welcome', status: 'active' } },
      { id: 'wander', type: 'action', label: '돌아다니기', action: { type: 'wander', radius: 4, speed: 2.2, waitSeconds: 1.5 } },
    ],
    edges: [
      { id: 'start-idle', source: 'start', target: 'idle-check', branch: 'next' },
      { id: 'idle-quest', source: 'idle-check', target: 'quest-check', branch: 'true' },
      { id: 'quest-wander', source: 'quest-check', target: 'wander', branch: 'true' },
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
  
  // Default clothing categories
  state.clothingCategories.set('basic', {
    id: 'basic',
    name: '기본 의상',
    description: '기본 의상 모음',
    clothingSetIds: ['rabbit-outfit', 'basic-suit', 'formal-suit']
  });
  
  state.clothingCategories.set('accessories', {
    id: 'accessories',
    name: '액세서리',
    description: '모자와 안경',
    clothingSetIds: ['hat-set-a', 'hat-set-b', 'hat-set-c', 'glass-set-a', 'glass-set-b']
  });
  
  // Default clothing sets - 토끼 옷
  state.clothingSets.set('rabbit-outfit', {
    id: 'rabbit-outfit',
    name: '토끼옷',
    category: 'casual',
    parts: [
      {
        id: 'rabbit-cloth',
        type: 'top',
        url: DEFAULT_NPC_ASSET_URLS.rabbitCloth,
        position: [0, 0, 0]
      }
    ]
  });
  
  // 기본 양복
  state.clothingSets.set('basic-suit', {
    id: 'basic-suit',
    name: '양복',
    category: 'formal',
    parts: [
      {
        id: 'basic-suit-cloth',
        type: 'top',
        url: DEFAULT_NPC_ASSET_URLS.cloth,
        position: [0, 0, 0]
      }
    ]
  });
  
  // 정장
  state.clothingSets.set('formal-suit', {
    id: 'formal-suit',
    name: '양복 2',
    category: 'formal',
    parts: [
      {
        id: 'formal-suit-cloth',
        type: 'top',
        url: DEFAULT_NPC_ASSET_URLS.cloth,
        position: [0, 0, 0]
      }
    ]
  });
  
  // 모자들
  state.clothingSets.set('hat-set-a', {
    id: 'hat-set-a',
    name: '모자 A',
    category: 'casual',
    parts: [
      {
        id: 'hat-a',
        type: 'hat',
        url: DEFAULT_NPC_ASSET_URLS.hat,
        position: [0, 0, 0]
      }
    ]
  });
  
  state.clothingSets.set('hat-set-b', {
    id: 'hat-set-b',
    name: '모자 B',
    category: 'casual',
    parts: [
      {
        id: 'hat-b',
        type: 'hat',
        url: DEFAULT_NPC_ASSET_URLS.hat,
        position: [0, 0, 0]
      }
    ]
  });
  
  state.clothingSets.set('hat-set-c', {
    id: 'hat-set-c',
    name: '모자 C',
    category: 'casual',
    parts: [
      {
        id: 'hat-c',
        type: 'hat',
        url: DEFAULT_NPC_ASSET_URLS.hat,
        position: [0, 0, 0]
      }
    ]
  });
  
  // 안경들
  state.clothingSets.set('glass-set-a', {
    id: 'glass-set-a',
    name: '안경 A',
    category: 'casual',
    parts: [
      {
        id: 'glass-a',
        type: 'glasses',
        url: DEFAULT_NPC_ASSET_URLS.glasses,
        position: [0, 0, 0]
      }
    ]
  });
  
  state.clothingSets.set('glass-set-b', {
    id: 'glass-set-b',
    name: '슈퍼 안경',
    category: 'casual',
    parts: [
      {
        id: 'super-glass',
        type: 'glasses',
        url: DEFAULT_NPC_ASSET_URLS.glasses,
        position: [0, 0, 0]
      }
    ]
  });
  
  // Default categories
  state.categories.set('humanoid', {
    id: 'humanoid',
    name: '캐릭터',
    description: '사람 형태의 캐릭터',
    templateIds: ['ally', 'oneyee']
  });
  
  // Default templates - Ally (올춘삼)
  state.templates.set('ally', {
    id: 'ally',
    name: '올춘삼',
    description: '올춘삼 캐릭터',
    category: 'humanoid',
    baseParts: [
      {
        id: 'ally-body',
        type: 'body',
        url: DEFAULT_NPC_ASSET_URLS.body,
        position: [0, 0, 0]
      }
    ],
    clothingParts: [],
    defaultAnimation: 'idle',
    defaultClothingSet: 'rabbit-outfit'
  });
  
  // Oneyee (원덕배)
  state.templates.set('oneyee', {
    id: 'oneyee',
    name: '원덕배',
    description: '원덕배 캐릭터',
    category: 'humanoid',
    baseParts: [
      {
        id: 'oneyee-body',
        type: 'body',
        // Fallback to an existing body asset until oneyee model is added.
        url: DEFAULT_NPC_ASSET_URLS.body,
        position: [0, 0, 0]
      }
    ],
    clothingParts: [],
    defaultAnimation: 'idle',
    defaultClothingSet: 'basic-suit'
  });
  
  state.selectedCategoryId = 'humanoid';
  state.selectedTemplateId = 'ally';
  state.selectedClothingCategoryId = 'basic';
  state.selectedClothingSetId = 'rabbit-outfit';
  attachDefaultBrainToInstances(state);
  state.initialized = true;
}
