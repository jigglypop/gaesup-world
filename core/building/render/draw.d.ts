export { DRAW_CLUSTER_BILLBOARD, DRAW_CLUSTER_BLOCK, DRAW_CLUSTER_COUNT, DRAW_CLUSTER_FIRE, DRAW_CLUSTER_FLAG, DRAW_CLUSTER_GRASS, DRAW_CLUSTER_MODEL, DRAW_CLUSTER_SAKURA, DRAW_CLUSTER_SAND, DRAW_CLUSTER_SNOWFIELD, DRAW_CLUSTER_TILE, DRAW_CLUSTER_WALL, DRAW_CLUSTER_WATER, } from './culling';
export declare const INDIRECT_DRAW_STRIDE = 4;
export type BuildingIndirectDrawMirror = {
    version: number;
    args: Uint32Array;
    dirtyRanges: Array<{
        start: number;
        end: number;
    }>;
};
export type BuildingIndirectDrawUploadPlan = {
    version: number;
    slices: Array<{
        byteOffset: number;
        elementOffset: number;
        elementCount: number;
        data: Uint32Array;
    }>;
};
export declare function getIndirectInstanceCount(mirror: BuildingIndirectDrawMirror, clusterId: number): number;
export type DrawClusterDescriptor = {
    id: number;
    label: string;
    vertexCountHint: number;
};
export declare const DRAW_CLUSTER_DESCRIPTORS: DrawClusterDescriptor[];
export declare function createEmptyBuildingIndirectDrawMirror(): BuildingIndirectDrawMirror;
export declare function buildBuildingIndirectDrawMirror(version: number, clusterCounts: Uint32Array, previous: BuildingIndirectDrawMirror | null): BuildingIndirectDrawMirror;
export declare function createBuildingIndirectDrawUploadPlan(mirror: BuildingIndirectDrawMirror): BuildingIndirectDrawUploadPlan;
