import * as THREE from 'three';

export type Vec3 = readonly [number, number, number];

const UP: Vec3 = [0, 1, 0];
const color = new THREE.Color();

const add = (a: Vec3, b: Vec3, s = 1): Vec3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

/** A unit direction at `yaw` around y, raised `pitch` radians from the ground. */
export const heading = (yaw: number, pitch: number): Vec3 => [Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)];

export type LeafOptions = {
  /** Width at its widest, droop (how far the tip falls per unit of length) and the V-fold of its halves. */
  width: number;
  droop?: number;
  fold?: number;
  segments?: number;
  /** Base and tip colors. */
  color: string;
  tip?: string;
  /** 1 on flowers whose color comes from the plant's bloom tint. */
  bloom?: number;
  /** Where the widest point lies along the leaf, 0..1; lower makes a spoon, higher a blade. */
  belly?: number;
};

/**
 * Low-poly plant geometry in the plant's own space, root at the origin: vertex colors, and a `farmPlant` attribute
 * with how far each vertex sways (rising with height over `height`, scaled by each part's `flex`) and its bloom mask.
 */
export class PlantBuilder {
  private readonly positions: number[] = [];
  private readonly normals: number[] = [];
  private readonly colors: number[] = [];
  private readonly plant: number[] = [];
  private readonly indices: number[] = [];

  constructor(private readonly height: number, private flex = 1) {}

  /** Parts added after this sway `flex` times as much: 0 for stakes, low for stiff stalks. */
  stiffness(flex: number): this {
    this.flex = flex;
    return this;
  }

  private vertex(p: Vec3, hex: string, bloom: number, normal: Vec3 = [0, 0, 0]): number {
    const sway = this.flex * Math.min(1.2, Math.max(0, p[1] / this.height)) ** 1.5;
    this.positions.push(...p);
    this.normals.push(...normal);
    color.set(hex);
    this.colors.push(color.r, color.g, color.b);
    this.plant.push(sway, bloom);
    return this.positions.length / 3 - 1;
  }

  /** Smooth normals over the triangles added from index `from`, for parts without analytic normals. */
  private smooth(from: number): void {
    const { positions: p, normals: n, indices } = this;
    for (let i = from; i < indices.length; i += 3) {
      const [a, b, c] = [indices[i]! * 3, indices[i + 1]! * 3, indices[i + 2]! * 3];
      const face = cross([p[b]! - p[a]!, p[b + 1]! - p[a + 1]!, p[b + 2]! - p[a + 2]!], [p[c]! - p[a]!, p[c + 1]! - p[a + 1]!, p[c + 2]! - p[a + 2]!]);
      for (const v of [a, b, c]) for (let k = 0; k < 3; k++) n[v + k]! += face[k]!;
    }
  }

  private finishNormals(fromVertex: number): void {
    const n = this.normals;
    for (let v = fromVertex * 3; v < n.length; v += 3) {
      const [x, y, z] = normalize([n[v]!, n[v + 1]!, n[v + 2]!]);
      n[v] = x; n[v + 1] = y; n[v + 2] = z;
    }
  }

  /**
   * A leaf, petal or blade from `base` along `dir`: a midrib that droops toward its tip and two halves folded up
   * along it, widest at `belly`. Its flat side faces the sky.
   */
  leaf(base: Vec3, dir: Vec3, length: number, options: LeafOptions): this {
    const { width, droop = 0.3, fold = 0.25, segments = 3, tip = options.color, bloom = 0, belly = 0.45 } = options;
    const forward = normalize(dir);
    const side = Math.abs(forward[1]) > 0.98 ? ([1, 0, 0] as Vec3) : normalize(cross(forward, UP));
    const up = normalize(cross(side, forward));
    const firstIndex = this.indices.length, firstVertex = this.positions.length / 3;
    const mix = (t: number) => (t < 0.6 ? options.color : tip);
    let previous: number[] | null = null;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const spine = add(add(base, forward, length * t), UP, -droop * length * t * t);
      const half = (width / 2) * Math.sin(Math.PI * Math.min(1, t < belly ? (t / belly) * 0.5 : 0.5 + ((t - belly) / (1 - belly)) * 0.5)) ** 0.8;
      const lift = half * fold;
      const hex = mix(t);
      const row = s === segments
        ? [this.vertex(spine, tip, bloom)]
        : [
            this.vertex(add(add(spine, side, -half), up, lift), hex, bloom),
            this.vertex(spine, hex, bloom),
            this.vertex(add(add(spine, side, half), up, lift), hex, bloom),
          ];
      if (previous) {
        const [l, m, r] = previous as [number, number, number];
        if (row.length === 1) this.indices.push(l, m, row[0]!, m, r, row[0]!);
        else this.indices.push(l, m, row[0]!, m, row[1]!, row[0]!, m, r, row[1]!, r, row[2]!, row[1]!);
      }
      previous = row;
    }
    this.smooth(firstIndex);
    this.finishNormals(firstVertex);
    return this;
  }

  /** A thin tapered blade: stalks, fronds, grass. */
  blade(base: Vec3, dir: Vec3, length: number, width: number, hex: string, tip = hex, droop = 0.15): this {
    return this.leaf(base, dir, length, { width, droop, fold: 0, segments: 2, color: hex, tip, belly: 0.05 });
  }

  /** A ball, squashed along y by `squash`, its surface pushed out by `ribs` lobes around y; `stripes` paints alternate lobes. */
  ball(center: Vec3, radius: number, hex: string, { detail = 1, squash = 1, ribs = 0, lobes = 8, stripes, stretch = 1 }: {
    detail?: number; squash?: number; ribs?: number; lobes?: number; stripes?: string; stretch?: number;
  } = {}): this {
    const sphere = new THREE.IcosahedronGeometry(1, detail);
    const points = sphere.getAttribute('position');
    const first = this.positions.length / 3;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i), angle = Math.atan2(z, x);
      const lobe = Math.cos(angle * lobes);
      const r = radius * (1 + ribs * lobe * (1 - Math.abs(y)));
      const hexAt = stripes && lobe > 0.3 ? stripes : hex;
      this.vertex([center[0] + x * r, center[1] + y * r * squash * stretch, center[2] + z * r], hexAt, 0, normalize([x, y / (squash * stretch), z]));
      this.indices.push(first + i);
    }
    sphere.dispose();
    return this;
  }

  /** An open prism from `from` to `to`, `sides` faces around. */
  stem(from: Vec3, to: Vec3, radius: number, hex: string, sides = 4, top = radius): this {
    const axis = normalize([to[0] - from[0], to[1] - from[1], to[2] - from[2]]);
    const u = Math.abs(axis[1]) > 0.98 ? ([1, 0, 0] as Vec3) : normalize(cross(axis, UP));
    const v = cross(u, axis);
    const first = this.positions.length / 3;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const out = add(add([0, 0, 0], u, Math.cos(a)), v, Math.sin(a));
      this.vertex(add(from, out, radius), hex, 0, out);
      this.vertex(add(to, out, top), hex, 0, out);
    }
    for (let i = 0; i < sides; i++) {
      const a = first + i * 2, b = first + ((i + 1) % sides) * 2;
      this.indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
    return this;
  }

  /** A flat fan facing `normal`, such as a flower's face. */
  disc(center: Vec3, normal: Vec3, radius: number, hex: string, sides = 8, bloom = 0): this {
    const n = normalize(normal);
    const u = Math.abs(n[1]) > 0.98 ? ([1, 0, 0] as Vec3) : normalize(cross(n, UP));
    const v = cross(n, u);
    const middle = this.vertex(add(center, n, radius * 0.25), hex, bloom, n);
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      this.vertex(add(add(center, u, Math.cos(a) * radius), v, Math.sin(a) * radius), hex, bloom, n);
    }
    for (let i = 0; i < sides; i++) this.indices.push(middle, middle + 1 + i, middle + 1 + ((i + 1) % sides));
    return this;
  }

  build(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
    geometry.setAttribute('farmPlant', new THREE.Float32BufferAttribute(this.plant, 2));
    geometry.setIndex(this.indices);
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/** A seeded stream in [0, 1): the same plant shape on every client. */
export function seeded(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
