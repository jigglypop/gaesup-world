import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { 
  NPCSystemState, 
  NPCTemplate, 
  NPCInstance, 
  NPCCategory,
  NPCAnimation,
  NPCPart,
  ClothingSet,
  ClothingCategory,
  NPCEvent
} from '../types';

enableMapSet();

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
  addInstanceEvent: (instanceId: string, event: NPCEvent) => void;
  removeInstanceEvent: (instanceId: string, eventId: string) => void;
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
  }))
); 