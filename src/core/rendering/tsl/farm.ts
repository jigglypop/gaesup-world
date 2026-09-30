import {
  attribute, cameraPosition, cameraViewMatrix, clamp, dot, float, floor, Fn, fract, length, min, mix, normalize, normalView,
  normalWorldGeometry, positionLocal, positionViewDirection, positionWorld, pow, select, sin, smoothstep, step, time, uniform, vec2, vec3, vec4,
} from 'three/tsl';
import { DoubleSide, MeshStandardNodeMaterial, MeshToonNodeMaterial, type Node, type Texture } from 'three/webgpu';

import { GRASS_FADE_BAND } from './grassMaterial';
import { hash12, hash22, noise } from './groundCover';
import { rainRipples, weatherNodes, wetSurface } from './weatherSurface';

type Vec2Node = Node<'vec2'>;
type Curve = { near: number; far: number; strength: number };
type Shading = { toon?: boolean; gradientMap?: Texture | null };

const TAU = Math.PI * 2;
/** The grass wind, so crops and grass bend together. */
const WIND = { x: 0.848, z: 0.53 } as const;
/** Meters a fully flexible plant top travels in a gust at wind scale 1. */
const SWAY = 0.13;

const material = ({ toon = false, gradientMap = null }: Shading, options: ConstructorParameters<typeof MeshStandardNodeMaterial>[0]) =>
  toon ? new MeshToonNodeMaterial({ ...options, gradientMap }) : new MeshStandardNodeMaterial({ ...options, metalness: 0 });

/**
 * Crops drawn as instanced plants. Instance attributes `farmRoot` (root x, y, z and draw rank) and `farmTint` (bloom
 * color and shade) with vertex attributes `farmPlant` (sway weight, bloom mask). Each plant sways downwind under rolling
 * gusts with its own flutter, and past its LOD share it shrinks into its root along the draw rank, matching the CPU draw
 * count, so thinning never pops. The mesh sits at the world origin.
 */
export class FarmCropMaterial {
  readonly uniforms = { time: uniform(0), wind: uniform(0.85), near: uniform(22), far: uniform(58), strength: uniform(1.3) };
  readonly material: MeshStandardNodeMaterial | MeshToonNodeMaterial;

  constructor({ near, far, strength }: Curve, shading: Shading = {}) {
    const u = this.uniforms;
    u.near.value = near;
    u.far.value = far;
    u.strength.value = strength;
    this.material = material(shading, { side: DoubleSide, roughness: 0.82 });
    this.material.name = 'farm-crop';
    const root = attribute<'vec4'>('farmRoot', 'vec4'), tint = attribute<'vec4'>('farmTint', 'vec4'), plant = attribute<'vec2'>('farmPlant', 'vec2');
    const base = root.xyz;
    const lod = pow(clamp(float(1).sub(length(cameraPosition.sub(base)).sub(u.near).div(u.far.sub(u.near))), 0, 1), u.strength);
    const grow = smoothstep(0, 1, lod.mul(1 + GRASS_FADE_BAND).sub(root.w).div(lod.mul(GRASS_FADE_BAND).add(1e-5)));
    const clock = u.time.mul(4), downwind = base.x.mul(WIND.x).add(base.z.mul(WIND.z)), crosswind = base.z.mul(WIND.x).sub(base.x.mul(WIND.z));
    const gust = smoothstep(0.2, 1, sin(downwind.mul(0.32).sub(clock.mul(1.25)).add(sin(crosswind.mul(0.21)).mul(1.4))).mul(0.5).add(0.5));
    const seed = fract(root.w.mul(37.1));
    const flutter = sin(clock.mul(mix(float(2.1), float(3.3), seed)).add(seed.mul(TAU)).add(downwind.mul(1.3))).mul(gust.add(0.3)).mul(0.3);
    const push = u.wind.mul(gust.mul(0.75).add(0.2).add(flutter)).mul(plant.x).mul(SWAY).mul(grow);
    this.material.positionNode = base.add(positionLocal.sub(base).mul(grow)).add(vec3(push.mul(WIND.x), push.mul(push).mul(-0.8), push.mul(WIND.z)));
    this.material.colorNode = mix(attribute<'vec3'>('color', 'vec3'), tint.rgb, plant.y).mul(mix(float(0.88), float(1.1), tint.w));
  }
}

/** Cracks of dry soil: 0 on a crack line between the jittered cells of `p`, rising to their width (F2 − F1). */
const crackLines = Fn(([p]: [Vec2Node]) => {
  const cell = floor(p), local = fract(p);
  const first = float(8).toVar(), second = float(8).toVar();
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const offset = vec2(i, j);
      const distance = length(offset.add(hash22(cell.add(offset)).mul(0.8).add(0.1)).sub(local));
      second.assign(select(distance.lessThan(first), first, min(second, distance)));
      first.assign(min(first, distance));
    }
  }
  return second.sub(first);
});

/**
 * Farm soil, its tile colors in `color` and `farmSoil` (trough, crack, wet, canopy share) with `farmCanopy`: grit and
 * crumbs on the ridges, dark wet troughs, cracks on dry soil, rain soaking it with puddles, and past `near` the rows
 * take the crop's foliage color as the plants thin out, so a far field still reads green or golden.
 */
export function createFarmSoilMaterial({ near, far }: Pick<Curve, 'near' | 'far'>, shading: Shading = {}) {
  const soil = attribute<'vec4'>('farmSoil', 'vec4'), canopy = attribute<'vec3'>('farmCanopy', 'vec3');
  const world = positionWorld.xz, distance = length(cameraPosition.sub(positionWorld));
  const close = smoothstep(16, 4, distance);
  const grit = mix(float(1), mix(float(0.9), float(1.08), noise(world.mul(11)).x), close);
  const crumbs = world.mul(9), crumb = floor(crumbs);
  const clod = step(0.6, hash12(crumb.add(3.1)))
    .mul(smoothstep(0.32, 0.12, length(fract(crumbs).sub(hash22(crumb).mul(0.5).add(0.25)))))
    .mul(float(1).sub(soil.x)).mul(close);
  const crack = soil.y.mul(float(1).sub(smoothstep(0.02, 0.06, crackLines(world.mul(2.6))))).mul(smoothstep(30, 8, distance));
  const tone = attribute<'vec3'>('color', 'vec3').mul(grit).mul(clod.mul(0.2).add(1)).mul(float(1).sub(crack.mul(0.55)));
  const wet = soil.z;
  const moist = tone.mul(mix(float(1), float(0.62), wet));
  const thin = smoothstep(near * 0.8, far * 0.85, distance).mul(soil.w);
  const leafy = canopy.mul(mix(float(0.86), float(1.1), noise(world.mul(1.3)).x));
  const shaded = mix(moist, leafy, thin.mul(0.9));
  const rained = wetSurface(shaded, mix(float(0.97), float(0.42), wet), { porosity: 0.9 });
  const out = material(shading, { roughness: 0.95 });
  out.name = 'farm-soil';
  out.colorNode = vec4(rained.color, 1);
  if (out instanceof MeshStandardNodeMaterial) {
    out.roughnessNode = rained.roughness;
    // Crumbs and crack rims tilt the normal a little, so low sun picks out the tilth.
    const lean = hash22(crumb).sub(0.5).mul(clod.mul(0.5)).add(noise(world.mul(6)).yz.mul(0.012).mul(close));
    out.normalNode = normalize(cameraViewMatrix.mul(vec4(normalize(normalWorldGeometry.sub(vec3(lean.x, 0, lean.y))), 0)).xyz);
  }
  return out;
}

/**
 * Shallow paddy water: muddy green looking down, the sky's color toward grazing angles, small wind ripples and rain
 * rings. Blended over the soil below.
 */
export function createPaddyWaterMaterial(shading: Shading = {}) {
  const out = material(shading, { transparent: true, depthWrite: false, roughness: 0.06 });
  out.name = 'farm-paddy-water';
  const world = positionWorld.xz;
  const ripple = noise(world.mul(3.2).add(vec2(time.mul(0.35), time.mul(0.22)))).yz.mul(0.035).add(rainRipples(world));
  const tilted = normalize(cameraViewMatrix.mul(vec4(normalize(vec3(ripple.x.negate(), 1, ripple.y.negate())), 0)).xyz);
  const fresnel = pow(float(1).sub(clamp(dot(normalView, positionViewDirection), 0, 1)), 3);
  out.colorNode = vec4(mix(vec3(0.2, 0.3, 0.3), vec3(0.62, 0.78, 0.88), fresnel.mul(0.85)), 1);
  out.opacityNode = mix(float(0.55), float(0.92), fresnel).add(weatherNodes().rain.mul(0.05));
  if (out instanceof MeshStandardNodeMaterial) out.normalNode = tilted;
  return out;
}

