import * as THREE from 'three';

/** Footprint window: `size` meters across in `texels` (about 5 cm each), following the player. */
export const TRAIL = {
  size: 24,
  texels: 512,
  /** Meters the player strays from the window's center before it follows. */
  recenter: 4,
  /** Meters between prints, and how far each foot lands beside the line walked. */
  stride: 0.36,
  gait: 0.085,
  /** Half length and half width of a print (m). */
  foot: [0.12, 0.05],
} as const;

const wrap = (value: number, span: number) => ((value % span) + span) % span;

/**
 * Where characters have stepped: dent depth 0–255 per texel over a square window that follows the player. The texture
 * repeats, so moving the window only clears the rows and columns it scrolls onto; sand and snow shaders sample it at
 * `world.xz / size` and ignore it outside the window around `center`. Prints fade out over time.
 */
export class TrailField {
  readonly data: Uint8Array;
  readonly texture: THREE.DataTexture;
  /** World x, z of the window's center. */
  readonly center = new THREE.Vector2(0, 0);
  /** Set by prints and fading; the owner uploads the texture and clears it. */
  dirty = false;
  private originX = Number.NaN;
  private originZ = Number.NaN;

  constructor(readonly size: number = TRAIL.size, readonly texels: number = TRAIL.texels) {
    this.data = new Uint8Array(texels * texels);
    this.texture = new THREE.DataTexture(this.data, texels, texels, THREE.RedFormat, THREE.UnsignedByteType);
    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.magFilter = this.texture.minFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.needsUpdate = true;
  }

  get texel(): number {
    return this.size / this.texels;
  }

  /** Keeps the window around (x, z): once the point strays `TRAIL.recenter` meters it re-centers on it. */
  follow(x: number, z: number): void {
    const half = this.texels / 2;
    const ox = Math.floor(x / this.texel) - half, oz = Math.floor(z / this.texel) - half;
    const reach = TRAIL.recenter / this.texel;
    if (Math.abs(ox - this.originX) < reach && Math.abs(oz - this.originZ) < reach) return;
    if (Number.isNaN(this.originX) || Math.abs(ox - this.originX) >= this.texels || Math.abs(oz - this.originZ) >= this.texels) {
      this.data.fill(0);
    } else {
      // Texels that scroll into the window still hold prints from one window away.
      this.clear(ox > this.originX ? this.originX + this.texels : ox, ox > this.originX ? ox + this.texels : this.originX, true);
      this.clear(oz > this.originZ ? this.originZ + this.texels : oz, oz > this.originZ ? oz + this.texels : this.originZ, false);
    }
    this.originX = ox;
    this.originZ = oz;
    this.center.set((ox + half) * this.texel, (oz + half) * this.texel);
    this.dirty = true;
  }

  /** Whether world (x, z) lies inside the window. */
  covers(x: number, z: number): boolean {
    const ix = Math.floor(x / this.texel) - this.originX, iz = Math.floor(z / this.texel) - this.originZ;
    return ix >= 0 && iz >= 0 && ix < this.texels && iz < this.texels;
  }

  /** Dent depth 0–1 at world (x, z), the texel's own value; 0 outside the window. */
  depthAt(x: number, z: number): number {
    if (!this.covers(x, z)) return 0;
    return this.data[this.index(Math.floor(x / this.texel), Math.floor(z / this.texel))]! / 255;
  }

  /** Presses a rounded print at world (x, z), its long axis along `heading` (radians, from +x toward +z). */
  stamp(x: number, z: number, heading: number, strength = 1): void {
    if (!this.covers(x, z)) return;
    const [length, width] = TRAIL.foot, cos = Math.cos(heading), sin = Math.sin(heading), t = this.texel;
    for (let iz = Math.floor((z - length) / t); iz <= Math.floor((z + length) / t); iz++) {
      for (let ix = Math.floor((x - length) / t); ix <= Math.floor((x + length) / t); ix++) {
        const dx = (ix + 0.5) * t - x, dz = (iz + 0.5) * t - z;
        const along = (dx * cos + dz * sin) / length, across = (dz * cos - dx * sin) / width;
        const reach = Math.hypot(along, across);
        if (reach >= 1 || !this.covers((ix + 0.5) * t, (iz + 0.5) * t)) continue;
        const i = this.index(ix, iz);
        const depth = Math.round(255 * strength * Math.min(1, (1 - reach) * 2.2));
        if (depth > this.data[i]!) this.data[i] = depth;
      }
    }
    this.dirty = true;
  }

  /** Lifts every print by `amount` of 255; false once none is left. */
  fade(amount: number): boolean {
    let left = false;
    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i]!;
      if (!value) continue;
      this.data[i] = value > amount ? value - amount : 0;
      left = true;
    }
    if (left) this.dirty = true;
    return left;
  }

  dispose(): void {
    this.texture.dispose();
  }

  private index(ix: number, iz: number): number {
    return wrap(iz, this.texels) * this.texels + wrap(ix, this.texels);
  }

  /** Zeroes world texel columns (or rows) [from, to). */
  private clear(from: number, to: number, columns: boolean): void {
    for (let line = from; line < to; line++) {
      const at = wrap(line, this.texels);
      if (!columns) this.data.fill(0, at * this.texels, (at + 1) * this.texels);
      else for (let row = 0; row < this.texels; row++) this.data[row * this.texels + at] = 0;
    }
  }
}
