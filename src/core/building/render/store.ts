import { create, useStore } from 'zustand';


import { createEmptyRenderSnapshot, type BuildingRenderSnapshot } from './core';
import { createEmptyBuildingIndirectDrawMirror, type BuildingIndirectDrawMirror } from './draw';
import { createEmptyGpuMirror, type BuildingGpuBufferMirror } from './gpu';
import {
  createEmptyBuildingGpuUploadResources,
  destroyBuildingGpuUploadResources,
  type BuildingGpuUploadResources,
} from './upload';
import { useGaesupRuntime } from '../../runtime/runtimeContext';

type BuildingGpuUploadResourcesUpdate =
  | BuildingGpuUploadResources
  | ((previous: BuildingGpuUploadResources) => BuildingGpuUploadResources);

type BuildingRenderState = {
  snapshot: BuildingRenderSnapshot;
  gpuMirror: BuildingGpuBufferMirror;
  uploadResources: BuildingGpuUploadResources;
  drawMirror: BuildingIndirectDrawMirror;
  setSnapshot: (snapshot: BuildingRenderSnapshot) => void;
  setGpuMirror: (gpuMirror: BuildingGpuBufferMirror) => void;
  setUploadResources: (update: BuildingGpuUploadResourcesUpdate) => void;
  releaseUploadResources: () => void;
  setDrawMirror: (drawMirror: BuildingIndirectDrawMirror) => void;
  reset: () => void;
};


export function createBuildingRenderStore() {
  const EMPTY = createEmptyRenderSnapshot();
  const EMPTY_GPU = createEmptyGpuMirror();
  const EMPTY_DRAW = createEmptyBuildingIndirectDrawMirror();
  return create<BuildingRenderState>((set) => {
  let isApplyingUploadResourcesUpdate = false;

  const assertUploadResourcesUpdateIsNotReentrant = () => {
    if (isApplyingUploadResourcesUpdate) {
      throw new Error('Building GPU upload resource updates cannot be reentrant.');
    }
  };

  return {
    snapshot: EMPTY,
    gpuMirror: EMPTY_GPU,
    uploadResources: createEmptyBuildingGpuUploadResources(),
    drawMirror: EMPTY_DRAW,
    setSnapshot: (snapshot) => set({ snapshot }),
    setGpuMirror: (gpuMirror) => set({ gpuMirror }),
    setUploadResources: (update) =>
      set((state) => {
        assertUploadResourcesUpdateIsNotReentrant();
        isApplyingUploadResourcesUpdate = true;
        try {
          return {
            uploadResources: typeof update === 'function' ? update(state.uploadResources) : update,
          };
        } finally {
          isApplyingUploadResourcesUpdate = false;
        }
      }),
    releaseUploadResources: () => {
      assertUploadResourcesUpdateIsNotReentrant();
      let detachedResources = createEmptyBuildingGpuUploadResources();
      try {
        set((state) => {
          detachedResources = state.uploadResources;
          return { uploadResources: createEmptyBuildingGpuUploadResources() };
        });
      } finally {
        destroyBuildingGpuUploadResources(detachedResources);
      }
    },
    setDrawMirror: (drawMirror) => set({ drawMirror }),
    reset: () => {
      assertUploadResourcesUpdateIsNotReentrant();
      let detachedResources = createEmptyBuildingGpuUploadResources();
      try {
        set((state) => {
          detachedResources = state.uploadResources;
          return {
            snapshot: EMPTY,
            gpuMirror: EMPTY_GPU,
            uploadResources: createEmptyBuildingGpuUploadResources(),
            drawMirror: EMPTY_DRAW,
          };
        });
      } finally {
        destroyBuildingGpuUploadResources(detachedResources);
      }
    },
  };
});

}

export type BuildingRenderStore = ReturnType<typeof createBuildingRenderStore>;
const legacyStore = createBuildingRenderStore();
export function useBuildingRenderStateStoreApi(): BuildingRenderStore {
  return useGaesupRuntime()?.buildingRenderStore ?? useBuildingRenderStateStore;
}
function useScopedStore(): BuildingRenderState;
function useScopedStore<T>(selector: (state: BuildingRenderState) => T): T;
function useScopedStore(selector: (state: BuildingRenderState) => unknown = state => state) {
  return useStore(useBuildingRenderStateStoreApi(), selector);
}
/** React uses the nearest runtime; static methods retain the legacy default. */
export const useBuildingRenderStateStore = Object.assign(useScopedStore, legacyStore);
