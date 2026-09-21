import { DataTexture, LinearFilter, RGBAFormat } from 'three';

let snowTexture: DataTexture | undefined;
/** Shared soft flake; borrowed by particle materials, never disposed by a tile. */
export function getSnowParticleTexture(): DataTexture {
  if (snowTexture) return snowTexture;
  const size = 32; const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const radius = Math.hypot((x + 0.5) / size * 2 - 1, (y + 0.5) / size * 2 - 1);
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = Math.max(0, 1 - radius) ** 1.3 * 255;
  }
  snowTexture = new DataTexture(data, size, size, RGBAFormat);
  snowTexture.minFilter = snowTexture.magFilter = LinearFilter; snowTexture.needsUpdate = true;
  return snowTexture;
}
