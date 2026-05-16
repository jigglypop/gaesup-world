import { type BuildingRenderSnapshot } from './core';
import { type BuildingIndirectDrawMirror } from './draw';
import { type BuildingGpuBufferMirror } from './gpu';
import { type BuildingGpuUploadResources } from './upload';
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
export declare const useBuildingRenderStateStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BuildingRenderState>>;
export {};
