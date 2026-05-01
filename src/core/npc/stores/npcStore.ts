import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { registerNPCBrainBlueprint, unregisterNPCBrainBlueprint } from '../core/blueprint';
import { 
  NPCSystemState, 
  NPCTemplate, 
  NPCInstance, 
  NPCCategory,
  NPCAnimation,
  NPCPart,
  NPCNavigationState,
  NPCVolumeConfig,
  NPCBrainConfig,
  NPCPerceptionConfig,
  NPCBehaviorConfig,
  NPCAction,
  NPCObservation,
  NPCBrainDecision,
  NPCBrainBlueprint,
  ClothingSet,
  ClothingCategory,
  NPCEvent
} from '../types';

enableMapSet();

const DEFAULT_NPC_VOLUME: NPCVolumeConfig = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6,
};

const DEFAULT_NPC_BRAIN: NPCBrainConfig = {
  mode: 'scripted',
  autoRespond: false,
  prompt: 'Respond as an in-world NPC when a dialogue system is connected.',
};

const DEFAULT_NPC_PERCEPTION: NPCPerceptionConfig = {
  enabled: true,
  sightRadius: 8,
  hearingRadius: 4,
  fieldOfView: 110,
};

const DEFAULT_NPC_BEHAVIOR: NPCBehaviorConfig = {
  mode: 'idle',
  speed: 2.2,
  loop: true,
  wanderRadius: 4,
  waitSeconds: 1.5,
  idleAnimation: 'idle',
  moveAnimation: 'walk',
  arriveAnimation: 'idle',
};

function getIdleAnimation(instance: NPCInstance): string {
  return instance.behavior?.idleAnimation ?? instance.behavior?.arriveAnimation ?? 'idle';
}

function getMoveAnimation(instance: NPCInstance, speed: number): string {
  return instance.behavior?.moveAnimation ?? (speed >= 3.8 ? 'run' : 'walk');
}

interface NPCStore extends NPCSystemState {
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
  setEditMode: (editMode: boolean) => void;
  
  // Helper functions
  createInstanceFromTemplate: (templateId: string, position: [number, number, number]) => void;
  updateInstancePart: (instanceId: string, partId: string, updates: Partial<NPCPart>) => void;
  changeInstanceClothing: (instanceId: string, clothingSetId: string) => void;
  updateInstanceVolume: (instanceId: string, volume: Partial<NPCVolumeConfig>) => void;
  updateInstanceBrain: (instanceId: string, brain: Partial<NPCBrainConfig>) => void;
  updateInstancePerception: (instanceId: string, perception: Partial<NPCPerceptionConfig>) => void;
  updateInstanceBehavior: (instanceId: string, behavior: Partial<NPCBehaviorConfig>) => void;
  setInstanceObservation: (instanceId: string, observation: NPCObservation) => void;
  setInstanceDecision: (instanceId: string, decision: NPCBrainDecision) => void;
  executeInstanceAction: (instanceId: string, action: NPCAction) => void;
  executeInstanceActions: (instanceId: string, actions: NPCAction[]) => void;
  addInstanceEvent: (instanceId: string, event: NPCEvent) => void;
  removeInstanceEvent: (instanceId: string, eventId: string) => void;

  // Navigation
  setNavigation: (instanceId: string, waypoints: [number, number, number][], speed?: number) => void;
  advanceNavigation: (instanceId: string) => void;
  clearNavigation: (instanceId: string) => void;
  updateNavigationPosition: (instanceId: string, position: [number, number, number]) => void;
}

export const useNPCStore = create<NPCStore>()(
  immer((set, get) => ({
    initialized: false,
    templates: new Map(),
    instances: new Map(),
    categories: new Map(),
    clothingSets: new Map(),
    clothingCategories: new Map(),
    animations: new Map(),
    brainBlueprints: new Map(),
    editMode: false,
    previewAccessories: {},

    initializeDefaults: () => set((state) => {
      if (state.initialized) return;
      
      // Default animations
      state.animations.set('idle', {
        id: 'idle',
        name: 'Idle',
        loop: true,
        speed: 1
      });
      
      state.animations.set('walk', {
        id: 'walk',
        name: 'Walk',
        loop: true,
        speed: 1
      });
      
      state.animations.set('greet', {
        id: 'greet',
        name: 'Greet',
        loop: false,
        speed: 1
      });
      
      state.animations.set('jump', {
        id: 'jump',
        name: 'Jump',
        loop: false,
        speed: 1
      });
      
      state.animations.set('run', {
        id: 'run',
        name: 'Run',
        loop: true,
        speed: 1.5
      });

      const wanderBlueprint: NPCBrainBlueprint = {
        id: 'npc-blueprint-wander',
        name: 'Wander Loop',
        description: 'Move to a generated wander target when navigation is idle.',
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          { id: 'idle-check', type: 'condition', label: 'Navigation Idle', condition: { type: 'navigationIdle' } },
          { id: 'wander', type: 'action', label: 'Wander', action: { type: 'wander', radius: 4, speed: 2.2, waitSeconds: 1.5 } },
        ],
        edges: [
          { id: 'start-idle', source: 'start', target: 'idle-check', branch: 'next' },
          { id: 'idle-wander', source: 'idle-check', target: 'wander', branch: 'true' },
        ],
      };
      const greetBlueprint: NPCBrainBlueprint = {
        id: 'npc-blueprint-greet-nearest',
        name: 'Greet Nearest',
        description: 'Look at and greet the nearest perceived NPC.',
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          { id: 'see-any', type: 'condition', label: 'Perceived Any', condition: { type: 'perceivedAny' } },
          { id: 'look', type: 'action', label: 'Look At Nearest', action: { type: 'moveToTarget', target: { type: 'nearestPerceived' }, speed: 1.2, animationId: 'walk' } },
          { id: 'speak', type: 'action', label: 'Speak', action: { type: 'speak', text: '안녕?', duration: 2 } },
        ],
        edges: [
          { id: 'start-see', source: 'start', target: 'see-any', branch: 'next' },
          { id: 'see-look', source: 'see-any', target: 'look', branch: 'true' },
          { id: 'look-speak', source: 'look', target: 'speak', branch: 'next' },
        ],
      };
      state.brainBlueprints.set(wanderBlueprint.id, wanderBlueprint);
      state.brainBlueprints.set(greetBlueprint.id, greetBlueprint);
      registerNPCBrainBlueprint(wanderBlueprint);
      registerNPCBrainBlueprint(greetBlueprint);
      
      // Default clothing categories
      state.clothingCategories.set('basic', {
        id: 'basic',
        name: '기본 의상',
        description: 'Basic clothing sets',
        clothingSetIds: ['rabbit-outfit', 'basic-suit', 'formal-suit']
      });
      
      state.clothingCategories.set('accessories', {
        id: 'accessories',
        name: '액세서리',
        description: 'Hats and glasses',
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
            url: 'gltf/ally_cloth_rabbit.glb',
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
            url: 'gltf/ally_cloth.glb',
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
            url: 'gltf/formal.glb',
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
            url: 'gltf/hat_a.glb',
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
            url: 'gltf/hat_b.glb',
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
            url: 'gltf/hat_c.glb',
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
            url: 'gltf/glass_a.glb',
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
            url: 'gltf/super_glass.glb',
            position: [0, 0, 0]
          }
        ]
      });
      
      // Default categories
      state.categories.set('humanoid', {
        id: 'humanoid',
        name: '캐릭터',
        description: 'Human-like characters',
        templateIds: ['ally', 'oneyee']
      });
      
      // Default templates - Ally (올춘삼)
      state.templates.set('ally', {
        id: 'ally',
        name: '올춘삼',
        description: 'Ally character',
        category: 'humanoid',
        baseParts: [
          {
            id: 'ally-body',
            type: 'body',
            url: 'gltf/ally_body.glb',
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
        description: 'Oneyee character',
        category: 'humanoid',
        baseParts: [
          {
            id: 'oneyee-body',
            type: 'body',
            url: 'gltf/oneyee.glb',
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
      state.initialized = true;
    }),

    addTemplate: (template) => set((state) => {
      state.templates.set(template.id, template);
    }),

    updateTemplate: (id, updates) => set((state) => {
      const template = state.templates.get(id);
      if (template) {
        state.templates.set(id, { ...template, ...updates });
      }
    }),

    removeTemplate: (id) => set((state) => {
      state.templates.delete(id);
    }),

    addInstance: (instance) => set((state) => {
      state.instances.set(instance.id, instance);
    }),

    updateInstance: (id, updates) => set((state) => {
      const instance = state.instances.get(id);
      if (instance) {
        state.instances.set(id, { ...instance, ...updates });
      }
    }),

    removeInstance: (id) => set((state) => {
      state.instances.delete(id);
    }),

    addCategory: (category) => set((state) => {
      state.categories.set(category.id, category);
    }),

    updateCategory: (id, updates) => set((state) => {
      const category = state.categories.get(id);
      if (category) {
        state.categories.set(id, { ...category, ...updates });
      }
    }),

    removeCategory: (id) => set((state) => {
      state.categories.delete(id);
    }),

    addClothingSet: (clothingSet) => set((state) => {
      state.clothingSets.set(clothingSet.id, clothingSet);
    }),

    updateClothingSet: (id, updates) => set((state) => {
      const set = state.clothingSets.get(id);
      if (set) {
        state.clothingSets.set(id, { ...set, ...updates });
      }
    }),

    removeClothingSet: (id) => set((state) => {
      state.clothingSets.delete(id);
    }),

    addClothingCategory: (category) => set((state) => {
      state.clothingCategories.set(category.id, category);
    }),

    updateClothingCategory: (id, updates) => set((state) => {
      const category = state.clothingCategories.get(id);
      if (category) {
        state.clothingCategories.set(id, { ...category, ...updates });
      }
    }),

    removeClothingCategory: (id) => set((state) => {
      state.clothingCategories.delete(id);
    }),

    addAnimation: (animation) => set((state) => {
      state.animations.set(animation.id, animation);
    }),

    updateAnimation: (id, updates) => set((state) => {
      const animation = state.animations.get(id);
      if (animation) {
        state.animations.set(id, { ...animation, ...updates });
      }
    }),

    removeAnimation: (id) => set((state) => {
      state.animations.delete(id);
    }),

    addBrainBlueprint: (blueprint) => set((state) => {
      state.brainBlueprints.set(blueprint.id, blueprint);
      registerNPCBrainBlueprint(blueprint);
    }),

    updateBrainBlueprint: (id, updates) => set((state) => {
      const blueprint = state.brainBlueprints.get(id);
      if (!blueprint) return;
      const nextBlueprint = { ...blueprint, ...updates };
      state.brainBlueprints.set(id, nextBlueprint);
      registerNPCBrainBlueprint(nextBlueprint);
    }),

    removeBrainBlueprint: (id) => set((state) => {
      state.brainBlueprints.delete(id);
      unregisterNPCBrainBlueprint(id);
    }),

    setSelectedTemplate: (id) => set((state) => {
      state.selectedTemplateId = id;
    }),

    setSelectedCategory: (id) => set((state) => {
      state.selectedCategoryId = id;
      const category = state.categories.get(id);
      if (category && category.templateIds.length > 0) {
        const firstTemplateId = category.templateIds[0];
        if (firstTemplateId) state.selectedTemplateId = firstTemplateId;
      } else {
        delete state.selectedTemplateId;
      }
    }),

    setSelectedInstance: (id) => set((state) => {
      state.selectedInstanceId = id;
    }),

    setSelectedClothingSet: (id) => set((state) => {
      state.selectedClothingSetId = id;
    }),

    setSelectedClothingCategory: (id) => set((state) => {
      state.selectedClothingCategoryId = id;
      const category = state.clothingCategories.get(id);
      if (category && category.clothingSetIds.length > 0) {
        const firstSetId = category.clothingSetIds[0];
        if (firstSetId) state.selectedClothingSetId = firstSetId;
      } else {
        delete state.selectedClothingSetId;
      }
    }),

    setEditMode: (editMode) => set((state) => {
      state.editMode = editMode;
    }),

    createInstanceFromTemplate: (templateId, position) => {
      const template = get().templates.get(templateId);
      if (!template) return;

      const instanceId = `npc-${Date.now()}`;
      const selectedClothingSetId = get().selectedClothingSetId || template.defaultClothingSet;
      
      // Create custom parts from preview accessories
      const customParts: NPCPart[] = [];
      
      const hatId = get().previewAccessories.hat;
      if (hatId) {
        const hatSet = get().clothingSets.get(hatId);
        const part = hatSet?.parts[0];
        if (part) customParts.push(part);
      }
      
      const glassesId = get().previewAccessories.glasses;
      if (glassesId) {
        const glassesSet = get().clothingSets.get(glassesId);
        const part = glassesSet?.parts[0];
        if (part) customParts.push(part);
      }
      
      const instance: NPCInstance = {
        id: instanceId,
        templateId,
        name: `${template.name} ${Date.now()}`,
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...(template.defaultAnimation ? { currentAnimation: template.defaultAnimation } : {}),
        ...(selectedClothingSetId ? { currentClothingSetId: selectedClothingSetId } : {}),
        ...(customParts.length > 0 ? { customParts } : {}),
        volume: { ...DEFAULT_NPC_VOLUME },
        brain: { ...DEFAULT_NPC_BRAIN },
        perception: { ...DEFAULT_NPC_PERCEPTION },
        behavior: { ...DEFAULT_NPC_BEHAVIOR },
        events: [],
      };

      get().addInstance(instance);
      get().setSelectedInstance(instanceId);
    },

    updateInstancePart: (instanceId, partId, updates) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      
      const customParts = instance.customParts || [];
      const existingPartIndex = customParts.findIndex(p => p.id === partId);
      
      if (existingPartIndex >= 0) {
        const existing = customParts[existingPartIndex]!;
        customParts[existingPartIndex] = {
          ...existing,
          ...updates,
          id: existing.id,
          type: existing.type,
          url: existing.url,
        };
      } else {
        const type = updates.type ?? 'accessory';
        const url = updates.url ?? '';
        customParts.push({
          id: partId,
          type,
          url,
          ...(updates.category !== undefined ? { category: updates.category } : {}),
          ...(updates.position !== undefined ? { position: updates.position } : {}),
          ...(updates.rotation !== undefined ? { rotation: updates.rotation } : {}),
          ...(updates.scale !== undefined ? { scale: updates.scale } : {}),
          ...(updates.color !== undefined ? { color: updates.color } : {}),
          ...(updates.metadata !== undefined ? { metadata: updates.metadata } : {}),
        });
      }
      
      state.instances.set(instanceId, { ...instance, customParts });
    }),

    changeInstanceClothing: (instanceId, clothingSetId) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (instance) {
        state.instances.set(instanceId, { ...instance, currentClothingSetId: clothingSetId });
      }
    }),

    updateInstanceVolume: (instanceId, volume) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, {
        ...instance,
        volume: { ...(instance.volume ?? DEFAULT_NPC_VOLUME), ...volume },
      });
    }),

    updateInstanceBrain: (instanceId, brain) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, {
        ...instance,
        brain: { ...(instance.brain ?? DEFAULT_NPC_BRAIN), ...brain },
      });
    }),

    updateInstancePerception: (instanceId, perception) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, {
        ...instance,
        perception: { ...(instance.perception ?? DEFAULT_NPC_PERCEPTION), ...perception },
      });
    }),

    updateInstanceBehavior: (instanceId, behavior) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      const nextBehavior = { ...(instance.behavior ?? DEFAULT_NPC_BEHAVIOR), ...behavior };
      const nextInstance: NPCInstance = {
        ...instance,
        behavior: nextBehavior,
      };
      if (nextBehavior.mode === 'idle') {
        nextInstance.currentAnimation = nextBehavior.idleAnimation ?? 'idle';
      } else if (behavior.moveAnimation !== undefined) {
        nextInstance.currentAnimation = behavior.moveAnimation;
      }
      if (nextBehavior.mode === 'idle') {
        delete nextInstance.navigation;
      }
      state.instances.set(instanceId, nextInstance);
    }),

    setInstanceObservation: (instanceId, observation) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, {
        ...instance,
        lastObservation: observation,
      });
    }),

    setInstanceDecision: (instanceId, decision) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, {
        ...instance,
        lastDecision: decision,
      });
    }),

    executeInstanceAction: (instanceId, action) => {
      const store = get();
      const instance = store.instances.get(instanceId);
      if (!instance) return;

      switch (action.type) {
        case 'idle':
          store.updateInstanceBehavior(instanceId, {
            mode: 'idle',
            ...(action.animationId ? { idleAnimation: action.animationId, arriveAnimation: action.animationId } : {}),
          });
          store.clearNavigation(instanceId);
          if (action.animationId) store.updateInstance(instanceId, { currentAnimation: action.animationId });
          return;

        case 'moveTo':
          if (action.animationId) {
            store.updateInstanceBehavior(instanceId, { moveAnimation: action.animationId });
          }
          store.setNavigation(instanceId, [action.target], action.speed ?? instance.behavior?.speed ?? DEFAULT_NPC_BEHAVIOR.speed);
          return;

        case 'patrol':
          if (action.waypoints.length === 0) return;
          store.updateInstanceBehavior(instanceId, {
            mode: 'patrol',
            waypoints: action.waypoints,
            speed: action.speed ?? instance.behavior?.speed ?? DEFAULT_NPC_BEHAVIOR.speed,
            loop: action.loop ?? instance.behavior?.loop ?? true,
            ...(action.animationId ? { moveAnimation: action.animationId } : {}),
          });
          store.setNavigation(instanceId, action.waypoints, action.speed ?? instance.behavior?.speed ?? DEFAULT_NPC_BEHAVIOR.speed);
          return;

        case 'wander':
          store.updateInstanceBehavior(instanceId, {
            mode: 'wander',
            speed: action.speed ?? instance.behavior?.speed ?? DEFAULT_NPC_BEHAVIOR.speed,
            wanderRadius: action.radius ?? instance.behavior?.wanderRadius ?? DEFAULT_NPC_BEHAVIOR.wanderRadius ?? 4,
            waitSeconds: action.waitSeconds ?? instance.behavior?.waitSeconds ?? DEFAULT_NPC_BEHAVIOR.waitSeconds ?? 1.5,
          });
          return;

        case 'playAnimation':
          store.updateAnimation(action.animationId, {
            ...(action.loop !== undefined ? { loop: action.loop } : {}),
            ...(action.speed !== undefined ? { speed: action.speed } : {}),
          });
          store.updateInstance(instanceId, { currentAnimation: action.animationId });
          return;

        case 'lookAt':
          store.updateInstance(instanceId, {
            rotation: [
              instance.rotation[0],
              Math.atan2(action.target[0] - instance.position[0], action.target[2] - instance.position[2]),
              instance.rotation[2],
            ],
          });
          return;

        case 'speak':
          store.addInstanceEvent(instanceId, {
            id: `npc-speak-${Date.now()}`,
            type: 'onInteract',
            action: 'dialogue',
            payload: {
              type: 'dialogue',
              text: action.text,
              ...(action.duration !== undefined ? { duration: action.duration } : {}),
            },
          });
          return;

        case 'interact':
          store.updateInstance(instanceId, {
            metadata: {
              ...instance.metadata,
              lastInteractionTargetId: action.targetId,
            },
          });
          return;

        case 'remember':
          store.updateInstanceBrain(instanceId, {
            memory: {
              ...(instance.brain?.memory ?? {}),
              [action.key]: action.value,
            },
          });
          return;
      }
    },

    executeInstanceActions: (instanceId, actions) => {
      for (const action of actions) {
        get().executeInstanceAction(instanceId, action);
      }
    },

    addInstanceEvent: (instanceId, event) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (instance) {
        const events = instance.events || [];
        events.push(event);
        state.instances.set(instanceId, { ...instance, events });
      }
    }),

    removeInstanceEvent: (instanceId, eventId) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (instance && instance.events) {
        const events = instance.events.filter(e => e.id !== eventId);
        state.instances.set(instanceId, { ...instance, events });
      }
    }),

    setPreviewAccessory: (type, id) => set((state) => {
      if (id) {
        state.previewAccessories[type] = id;
      } else {
        delete state.previewAccessories[type];
      }
    }),

    setNavigation: (instanceId, waypoints, speed = 3) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance || waypoints.length === 0) return;
      const nav: NPCNavigationState = {
        waypoints,
        currentIndex: 0,
        speed,
        state: 'moving',
      };
      state.instances.set(instanceId, {
        ...instance,
        navigation: nav,
        currentAnimation: getMoveAnimation(instance, speed),
      });
    }),

    advanceNavigation: (instanceId) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance?.navigation || instance.navigation.state !== 'moving') return;
      const nav = instance.navigation;
      const nextIndex = nav.currentIndex + 1;
      if (nextIndex >= nav.waypoints.length) {
        state.instances.set(instanceId, {
          ...instance,
          navigation: { ...nav, state: 'arrived', currentIndex: nextIndex },
          currentAnimation: getIdleAnimation(instance),
        });
      } else {
        state.instances.set(instanceId, {
          ...instance,
          navigation: { ...nav, currentIndex: nextIndex },
        });
      }
    }),

    clearNavigation: (instanceId) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      const nextInstance: NPCInstance = {
        ...instance,
        currentAnimation: getIdleAnimation(instance),
      };
      delete nextInstance.navigation;
      state.instances.set(instanceId, nextInstance);
    }),

    updateNavigationPosition: (instanceId, position) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, { ...instance, position });
    }),
  }))
); 
