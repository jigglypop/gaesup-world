import * as THREE from 'three';

import { worldNoise as noise2D } from '../../../terrain/grid';

/** Default colors of the painted meadow under tall-grass tiles. */
export const MEADOW = { base: '#5a7a35', accent: '#7a8e3a' } as const;
const DIRT = new THREE.Color('#5b4628');

/** Height of the painted meadow above its tile top at world (x, z). */
export function meadowLift(x: number, z: number): number {
  return 0.05 * noise2D(x / 50, z / 50) + 0.05 * noise2D(x / 100, z / 100);
}

/** Painted meadow color at world (x, z): two-octave patches plus tight dirt scuffs. Writes into `target`. */
export function meadowColor(x: number, z: number, base: THREE.Color, accent: THREE.Color, target: THREE.Color): THREE.Color {
  const n0 = 0.5 + 0.5 * noise2D(x * 0.18, z * 0.18);
  const n1 = 0.5 + 0.5 * noise2D(x * 0.04 + 11.3, z * 0.04 - 7.7);
  const n2 = 0.5 + 0.5 * noise2D(x * 0.55 - 3.1, z * 0.55 + 9.4);
  const tint = THREE.MathUtils.clamp(n0 * 0.65 + n1 * 0.45, 0, 1);
  target.copy(base).multiplyScalar(0.58 + tint * 0.42).lerp(accent, n1 * 0.28);
  if (n2 > 0.86) target.lerp(DIRT, (n2 - 0.86) * 4);
  return target;
}

/** Lifts local ground vertices onto the meadow field and paints them; `originX`/`originZ` place them in the world. */
export function paintMeadow(geometry: THREE.BufferGeometry, base: THREE.Color, accent: THREE.Color, originX = 0, originZ = 0): void {
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  const colors = new Float32Array(positions.count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index) + originX;
    const z = positions.getZ(index) + originZ;
    positions.setY(index, positions.getY(index) + meadowLift(x, z));
    meadowColor(x, z, base, accent, color).toArray(colors, index * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
}
