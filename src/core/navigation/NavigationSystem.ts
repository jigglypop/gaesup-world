import * as THREE from 'three';

import { GaesupCoreWasmExports, loadCoreWasm } from '../wasm/loader';

export interface NavigationConfig {
  cellSize: number;
  worldMinX: number;
  worldMinZ: number;
  worldMaxX: number;
  worldMaxZ: number;
}

export type Waypoint = [number, number, number];

const DEFAULT_CONFIG: NavigationConfig = {
  cellSize: 2,
  worldMinX: -200,
  worldMinZ: -200,
  worldMaxX: 200,
  worldMaxZ: 200,
};

export class NavigationSystem {
  private static instance: NavigationSystem | null = null;

  private config: NavigationConfig;
  private gridWidth: number;
  private gridHeight: number;
  private grid: Uint8Array;
  private costGrid: Uint8Array;
  private wasm: GaesupCoreWasmExports | null = null;
  private ready = false;

  private gridPtr = 0;
  private outPathPtr = 0;
  private readonly outCapacity = 512;

  private constructor(config: Partial<NavigationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const { cellSize, worldMinX, worldMinZ, worldMaxX, worldMaxZ } = this.config;

    this.gridWidth = Math.ceil((worldMaxX - worldMinX) / cellSize);
    this.gridHeight = Math.ceil((worldMaxZ - worldMinZ) / cellSize);

    const total = this.gridWidth * this.gridHeight;
    this.grid = new Uint8Array(total).fill(1);
    this.costGrid = new Uint8Array(total).fill(1);
  }

  static getInstance(config?: Partial<NavigationConfig>): NavigationSystem {
    if (!NavigationSystem.instance) {
      NavigationSystem.instance = new NavigationSystem(config);
    }
    return NavigationSystem.instance;
  }

  async init(): Promise<boolean> {
    if (this.ready) return true;

    this.wasm = await loadCoreWasm();
    if (this.wasm && typeof this.wasm.astar_find_path === 'function') {
      const total = this.gridWidth * this.gridHeight;
      this.gridPtr = this.wasm.alloc_u8(total);
      this.outPathPtr = this.wasm.alloc_u32(this.outCapacity * 2);
      this.syncGridToWasm();
    } else {
      this.wasm = null;
    }

    this.ready = true;
    return true;
  }

  private syncGridToWasm(): void {
    if (!this.wasm) return;
    const view = new Uint8Array(
      this.wasm.memory.buffer,
      this.gridPtr,
      this.gridWidth * this.gridHeight,
    );
    view.set(this.grid);
  }

  private syncCostGridToWasm(): void {
    if (!this.wasm) return;
    const view = new Uint8Array(
      this.wasm.memory.buffer,
      this.gridPtr,
      this.gridWidth * this.gridHeight,
    );
    view.set(this.costGrid);
  }

  worldToGrid(worldX: number, worldZ: number): [number, number] {
    const { cellSize, worldMinX, worldMinZ } = this.config;
    const gx = Math.floor((worldX - worldMinX) / cellSize);
    const gz = Math.floor((worldZ - worldMinZ) / cellSize);
    return [
      Math.max(0, Math.min(gx, this.gridWidth - 1)),
      Math.max(0, Math.min(gz, this.gridHeight - 1)),
    ];
  }

  gridToWorld(gx: number, gz: number, y: number = 0): Waypoint {
    const { cellSize, worldMinX, worldMinZ } = this.config;
    return [
      worldMinX + (gx + 0.5) * cellSize,
      y,
      worldMinZ + (gz + 0.5) * cellSize,
    ];
  }

  setBlocked(worldX: number, worldZ: number, width: number, depth: number): void {
    this.setRegion(worldX, worldZ, width, depth, 0);
  }

  setWalkable(worldX: number, worldZ: number, width: number, depth: number): void {
    this.setRegion(worldX, worldZ, width, depth, 1);
  }

  private setRegion(
    worldX: number, worldZ: number,
    width: number, depth: number,
    value: number,
  ): void {
    const { cellSize, worldMinX, worldMinZ } = this.config;
    const halfW = width / 2;
    const halfD = depth / 2;
    const startGX = Math.floor((worldX - halfW - worldMinX) / cellSize);
    const startGZ = Math.floor((worldZ - halfD - worldMinZ) / cellSize);
    const endGX = Math.ceil((worldX + halfW - worldMinX) / cellSize);
    const endGZ = Math.ceil((worldZ + halfD - worldMinZ) / cellSize);

    for (let gz = startGZ; gz < endGZ; gz++) {
      for (let gx = startGX; gx < endGX; gx++) {
        if (gx >= 0 && gx < this.gridWidth && gz >= 0 && gz < this.gridHeight) {
          const idx = gz * this.gridWidth + gx;
          this.grid[idx] = value;
          this.costGrid[idx] = value;
        }
      }
    }
  }

  setCost(worldX: number, worldZ: number, cost: number): void {
    const [gx, gz] = this.worldToGrid(worldX, worldZ);
    const idx = gz * this.gridWidth + gx;
    const clamped = Math.max(0, Math.min(255, Math.round(cost)));
    this.costGrid[idx] = clamped;
    if (clamped === 0) this.grid[idx] = 0;
  }

  setBlockedFromBox(box: THREE.Box3): void {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    this.setBlocked(center.x, center.z, size.x, size.z);
  }

  findPath(
    startX: number, startZ: number,
    goalX: number, goalZ: number,
    y: number = 0,
    weighted: boolean = false,
  ): Waypoint[] {
    if (!this.ready) return [];

    const [sx, sz] = this.worldToGrid(startX, startZ);
    const [gx, gz] = this.worldToGrid(goalX, goalZ);

    if (this.wasm) {
      return this.findPathWasm(sx, sz, gx, gz, y, weighted);
    }
    return this.findPathJS(sx, sz, gx, gz, y);
  }

  private findPathWasm(
    sx: number, sz: number,
    gx: number, gz: number,
    y: number,
    weighted: boolean,
  ): Waypoint[] {
    const wasm = this.wasm!;

    if (weighted) {
      this.syncCostGridToWasm();
    } else {
      this.syncGridToWasm();
    }

    const fn = weighted ? wasm.astar_find_path_weighted : wasm.astar_find_path;
    const pathLen = fn(
      this.gridPtr, this.gridWidth, this.gridHeight,
      sx, sz, gx, gz,
      this.outPathPtr, this.outCapacity,
    );

    if (pathLen === 0) return [];

    const raw = new Uint32Array(wasm.memory.buffer, this.outPathPtr, pathLen * 2);
    const waypoints: Waypoint[] = [];
    for (let i = 0; i < pathLen; i++) {
      waypoints.push(this.gridToWorld(raw[i * 2], raw[i * 2 + 1], y));
    }
    return waypoints;
  }

  private findPathJS(
    sx: number, sz: number,
    gx: number, gz: number,
    y: number,
  ): Waypoint[] {
    const w = this.gridWidth;
    const h = this.gridHeight;
    const grid = this.grid;
    const total = w * h;

    const startIdx = sz * w + sx;
    const goalIdx = gz * w + gx;

    if (grid[startIdx] === 0 || grid[goalIdx] === 0) return [];
    if (startIdx === goalIdx) return [this.gridToWorld(gx, gz, y)];

    const gScore = new Uint32Array(total).fill(0xFFFFFFFF);
    const cameFrom = new Uint32Array(total).fill(0xFFFFFFFF);
    const closed = new Uint8Array(total);
    gScore[startIdx] = 0;

    const open: { f: number; idx: number }[] = [
      { f: this.octileH(sx, sz, gx, gz), idx: startIdx },
    ];

    const dirs = [
      [1, 0, 10], [-1, 0, 10], [0, 1, 10], [0, -1, 10],
      [1, 1, 14], [1, -1, 14], [-1, 1, 14], [-1, -1, 14],
    ];

    while (open.length > 0) {
      let minPos = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[minPos].f) minPos = i;
      }
      const current = open[minPos];
      open[minPos] = open[open.length - 1];
      open.pop();

      const ci = current.idx;
      if (ci === goalIdx) break;
      if (closed[ci]) continue;
      closed[ci] = 1;

      const cx = ci % w;
      const cz = (ci / w) | 0;
      const cg = gScore[ci];

      for (const [dx, dz, cost] of dirs) {
        const nx = cx + dx;
        const nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= w || nz >= h) continue;

        const ni = nz * w + nx;
        if (closed[ni] || grid[ni] === 0) continue;

        if (dx !== 0 && dz !== 0) {
          if (grid[cz * w + nx] === 0 || grid[nz * w + cx] === 0) continue;
        }

        const tentG = cg + cost;
        if (tentG < gScore[ni]) {
          gScore[ni] = tentG;
          cameFrom[ni] = ci;
          open.push({ f: tentG + this.octileH(nx, nz, gx, gz), idx: ni });
        }
      }
    }

    if (gScore[goalIdx] === 0xFFFFFFFF) return [];

    const path: Waypoint[] = [];
    let trace = goalIdx;
    while (trace !== startIdx) {
      path.push(this.gridToWorld(trace % w, (trace / w) | 0, y));
      trace = cameFrom[trace];
      if (trace === 0xFFFFFFFF) return [];
    }
    path.push(this.gridToWorld(sx, sz, y));
    path.reverse();
    return path;
  }

  private octileH(x: number, z: number, gx: number, gz: number): number {
    const dx = Math.abs(x - gx);
    const dz = Math.abs(z - gz);
    return Math.max(dx, dz) * 10 + Math.min(dx, dz) * 4;
  }

  simplifyPath(waypoints: Waypoint[]): Waypoint[] {
    if (waypoints.length <= 2) return waypoints;

    const result: Waypoint[] = [waypoints[0]];
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = result[result.length - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      const dx1 = curr[0] - prev[0];
      const dz1 = curr[2] - prev[2];
      const dx2 = next[0] - curr[0];
      const dz2 = next[2] - curr[2];

      if (Math.abs(dx1 * dz2 - dz1 * dx2) > 0.01) {
        result.push(curr);
      }
    }
    result.push(waypoints[waypoints.length - 1]);
    return result;
  }

  isWalkable(worldX: number, worldZ: number): boolean {
    const [gx, gz] = this.worldToGrid(worldX, worldZ);
    return this.grid[gz * this.gridWidth + gx] !== 0;
  }

  getGridDimensions(): { width: number; height: number; cellSize: number } {
    return { width: this.gridWidth, height: this.gridHeight, cellSize: this.config.cellSize };
  }

  dispose(): void {
    if (this.wasm) {
      if (this.gridPtr) this.wasm.dealloc_u8(this.gridPtr, this.gridWidth * this.gridHeight);
      if (this.outPathPtr) this.wasm.dealloc_u32(this.outPathPtr, this.outCapacity * 2);
    }
    NavigationSystem.instance = null;
    this.ready = false;
  }
}
