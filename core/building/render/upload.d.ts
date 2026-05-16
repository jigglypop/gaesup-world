import { type BuildingIndirectDrawMirror } from './draw';
import { type BuildingGpuBufferMirror } from './gpu';
export type GpuQueueLike = {
    writeBuffer: (buffer: GpuBufferLike, bufferOffset: number, data: BufferSource) => void;
};
export type GpuBufferLike = {
    destroy?: () => void;
};
export type GpuDeviceLike = {
    createBuffer: (descriptor: {
        label?: string;
        size: number;
        usage: number;
    }) => GpuBufferLike;
    queue: GpuQueueLike;
};
export type BuildingGpuUploadResources = {
    backend: 'none' | 'webgpu';
    uploadedVersion: number;
    spatialBuffer: GpuBufferLike | null;
    metaBuffer: GpuBufferLike | null;
    indirectArgsBuffer: GpuBufferLike | null;
    spatialBytes: number;
    metaBytes: number;
    indirectArgsBytes: number;
};
export declare function createEmptyBuildingGpuUploadResources(): BuildingGpuUploadResources;
export declare function getWebGPUDeviceFromRenderer(renderer: object | null | undefined): GpuDeviceLike | null;
export declare function destroyBuildingGpuUploadResources(resources: BuildingGpuUploadResources): void;
export declare function syncBuildingGpuBuffers(device: GpuDeviceLike, previous: BuildingGpuUploadResources, mirror: BuildingGpuBufferMirror): BuildingGpuUploadResources;
export declare function syncBuildingIndirectArgsBuffer(device: GpuDeviceLike, previous: BuildingGpuUploadResources, mirror: BuildingIndirectDrawMirror): BuildingGpuUploadResources;
