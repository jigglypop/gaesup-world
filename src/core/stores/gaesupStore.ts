import { createContext, useContext } from 'react';

import { create, useStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createCameraOptionSlice } from '@core/camera/stores/slices/cameraOption';

import {
  createModeSlice,
  createUrlsSlice,
  createRideableSlice,
  createPerformanceSlice,
  createPhysicsSlice,
  createSizesSlice,
} from './slices';
import { GaesupState } from './types';
import { createAnimationSlice } from '../animation/stores/slices';
import { createMemoryInputBackend, type InputBackend } from '../interactions/core/adapter';
import {
  createInteractionSlice,
  createInteractionSliceWithServices,
} from '../interactions/stores/slices';
import { createWorldInteractions } from '../interactions/stores/worldInteractions';
import { createWorldSlice } from '../world/stores/slices/worldStates/slice';

function buildGaesupStore(interactions = createInteractionSlice) {
  return create<GaesupState>()(
    devtools(
      subscribeWithSelector((...a) => ({
        ...createModeSlice(...a),
        ...createUrlsSlice(...a),
        ...createSizesSlice(...a),
        ...createRideableSlice(...a),
        ...createPerformanceSlice(...a),
        ...createCameraOptionSlice(...a),
        ...createPhysicsSlice(...a),
        ...createAnimationSlice(...a),
        ...interactions(...a),
        ...createWorldSlice(...a),
      })),
    ),
  );
}

export function createGaesupStore(inputBackend: InputBackend = createMemoryInputBackend()) {
  const interactions = createWorldInteractions(inputBackend);
  const store = buildGaesupStore(createInteractionSliceWithServices(interactions.services));
  interactions.activate();
  return Object.assign(store, {
    inputBackend,
    activateInteractions: interactions.activate,
    disposeInteractions: interactions.dispose,
  });
}

export type GaesupStore = ReturnType<typeof buildGaesupStore>;
export const RUNTIME_GAESUP_STORE_SERVICE_ID = 'gaesup.runtime.world-store';
const legacyGaesupStore = buildGaesupStore();
const GaesupStoreContext = createContext<GaesupStore | null>(null);
export const GaesupStoreProvider = GaesupStoreContext.Provider;
export function useGaesupStoreApi(): GaesupStore {
  return useContext(GaesupStoreContext) ?? useGaesupStore;
}

function useScopedGaesupStore(): GaesupState;
function useScopedGaesupStore<T>(selector: (state: GaesupState) => T): T;
function useScopedGaesupStore(selector: (state: GaesupState) => unknown = (state) => state) {
  return useStore(useGaesupStoreApi(), selector);
}

/** React reads the nearest world; static methods retain the legacy default store. */
export const useGaesupStore = Object.assign(useScopedGaesupStore, legacyGaesupStore);
