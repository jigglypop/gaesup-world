import * as THREE from 'three';
import type { GaesupCoreWasmExports } from '@core/wasm/loader';
/**
 * Per-tile grass record consumed by the manager. Tiles register on
 * mount and unregister on unmount. The manager owns one camera/weather
 * read per frame and pushes derived values back into each tile via the
 * supplied callbacks, so adding more tiles costs O(N) cheap updates
 * instead of N independent React-Three-Fiber `useFrame` subscriptions.
 */
export type GrassTileHandle = {
    id: number;
    /** Local tile width in world units (square). */
    width: number;
    /** Tile height envelope used for bounding sphere/frustum culling. */
    height: number;
    /** World-space center of the tile in XZ. */
    center: THREE.Vector3;
    /** Maximum instance count this tile can ever render. */
    maxInstances: number;
    /** Optional LOD curve (matches old per-tile lod prop). */
    lod?: {
        near?: number;
        far?: number;
        strength?: number;
    };
    /**
     * Called once per management tick with the new render state. Tiles
     * skip uniform writes when nothing changed.
     */
    apply: (state: GrassTileRenderState) => void;
};
export type GrassTileRenderState = {
    /** True when the tile should be rendered at all this frame. */
    visible: boolean;
    /** Effective instance count after LOD + perf clamp. */
    instanceCount: number;
    /** Animation time (seconds, scaled). */
    time: number;
    /** Wind multiplier blended from current weather. */
    windScale: number;
    /** XZ trample center expressed in world-space. */
    trampleCenter: THREE.Vector3;
    /** Trample strength target (0..1). */
    trampleStrength: number;
};
export declare function setGrassManagerWasm(w: GaesupCoreWasmExports | null): void;
declare class GrassManager {
    private nextId;
    private tiles;
    private positions;
    private weights;
    private trampleWorld;
    private trampleStrength;
    private lastSampleAt;
    register(handle: Omit<GrassTileHandle, 'id'>): GrassTileHandle;
    update(id: number, patch: Partial<Omit<GrassTileHandle, 'id' | 'apply'>>): void;
    unregister(id: number): void;
    size(): number;
    /**
     * Run one management tick. Cheap to call from a single shared
     * `useFrame` that lives at the top of the scene; safe to call from
     * each individual tile if no shared driver is mounted (the manager
     * dedupes by tracking `lastSampleAt`).
     */
    tick(args: {
        elapsedTime: number;
        delta: number;
        cameraPosition: THREE.Vector3;
        frustum: THREE.Frustum;
    }): void;
    private ensureCapacity;
    private computeWeights;
    private refreshTrample;
    private computeWindScale;
}
export declare function getGrassManager(): GrassManager;
export type GrassManagerType = GrassManager;
export {};
