import { create, useStore } from 'zustand';

import { createWorldSlice, createWorldSliceForBridge } from './slices';
import type { WorldSlice } from './types';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { WorldBridge } from '../bridge/WorldBridge';

export function createWorldObjectStore(worldId = 'default', active = true) {
  const bridge = new WorldBridge();
  return create<WorldSlice>()(createWorldSliceForBridge({ bridge, worldId, owned: true, active }));
}

export type WorldObjectStore = ReturnType<typeof createWorldObjectStore>;
let legacyStore: WorldObjectStore | undefined;
export function useWorldObjectStoreApi(): WorldObjectStore {
  return useGaesupRuntime()?.worldObjectStore ?? (legacyStore ??= create<WorldSlice>()(createWorldSlice));
}
export function useWorldObjectStore(): WorldSlice;
export function useWorldObjectStore<T>(selector: (state: WorldSlice) => T): T;
export function useWorldObjectStore(selector: (state: WorldSlice) => unknown = state => state) {
  return useStore(useWorldObjectStoreApi(), selector);
}
