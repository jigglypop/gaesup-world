import type * as THREE from 'three';

import { heading, PlantBuilder, seeded, type Vec3 } from './kit';
import { CROPS } from '../../../terrain/farm/config';
import type { FarmCrop, FarmStage } from '../../../types';

/** What a crop chunk draws: a crop, or the weeds of a fallow bed. */
export type PlantKind = Exclude<FarmCrop, 'none'> | 'weed';

type Grown = 'young' | 'ripe';
/** Adds a plant to `b`; `near` draws the full plant, otherwise fewer and coarser parts for the far tier. */
type Recipe = (b: PlantBuilder, grown: Grown, near: boolean, r: () => number) => void;

const TAU = Math.PI * 2;
/** Parts per tier: the near count, or the far one. */
const n = (near: boolean, full: number, far: number) => (near ? full : far);
const ring = (count: number, r: () => number, jitter = 0.35) => Array.from({ length: count }, (_, i) => (i / count) * TAU + (r() - 0.5) * jitter);
const at = (yaw: number, radius: number, y: number): Vec3 => [Math.cos(yaw) * radius, y, Math.sin(yaw) * radius];
const along = (from: Vec3, dir: Vec3, length: number): Vec3 => [from[0] + dir[0] * length, from[1] + dir[1] * length, from[2] + dir[2] * length];

/** Rosette leaves, the start of lettuce, cabbage and herbs. */
function rosette(b: PlantBuilder, count: number, r: () => number, length: number, pitch: number, look: { width: number; droop: number; fold: number; color: string; tip: string }, y = 0.02) {
  for (const yaw of ring(count, r)) b.leaf([0, y, 0], heading(yaw, pitch + (r() - 0.5) * 0.2), length * (0.9 + r() * 0.2), { ...look, belly: 0.6 });
}

const RECIPES: Record<PlantKind, Recipe> = {
  lettuce(b, grown, near, r) {
    const s = grown === 'ripe' ? 1 : 0.62;
    rosette(b, n(near, 7, 5), r, 0.24 * s, 0.5, { width: 0.19 * s, droop: 0.55, fold: 0.35, color: '#6aa843', tip: '#bde27e' });
    if (grown === 'ripe') rosette(b, n(near, 4, 2), r, 0.13, 1.05, { width: 0.12, droop: 0.4, fold: 0.5, color: '#9ccf63', tip: '#d6f19c' }, 0.04);
    if (near && grown === 'ripe') b.ball([0, 0.085, 0], 0.05, '#c9eb8f', { detail: 0, squash: 0.8 });
  },
  cabbage(b, grown, near, r) {
    const s = grown === 'ripe' ? 1 : 0.65;
    rosette(b, n(near, 6, 4), r, 0.26 * s, 0.32, { width: 0.23 * s, droop: 0.45, fold: 0.45, color: '#6e9e78', tip: '#a9d0a2' });
    b.stiffness(0.2).ball([0, 0.13 * s, 0], 0.12 * s, grown === 'ripe' ? '#cfe6b0' : '#a9cf8f', { detail: n(near, 1, 0), squash: 0.88 });
    if (grown === 'ripe') rosette(b, n(near, 3, 2), r, 0.17, 1.15, { width: 0.19, droop: 0.95, fold: 0.5, color: '#a9cf92', tip: '#c7e3ac' }, 0.05);
  },
  carrot(b, grown, near, r) {
    const s = grown === 'ripe' ? 1 : 0.6;
    for (const yaw of ring(n(near, 7, 4), r)) {
      b.leaf([0, 0.02, 0], heading(yaw, 1.05 + r() * 0.3), 0.34 * s, { width: 0.085, droop: 0.55, fold: 0.1, color: '#4c9635', tip: '#80c455', belly: 0.65 });
    }
    if (grown === 'ripe') b.stiffness(0).ball([0, 0.012, 0], 0.036, '#f08a2a', { detail: 0, squash: 1.2 });
  },
  potato(b, grown, near, r) {
    const layers = grown === 'ripe' ? 3 : 2;
    for (const [i, yaw] of ring(n(near, 12, 7), r, 0.6).entries()) {
      const level = i % layers;
      b.leaf(at(yaw, 0.05, 0.06 + level * 0.11), heading(yaw, 0.7 - level * 0.2), 0.25, { width: 0.18, droop: 0.45, fold: 0.3, color: '#487f36', tip: '#6fac4c' });
    }
    if (grown !== 'ripe' || !near) return;
    for (const yaw of ring(4, r, 1)) {
      const top = at(yaw, 0.08, 0.4);
      b.stem([0, 0, 0], top, 0.007, '#5a8a3c', 3).disc(top, [0, 1, 0], 0.032, '#f1ecfb', 5).ball([top[0], top[1] + 0.012, top[2]], 0.009, '#f6d34a', { detail: 0 });
    }
  },
  tomato(b, grown, near, r) {
    const top = grown === 'ripe' ? 6 : 3;
    b.stiffness(0).stem([0.07, 0, 0], [0.07, 1.32, 0], 0.017, '#a57a4a', 4).stiffness(0.35);
    const vine = Array.from({ length: top + 1 }, (_, k): Vec3 => [Math.sin(k * 1.7) * 0.035, k * 0.19, Math.cos(k * 1.7) * 0.035]);
    for (let k = 0; k < top; k++) {
      b.stem(vine[k]!, vine[k + 1]!, 0.012, '#5f8f3a', 3);
      if (near || k % 2) b.leaf(vine[k + 1]!, heading(k * 2.4 + r(), 0.25), 0.24, { width: 0.17, droop: 0.6, fold: 0.35, color: '#4b8333', tip: '#70a84c' });
    }
    if (grown !== 'ripe') {
      b.disc(vine[top]!, [0, 1, 0], 0.03, '#f6d34a', 5);
      return;
    }
    const fruit = ['#e5432f', '#e5432f', '#ee6a30', '#9cc24a'];
    for (const [k, height] of [0.34, 0.58, 0.82, 1.02].entries()) {
      for (let i = 0; i < n(near, 3, 2); i++) {
        const yaw = k * 2.1 + i * 1.3;
        b.ball(at(yaw, 0.09 + i * 0.015, height - i * 0.045), 0.05 - k * 0.004, fruit[(k + i) % fruit.length]!, { detail: n(near, 1, 0), squash: 0.9 });
      }
    }
  },
  corn(b, grown, near, r) {
    const ripe = grown === 'ripe', height = ripe ? 1.9 : 1;
    b.stiffness(0.6).stem([0, 0, 0], [0, height, 0], 0.026, '#8fb04c', n(near, 5, 3), 0.014);
    const leaves = n(near, ripe ? 8 : 6, 5);
    for (let i = 0; i < leaves; i++) {
      b.leaf([0, 0.2 + (i * (height - 0.35)) / leaves, 0], heading(i * Math.PI + (r() - 0.5) * 0.9, 0.95), (ripe ? 0.78 : 0.55) - i * 0.03, {
        width: 0.085, droop: 1.15, fold: 0.15, color: '#6a9a3a', tip: '#a9c96c', belly: 0.35, segments: n(near, 4, 3),
      });
    }
    if (!ripe) return;
    b.stiffness(0.4).ball([0.07, 0.95, 0.02], 0.045, '#a7c46a', { detail: 0, stretch: 2.5 }).ball([0.09, 1.07, 0.02], 0.03, '#f2cf4f', { detail: 0, stretch: 1.4 });
    for (const yaw of ring(n(near, 5, 3), r, 0.8)) b.blade([0, height, 0], heading(yaw, 1.15 + r() * 0.25), 0.24, 0.018, '#d6bd76', '#ecd89a', 0.5);
  },
  wheat(b, grown, near, r) {
    const ripe = grown === 'ripe';
    for (let i = 0; i < n(near, 6, 4); i++) {
      const yaw = i * 2.39 + r(), base = at(yaw, 0.035, 0), dir = heading(yaw, 1.43 - r() * 0.12), length = (ripe ? 0.72 : 0.46) + r() * 0.12;
      b.blade(base, dir, length, 0.02, ripe ? '#c3a256' : '#5f9a3c', ripe ? '#e0c068' : '#8cc257', 0.03);
      if (ripe) b.ball(along(base, dir, length + 0.045), 0.021, i % 2 ? '#e8c56a' : '#dcb45a', { detail: 0, stretch: 3 });
    }
    b.blade([0, 0, 0], heading(r() * TAU, 0.8), 0.3, 0.03, ripe ? '#b39a52' : '#5a9038', ripe ? '#d5ba68' : '#7fb24c', 0.45);
  },
  rice(b, grown, near, r) {
    const ripe = grown === 'ripe';
    for (const yaw of ring(n(near, 9, 6), r, 0.5)) {
      b.blade([0, 0, 0], heading(yaw, 1.18 + r() * 0.25), (ripe ? 0.56 : 0.42) + r() * 0.14, 0.032, ripe ? '#79a843' : '#6fb446', ripe ? '#b9c96a' : '#a6d86c', 0.35);
    }
    if (!ripe) return;
    for (const yaw of ring(n(near, 4, 2), r, 1)) {
      b.leaf([0, 0.5, 0], heading(yaw, 0.65), 0.26, { width: 0.04, droop: 1.3, fold: 0, color: '#c9b05a', tip: '#e2cf7a', belly: 0.5, segments: 3 });
    }
  },
  pumpkin: (b, grown, near, r) => vine(b, grown, near, r, { fruit: '#f08a2e', radius: 0.17, squash: 0.78, ribs: 0.075, lobes: 8 }),
  melon: (b, grown, near, r) => vine(b, grown, near, r, { fruit: '#b9cf78', radius: 0.14, squash: 0.92, ribs: 0.015, lobes: 10, stripes: '#86a84e' }),
  strawberry(b, grown, near, r) {
    b.stiffness(0.45);
    for (const yaw of ring(n(near, 6, 4), r)) {
      const top = at(yaw, 0.08, 0.14 + r() * 0.05);
      b.stem([0, 0, 0], top, 0.005, '#4f8a3c', 3);
      for (let k = -1; k <= 1; k++) b.leaf(top, heading(yaw + k * 0.9, 0.2), 0.1, { width: 0.085, droop: 0.3, fold: 0.3, color: '#3d8a3a', tip: '#62ae50', segments: 2 });
    }
    for (const yaw of ring(2, r, 1)) b.disc(at(yaw + 0.8, 0.1, 0.13), [0, 1, 0], 0.026, '#fbf7f0', 5).ball(at(yaw + 0.8, 0.1, 0.14), 0.008, '#f6d34a', { detail: 0 });
    if (grown === 'ripe') for (const yaw of ring(n(near, 5, 3), r, 1)) b.stiffness(0.2).ball(at(yaw, 0.17, 0.06), 0.034, '#e0364a', { detail: 0, stretch: 1.25 });
  },
  sunflower(b, grown, near, r) {
    const ripe = grown === 'ripe', height = ripe ? 1.72 : 0.9;
    b.stiffness(0.45).stem([0, 0, 0], [0, height, 0], 0.03, '#6f9a3c', n(near, 5, 3), 0.02);
    for (let i = 0; i < n(near, ripe ? 6 : 4, 3); i++) {
      b.leaf([0, 0.3 + i * (height - 0.45) / 5, 0], heading(i * 2.5 + r(), 0.2), 0.27 - i * 0.015, { width: 0.23, droop: 0.5, fold: 0.25, color: '#5b8e35', tip: '#7cae4c', belly: 0.4 });
    }
    if (!ripe) {
      b.ball([0, height + 0.04, 0], 0.06, '#7fae4a', { detail: 0 });
      return;
    }
    // The face looks along +x, tipped down a little; the layout turns every head roughly the same way.
    const face = heading(0, -0.35), center: Vec3 = [0.05, height + 0.06, 0];
    const u: Vec3 = [0, 0, 1], v: Vec3 = [-face[1], face[0], 0];
    b.disc(along(center, face, -0.02), [-face[0], -face[1], -face[2]], 0.13, '#6f9a3c', 10);
    for (let k = 0; k < n(near, 14, 9); k++) {
      const a = (k / n(near, 14, 9)) * TAU, dir: Vec3 = [u[0] * Math.cos(a) + v[0] * Math.sin(a), u[1] * Math.cos(a) + v[1] * Math.sin(a), u[2] * Math.cos(a) + v[2] * Math.sin(a)];
      b.leaf(along(center, dir, 0.09), dir, 0.12, { width: 0.06, droop: 0.05, fold: 0.2, color: '#f6c537', tip: '#fbd65a', segments: 2 });
    }
    b.disc(along(center, face, 0.016), face, 0.105, '#6b4424', 12);
  },
  tulip(b, grown, near, r) {
    const ripe = grown === 'ripe', height = ripe ? 0.37 : 0.25;
    for (const yaw of ring(2, r, 0.8)) b.leaf([0, 0.01, 0], heading(yaw, 1.15), 0.2, { width: 0.075, droop: 0.35, fold: 0.4, color: '#5f9a4e', tip: '#86b86a', belly: 0.35 });
    b.stem([0, 0, 0], [0, height, 0], 0.007, '#6aa44a', 3);
    if (!ripe) {
      b.ball([0, height + 0.02, 0], 0.025, '#8fbf5a', { detail: 0, stretch: 1.6 });
      return;
    }
    for (const yaw of ring(n(near, 6, 4), r, 0.2)) {
      b.leaf(at(yaw, 0.012, height), heading(yaw, 1.22), 0.09, { width: 0.065, droop: -0.2, fold: 0.5, color: '#f0485e', bloom: 1, belly: 0.55, segments: 2 });
    }
  },
  lavender(b, grown, near, r) {
    const ripe = grown === 'ripe';
    for (const [i, yaw] of ring(n(near, 16, 9), r, 0.5).entries()) {
      b.blade(at(yaw, 0.03, 0.01), heading(yaw, 0.45 + (i % 3) * 0.35), 0.2 + r() * 0.06, 0.035, '#627a64', '#9fb39c', 0.3);
    }
    for (let i = 0; i < n(near, ripe ? 18 : 10, 10); i++) {
      const yaw = i * 2.39 + r(), base = at(yaw, 0.08 + r() * 0.06, 0.1), dir = heading(yaw, 1.05 + r() * 0.4), length = (ripe ? 0.36 : 0.24) + r() * 0.14;
      b.blade(base, dir, length, 0.014, '#8fa58a', '#9fb49a', 0.05);
      if (ripe) b.ball(along(base, dir, length + 0.045), 0.024, i % 3 ? '#8f78d0' : '#a78fe2', { detail: 0, stretch: 3 });
    }
  },
  herb(b, grown, near, r) {
    const leaves = grown === 'ripe' ? n(near, 11, 6) : 5, top = grown === 'ripe' ? 0.28 : 0.16;
    for (const yaw of ring(3, r)) b.stem([0, 0, 0], at(yaw, 0.04, top), 0.006, '#4f8a36', 3);
    for (let i = 0; i < leaves; i++) {
      const yaw = i * 2.4 + r(), y = 0.04 + (i / leaves) * top;
      b.leaf(at(yaw, 0.03, y), heading(yaw, 0.35 + (i / leaves) * 0.8), 0.09 - (i / leaves) * 0.03, { width: 0.075, droop: 0.35, fold: 0.45, color: '#4b9a3a', tip: '#80c45c', segments: 2 });
    }
  },
  weed(b, _grown, near, r) {
    for (const yaw of ring(n(near, 6, 4), r, 0.8)) b.blade([0, 0, 0], heading(yaw, 1 + r() * 0.4), 0.16 + r() * 0.1, 0.026, '#6f8f3e', '#a4b85c', 0.35);
    for (const yaw of ring(2, r, 1)) b.leaf([0, 0.01, 0], heading(yaw, 0.25), 0.1, { width: 0.06, droop: 0.2, color: '#5d8a3a', tip: '#7ea64c' });
    if (near) b.stem([0, 0, 0], [0.02, 0.2, 0], 0.004, '#6f8f3e', 3).disc([0.02, 0.2, 0], [0, 1, 0], 0.024, '#f3d24a', 6);
  },
};

/** Pumpkins and melons: broad leaves on a runner along the ground and, when ripe, the fruit beside it. */
function vine(b: PlantBuilder, grown: Grown, near: boolean, r: () => number, fruit: { fruit: string; radius: number; squash: number; ribs: number; lobes: number; stripes?: string }) {
  b.stiffness(0.35).stem([0, 0.02, 0], [0.5, 0.02, 0.12], 0.012, '#6c9a44', 3);
  for (const yaw of ring(n(near, 5, 3), r, 0.5)) {
    const top = at(yaw, 0.17, 0.17 + r() * 0.08);
    b.stem([0, 0, 0], top, 0.01, '#6c9a44', 3).leaf(top, heading(yaw, 0.1), 0.27, { width: 0.31, droop: 0.2, fold: 0.3, color: '#4c8738', tip: '#72aa52', belly: 0.55 });
  }
  const spot: Vec3 = [0.3, fruit.radius * fruit.squash, 0.22];
  if (grown !== 'ripe') {
    b.disc([0.3, 0.12, 0.2], [0.3, 1, 0.2], 0.05, '#f6c537', 5).ball([0.34, 0.05, 0.28], 0.055, '#9cbf5a', { detail: 0 });
    return;
  }
  b.stiffness(0).ball(spot, fruit.radius, fruit.fruit, { detail: n(near, 1, 0), squash: fruit.squash, ribs: fruit.ribs, lobes: fruit.lobes, ...(fruit.stripes ? { stripes: fruit.stripes } : {}) });
  b.stem([spot[0], spot[1] * 1.7, spot[2]], [spot[0] + 0.01, spot[1] * 1.7 + 0.06, spot[2]], 0.016, '#6b5a2a', 3);
}

/** Seed leaves: a pair of rounded leaves on a short stalk, or three blades for grasses. */
function sprout(b: PlantBuilder, kind: PlantKind, r: () => number) {
  if (kind === 'wheat' || kind === 'rice' || kind === 'corn') {
    for (const yaw of ring(3, r, 0.8)) b.blade([0, 0, 0], heading(yaw, 1.2 + r() * 0.2), 0.13, 0.026, '#6fb446', '#a6d86c', 0.3);
    return;
  }
  const color = kind === 'lavender' ? '#8fa58a' : '#6fb446';
  b.stem([0, 0, 0], [0, 0.05, 0], 0.007, color, 3);
  for (const yaw of [0, Math.PI]) b.leaf([0, 0.05, 0], heading(yaw + (r() - 0.5) * 0.4, 0.4), 0.075, { width: 0.06, droop: 0.25, fold: 0.3, color, tip: '#b4e07a', belly: 0.6 });
  b.leaf([0, 0.055, 0], heading(Math.PI / 2, 1), 0.04, { width: 0.03, color: '#9fd46a', segments: 2 });
}

const templates = new Map<string, THREE.BufferGeometry>();

/** Height (m) a plant sways over; the layout's instance scale stretches it. */
export function plantHeight(kind: PlantKind, stage: FarmStage): number {
  if (stage === 'sprout') return 0.12;
  const full = kind === 'weed' ? 0.25 : CROPS[kind].height;
  return stage === 'ripe' ? full : full * 0.6;
}

/** How freely each plant sways at its top. */
const FLEX: Record<PlantKind, number> = {
  lettuce: 0.25, cabbage: 0.2, carrot: 0.8, potato: 0.5, tomato: 0.35, corn: 0.6, wheat: 1, rice: 1, pumpkin: 0.35,
  melon: 0.35, strawberry: 0.4, sunflower: 0.45, tulip: 0.9, lavender: 0.9, herb: 0.5, weed: 1,
};

/**
 * The shared template geometry of a plant: tier 0 near, tier 1 far. Built once per kind, stage and tier from a fixed
 * seed, so every client draws the same plant.
 */
export function plantTemplate(kind: PlantKind, stage: FarmStage, tier: 0 | 1): THREE.BufferGeometry {
  const key = `${kind}|${stage}|${tier}`;
  let geometry = templates.get(key);
  if (!geometry) {
    const b = new PlantBuilder(plantHeight(kind, stage), FLEX[kind]), r = seeded(key.length * 7919 + kind.charCodeAt(0));
    if (stage === 'sprout') sprout(b, kind, r);
    else RECIPES[kind](b, stage, tier === 0, r);
    geometry = b.build();
    templates.set(key, geometry);
  }
  return geometry;
}
