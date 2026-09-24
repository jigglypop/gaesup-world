import { Color, DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three';

import { TILES, type TileKind } from './terrain';

/** Small, deterministic PBR tile maps, created once per room (never per tile/frame). */
export function createRoomSurface(kind: TileKind) {
  const size = 128; const color = new Uint8Array(size * size * 4); const normal = new Uint8Array(color.length);
  const heights = new Float32Array(size * size); const base = new Color(TILES[kind].color).convertLinearToSRGB();
  const tau = Math.PI * 2;
  const grain = (x: number, y: number) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size; const v = y / size; const noise = grain(x, y);
    const broad = Math.sin(u * tau) * Math.cos(v * tau) * 0.5 + 0.5;
    let shade = 0.9 + noise * 0.1; let height = noise * 0.02;
    if (kind === 'grass') { shade = 0.68 + broad * 0.18 + noise * 0.2; height = noise * 0.045; }
    if (kind === 'snow') { shade = 0.93 + broad * 0.065 + (noise > 0.99 ? 0.06 : 0); height = broad * 0.12 + noise * 0.018; }
    if (kind === 'sand') { const ripple = Math.sin(v * tau * 7 + Math.sin(u * tau) * 0.5); shade = 0.9 + ripple * 0.035 + noise * 0.09; height = ripple * 0.035 + noise * 0.035; }
    if (kind === 'stone') { const edge = Math.min(u, v, 1 - u, 1 - v); const bevel = Math.min(1, edge * 45); shade = (0.88 + broad * 0.1 + noise * 0.06) * (0.68 + bevel * 0.32); height = bevel * 0.17 + noise * 0.025; }
    if (kind === 'wood') { const line = Math.sin((u * 26 + Math.sin(v * tau) * 0.16) * tau); const seam = x % 32 < 2; shade = seam ? 0.48 : 0.82 + line * 0.055 + noise * 0.06; height = seam ? 0 : 0.12 + line * 0.008; }
    if (kind === 'soil') { const furrow = Math.sin(v * tau * 4 + Math.sin(u * tau) * 0.3); const clod = noise > 0.93 ? 0.12 : 0; shade = 0.74 + furrow * 0.13 + noise * 0.12 + clod; height = furrow * 0.09 + noise * 0.03 + clod * 0.3; }
    if (kind === 'dirt') { const pebble = noise > 0.975 ? 0.16 : 0; const litter = grain(x * 3 + 17, y * 5 + 3) > 0.992 ? -0.2 : 0; shade = 0.86 + broad * 0.07 + noise * 0.1 + pebble + litter; height = noise * 0.03 + pebble * 0.25; }
    heights[y * size + x] = height;
    const i = (y * size + x) * 4;
    color[i] = Math.min(255, base.r * shade * 255); color[i + 1] = Math.min(255, base.g * shade * 255); color[i + 2] = Math.min(255, base.b * shade * 255); color[i + 3] = 255;
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sample = (dx: number, dy: number) => heights[((y + dy + size) % size) * size + (x + dx + size) % size]!;
    const nx = (sample(-1, 0) - sample(1, 0)) * 3; const ny = (sample(0, -1) - sample(0, 1)) * 3;
    const length = Math.hypot(nx, ny, 1); const i = (y * size + x) * 4;
    normal[i] = (nx / length * 0.5 + 0.5) * 255; normal[i + 1] = (ny / length * 0.5 + 0.5) * 255; normal[i + 2] = (1 / length * 0.5 + 0.5) * 255; normal[i + 3] = 255;
  }
  const map = new DataTexture(color, size, size, RGBAFormat); map.colorSpace = SRGBColorSpace;
  const normalMap = new DataTexture(normal, size, size, RGBAFormat);
  for (const texture of [map, normalMap]) { texture.wrapS = texture.wrapT = RepeatWrapping; texture.minFilter = LinearMipmapLinearFilter; texture.magFilter = LinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true; }
  return { map, normalMap };
}
