import { create } from 'zustand';

import { createEmptyRenderSnapshot, type BuildingRenderSnapshot } from './core';
import { createEmptyBuildingIndirectDrawMirror, type BuildingIndirectDrawMirror } from './draw';
import { createEmptyGpuMirror, type BuildingGpuBufferMirror } from './gpu';
import { createEmptyBuildingGpuUploadResources, type BuildingGpuUploadResources } from './upload';

type BuildingRenderState = {
  snapshot: BuildingRenderSnapshot;
  gpuMirror: BuildingGpuBufferMirror;
  uploadResources: BuildingGpuUploadResources;
  drawMirror: BuildingIndirectDrawMirror;
  setSnapshot: (snapshot: BuildingRenderSnapshot) => void;
  setGpuMirror: (gpuMirror: BuildingGpuBufferMirror) => void;
  setUploadResources: (uploadResources: BuildingGpuUploadResources) => void;
  setDrawMirror: (drawMirror: BuildingIndirectDrawMirror) => void;
  reset: () => void;
};

const EMPTY = createEmptyRenderSnapshot();
const EMPTY_GPU = createEmptyGpuMirror();
const EMPTY_UPLOAD = createEmptyBuildingGpuUploadResources();
const EMPTY_DRAW = createEmptyBuildingIndirectDrawMirror();

export const useBuildingRenderStateStore = create<BuildingRenderState>((set) => ({
  snapshot: EMPTY,
  gpuMirror: EMPTY_GPU,
  uploadResources: EMPTY_UPLOAD,
  drawMirror: EMPTY_DRAW,
  setSnapshot: (snapshot) => set({ snapshot }),
  setGpuMirror: (gpuMirror) => set({ gpuMirror }),
  setUploadResources: (uploadResources) => set({ uploadResources }),
  setDrawMirror: (drawMirror) => set({ drawMirror }),
  reset: () => set({ snapshot: EMPTY, gpuMirror: EMPTY_GPU, uploadResources: EMPTY_UPLOAD, drawMirror: EMPTY_DRAW }),
}));
