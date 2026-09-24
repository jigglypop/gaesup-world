/** Stable jitter in each cell keeps edits from rearranging the whole meadow. */
function jitter(x: number, z: number, blade: number): number {
  let hash = Math.imul(Math.round(x * 1000), 374761393) ^ Math.imul(Math.round(z * 1000), 668265263) ^ Math.imul(blade + 1, 1274126177);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

export function placeGrassOnCells(offsets: Float32Array, cells: ReadonlyArray<readonly [number, number, number?]>, cellSize: number): void {
  if (!cells.length) return;
  for (let index = 0; index < offsets.length / 3; index++) {
    const [x, z, y = 0] = cells[index % cells.length]!;
    const blade = Math.floor(index / cells.length);
    offsets[index * 3] = x + (jitter(x, z, blade * 2) - 0.5) * cellSize * 0.9;
    offsets[index * 3 + 1] = y;
    offsets[index * 3 + 2] = z + (jitter(x, z, blade * 2 + 1) - 0.5) * cellSize * 0.9;
  }
}
