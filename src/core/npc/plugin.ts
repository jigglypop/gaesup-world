import type { GaesupPlugin, PluginContext } from '../plugins';
import { useNPCStore } from './stores/npcStore';
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

function cloneNPCValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function serializeNPCState(): NPCSerializedState {
  const state = useNPCStore.getState();

  return {
    version: 1,
    templates: Array.from(state.templates.values(), cloneNPCValue),
    instances: Array.from(state.instances.values(), cloneNPCValue),
    categories: Array.from(state.categories.values(), cloneNPCValue),
    clothingSets: Array.from(state.clothingSets.values(), cloneNPCValue),
    clothingCategories: Array.from(state.clothingCategories.values(), cloneNPCValue),
    animations: Array.from(state.animations.values(), cloneNPCValue),
    brainBlueprints: Array.from(state.brainBlueprints.values(), cloneNPCValue),
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
    result.set(entry.id, cloneNPCValue(entry));
  }
  return result;
}

function prepareNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined): () => void {
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
  return () => useNPCStore.setState(prepared);
}

export function hydrateNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined): void {
  prepareNPCState(data)();
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
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: serializeNPCState,
        hydrate: hydrateNPCState,
        prepareHydrate: prepareNPCState,
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: useNPCStore,
        getState: useNPCStore.getState,
        setState: useNPCStore.setState,
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
