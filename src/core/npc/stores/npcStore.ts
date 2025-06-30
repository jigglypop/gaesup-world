import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { 
  NPCSystemState, 
  NPCTemplate, 
  NPCInstance, 
  NPCCategory,
  NPCAnimation,
  NPCPart
} from '../types';

enableMapSet();

interface NPCStore extends NPCSystemState {
  initialized: boolean;
  initializeDefaults: () => void;
  
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
  
  // Animation management
  addAnimation: (animation: NPCAnimation) => void;
  updateAnimation: (id: string, updates: Partial<NPCAnimation>) => void;
  removeAnimation: (id: string) => void;
  
  // Selection
  setSelectedTemplate: (id: string) => void;
  setSelectedCategory: (id: string) => void;
  setSelectedInstance: (id: string) => void;
  setEditMode: (editMode: boolean) => void;
  
  // Helper functions
  createInstanceFromTemplate: (templateId: string, position: [number, number, number]) => void;
  updateInstancePart: (instanceId: string, partId: string, updates: Partial<NPCPart>) => void;
}

export const useNPCStore = create<NPCStore>()(
  immer((set, get) => ({
    initialized: false,
    templates: new Map(),
    instances: new Map(),
    categories: new Map(),
    animations: new Map(),
    selectedTemplateId: undefined,
    selectedCategoryId: undefined,
    selectedInstanceId: undefined,
    editMode: false,

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
      
      state.animations.set('run', {
        id: 'run',
        name: 'Run',
        loop: true,
        speed: 1.5
      });
      
      // Default categories
      state.categories.set('humanoid', {
        id: 'humanoid',
        name: 'Humanoid NPCs',
        description: 'Human-like characters',
        templateIds: ['basic-human', 'soldier', 'merchant']
      });
      
      state.categories.set('creature', {
        id: 'creature',
        name: 'Creatures',
        description: 'Non-humanoid creatures',
        templateIds: ['wolf', 'bird']
      });
      
      // Default templates
      state.templates.set('basic-human', {
        id: 'basic-human',
        name: 'Basic Human',
        description: 'A simple human NPC',
        parts: [
          {
            id: 'basic-head',
            type: 'head',
            url: 'models/npc/human/head.glb',
            position: [0, 1.5, 0]
          },
          {
            id: 'basic-body',
            type: 'body',
            url: 'models/npc/human/body.glb',
            position: [0, 0.8, 0]
          },
          {
            id: 'basic-legs',
            type: 'legs',
            url: 'models/npc/human/legs.glb',
            position: [0, 0, 0]
          }
        ],
        defaultAnimation: 'idle'
      });
      
      state.templates.set('soldier', {
        id: 'soldier',
        name: 'Soldier',
        description: 'An armored soldier',
        parts: [
          {
            id: 'soldier-head',
            type: 'head',
            url: 'models/npc/soldier/helmet.glb',
            position: [0, 1.5, 0]
          },
          {
            id: 'soldier-body',
            type: 'body',
            url: 'models/npc/soldier/armor.glb',
            position: [0, 0.8, 0]
          },
          {
            id: 'soldier-legs',
            type: 'legs',
            url: 'models/npc/soldier/legs.glb',
            position: [0, 0, 0]
          },
          {
            id: 'soldier-weapon',
            type: 'weapon',
            url: 'models/npc/soldier/sword.glb',
            position: [0.5, 1, 0]
          }
        ],
        defaultAnimation: 'idle'
      });
      
      state.selectedCategoryId = 'humanoid';
      state.selectedTemplateId = 'basic-human';
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
        state.selectedTemplateId = category.templateIds[0];
      }
    }),

    setSelectedInstance: (id) => set((state) => {
      state.selectedInstanceId = id;
    }),

    setEditMode: (editMode) => set((state) => {
      state.editMode = editMode;
    }),

    createInstanceFromTemplate: (templateId, position) => {
      const template = get().templates.get(templateId);
      if (!template) return;

      const instanceId = `npc-${Date.now()}`;
      const instance: NPCInstance = {
        id: instanceId,
        templateId,
        name: `${template.name} ${Date.now()}`,
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        currentAnimation: template.defaultAnimation
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
        customParts[existingPartIndex] = { ...customParts[existingPartIndex], ...updates };
      } else {
        const template = state.templates.get(instance.templateId);
        const templatePart = template?.parts.find(p => p.id === partId);
        if (templatePart) {
          customParts.push({ ...templatePart, ...updates });
        }
      }
      
      state.instances.set(instanceId, { ...instance, customParts });
    }),
  }))
); 