import type { BufferGeometry } from 'three';

const quantize = (value: number) => Math.round(value * 100_000);

/**
 * Merges the normals a UV seam splits at one position where they differ by less than `creaseDeg`; sharper creases
 * (teeth, claws, opposing thin faces) keep their split. Vertices merge only when position, skin binding and morph
 * offsets all agree, so parts that move apart keep their own normals. Only normal values change: topology, UVs, skin
 * and morph attributes stay as authored, and geometries with morphed normals are left alone.
 * Returns the number of vertices whose normal changed.
 */
export function smoothSeamNormals(geometry: BufferGeometry, { creaseDeg = 60 }: { creaseDeg?: number } = {}): number {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  if (!position || !normal || position.count !== normal.count || geometry.morphAttributes.normal?.length) return 0;
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  const morphs = geometry.morphAttributes.position ?? [];
  const keys: string[] = [];
  const groups = new Map<string, number[]>();
  for (let i = 0; i < position.count; i++) {
    let key = `${quantize(position.getX(i))},${quantize(position.getY(i))},${quantize(position.getZ(i))}`;
    if (skinIndex && skinWeight) {
      for (let j = 0; j < skinIndex.itemSize; j++) key += `:${skinIndex.getComponent(i, j)},${quantize(skinWeight.getComponent(i, j))}`;
    }
    for (const morph of morphs) key += `/${quantize(morph.getX(i))},${quantize(morph.getY(i))},${quantize(morph.getZ(i))}`;
    keys.push(key);
    const group = groups.get(key);
    if (group) group.push(i);
    else groups.set(key, [i]);
  }

  const threshold = Math.cos((creaseDeg * Math.PI) / 180) - 1e-6;
  const output = new Float32Array(position.count * 3);
  let changed = 0;
  for (let i = 0; i < position.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const group = groups.get(keys[i]!)!;
    let x = nx;
    let y = ny;
    let z = nz;
    const length = Math.hypot(nx, ny, nz);
    if (group.length > 1 && length) {
      x = y = z = 0;
      const directions = new Set<string>();
      for (const j of group) {
        const ax = normal.getX(j);
        const ay = normal.getY(j);
        const az = normal.getZ(j);
        const other = Math.hypot(ax, ay, az);
        if (!other || (nx * ax + ny * ay + nz * az) / (length * other) < threshold) continue;
        // Copies with one direction (the corners of a split quad) count once.
        const direction = `${quantize(ax / other)},${quantize(ay / other)},${quantize(az / other)}`;
        if (directions.has(direction)) continue;
        directions.add(direction);
        x += ax / other;
        y += ay / other;
        z += az / other;
      }
      const total = Math.hypot(x, y, z);
      if (total > 1e-8) {
        x /= total;
        y /= total;
        z /= total;
        if (Math.hypot(x - nx / length, y - ny / length, z - nz / length) > 1e-4) changed++;
      } else {
        x = nx;
        y = ny;
        z = nz;
      }
    }
    output[i * 3] = x;
    output[i * 3 + 1] = y;
    output[i * 3 + 2] = z;
  }
  if (!changed) return 0;
  for (let i = 0; i < normal.count; i++) normal.setXYZ(i, output[i * 3]!, output[i * 3 + 1]!, output[i * 3 + 2]!);
  normal.needsUpdate = true;
  return changed;
}
