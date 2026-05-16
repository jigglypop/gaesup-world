import type { BuildingRenderSnapshot } from './core';
export declare const GPU_SPATIAL_STRIDE = 4;
export declare const GPU_META_STRIDE = 5;
export type DirtyRange = {
    start: number;
    end: number;
};
export type BuildingGpuBufferMirror = {
    version: number;
    count: number;
    spatial: Float32Array;
    meta: Int32Array;
    spatialDirty: DirtyRange[];
    metaDirty: DirtyRange[];
};
export type GpuUploadSlice = {
    byteOffset: number;
    elementOffset: number;
    elementCount: number;
    data: Float32Array | Int32Array;
};
export type BuildingGpuUploadPlan = {
    version: number;
    count: number;
    spatial: GpuUploadSlice[];
    meta: GpuUploadSlice[];
};
export declare function createEmptyGpuMirror(): BuildingGpuBufferMirror;
export declare function buildBuildingGpuMirror(snapshot: BuildingRenderSnapshot, previous: BuildingGpuBufferMirror | null): BuildingGpuBufferMirror;
export declare function createBuildingGpuUploadPlan(mirror: BuildingGpuBufferMirror): BuildingGpuUploadPlan;
