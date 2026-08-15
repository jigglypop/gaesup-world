const POSITION_STRIDE = 3;
const ROTATION_STRIDE = 4;
const SCALE_STRIDE = 3;
const CELL_STRIDE = 3;

export class TransformStore {
  positions: Float32Array;
  rotations: Float32Array;
  scales: Float32Array;
  originCells: Int32Array;

  constructor(capacity: number) {
    this.positions = new Float32Array(capacity * POSITION_STRIDE);
    this.rotations = new Float32Array(capacity * ROTATION_STRIDE);
    this.scales = new Float32Array(capacity * SCALE_STRIDE);
    this.originCells = new Int32Array(capacity * CELL_STRIDE);
    for (let index = 0; index < capacity; index += 1) {
      this.resetIndex(index);
    }
  }

  grow(capacity: number): void {
    const previousCapacity = this.rotations.length / ROTATION_STRIDE;
    const positions = new Float32Array(capacity * POSITION_STRIDE);
    positions.set(this.positions);
    const rotations = new Float32Array(capacity * ROTATION_STRIDE);
    rotations.set(this.rotations);
    const scales = new Float32Array(capacity * SCALE_STRIDE);
    scales.set(this.scales);
    const originCells = new Int32Array(capacity * CELL_STRIDE);
    originCells.set(this.originCells);
    this.positions = positions;
    this.rotations = rotations;
    this.scales = scales;
    this.originCells = originCells;
    for (let index = previousCapacity; index < capacity; index += 1) {
      this.resetIndex(index);
    }
  }

  resetIndex(index: number): void {
    const positionOffset = index * POSITION_STRIDE;
    this.positions[positionOffset] = 0;
    this.positions[positionOffset + 1] = 0;
    this.positions[positionOffset + 2] = 0;
    const rotationOffset = index * ROTATION_STRIDE;
    this.rotations[rotationOffset] = 0;
    this.rotations[rotationOffset + 1] = 0;
    this.rotations[rotationOffset + 2] = 0;
    this.rotations[rotationOffset + 3] = 1;
    const scaleOffset = index * SCALE_STRIDE;
    this.scales[scaleOffset] = 1;
    this.scales[scaleOffset + 1] = 1;
    this.scales[scaleOffset + 2] = 1;
    const cellOffset = index * CELL_STRIDE;
    this.originCells[cellOffset] = 0;
    this.originCells[cellOffset + 1] = 0;
    this.originCells[cellOffset + 2] = 0;
  }

  setPosition(index: number, x: number, y: number, z: number): void {
    const offset = index * POSITION_STRIDE;
    this.positions[offset] = x;
    this.positions[offset + 1] = y;
    this.positions[offset + 2] = z;
  }

  readPosition(index: number, out: Float32Array): Float32Array {
    const offset = index * POSITION_STRIDE;
    out[0] = this.positions[offset] ?? 0;
    out[1] = this.positions[offset + 1] ?? 0;
    out[2] = this.positions[offset + 2] ?? 0;
    return out;
  }

  setRotation(index: number, x: number, y: number, z: number, w: number): void {
    const offset = index * ROTATION_STRIDE;
    this.rotations[offset] = x;
    this.rotations[offset + 1] = y;
    this.rotations[offset + 2] = z;
    this.rotations[offset + 3] = w;
  }

  readRotation(index: number, out: Float32Array): Float32Array {
    const offset = index * ROTATION_STRIDE;
    out[0] = this.rotations[offset] ?? 0;
    out[1] = this.rotations[offset + 1] ?? 0;
    out[2] = this.rotations[offset + 2] ?? 0;
    out[3] = this.rotations[offset + 3] ?? 1;
    return out;
  }

  setScale(index: number, x: number, y: number, z: number): void {
    const offset = index * SCALE_STRIDE;
    this.scales[offset] = x;
    this.scales[offset + 1] = y;
    this.scales[offset + 2] = z;
  }

  readScale(index: number, out: Float32Array): Float32Array {
    const offset = index * SCALE_STRIDE;
    out[0] = this.scales[offset] ?? 1;
    out[1] = this.scales[offset + 1] ?? 1;
    out[2] = this.scales[offset + 2] ?? 1;
    return out;
  }

  setOriginCell(index: number, cellX: number, cellY: number, cellZ: number): void {
    const offset = index * CELL_STRIDE;
    this.originCells[offset] = cellX;
    this.originCells[offset + 1] = cellY;
    this.originCells[offset + 2] = cellZ;
  }

  readOriginCell(index: number, out: Int32Array): Int32Array {
    const offset = index * CELL_STRIDE;
    out[0] = this.originCells[offset] ?? 0;
    out[1] = this.originCells[offset + 1] ?? 0;
    out[2] = this.originCells[offset + 2] ?? 0;
    return out;
  }
}
