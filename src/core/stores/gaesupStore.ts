import { createContext, useContext } from 'react';

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createCameraOptionSlice } from '@core/camera/stores/slices/cameraOption';

import { lazyScopedStore } from './scopedStore';
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
import { createMemoryInputBackend, type InputBackend } from '../input/core';
import {
  createInteractionSlice,
  createInteractionSliceWithServices,
} from '../interactions/stores/slices';
import { createWorldInteractions } from '../interactions/stores/worldInteractions';
import { createWorldSlice } from '../world/stores/slices/worldStates/slice';

/** Redux devtools serializes THREE-heavy state on every update; opt in with `globalThis.__GAESUP_DEVTOOLS__ = true`. */
const isDevtoolsEnabled = () => (globalThis as { __GAESUP_DEVTOOLS__?: boolean }).__GAESUP_DEVTOOLS__ === true;

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
      { name: 'gaesup-world', enabled: isDevtoolsEnabled() },
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
const GaesupStoreContext = createContext<GaesupStore | null>(null);
export const GaesupStoreProvider = GaesupStoreContext.Provider;

/** React reads the nearest world; static methods retain the legacy default store. */
export const { useStore: useGaesupStore, useStoreApi: useGaesupStoreApi } = lazyScopedStore(
  'useGaesupStore', () => buildGaesupStore(), () => useContext(GaesupStoreContext),
);
