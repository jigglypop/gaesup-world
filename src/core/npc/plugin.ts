import type { GaesupPlugin, PluginContext } from '../plugins';
import { useNPCStore } from './stores/npcStore';
import type {
  ClothingCategory,
  ClothingSet,
  NPCAnimation,
  NPCBrainBlueprint,
  NPCCategory,
  NPCInstance,
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

export function hydrateNPCState(data: Partial<NPCSerializedState> | NPCInstance[] | null | undefined): void {
  if (!data) return;

  const instances = Array.isArray(data) ? data : data.instances;

  useNPCStore.setState((state) => {
    if (!Array.isArray(data)) {
      if (data.templates) {
        state.templates = new Map(data.templates.map((template) => [template.id, cloneNPCValue(template)]));
      }
      if (data.categories) {
        state.categories = new Map(data.categories.map((category) => [category.id, cloneNPCValue(category)]));
      }
      if (data.clothingSets) {
        state.clothingSets = new Map(data.clothingSets.map((set) => [set.id, cloneNPCValue(set)]));
      }
      if (data.clothingCategories) {
        state.clothingCategories = new Map(data.clothingCategories.map((category) => [category.id, cloneNPCValue(category)]));
      }
      if (data.animations) {
        state.animations = new Map(data.animations.map((animation) => [animation.id, cloneNPCValue(animation)]));
      }
      if (data.brainBlueprints) {
        state.brainBlueprints = new Map(data.brainBlueprints.map((blueprint) => [blueprint.id, cloneNPCValue(blueprint)]));
      }
      if (typeof data.editMode === 'boolean') {
        state.editMode = data.editMode;
      }
    }

    if (instances) {
      state.instances = new Map(instances.map((instance) => [instance.id, cloneNPCValue(instance)]));
    }
  });
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
