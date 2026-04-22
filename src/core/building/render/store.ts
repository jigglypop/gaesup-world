import { create } from 'zustand';

import { createEmptyRenderSnapshot, type BuildingRenderSnapshot } from './core';
import { createEmptyGpuMirror, type BuildingGpuBufferMirror } from './gpu';
import { createEmptyBuildingGpuUploadResources, type BuildingGpuUploadResources } from './upload';

type BuildingRenderState = {
  snapshot: BuildingRenderSnapshot;
  gpuMirror: BuildingGpuBufferMirror;
  uploadResources: BuildingGpuUploadResources;
  setSnapshot: (snapshot: BuildingRenderSnapshot) => void;
  setGpuMirror: (gpuMirror: BuildingGpuBufferMirror) => void;
  setUploadResources: (uploadResources: BuildingGpuUploadResources) => void;
  reset: () => void;
};

const EMPTY = createEmptyRenderSnapshot();
const EMPTY_GPU = createEmptyGpuMirror();
const EMPTY_UPLOAD = createEmptyBuildingGpuUploadResources();

export const useBuildingRenderStateStore = create<BuildingRenderState>((set) => ({
  snapshot: EMPTY,
  gpuMirror: EMPTY_GPU,
  uploadResources: EMPTY_UPLOAD,
  setSnapshot: (snapshot) => set({ snapshot }),
  setGpuMirror: (gpuMirror) => set({ gpuMirror }),
  setUploadResources: (uploadResources) => set({ uploadResources }),
  reset: () => set({ snapshot: EMPTY, gpuMirror: EMPTY_GPU, uploadResources: EMPTY_UPLOAD }),
}));
