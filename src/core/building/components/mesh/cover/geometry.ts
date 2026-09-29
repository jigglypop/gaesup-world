import * as THREE from 'three';

import { createCellIndex } from '../../../model/cellIndex';
import { cellMasks, edgeTaper, hash2 } from '../../../terrain/grid';

/** One tile of a cover: center (tile top y), side and the tile's own colors. */
export type CoverEntry = {
  position: [number, number, number];
  size: number;
  color?: string;
  accentColor?: string;
};

/** How a cover such as sand or snow shapes and paints its tiles. */
export type CoverLook = {
  color: string;
  accent: string;
  /** Surface segments per meter of tile side, and the fewest a tile takes. */
  segments: readonly [perMeter: number, least: number];
  /** Thickness over the tile top and the relief over it at world (x, z); both settle to the ground at open edges. */
  base: number;
  relief: (x: number, z: number) => number;
  /** Broad tint in [0, 1] at world (x, z): the color moves `mix` of the way to the accent and shades by `shade`. */
  tint: (x: number, z: number) => number;
  mix: number;
  shade: readonly [from: number, by: number];
  /** Shade at the foot of the skirt. */
  skirt: number;
  /** Loose specks the classic renderer scatters: per m² within `count`, lift over the surface, tint and point size. */
  specks: {
    density: number;
    count: readonly [number, number];
    lift: readonly [number, number];
    mix: readonly [number, number];
    shade: readonly [number, number];
    size: readonly [least: number, perMeter: number];
    opacity: number;
  };
};

/** Meters over which the cover settles to the ground at an open edge, so it meets its neighbor without a step. */
const EDGE_TAPER = 1.4;
const SKIRT_DROP = 0.12;

const boundsOf = ({ position: [x, , z], size }: CoverEntry) => ({ minX: x - size / 2, maxX: x + size / 2, minZ: z - size / 2, maxZ: z + size / 2 });

export type CoverGeometry = { surface: THREE.BufferGeometry; skirt: THREE.BufferGeometry | null };

/** The surface of tile `index` at local (lx, lz): relief over a thin base, both settling toward open edges. */
function surfaceOf(entries: readonly CoverEntry[], look: CoverLook) {
  const masks = cellMasks(entries.map(({ position, size }) => [position[0], position[2], size] as const));
  return (index: number, lx: number, lz: number) => {
    const { position: [x, y, z], size } = entries[index]!;
    return y + 0.01 + (look.base + look.relief(x + lx, z + lz)) * edgeTaper(masks[index]!, lx, lz, size, EDGE_TAPER);
  };
}

/** A cover's color at world (x, z) between a tile's `color` and `accent`. */
export function paintCover(look: CoverLook, x: number, z: number, color: THREE.Color, accent: THREE.Color, target: THREE.Color): THREE.Color {
  const tint = look.tint(x, z);
  return target.copy(color).lerp(accent, tint * look.mix).multiplyScalar(look.shade[0] + tint * look.shade[1]);
}

/**
 * One surface for all of a cover's tiles and a skirt down its open edges. Relief and color are fields over the world,
 * and normals come from the same field one step past each tile, so neighboring tiles meet without a seam in height or
 * shading. A skirt edge is left out where another tile at the same height continues the cover.
 */
export function buildCoverGeometry(entries: readonly CoverEntry[], look: CoverLook): CoverGeometry {
  const surfaceY = surfaceOf(entries, look);
  const near = createCellIndex(entries, boundsOf);
  const continues = (x: number, z: number, y: number, self: CoverEntry) => near(x, z).some((entry) => {
    const half = entry.size / 2 - 0.001;
    return entry !== self && Math.abs(entry.position[1] - y) <= 0.01
      && Math.abs(x - entry.position[0]) <= half && Math.abs(z - entry.position[2]) <= half;
  });
  const [perMeter, least] = look.segments;
  const segments = entries.map(({ size }) => Math.max(least, Math.round(size * perMeter)));
  const vertices = segments.reduce((sum, segs) => sum + (segs + 1) ** 2, 0);
  const positions = new Float32Array(vertices * 3), normals = new Float32Array(vertices * 3), colors = new Float32Array(vertices * 3);
  const indices = new Uint32Array(segments.reduce((sum, segs) => sum + segs * segs * 6, 0));
  const skirtPositions: number[] = [], skirtColors: number[] = [];
  const color = new THREE.Color(), accent = new THREE.Color(), tinted = new THREE.Color(), foot = new THREE.Color();
  let vertex = 0, index = 0;

  entries.forEach((entry, entryIndex) => {
    const segs = segments[entryIndex]!, { size, position: [ox, oy, oz] } = entry, step = size / segs, row = segs + 3;
    color.set(entry.color ?? look.color);
    accent.set(entry.accentColor ?? look.accent);
    foot.copy(color).multiplyScalar(look.skirt);
    // Heights one step past every side, for central-difference normals at the tile's own edges.
    const heights = new Float32Array(row * row);
    for (let iz = 0; iz < row; iz++) {
      for (let ix = 0; ix < row; ix++) heights[iz * row + ix] = surfaceY(entryIndex, (ix - 1) * step - size / 2, (iz - 1) * step - size / 2);
    }
    const heightAt = (ix: number, iz: number) => heights[(iz + 1) * row + ix + 1]!;
    const first = vertex;
    for (let iz = 0; iz <= segs; iz++) {
      for (let ix = 0; ix <= segs; ix++, vertex++) {
        const x = ox + ix * step - size / 2, z = oz + iz * step - size / 2;
        const nx = heightAt(ix - 1, iz) - heightAt(ix + 1, iz), nz = heightAt(ix, iz - 1) - heightAt(ix, iz + 1);
        const length = Math.hypot(nx, 2 * step, nz);
        positions.set([x, heightAt(ix, iz), z], vertex * 3);
        normals.set([nx / length, (2 * step) / length, nz / length], vertex * 3);
        paintCover(look, x, z, color, accent, tinted).toArray(colors, vertex * 3);
      }
    }
    for (let iz = 0; iz < segs; iz++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = first + iz * (segs + 1) + ix, b = a + 1, c = a + segs + 1, d = c + 1;
        indices.set([a, c, b, b, c, d], index);
        index += 6;
      }
    }

    // Double-sided skirt quads down each open edge, from the surface to below the tile top.
    const drop = oy - SKIRT_DROP;
    const skirtEdge = (ax: number, az: number, bx: number, bz: number, outX: number, outZ: number) => {
      if (continues(ox + (ax + bx) / 2 * step - size / 2 + outX, oz + (az + bz) / 2 * step - size / 2 + outZ, oy, entry)) return;
      const top = [ax, az, bx, bz].map((value, i) => (i % 2 ? oz : ox) + value * step - size / 2);
      const a: [number, number, number] = [top[0]!, heightAt(ax, az), top[1]!], b: [number, number, number] = [top[2]!, heightAt(bx, bz), top[3]!];
      const ca = new THREE.Color().fromArray(colors, (first + az * (segs + 1) + ax) * 3), cb = new THREE.Color().fromArray(colors, (first + bz * (segs + 1) + bx) * 3);
      const lowA: [number, number, number] = [a[0], drop, a[2]], lowB: [number, number, number] = [b[0], drop, b[2]];
      for (const [point, shade] of [[a, ca], [b, cb], [lowB, foot], [a, ca], [lowB, foot], [lowA, foot],
        [lowB, foot], [b, cb], [a, ca], [lowA, foot], [lowB, foot], [a, ca]] as const) {
        skirtPositions.push(...point);
        skirtColors.push(shade.r, shade.g, shade.b);
      }
    };
    for (let i = 0; i < segs; i++) {
      skirtEdge(segs, i, segs, i + 1, 0.02, 0);
      skirtEdge(0, i + 1, 0, i, -0.02, 0);
      skirtEdge(i + 1, 0, i, 0, 0, -0.02);
      skirtEdge(i, segs, i + 1, segs, 0, 0.02);
    }
  });

  const surface = new THREE.BufferGeometry();
  surface.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  surface.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  surface.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  surface.setIndex(new THREE.BufferAttribute(indices, 1));
  surface.computeBoundingSphere();
  if (!skirtPositions.length) return { surface, skirt: null };
  const skirt = new THREE.BufferGeometry();
  skirt.setAttribute('position', new THREE.Float32BufferAttribute(skirtPositions, 3));
  skirt.setAttribute('color', new THREE.Float32BufferAttribute(skirtColors, 3));
  skirt.computeVertexNormals();
  skirt.computeBoundingSphere();
  return { surface, skirt };
}

/** Loose specks over the surface for the classic renderer, scattered by each tile's place; returns the point size too. */
export function buildCoverSpecks(entries: readonly CoverEntry[], look: CoverLook): { geometry: THREE.BufferGeometry; size: number } {
  const surfaceY = surfaceOf(entries, look);
  const { density, count: [fewest, most], lift, mix, shade, size: [least, perMeter] } = look.specks;
  const counts = entries.map(({ size }) => Math.max(fewest, Math.min(most, Math.round(size * size * density))));
  const positions = new Float32Array(counts.reduce((sum, n) => sum + n, 0) * 3), colors = new Float32Array(positions.length);
  const color = new THREE.Color(), accent = new THREE.Color(), tinted = new THREE.Color();
  let at = 0;
  entries.forEach((entry, entryIndex) => {
    const { size, position: [ox, , oz] } = entry;
    color.set(entry.color ?? look.color);
    accent.set(entry.accentColor ?? look.accent);
    for (let i = 0; i < counts[entryIndex]!; i++, at += 3) {
      const lx = (hash2(ox + i * 0.37, oz - 1.3) - 0.5) * size, lz = (hash2(oz + i * 0.59, ox + 2.1) - 0.5) * size;
      const tint = hash2(ox - i * 0.73, oz + i * 0.41);
      positions.set([ox + lx, surfaceY(entryIndex, lx, lz) + lift[0] + hash2(lx, lz) * lift[1], oz + lz], at);
      tinted.copy(color).lerp(accent, mix[0] + tint * mix[1]).multiplyScalar(shade[0] + tint * shade[1]).toArray(colors, at);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  const average = entries.length ? entries.reduce((sum, entry) => sum + entry.size, 0) / entries.length : 4;
  return { geometry, size: Math.max(least, average * perMeter) };
}
