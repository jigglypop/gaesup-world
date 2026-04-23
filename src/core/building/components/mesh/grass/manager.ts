import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';
import type { MotionBridge } from '@core/motions/bridge/MotionBridge';
import { useWeatherStore } from '@core/weather/stores/weatherStore';
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
  lod?: { near?: number; far?: number; strength?: number };
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

let _wasm: GaesupCoreWasmExports | null = null;
export function setGrassManagerWasm(w: GaesupCoreWasmExports | null): void {
  _wasm = w;
}

class GrassManager {
  private nextId = 1;
  private tiles = new Map<number, GrassTileHandle>();

  // Reusable scratch buffers — never grow beyond the largest registered batch.
  private positions = new Float32Array(0);
  private weights = new Float32Array(0);

  private trampleWorld = new THREE.Vector3(0, -9999, 0);
  private trampleStrength = 0.0;

  private lastSampleAt = 0;

  register(handle: Omit<GrassTileHandle, 'id'>): GrassTileHandle {
    if (this.tiles.size === 0) {
      this.lastSampleAt = 0;
    }
    const id = this.nextId++;
    const tile: GrassTileHandle = { ...handle, id };
    this.tiles.set(id, tile);
    this.ensureCapacity(this.tiles.size);
    return tile;
  }

  update(id: number, patch: Partial<Omit<GrassTileHandle, 'id' | 'apply'>>): void {
    const tile = this.tiles.get(id);
    if (!tile) return;
    Object.assign(tile, patch);
  }

  unregister(id: number): void {
    this.tiles.delete(id);
    if (this.tiles.size === 0) {
      this.lastSampleAt = 0;
    }
  }

  size(): number {
    return this.tiles.size;
  }

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
  }): void {
    if (this.tiles.size === 0) return;
    const now = performance.now();
    if (now - this.lastSampleAt < 12) return; // cap at ~80Hz to avoid burning
    this.lastSampleAt = now;

    this.refreshTrample(args.delta);

    const wind = this.computeWindScale();
    const time = args.elapsedTime / 4;

    this.ensureCapacity(this.tiles.size);
    let i = 0;
    const sortedIds: number[] = [];
    for (const tile of this.tiles.values()) {
      const oi = i * 3;
      this.positions[oi] = tile.center.x;
      this.positions[oi + 1] = tile.center.y;
      this.positions[oi + 2] = tile.center.z;
      sortedIds.push(tile.id);
      i += 1;
    }

    this.computeWeights(sortedIds.length, args.cameraPosition);

    let idx = 0;
    for (const id of sortedIds) {
      const tile = this.tiles.get(id);
      if (!tile) { idx += 1; continue; }

      const weight = this.weights[idx] ?? 0;
      idx += 1;

      // Frustum cull using a sphere whose radius matches the tile's
      // diagonal. Cheaper than per-blade culling and correct for tiles
      // placed far apart.
      const radius = Math.hypot(tile.width, tile.height) * 0.6;
      const sphere = SPHERE_SCRATCH.set(tile.center, radius);
      const inFrustum = args.frustum.intersectsSphere(sphere);

      const target = Math.max(0, Math.floor(tile.maxInstances * weight));
      const visible = inFrustum && target > 0;

      tile.apply({
        visible,
        instanceCount: visible ? target : 0,
        time,
        windScale: wind,
        trampleCenter: this.trampleWorld,
        trampleStrength: this.trampleStrength,
      });
    }
  }

  private ensureCapacity(count: number): void {
    if (this.positions.length < count * 3) {
      this.positions = new Float32Array(count * 3);
    }
    if (this.weights.length < count) {
      this.weights = new Float32Array(count);
    }
  }

  private computeWeights(count: number, camera: THREE.Vector3): void {
    const wasm = _wasm;
    // Use the global LOD curve as a default so isolated tiles still
    // benefit from culling. Per-tile lod overrides are applied at the
    // tile site by re-clamping `weight * tile.maxInstances`.
    const near = 24;
    const far = 160;
    const strength = 4;

    if (wasm) {
      try {
        const inPtr = wasm.alloc_f32(count * 3);
        const outPtr = wasm.alloc_f32(count);
        try {
          new Float32Array(wasm.memory.buffer, inPtr, count * 3).set(this.positions.subarray(0, count * 3));
          wasm.batch_sfe_weights(count, inPtr, camera.x, camera.y, camera.z, near, far, strength, outPtr);
          this.weights.set(new Float32Array(wasm.memory.buffer, outPtr, count));
        } finally {
          wasm.dealloc_f32(inPtr, count * 3);
          wasm.dealloc_f32(outPtr, count);
        }
        return;
      } catch {
        // fall through to the JS path on wasm hiccups
      }
    }

    for (let i = 0; i < count; i += 1) {
      const oi = i * 3;
      const dx = (this.positions[oi] ?? 0) - camera.x;
      const dy = (this.positions[oi + 1] ?? 0) - camera.y;
      const dz = (this.positions[oi + 2] ?? 0) - camera.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      this.weights[i] = jsWeight(dist, near, far, strength);
    }
  }

  private refreshTrample(delta: number): void {
    const bridge = BridgeFactory.getOrCreate('motion') as MotionBridge | null;
    const ids = bridge?.getActiveEntities() ?? [];
    const snap = ids[0] ? bridge?.snapshot(ids[0]) : null;
    const lerp = THREE.MathUtils.clamp(delta * 6, 0, 1);
    if (snap) {
      this.trampleWorld.x += (snap.position.x - this.trampleWorld.x) * lerp;
      this.trampleWorld.y = snap.position.y;
      this.trampleWorld.z += (snap.position.z - this.trampleWorld.z) * lerp;
    }
    const desired = snap?.isMoving && snap?.isGrounded ? 0.85 : 0.35;
    this.trampleStrength += (desired - this.trampleStrength) * lerp;
  }

  private computeWindScale(): number {
    const w = useWeatherStore.getState().current;
    const intensity = w?.intensity ?? 0;
    const base =
      w?.kind === 'storm'  ? 2.6 :
      w?.kind === 'rain'   ? 1.7 :
      w?.kind === 'snow'   ? 1.3 :
      w?.kind === 'cloudy' ? 1.15 :
                             0.85;
    return base + intensity * 0.9;
  }
}

const SPHERE_SCRATCH = new THREE.Sphere();

function jsWeight(dist: number, near: number, far: number, strength: number): number {
  if (dist <= near) return 1;
  if (dist >= far) return 0;
  const t = (dist - near) / (far - near);
  return Math.pow(1 - t, Math.max(1, strength));
}

let _instance: GrassManager | null = null;
export function getGrassManager(): GrassManager {
  if (!_instance) _instance = new GrassManager();
  return _instance;
}

export type GrassManagerType = GrassManager;
