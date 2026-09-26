import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createNPCCatalogActions } from './npcCatalogActions';
import { seedNPCDefaults } from './npcDefaults';
import { createNPCInstanceActions } from './npcInstanceActions';
import type { NPCStore } from './npcStoreTypes';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';

export { DEFAULT_NPC_SCALE } from './npcDefaults';

function buildNPCStore(legacyBlueprintRegistry = false, invalidateBrainRequests: (id?: string) => void = () => {}) {
  enableMapSet();
  const context = { legacyBlueprintRegistry, invalidateBrainRequests };
  return create<NPCStore>()(
  immer((set, get) => ({
    initialized: false,
    templates: new Map(),
    instances: new Map(),
    categories: new Map(),
    clothingSets: new Map(),
    clothingCategories: new Map(),
    animations: new Map(),
    brainBlueprints: new Map(),
    previewAccessories: {},

    initializeDefaults: () => set((state) => seedNPCDefaults(state, legacyBlueprintRegistry)),
    ...createNPCCatalogActions(set, get, context),
    ...createNPCInstanceActions(set, get, context),
  }))
);
}

export function createNPCStore(options: { onInvalidateBrain?: (id?: string) => void } = {}) {
  const store = buildNPCStore(false, options.onInvalidateBrain);
  if (options.onInvalidateBrain) {
    const externalSetState = store.setState;
    // Bulk writes (including snapshot hydration) invalidate requests before observers see new data.
    // Store actions retain their captured Immer setter and invalidate only the affected NPC.
    store.setState = ((...args: Parameters<typeof externalSetState>) => {
      options.onInvalidateBrain!();
      Reflect.apply(externalSetState, store, args);
    }) as typeof externalSetState;
  }
  return store;
}
export type NPCStoreApi = ReturnType<typeof createNPCStore>;
export const NPC_STORE_SERVICE = runtimeStoreServiceKey<NPCStoreApi>('npc');
/** React uses the nearest runtime; static methods retain the legacy default. */
export const { useStore: useNPCStore, useStoreApi: useNPCStoreApi } = lazyScopedStore(
  'useNPCStore', () => buildNPCStore(true), () => useGaesupRuntime()?.npcStore,
);
