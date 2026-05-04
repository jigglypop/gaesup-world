import * as THREE from 'three';

import { GaesupCoreWasmExports, loadCoreWasm } from '../wasm/loader';

export interface NavigationConfig {
  cellSize: number;
  worldMinX: number;
  worldMinZ: number;
  worldMaxX: number;
  worldMaxZ: number;
  maxStepHeight: number;
}

export type Waypoint = [number, number, number];

const DEFAULT_CONFIG: NavigationConfig = {
  cellSize: 2,
  worldMinX: -200,
  worldMinZ: -200,
  worldMaxX: 200,
  worldMaxZ: 200,
  maxStepHeight: 1.1,
};

const PATH_DIRECTIONS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, 10], [-1, 0, 10], [0, 1, 10], [0, -1, 10],
  [1, 1, 14], [1, -1, 14], [-1, 1, 14], [-1, -1, 14],
];

function hasNavigationWasm(wasm: GaesupCoreWasmExports | null): wasm is GaesupCoreWasmExports {
  return Boolean(
    wasm &&
    typeof wasm.alloc_u8 === 'function' &&
    typeof wasm.dealloc_u8 === 'function' &&
    typeof wasm.alloc_u32 === 'function' &&
    typeof wasm.dealloc_u32 === 'function' &&
    typeof wasm.astar_find_path === 'function',
  );
}

export class NavigationSystem {
  private static instance: NavigationSystem | null = null;

  private config: NavigationConfig;
  private gridWidth: number;
  private gridHeight: number;
  private grid: Uint8Array;
  private costGrid: Uint8Array;
  private heightGrid: Float32Array;
  private hasHeightData = false;
  private hasBlockedData = false;
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
    this.heightGrid = new Float32Array(total);
  }

  static getInstance(config?: Partial<NavigationConfig>): NavigationSystem {
    if (!NavigationSystem.instance) {
      NavigationSystem.instance = new NavigationSystem(config);
    }
    return NavigationSystem.instance;
  }

  async init(): Promise<boolean> {
    if (this.ready) return true;

    const wasm = await loadCoreWasm();
    if (hasNavigationWasm(wasm)) {
      this.wasm = wasm;
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
    this.syncToWasm(this.grid);
  }

  private syncCostGridToWasm(): void {
    if (!this.wasm) return;
    this.syncToWasm(this.costGrid);
  }

  private syncToWasm(source: Uint8Array): void {
    if (!this.wasm) return;
    new Uint8Array(
      this.wasm.memory.buffer,
      this.gridPtr,
      this.gridWidth * this.gridHeight,
    ).set(source);
  }

  private cellIndex(gx: number, gz: number): number {
    return gz * this.gridWidth + gx;
  }

  private isGridCell(gx: number, gz: number): boolean {
    return gx >= 0 && gx < this.gridWidth && gz >= 0 && gz < this.gridHeight;
  }

  private setCell(gx: number, gz: number, value: number): void {
    if (!this.isGridCell(gx, gz)) return;
    const idx = this.cellIndex(gx, gz);
    this.grid[idx] = value;
    this.costGrid[idx] = value;
    if (value === 0) this.hasBlockedData = true;
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

  gridToWorld(gx: number, gz: number, y?: number): Waypoint {
    const { cellSize, worldMinX, worldMinZ } = this.config;
    return [
      worldMinX + (gx + 0.5) * cellSize,
      y ?? this.heightGrid[this.cellIndex(gx, gz)] ?? 0,
      worldMinZ + (gz + 0.5) * cellSize,
    ];
  }

  setBlocked(worldX: number, worldZ: number, width: number, depth: number): void {
    this.setRegion(worldX, worldZ, width, depth, 0);
  }

  setWalkable(worldX: number, worldZ: number, width: number, depth: number): void {
    this.setRegion(worldX, worldZ, width, depth, 1);
  }

  reset(value: number = 1): void {
    const clamped = Math.max(0, Math.min(255, Math.round(value)));
    this.grid.fill(clamped === 0 ? 0 : 1);
    this.costGrid.fill(clamped);
    this.heightGrid.fill(0);
    this.hasHeightData = false;
    this.hasBlockedData = clamped === 0;
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
        this.setCell(gx, gz, value);
      }
    }
  }

  setCost(worldX: number, worldZ: number, cost: number): void {
    const [gx, gz] = this.worldToGrid(worldX, worldZ);
    const idx = this.cellIndex(gx, gz);
    const clamped = Math.max(0, Math.min(255, Math.round(cost)));
    this.costGrid[idx] = clamped;
    if (clamped === 0) {
      this.grid[idx] = 0;
      this.hasBlockedData = true;
    }
  }

  setHeight(worldX: number, worldZ: number, height: number): void {
    const [gx, gz] = this.worldToGrid(worldX, worldZ);
    this.heightGrid[this.cellIndex(gx, gz)] = height;
    if (height !== 0) this.hasHeightData = true;
  }

  setHeightRegion(worldX: number, worldZ: number, width: number, depth: number, height: number): void {
    this.setHeightSampler(worldX, worldZ, width, depth, () => height);
  }

  setHeightSampler(
    worldX: number,
    worldZ: number,
    width: number,
    depth: number,
    sampler: (worldX: number, worldZ: number) => number,
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
        if (!this.isGridCell(gx, gz)) continue;
        const [sampleX, , sampleZ] = this.gridToWorld(gx, gz, 0);
        const height = sampler(sampleX, sampleZ);
        this.heightGrid[this.cellIndex(gx, gz)] = height;
        if (height !== 0) this.hasHeightData = true;
      }
    }
  }

  sampleHeight(worldX: number, worldZ: number): number {
    const [gx, gz] = this.worldToGrid(worldX, worldZ);
    return this.heightGrid[this.cellIndex(gx, gz)] ?? 0;
  }

  hasNavigationConstraints(): boolean {
    return this.hasBlockedData || this.hasHeightData;
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
    y?: number,
    weighted: boolean = false,
  ): Waypoint[] {
    if (!this.ready) return [];

    const [sx, sz] = this.worldToGrid(startX, startZ);
    const [gx, gz] = this.worldToGrid(goalX, goalZ);

    if (this.wasm && !this.hasHeightData) {
      return this.findPathWasm(sx, sz, gx, gz, y, weighted);
    }
    return this.findPathJS(sx, sz, gx, gz, y, weighted);
  }

  private findPathWasm(
    sx: number, sz: number,
    gx: number, gz: number,
    y: number | undefined,
    weighted: boolean,
  ): Waypoint[] {
    const wasm = this.wasm!;

    if (weighted && typeof wasm.astar_find_path_weighted !== 'function') {
      return this.findPathJS(sx, sz, gx, gz, y, true);
    }

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
      const rawX = raw[i * 2];
      const rawZ = raw[i * 2 + 1];
      if (rawX === undefined || rawZ === undefined) continue;
      waypoints.push(this.gridToWorld(rawX, rawZ, y));
    }
    return waypoints;
  }

  private findPathJS(
    sx: number, sz: number,
    gx: number, gz: number,
    y: number | undefined,
    weighted: boolean,
  ): Waypoint[] {
    const w = this.gridWidth;
    const h = this.gridHeight;
    const grid = this.grid;
    const total = w * h;

    const startIdx = this.cellIndex(sx, sz);
    const goalIdx = this.cellIndex(gx, gz);

    if (grid[startIdx] === 0 || grid[goalIdx] === 0) return [];
    if (startIdx === goalIdx) return [this.gridToWorld(gx, gz, y)];

    const gScore = new Uint32Array(total).fill(0xFFFFFFFF);
    const cameFrom = new Uint32Array(total).fill(0xFFFFFFFF);
    const closed = new Uint8Array(total);
    gScore[startIdx] = 0;

    const open: { f: number; idx: number }[] = [
      { f: this.octileH(sx, sz, gx, gz), idx: startIdx },
    ];

    while (open.length > 0) {
      let minPos = 0;
      for (let i = 1; i < open.length; i++) {
        const candidate = open[i];
        const currentMin = open[minPos];
        if (candidate && currentMin && candidate.f < currentMin.f) minPos = i;
      }
      const current = open[minPos];
      const last = open[open.length - 1];
      if (!current || !last) break;
      open[minPos] = last;
      open.pop();

      const ci = current.idx;
      if (ci === goalIdx) break;
      if (closed[ci]) continue;
      closed[ci] = 1;

      const cx = ci % w;
      const cz = (ci / w) | 0;
      const cg = gScore[ci];
      if (cg === undefined) continue;

      for (const [dx, dz, cost] of PATH_DIRECTIONS) {
        const nx = cx + dx;
        const nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= w || nz >= h) continue;

        const ni = this.cellIndex(nx, nz);
        if (closed[ni] || grid[ni] === 0) continue;
        if (!this.canStepBetween(ci, ni)) continue;

        if (dx !== 0 && dz !== 0) {
          if (grid[cz * w + nx] === 0 || grid[nz * w + cx] === 0) continue;
          if (!this.canStepBetween(ci, this.cellIndex(nx, cz))) continue;
          if (!this.canStepBetween(ci, this.cellIndex(cx, nz))) continue;
        }

        const cellCost = weighted ? Math.max(1, this.costGrid[ni] ?? 1) : 1;
        const tentG = cg + cost * cellCost;
        const nextScore = gScore[ni];
        if (nextScore !== undefined && tentG < nextScore) {
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
      const previous = cameFrom[trace];
      if (previous === undefined) return [];
      trace = previous;
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

  private canStepBetween(fromIdx: number, toIdx: number): boolean {
    if (!this.hasHeightData) return true;
    return Math.abs((this.heightGrid[toIdx] ?? 0) - (this.heightGrid[fromIdx] ?? 0)) <= this.config.maxStepHeight;
  }

  hasLineOfSight(
    startX: number,
    startZ: number,
    goalX: number,
    goalZ: number,
  ): boolean {
    const dx = goalX - startX;
    const dz = goalZ - startZ;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const steps = Math.max(1, Math.ceil(distance / (this.config.cellSize * 0.5)));

    let prevGX = -1;
    let prevGZ = -1;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const [gx, gz] = this.worldToGrid(startX + dx * t, startZ + dz * t);
      if (gx === prevGX && gz === prevGZ) continue;
      const idx = this.cellIndex(gx, gz);
      if (
        prevGX !== -1 &&
        prevGZ !== -1 &&
        !this.canStepBetween(this.cellIndex(prevGX, prevGZ), idx)
      ) {
        return false;
      }
      prevGX = gx;
      prevGZ = gz;
      if (this.grid[idx] === 0) return false;
    }

    return true;
  }

  smoothPath(
    waypoints: Waypoint[],
    start?: Waypoint,
    goal?: Waypoint,
  ): Waypoint[] {
    if (waypoints.length === 0) return [];

    const first = start ?? waypoints[0];
    const last = goal ?? waypoints[waypoints.length - 1];
    if (!first || !last) return [];

    const anchors: Waypoint[] = [first];
    const bodyStart = start ? 1 : 0;
    const bodyEnd = goal ? waypoints.length - 1 : waypoints.length;
    for (let i = bodyStart; i < bodyEnd; i++) {
      const waypoint = waypoints[i];
      if (waypoint) anchors.push(waypoint);
    }
    anchors.push(last);

    const result: Waypoint[] = [];
    let anchorIndex = 0;
    result.push(anchors[anchorIndex]!);

    while (anchorIndex < anchors.length - 1) {
      let nextIndex = anchors.length - 1;
      const anchor = anchors[anchorIndex]!;
      while (
        nextIndex > anchorIndex + 1 &&
        !this.hasLineOfSight(anchor[0], anchor[2], anchors[nextIndex]![0], anchors[nextIndex]![2])
      ) {
        nextIndex -= 1;
      }
      result.push(anchors[nextIndex]!);
      anchorIndex = nextIndex;
    }

    return result;
  }

  simplifyPath(waypoints: Waypoint[]): Waypoint[] {
    if (waypoints.length <= 2) return waypoints;

    const first = waypoints[0];
    if (!first) return [];
    const result: Waypoint[] = [first];
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = result[result.length - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];
      if (!prev || !curr || !next) continue;

      const dx1 = curr[0] - prev[0];
      const dz1 = curr[2] - prev[2];
      const dx2 = next[0] - curr[0];
      const dz2 = next[2] - curr[2];

      if (Math.abs(dx1 * dz2 - dz1 * dx2) > 0.01) {
        result.push(curr);
      }
    }
    const last = waypoints[waypoints.length - 1];
    if (last) result.push(last);
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
