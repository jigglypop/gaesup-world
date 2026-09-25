import type { GaesupPlugin, PluginContext } from '../plugins';
import { createIdentityRevision } from '../save/core/revision';
import { clonePlainData } from '../utils/clone';
import { findNPCSimulation } from './core/NPCSimulation';
import { useNPCStore, type NPCStoreApi, NPC_STORE_SERVICE } from './stores/npcStore';
import type {
  ClothingCategory,
  ClothingSet,
  NPCAnimation,
  NPCBrainBlueprint,
  NPCCategory,
  NPCInstance,
  NPCSystemState,
  NPCTemplate,
} from './types';

export type NPCSerializedState = {
  version: 1;
  templates: NPCTemplate[];
  instances: NPCInstance[];
  categories: NPCCategory[];
  clothingSets: ClothingSet[];
  clothingCategories: ClothingCategory[];
  animations: NPCAnimation[];
  brainBlueprints: NPCBrainBlueprint[];
  editMode: boolean;
};

export interface NPCPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.npc';
const DEFAULT_SAVE_EXTENSION_ID = 'npc';
const DEFAULT_STORE_SERVICE_ID = 'npc.store';

export function serializeNPCState(store: NPCStoreApi = useNPCStore): NPCSerializedState {
  const state = store.getState();

  return {
    version: 1,
    templates: Array.from(state.templates.values(), clonePlainData),
    instances: Array.from((findNPCSimulation(store)?.snapshotInstances() ?? state.instances).values(), clonePlainData),
    categories: Array.from(state.categories.values(), clonePlainData),
    clothingSets: Array.from(state.clothingSets.values(), clonePlainData),
    clothingCategories: Array.from(state.clothingCategories.values(), clonePlainData),
    animations: Array.from(state.animations.values(), clonePlainData),
    brainBlueprints: Array.from(state.brainBlueprints.values(), clonePlainData),
    editMode: state.editMode,
  };
}

function prepareCollection<T extends { id: string }>(entries: T[]): Map<string, T> {
  if (!Array.isArray(entries)) throw new TypeError('Invalid NPC collection');
  const result = new Map<string, T>();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id.trim() || result.has(entry.id)) {
      throw new TypeError('Invalid NPC collection ID');
    }
    result.set(entry.id, clonePlainData(entry));
  }
  return result;
}

function prepareNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined, store: NPCStoreApi = useNPCStore): () => void {
  if (data === null || data === undefined) return () => {};
  const snapshot = Array.isArray(data) ? { instances: data } : data;
  if (typeof snapshot !== 'object' || (snapshot.version !== undefined && snapshot.version !== 1)
    || (snapshot.editMode !== undefined && typeof snapshot.editMode !== 'boolean')) {
    throw new TypeError('Invalid NPC snapshot');
  }
  const prepared: Partial<NPCSystemState> = {
    ...(snapshot.templates === undefined ? {} : { templates: prepareCollection(snapshot.templates) }),
    ...(snapshot.categories === undefined ? {} : { categories: prepareCollection(snapshot.categories) }),
    ...(snapshot.clothingSets === undefined ? {} : { clothingSets: prepareCollection(snapshot.clothingSets) }),
    ...(snapshot.clothingCategories === undefined ? {} : { clothingCategories: prepareCollection(snapshot.clothingCategories) }),
    ...(snapshot.animations === undefined ? {} : { animations: prepareCollection(snapshot.animations) }),
    ...(snapshot.brainBlueprints === undefined ? {} : { brainBlueprints: prepareCollection(snapshot.brainBlueprints) }),
    ...(snapshot.instances === undefined ? {} : { instances: prepareCollection(snapshot.instances) }),
    ...(snapshot.editMode === undefined ? {} : { editMode: snapshot.editMode }),
  };
  for (const instance of prepared.instances?.values() ?? []) {
    if (typeof instance.templateId !== 'string' || !instance.templateId.trim() || typeof instance.name !== 'string'
      || ![instance.position, instance.rotation, instance.scale].every((vector) =>
        Array.isArray(vector) && vector.length === 3 && [...vector].every(Number.isFinite))) {
      throw new TypeError('Invalid NPC instance transform');
    }
  }
  return () => store.setState(prepared);
}

export function hydrateNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined, store: NPCStoreApi = useNPCStore): void {
  prepareNPCState(data, store)();
}

export function createNPCPlugin(options: NPCPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup NPC',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['npc'],
    setup(ctx: PluginContext) {
      const store = ctx.services.get(NPC_STORE_SERVICE) ?? useNPCStore;
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: () => serializeNPCState(store),
        hydrate: (data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined) => hydrateNPCState(data, store),
        prepareHydrate: (data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined) => prepareNPCState(data, store),
        // serializeNPCState clones every entry.
        owned: true,
        // Saved positions come from the simulation's poses, so their revision counts too.
        revision: createIdentityRevision(() => {
          const state = store.getState();
          return [state.templates, state.instances, state.categories, state.clothingSets, state.clothingCategories,
            state.animations, state.brainBlueprints, state.editMode, findNPCSimulation(store)?.poseRevision ?? 0];
        }),
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: store,
        getState: store.getState,
        setState: store.setState,
      }, pluginId);
      ctx.events.emit('npc:ready', {
        pluginId,
        saveExtensionId,
        storeServiceId,
      });
    },
    dispose(ctx) {
      ctx.save.remove(saveExtensionId);
      ctx.services.remove(storeServiceId);
    },
  };
}

export const npcPlugin = createNPCPlugin();
