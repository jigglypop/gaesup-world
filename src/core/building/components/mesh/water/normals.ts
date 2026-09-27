import * as THREE from 'three';

let _sharedWaterNormals: THREE.DataTexture | null = null;

/** Octaves of lattice cells per tile; whole numbers keep every octave periodic over the texture. */
const OCTAVES = [
  { period: 4, amplitude: 0.5 },
  { period: 8, amplitude: 0.26 },
  { period: 16, amplitude: 0.13 },
  { period: 32, amplitude: 0.06 },
] as const;
/** Mean tilt of the encoded normals (|xy|); materials scale it down to taste. */
const MEAN_SLOPE = 0.2;

function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed + 1, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Gradient noise on a `period`-cell lattice that wraps, so the unit square tiles without a seam. */
function periodicNoise(u: number, v: number, period: number, seed: number): number {
  const x = u * period;
  const y = v * period;
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const dot = (ix: number, iy: number) => {
    const angle = hash(((ix % period) + period) % period, ((iy % period) + period) % period, seed) * Math.PI * 2;
    return Math.cos(angle) * (x - ix) + Math.sin(angle) * (y - iy);
  };
  const sx = fade(x - xi);
  const top = THREE.MathUtils.lerp(dot(xi, yi), dot(xi + 1, yi), sx);
  const bottom = THREE.MathUtils.lerp(dot(xi, yi + 1), dot(xi + 1, yi + 1), sx);
  return THREE.MathUtils.lerp(top, bottom, fade(y - yi));
}

function waterHeight(u: number, v: number): number {
  let value = 0;
  for (let i = 0; i < OCTAVES.length; i++) value += periodicNoise(u, v, OCTAVES[i]!.period, i) * OCTAVES[i]!.amplitude;
  return value;
}

/** A tileable ripple normal map shared by every water surface; both render paths sample it in world space. */
export function getSharedWaterNormals(size = 128): THREE.DataTexture {
  if (_sharedWaterNormals) return _sharedWaterNormals;
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) heights[y * size + x] = waterHeight(x / size, y / size);
  const at = (x: number, y: number) => heights[(((y + size) % size) * size) + ((x + size) % size)]!;
  const slopes = new Float32Array(size * size * 2);
  let total = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 2;
      slopes[i] = at(x - 1, y) - at(x + 1, y);
      slopes[i + 1] = at(x, y - 1) - at(x, y + 1);
      total += Math.hypot(slopes[i]!, slopes[i + 1]!);
    }
  }
  const scale = total > 0 ? (MEAN_SLOPE * size * size) / total : 0;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const nx = slopes[i * 2]! * scale;
    const ny = slopes[i * 2 + 1]! * scale;
    const length = Math.hypot(nx, ny, 1);
    data[i * 4] = Math.round((nx / length * 0.5 + 0.5) * 255);
    data[i * 4 + 1] = Math.round((ny / length * 0.5 + 0.5) * 255);
    data[i * 4 + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
    data[i * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  _sharedWaterNormals = texture;
  return texture;
}
