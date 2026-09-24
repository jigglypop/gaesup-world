import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';
import { MotionBridge } from '@core/motions/bridge/MotionBridge';
import { logger } from '@core/utils/logger';
import type { GaesupCoreWasmExports } from '@core/wasm/loader';
import { useWeatherStore } from '@core/weather/stores/weatherStore';
import type { WeatherEntry } from '@core/weather/types';

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

export type GrassManagerSources = {
  weather: () => WeatherEntry | null;
  trample: () => { position: { x: number; y: number; z: number }; isMoving: boolean; isGrounded: boolean } | null;
};

const legacySources: GrassManagerSources = {
  weather: () => useWeatherStore.getState().current,
  trample: () => {
    const bridge = BridgeFactory.getOrCreateFor(MotionBridge);
    const id = bridge?.getPlayerEntityId();
    return id ? bridge?.snapshot(id) ?? null : null;
  },
};

export class GrassManager {
  constructor(private readonly sources: GrassManagerSources = legacySources) {}
  private nextId = 1;
  private tiles = new Map<number, GrassTileHandle>();
  private orderedTiles: GrassTileHandle[] = [];
  private orderDirty = true;
  private enabled = true;
  private sphere = new THREE.Sphere();

  // Geometric growth amortizes edits; buffers are released at zero owners or suspension.
  private positions = new Float32Array(0);
  private weights = new Float32Array(0);

  private trampleWorld = new THREE.Vector3(0, -9999, 0);
  private trampleStrength = 0.0;
  private hasTrample = false;

  private lastElapsedTime: number | undefined;
  private lastCameraPosition = new THREE.Vector3();
  private lastFrustum = new THREE.Frustum();
  private wasmBuffers: { module: GaesupCoreWasmExports; input: number; output: number; capacity: number } | undefined;

  suspend(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.lastElapsedTime = undefined;
    this.releaseBuffers();
    this.positions = new Float32Array(0); this.weights = new Float32Array(0);
    this.trampleWorld.set(0, -9999, 0); this.trampleStrength = 0; this.hasTrample = false;
    for (const tile of this.tiles.values()) this.hide(tile);
  }

  resume(): void { this.enabled = true; this.lastElapsedTime = undefined; }
  isEnabled(): boolean { return this.enabled; }

  dispose(): void {
    this.suspend(); this.tiles.clear(); this.orderedTiles = []; this.orderDirty = true;
  }

  private hide(tile: GrassTileHandle): void {
    this.apply(tile, { visible: false, instanceCount: 0, time: 0, windScale: 0.85, trampleCenter: this.trampleWorld, trampleStrength: 0 });
  }

  private apply(tile: GrassTileHandle, state: GrassTileRenderState): void {
    try { tile.apply(state); }
    catch (error) { logger.error('Grass tile update failed', { id: tile.id, error }); }
  }

  register(handle: Omit<GrassTileHandle, 'id'>): GrassTileHandle {
    if (this.tiles.size === 0) {
      this.lastElapsedTime = undefined;
    }
    const id = this.nextId++;
    const tile: GrassTileHandle = { ...handle, id };
    this.tiles.set(id, tile);
    this.orderDirty = true;
    if (!this.enabled) this.hide(tile);
    return tile;
  }

  update(id: number, patch: Partial<Omit<GrassTileHandle, 'id' | 'apply'>>): void {
    const tile = this.tiles.get(id);
    if (!tile) return;
    Object.assign(tile, patch);
  }

  unregister(id: number): void {
    if (!this.tiles.delete(id)) return;
    this.orderDirty = true;
    if (this.tiles.size === 0) {
      this.lastElapsedTime = undefined;
      this.orderedTiles = [];
      this.positions = new Float32Array(0); this.weights = new Float32Array(0);
      this.releaseBuffers();
    }
  }

  size(): number {
    return this.tiles.size;
  }

  /**
   * Run one management tick. Cheap to call from a single shared
   * `useFrame` that lives at the top of the scene; safe to call from
   * multiple drivers: elapsedTime identifies a render frame. Wall-clock
   * throttling would skip valid high-refresh or manually advanced frames.
   */
  tick(args: {
    elapsedTime: number;
    delta: number;
    cameraPosition: THREE.Vector3;
    frustum: THREE.Frustum;
  }): void {
    if (!this.enabled || this.tiles.size === 0) return;
    if (this.lastElapsedTime === args.elapsedTime && this.lastCameraPosition.equals(args.cameraPosition)
      && this.lastFrustum.planes.every((plane, index) => plane.equals(args.frustum.planes[index]!))) return;
    this.lastElapsedTime = args.elapsedTime;
    this.lastCameraPosition.copy(args.cameraPosition); this.lastFrustum.copy(args.frustum);

    this.refreshTrample(args.delta);

    const wind = this.computeWindScale();
    const time = args.elapsedTime / 4;

    this.ensureCapacity(this.tiles.size);
    let i = 0;
    if (this.orderDirty) { this.orderedTiles = [...this.tiles.values()]; this.orderDirty = false; }
    const batch = this.orderedTiles;
    for (const tile of batch) {
      const oi = i * 3;
      this.positions[oi] = tile.center.x;
      this.positions[oi + 1] = tile.center.y;
      this.positions[oi + 2] = tile.center.z;
      i += 1;
    }

    this.computeWeights(batch.length, args.cameraPosition);

    let idx = 0;
    for (const tile of batch) {
      if (!this.enabled) break;
      if (!this.tiles.has(tile.id)) { idx += 1; continue; }

      let weight = this.weights[idx] ?? 0;
      idx += 1;

      // Frustum cull using a sphere whose radius matches the tile's
      // diagonal. Cheaper than per-blade culling and correct for tiles
      // placed far apart.
      const radius = Math.hypot(tile.width, tile.width, tile.height) * 0.5;
      const sphere = this.sphere.set(tile.center, radius);
      const inFrustum = args.frustum.intersectsSphere(sphere);
      if (tile.lod) {
        const dist = tile.center.distanceTo(args.cameraPosition);
        weight = jsWeight(
          dist,
          tile.lod.near ?? 24,
          tile.lod.far ?? 160,
          tile.lod.strength ?? 4,
        );
      }

      const target = Math.max(0, Math.floor(tile.maxInstances * weight));
      const visible = inFrustum && target > 0;

      this.apply(tile, {
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
      const capacity = Math.max(count, this.weights.length * 2, 8);
      this.positions = new Float32Array(capacity * 3);
      this.weights = new Float32Array(capacity);
    }
  }

  private releaseBuffers(): void {
    const buffers = this.wasmBuffers; this.wasmBuffers = undefined;
    if (!buffers) return;
    try { buffers.module.dealloc_f32(buffers.input, buffers.capacity * 3); }
    finally { buffers.module.dealloc_f32(buffers.output, buffers.capacity); }
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
        if (this.wasmBuffers?.module !== wasm || this.wasmBuffers.capacity < count) {
          this.releaseBuffers();
          const capacity = this.weights.length;
          const input = wasm.alloc_f32(capacity * 3);
          try { this.wasmBuffers = { module: wasm, input, output: wasm.alloc_f32(capacity), capacity }; }
          catch (error) { wasm.dealloc_f32(input, capacity * 3); throw error; }
        }
        const { input, output } = this.wasmBuffers;
        new Float32Array(wasm.memory.buffer, input, count * 3).set(this.positions.subarray(0, count * 3));
        wasm.batch_sfe_weights(count, input, camera.x, camera.y, camera.z, near, far, strength, output);
        this.weights.set(new Float32Array(wasm.memory.buffer, output, count));
        return;
      } catch {
        this.releaseBuffers();
        // fall through to the JS path on wasm hiccups
      }
    } else this.releaseBuffers();

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
    const snap = this.sources.trample();
    const lerp = 1 - Math.exp(-Math.max(0, delta) * 6);
    if (snap) {
      if (!this.hasTrample) this.trampleWorld.set(snap.position.x, snap.position.y, snap.position.z);
      this.hasTrample = true;
      this.trampleWorld.x += (snap.position.x - this.trampleWorld.x) * lerp;
      this.trampleWorld.y = snap.position.y;
      this.trampleWorld.z += (snap.position.z - this.trampleWorld.z) * lerp;
    }
    const desired = snap?.isMoving && snap?.isGrounded ? 0.85 : 0.35;
    this.trampleStrength += (desired - this.trampleStrength) * lerp;
  }

  private computeWindScale(): number {
    const w = this.sources.weather();
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

function jsWeight(dist: number, near: number, far: number, strength: number): number {
  if (dist <= near) return 1;
  if (dist >= far) return 0;
  const t = (dist - near) / (far - near);
  return Math.pow(1 - t, Math.max(1, strength));
}

let _instance: GrassManager | null = null;
export function createGrassManager(sources?: GrassManagerSources): GrassManager { return new GrassManager(sources); }
export function getGrassManager(): GrassManager {
  if (!_instance) _instance = new GrassManager();
  return _instance;
}

export type GrassManagerType = GrassManager;
