import { applyNPCAction, getIdleAnimation, withBehavior, withNavigation, withoutNavigation } from './npcActions';
import {
  DEFAULT_NPC_BEHAVIOR,
  DEFAULT_NPC_BRAIN,
  DEFAULT_NPC_PERCEPTION,
  DEFAULT_NPC_SCALE,
  DEFAULT_NPC_VOLUME,
} from './npcDefaults';
import type { NPCGet, NPCSet, NPCStore, NPCStoreContext } from './npcStoreTypes';
import { createUniqueId } from '../../utils/id';
import type { NPCInstance, NPCPart } from '../types';

/** Placed NPCs: creation, parts and clothing, brain side tables (observations, decisions, actions), events and navigation. */
export function createNPCInstanceActions(set: NPCSet, get: NPCGet, { invalidateBrainRequests }: NPCStoreContext) {
  return {
    addInstance: (instance) => set((state) => {
      invalidateBrainRequests(instance.id);
      state.instances.set(instance.id, instance);
    }),

    updateInstance: (id, updates) => set((state) => {
      const instance = state.instances.get(id);
      if (instance) {
        if (updates.brain !== undefined || updates.templateId !== undefined) invalidateBrainRequests(id);
        state.instances.set(id, { ...instance, ...updates });
      }
    }),

    removeInstance: (id) => set((state) => {
      invalidateBrainRequests(id);
      state.instances.delete(id);
    }),

    createInstanceFromTemplate: (templateId, position) => {
      const template = get().templates.get(templateId);
      if (!template) return;

      const instanceId = createUniqueId('npc');
      const templateCount = [...get().instances.values()].filter((entry) => entry.templateId === templateId).length;
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
        name: `${template.name} ${templateCount + 1}`,
        position,
        rotation: [0, 0, 0],
        scale: [DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE, DEFAULT_NPC_SCALE],
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
      invalidateBrainRequests(instanceId);
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
      if (instance) state.instances.set(instanceId, withBehavior(instance, behavior));
    }),

    applyNPCDecisions: (entries) => {
      if (!entries.some((entry) => entry.decision)) return;
      set((state) => {
        for (const { instanceId, decision } of entries) {
          if (decision) for (const action of decision.actions) applyNPCAction(state, instanceId, action, invalidateBrainRequests);
        }
      });
    },

    executeInstanceAction: (instanceId, action) => set((state) => {
      applyNPCAction(state, instanceId, action, invalidateBrainRequests);
    }),

    executeInstanceActions: (instanceId, actions) => {
      if (actions.length === 0) return;
      set((state) => {
        for (const action of actions) applyNPCAction(state, instanceId, action, invalidateBrainRequests);
      });
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
      if (instance && waypoints.length > 0) state.instances.set(instanceId, withNavigation(instance, waypoints, speed));
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
      if (instance) state.instances.set(instanceId, withoutNavigation(instance));
    }),

    updateNavigationPosition: (instanceId, position) => set((state) => {
      const instance = state.instances.get(instanceId);
      if (!instance) return;
      state.instances.set(instanceId, { ...instance, position });
    }),
  } satisfies Partial<NPCStore>;
}
