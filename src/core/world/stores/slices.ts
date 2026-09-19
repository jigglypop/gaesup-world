import type { StateCreator } from 'zustand';

import { BridgeFactory } from '@core/boilerplate';

import type { WorldSlice, WorldSliceState } from './types';
import type { WorldSnapshot } from '../bridge/types';
import { WorldBridge } from '../bridge/WorldBridge';

export type WorldSliceOptions = { bridge: WorldBridge; worldId: string; owned?: boolean; active?: boolean };

const emptyState = (): WorldSliceState => ({ objects: [], selectedObjectId: undefined, interactionMode: 'view', showDebugInfo: false, events: [], loading: false, error: undefined });
const stateFrom = (snapshot: WorldSnapshot): WorldSliceState => ({ objects: snapshot.objects, selectedObjectId: snapshot.selectedObjectId,
  interactionMode: snapshot.interactionMode, showDebugInfo: snapshot.showDebugInfo, events: snapshot.events, loading: false, error: undefined });

/** An owned bridge can be suspended while world data remains in its store. */
export function createWorldSliceForBridge({ bridge, worldId, owned = false, active = true }: WorldSliceOptions): StateCreator<WorldSlice> {
  return (set, get) => {
    let unsubscribe: (() => void) | undefined;
    let connected = false;
    const sync = (snapshot: WorldSnapshot, id: string) => { if (connected && id === worldId) set(stateFrom(snapshot)); };
    const activateWorldBridge = () => {
      if (connected) return;
      if (owned) bridge.resume();
      const state = get();
      if (!bridge.getEngine(worldId)) {
        bridge.register(worldId, state ? { selectedObjectId: state.selectedObjectId, interactionMode: state.interactionMode, showDebugInfo: state.showDebugInfo } : {});
        const system = bridge.getEngine(worldId)?.system;
        if (state) {
          for (const object of state.objects) system?.addObject(object);
          for (const event of state.events) system?.processInteraction(event);
        }
      }
      connected = true;
      unsubscribe = bridge.subscribe(sync);
      const snapshot = bridge.snapshot(worldId);
      if (state && snapshot) sync(snapshot, worldId);
    };
    const deactivateWorldBridge = () => {
      if (!connected) return;
      try {
        const snapshot = bridge.snapshot(worldId);
        if (snapshot) sync(snapshot, worldId);
      } finally {
        connected = false; unsubscribe?.(); unsubscribe = undefined;
        if (owned) { bridge.suspend(); bridge.dispose(); }
      }
    };
    if (active) activateWorldBridge();
    else if (owned) bridge.suspend();
    const snapshot = connected ? bridge.snapshot(worldId) : null;
    const execute = <T>(fallback: T, command: () => T): T => {
      if (!connected) return fallback;
      try {
        const result = command();
        if (get().loading || get().error !== undefined) set({ loading: false, error: undefined });
        return result;
      }
      catch (error) { set({ loading: false, error: error instanceof Error ? error.message : String(error) }); return fallback; }
    };
    return {
      ...(snapshot ? stateFrom(snapshot) : emptyState()),
      activateWorldBridge, deactivateWorldBridge,
      addObject: object => execute('', () => bridge.addObject(worldId, object)),
      removeObject: id => execute(false, () => {
        if (!bridge.getEngine(worldId)?.system.getObject(id)) return false;
        bridge.removeObject(worldId, id); return true;
      }),
      updateObject: (id, updates) => execute(false, () => {
        if (!bridge.getEngine(worldId)?.system.getObject(id)) return false;
        bridge.updateObject(worldId, id, updates); return true;
      }),
      selectObject: id => execute(undefined, () => bridge.selectObject(worldId, id)),
      setInteractionMode: mode => execute(undefined, () => bridge.setInteractionMode(worldId, mode)),
      toggleDebugInfo: () => execute(undefined, () => bridge.toggleDebugInfo(worldId)),
      setLoading: loading => set({ loading }), setError: error => set({ error }),
      clearEvents: () => execute(undefined, () => bridge.clearEvents(worldId)),
      getBridge: () => bridge,
      getObjectsInRadius: (center, radius) => connected ? bridge.getObjectsInRadius(worldId, center, radius) : [],
      getObjectsByType: type => connected ? bridge.getObjectsByType(worldId, type) : [],
      raycast: (origin, direction) => connected ? bridge.raycast(worldId, origin, direction) : null,
      interact: (objectId, action) => execute(undefined, () => bridge.interact(worldId, objectId, action)),
      cleanup: () => {
        if (connected) execute(undefined, () => bridge.cleanup(worldId));
        else set(emptyState());
      },
    };
  };
}

/** Legacy shared-default-world composition. Each slice owns only its own subscription. */
export const createWorldSlice: StateCreator<WorldSlice> = (...args) => createWorldSliceForBridge({
  bridge: BridgeFactory.getOrCreate<WorldBridge>('world') ?? new WorldBridge(), worldId: 'default',
})(...args);
