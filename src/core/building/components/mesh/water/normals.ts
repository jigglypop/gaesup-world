import * as THREE from 'three';

let _sharedWaterNormals: THREE.DataTexture | null = null;

function noise2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = noise2(xi, yi);
  const b = noise2(xi + 1, yi);
  const c = noise2(xi, yi + 1);
  const d = noise2(xi + 1, yi + 1);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(a, b, u),
    THREE.MathUtils.lerp(c, d, u),
    v,
  );
}

function waterHeight(x: number, y: number): number {
  let value = 0;
  let amp = 0.58;
  let freq = 1.15;
  for (let i = 0; i < 5; i += 1) {
    value += smoothNoise(x * freq + 17.3 * i, y * freq - 9.1 * i) * amp;
    freq *= 2.03;
    amp *= 0.48;
  }
  value += Math.sin(x * 8.2 + y * 1.7) * 0.06;
  value += Math.cos(y * 7.1 - x * 2.4) * 0.05;
  return value;
}

export function getSharedWaterNormals(size = 128): THREE.DataTexture {
  if (_sharedWaterNormals) return _sharedWaterNormals;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const u = x / size;
      const v = y / size;
      const e = 1 / size;
      const hL = waterHeight(u - e, v);
      const hR = waterHeight(u + e, v);
      const hD = waterHeight(u, v - e);
      const hU = waterHeight(u, v + e);
      const nx = (hL - hR) * 1.15;
      const ny = (hD - hU) * 1.15;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      data[i] = Math.round((nx / len * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round((nz / len * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
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

