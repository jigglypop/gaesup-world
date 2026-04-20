import * as THREE from 'three';

/**
 * Adobe Cube LUT (.cube) parser.
 *
 * Supports `LUT_3D_SIZE N` and `LUT_1D_SIZE N` headers, optional
 * `DOMAIN_MIN` / `DOMAIN_MAX`, and `TITLE`. Lines starting with `#` are
 * treated as comments. RGB triplets (separated by whitespace) make up the
 * payload, ordered with the red index varying fastest, then green, then
 * blue, exactly like the Adobe specification.
 *
 * Returned data is a `Float32Array` of length `size * size * size * 4`
 * (RGBA, alpha set to 1) packed in the layout expected by
 * `THREE.Data3DTexture` so it can be uploaded directly to the GPU.
 */
export type CubeLutData = {
  size: number;
  data: Float32Array;
  domainMin: [number, number, number];
  domainMax: [number, number, number];
  title?: string;
};

const HEADER_KEYWORDS = new Set([
  'TITLE',
  'LUT_1D_SIZE',
  'LUT_3D_SIZE',
  'DOMAIN_MIN',
  'DOMAIN_MAX',
]);

export function parseCubeLut(text: string): CubeLutData {
  let size = 0;
  let is1D = false;
  let domainMin: [number, number, number] = [0, 0, 0];
  let domainMax: [number, number, number] = [1, 1, 1];
  let title: string | undefined;

  const samples: number[] = [];
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const firstSpace = line.indexOf(' ');
    const keyword = (firstSpace === -1 ? line : line.slice(0, firstSpace)).toUpperCase();

    if (HEADER_KEYWORDS.has(keyword)) {
      const rest = firstSpace === -1 ? '' : line.slice(firstSpace + 1).trim();
      switch (keyword) {
        case 'TITLE':
          title = rest.replace(/^"|"$/g, '');
          break;
        case 'LUT_3D_SIZE':
          size = Number.parseInt(rest, 10);
          is1D = false;
          break;
        case 'LUT_1D_SIZE':
          size = Number.parseInt(rest, 10);
          is1D = true;
          break;
        case 'DOMAIN_MIN': {
          const [r, g, b] = rest.split(/\s+/).map(Number);
          domainMin = [r ?? 0, g ?? 0, b ?? 0];
          break;
        }
        case 'DOMAIN_MAX': {
          const [r, g, b] = rest.split(/\s+/).map(Number);
          domainMax = [r ?? 1, g ?? 1, b ?? 1];
          break;
        }
      }
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;
    const r = Number.parseFloat(parts[0]!);
    const g = Number.parseFloat(parts[1]!);
    const b = Number.parseFloat(parts[2]!);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) continue;
    samples.push(r, g, b);
  }

  if (size <= 0) {
    throw new Error('Invalid .cube LUT: missing LUT_1D_SIZE or LUT_3D_SIZE header');
  }
  const expectedTriplets = is1D ? size : size * size * size;
  const actualTriplets = samples.length / 3;
  if (actualTriplets < expectedTriplets) {
    throw new Error(
      `Invalid .cube LUT: expected ${expectedTriplets} samples, got ${actualTriplets}`,
    );
  }

  const cubeSize = is1D ? size : size;
  const data = new Float32Array(cubeSize * cubeSize * cubeSize * 4);

  if (is1D) {
    // Promote a 1D LUT to a degenerate 3D LUT by treating it as a curve
    // applied independently per channel. This keeps the runtime path uniform.
    for (let z = 0; z < cubeSize; z += 1) {
      for (let y = 0; y < cubeSize; y += 1) {
        for (let x = 0; x < cubeSize; x += 1) {
          const idx = (z * cubeSize * cubeSize + y * cubeSize + x) * 4;
          data[idx] = samples[x * 3]!;
          data[idx + 1] = samples[y * 3 + 1]!;
          data[idx + 2] = samples[z * 3 + 2]!;
          data[idx + 3] = 1;
        }
      }
    }
  } else {
    for (let i = 0; i < expectedTriplets; i += 1) {
      const o = i * 4;
      data[o] = samples[i * 3]!;
      data[o + 1] = samples[i * 3 + 1]!;
      data[o + 2] = samples[i * 3 + 2]!;
      data[o + 3] = 1;
    }
  }

  return { size: cubeSize, data, domainMin, domainMax, title };
}

export function createLutTexture(lut: CubeLutData): THREE.Data3DTexture {
  const tex = new THREE.Data3DTexture(lut.data, lut.size, lut.size, lut.size);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.FloatType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

export async function loadCubeLut(url: string): Promise<CubeLutData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch LUT '${url}': HTTP ${res.status}`);
  }
  const text = await res.text();
  return parseCubeLut(text);
}

export async function loadCubeLutTexture(url: string): Promise<THREE.Data3DTexture> {
  const data = await loadCubeLut(url);
  return createLutTexture(data);
}
