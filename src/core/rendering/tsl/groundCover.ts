import {
  abs, cameraPosition, cameraViewMatrix, cos, diffuseColor, dot, float, floor, Fn, fract, If, length, max, mix, normalize, normalView,
  normalWorldGeometry, positionViewDirection, positionWorld, sin, smoothstep, step, texture, time, uniform, vec2, vec3, vec4, vertexColor,
} from 'three/tsl';
import {
  MeshStandardNodeMaterial, MeshToonNodeMaterial, type LightingModel, type LightingModelDirectInput, type Node, type NodeBuilder,
  type Texture, type Vector2, type Vector4,
} from 'three/webgpu';

import { rainRipples, snowSurface, weatherNodes, wetSurface } from './weatherSurface';

export type CoverKind = 'sand' | 'snow';
/** Water coverage around the ground (a `ShoreField`): 0 land, 0.5 on the shoreline, sampled at `(xz - xy) * zw`. */
export type CoverShore = { texture: Texture; transform: Vector4 };
/** Recent footprints (a `TrailField`): dent depth in R over a window of `size` meters that repeats, valid around `center`. */
export type CoverTrail = { texture: Texture; center: Vector2; size: number; texels: number };

export type CoverMaterialOptions = {
  kind: CoverKind;
  /** Stepped toon shading from `gradientMap`: color detail only, no glints or relief. */
  toon?: boolean;
  gradientMap?: Texture | null;
  /** The soft fringe a cover spreads onto its neighbors: blended by vertex alpha over the floor. */
  fringe?: boolean;
  shore?: CoverShore | null;
  trail?: CoverTrail | null;
};

/** A cover's albedo, its ground slope (height gradient), roughness, and the glints: their extra tilt and where they are. */
type Surface = { color: Node<'vec3'>; lean: Node<'vec2'>; roughness: Node<'float'>; glint: { tilt: Node<'vec2'>; lit: Node<'float'> } };
type Vec2Node = Node<'vec2'>;

const TAU = Math.PI * 2;
/** The grass wind: sand ripples run across it, so dunes and gusts agree. */
const WIND = vec2(0.848, 0.53);

/** Hash without sines (Dave Hoskins), stable at island-wide coordinates. */
export const hash12 = Fn(([p]: [Vec2Node]) => {
  const q = fract(vec3(p.x, p.y, p.x).mul(0.1031)).toVar();
  q.addAssign(dot(q, q.yzx.add(33.33)));
  return fract(q.x.add(q.y).mul(q.z));
});

export const hash22 = Fn(([p]: [Vec2Node]) => {
  const q = fract(vec3(p.x, p.y, p.x).mul(vec3(0.1031, 0.103, 0.0973))).toVar();
  q.addAssign(dot(q, q.yzx.add(33.33)));
  return fract(q.xx.add(q.yz).mul(q.zy));
});

/** Value noise in [0, 1] and its gradient per lattice unit: (value, d/dx, d/dy). */
export const noise = Fn(([p]: [Vec2Node]) => {
  const i = floor(p), f = fract(p);
  const u = f.mul(f).mul(f.mul(-2).add(3)), du = f.mul(f.oneMinus()).mul(6);
  const a = hash12(i), b = hash12(i.add(vec2(1, 0))), c = hash12(i.add(vec2(0, 1))), d = hash12(i.add(1));
  const k = a.sub(b).sub(c).add(d);
  return vec3(
    a.add(b.sub(a).mul(u.x)).add(c.sub(a).mul(u.y)).add(k.mul(u.x).mul(u.y)),
    du.x.mul(b.sub(a).add(k.mul(u.y))),
    du.y.mul(c.sub(a).add(k.mul(u.x))),
  );
});

/** 1 within `near` meters of the camera, 0 past `far`: detail finer than a pixel fades instead of shimmering. */
export const within = (near: number, far: number) => smoothstep(far, near, length(cameraPosition.sub(positionWorld)));

/** How far rain darkens a cover (`weatherGround`): sand soaks, snow only glazes. */
export const COVER_POROSITY: Record<CoverKind, number> = { sand: 1, snow: 0.35 };

export type GroundWeatherOptions = {
  /** How far rain darkens it: sand 1, soil 0.85, grass 0.7, snow 0.35. */
  porosity?: number;
  /** Puddles on flat ground once soaked. */
  puddles?: boolean;
  /** Lying snow; off for what is snow already. */
  snow?: boolean;
};

/**
 * The live weather over a ground: wet (darker, glossier, puddles on flat spots), then lying snow that builds up and
 * melts. Flat and upward read the geometry's normal, so a material's own normal node stays out of them. Uniforms only:
 * a weather change rebuilds nothing, and uniform branches skip the noise on a dry, snowless day.
 */
export function weatherGround(color: Node<'vec3'>, roughness: Node<'float'>, { porosity = 1, puddles = true, snow = true }: GroundWeatherOptions = {}) {
  const { wetness, snowCover } = weatherNodes();
  const surface = Fn(() => {
    // Declared before the branches that read them.
    const normal = normalWorldGeometry.toVar(), out = vec4(color, roughness).toVar();
    If(wetness.greaterThan(0), () => {
      const wet = wetSurface(out.rgb, out.a, { normal, porosity, puddles });
      out.assign(vec4(wet.color, wet.roughness));
    });
    if (snow) {
      If(snowCover.greaterThan(0), () => {
        const lying = snowSurface(out.rgb, out.a, { normal });
        out.assign(vec4(lying.color, lying.roughness));
      });
    }
    return out;
  })();
  return { color: surface.rgb, roughness: surface.a };
}

/** The geometry's normal tilted by a height slope `lean` (per meter, xz), in view space. */
const viewNormal = (lean: Node<'vec2'>): Node<'vec3'> =>
  normalize(cameraViewMatrix.mul(vec4(normalize(normalWorldGeometry.sub(vec3(lean.x, 0, lean.y))), 0)).xyz);

/**
 * The view normal of a ground sloping by `lean`, with rain rings in the puddles `weatherGround` pools while it rains
 * on ground without snow. Only then does it pay for them.
 */
export function groundNormal(lean: Node<'vec2'>): Node<'vec3'> {
  const { rain, snowCover } = weatherNodes();
  return viewNormal(Fn(() => {
    const normal = normalWorldGeometry.toVar(), tilt = vec2(lean).toVar();
    If(rain.greaterThan(0).and(snowCover.lessThan(0.02)), () => {
      tilt.subAssign(rainRipples(positionWorld.xz).mul(wetSurface(vec3(0), float(0), { normal }).puddle));
    });
    return tilt;
  })());
}

/**
 * Glints: a few round grains per cell with a facet tilted at random, so the sun flashes off them from some angles and
 * not others as the camera moves. Only the flash uses the facet; the grain's own shading stays with the ground.
 */
function glints(world: Vec2Node, cells: number, share: number, amount: Node<'float'>) {
  const at = world.mul(cells), cell = floor(at);
  const lit = step(1 - share, hash12(cell.add(7.7))).mul(step(length(fract(at).sub(0.5)), 0.3)).mul(amount);
  return { tilt: hash22(cell).sub(0.5).mul(1.2).mul(lit), lit };
}

/** Wetness from the shore: dark, smooth sand along the waterline, its edge breathing with the swash. */
function wetness(shore: CoverShore | null | undefined, world: Vec2Node): Node<'float'> {
  if (!shore) return float(0);
  const place = uniform(shore.transform);
  const coverage = texture(shore.texture, world.sub(place.xy).mul(place.zw)).r;
  const swash = sin(time.mul(0.55).add(dot(world, WIND).mul(0.35))).mul(0.025);
  return smoothstep(0.015, 0.3, coverage.add(swash));
}

/** Footprint dents: depth 0..1 and its slope per meter, inside the trail's window only. */
function dents(trail: CoverTrail | null | undefined, world: Vec2Node, depth: number) {
  if (!trail) return { depth: float(0), slope: vec2(0) };
  const center = uniform(trail.center);
  const uv = world.div(trail.size), step_ = 1 / trail.texels;
  const map = texture(trail.texture);
  const here = map.sample(uv).r;
  const edge = abs(world.sub(center)).toVar();
  const inside = smoothstep(trail.size / 2 - 0.5, trail.size / 2 - 2.5, max(edge.x, edge.y));
  const slope = vec2(map.sample(uv.add(vec2(step_, 0))).r.sub(here), map.sample(uv.add(vec2(0, step_))).r.sub(here))
    .mul(-depth * trail.texels / trail.size).mul(inside);
  return { depth: here.mul(inside), slope };
}

/** Sand: fine grain and darker mineral specks, wind ripples across drier patches, glints, and wet sand at the water. */
function sand({ shore, trail }: CoverMaterialOptions): Surface {
  const world = positionWorld.xz;
  const close = within(4, 14), mid = within(6, 24);
  const wet = wetness(shore, world), dry = wet.oneMinus();
  const phase = dot(world, WIND).mul(TAU / 0.34).add(noise(world.mul(0.42)).x.mul(7));
  const crest = sin(phase).add(sin(phase.mul(2)).mul(0.3));
  const ripple = smoothstep(0.35, 0.75, noise(world.mul(0.11).add(vec2(4.1, -2.7))).x).mul(mid).mul(dry);
  const specks = world.mul(17), speck = floor(specks);
  const mineral = step(0.9, hash12(speck.add(51.3))).mul(smoothstep(0.3, 0.16, length(fract(specks).sub(hash22(speck).mul(0.5).add(0.25)))));
  const grain = mix(float(1), mix(float(0.9), float(1.07), noise(world.mul(42)).x).mul(mix(float(1), float(0.72), mineral)), close);
  const mottle = mix(float(0.94), float(1.05), noise(world.mul(2.6)).x);
  const shine = glints(world, 26, 0.05, close.mul(dry));
  const trodden = dents(trail, world, 0.025);
  const lean = WIND.mul(cos(phase).add(cos(phase.mul(2)).mul(0.6)).mul(ripple).mul(0.07)).add(trodden.slope);
  const color = vec3(grain.mul(mottle).mul(crest.mul(ripple).mul(0.025).add(1)))
    .mul(mix(vec3(1), vec3(0.6, 0.56, 0.52), wet))
    .mul(mix(float(1), float(0.84), trodden.depth));
  return { color, lean, roughness: mix(float(0.96), float(0.42), wet), glint: shine };
}

/** Snow: soft sculpted undulation with blue in its hollows, bright glints, and blue-shadowed footprint dents. */
function snow({ trail }: CoverMaterialOptions): Surface {
  const world = positionWorld.xz;
  const close = within(5, 20), mid = within(12, 50);
  const broad = noise(world.mul(0.45)), fine = noise(world.mul(1.7).add(vec2(3.1, -1.3)));
  const hollow = smoothstep(0.15, 0.75, broad.x.mul(0.65).add(fine.x.mul(0.35)));
  const shine = glints(world, 30, 0.12, close);
  const trodden = dents(trail, world, 0.05);
  const lean = broad.yz.mul(0.45 * 0.4).add(fine.yz.mul(1.7 * 0.07).mul(mid)).add(trodden.slope);
  const color = mix(vec3(0.88, 0.93, 1), vec3(1.1), hollow).mul(mix(vec3(1), vec3(0.74, 0.83, 1), trodden.depth));
  return { color, lean, roughness: float(0.7), glint: shine };
}

/** Snow keeps sky light blue in its shade and lets sunlight wrap softly past the terminator, like light scattered inside it. */
const SNOW_SHADE = { ambient: [0.84, 0.93, 1.1], wrap: 0.45, glow: [0.5, 0.72, 1] } as const;
/** Glint sharpness (Blinn-Phong exponent) and brightness per unit of light. */
const GLINT = { sharpness: 420, strength: 5 } as const;

/**
 * Adds a cover's light response to a lighting model: each light flashes off the glints' tilted facets (shadowed like
 * the rest of its light, and never darkening the grain under them), and snow tints its ambient light blue and wraps
 * sunlight past the terminator.
 */
function shaded<T extends LightingModel>(model: T, glint: Node<'vec3'> | null, lit: Node<'float'>, snowy: boolean): T {
  const indirect = model.indirect.bind(model), direct = model.direct.bind(model);
  if (snowy) {
    model.indirect = (builder: NodeBuilder) => {
      indirect(builder);
      (builder.context as { reflectedLight: { indirectDiffuse: Node<'vec3'> } }).reflectedLight.indirectDiffuse.mulAssign(vec3(...SNOW_SHADE.ambient));
    };
  }
  model.direct = (light: LightingModelDirectInput, builder: NodeBuilder) => {
    direct(light, builder);
    const toLight = light.lightDirection as Node<'vec3'>, color = light.lightColor as Node<'vec3'>;
    const facing = normalView.dot(toLight);
    if (glint) {
      const flash = max(dot(glint, normalize(toLight.add(positionViewDirection))), 0).pow(GLINT.sharpness).mul(facing.clamp().sqrt());
      (light.reflectedLight.directSpecular as Node<'vec3'>).addAssign(color.mul(flash.mul(lit).mul(GLINT.strength)));
    }
    if (snowy) {
      const wrap = facing.add(SNOW_SHADE.wrap).div(1 + SNOW_SHADE.wrap).clamp().sub(facing.clamp());
      (light.reflectedLight.directDiffuse as Node<'vec3'>).addAssign(
        color.mul(wrap).mul(diffuseColor.rgb).mul(vec3(...SNOW_SHADE.glow)).mul(1 / Math.PI),
      );
    }
  };
  return model;
}

/**
 * A node material for a sand or snow cover, its vertex colors carrying the tile colors. Detail lives in world space, so
 * it runs on across tiles without a seam, and fades with distance before it can shimmer. Lit covers add relief (ripples,
 * drifts, footprints) and glints; toon covers keep the color detail and snow's blue shade on their steps. The live
 * weather wets sand, with puddles and rain rings on the flat, and snows over it; rain only glazes snow a little.
 */
export function createCoverMaterial(options: CoverMaterialOptions): MeshStandardNodeMaterial | MeshToonNodeMaterial {
  const { kind, toon = false, gradientMap = null, fringe = false } = options;
  const sandy = kind === 'sand';
  const surface = sandy ? sand(options) : snow(options);
  const material = toon ? new MeshToonNodeMaterial({ gradientMap }) : new MeshStandardNodeMaterial({ metalness: 0 });
  material.name = `${kind}-cover${fringe ? '-fringe' : ''}`;
  // Vertex colors carry the tile colors and the fringe's alpha; rain and snow lie over them.
  const tile = vertexColor();
  const ground = weatherGround(surface.color.mul(tile.rgb), surface.roughness, { porosity: COVER_POROSITY[kind], puddles: sandy, snow: sandy });
  material.colorNode = vec4(ground.color, tile.a);
  let glint: Node<'vec3'> | null = null;
  if (material instanceof MeshStandardNodeMaterial) {
    material.normalNode = sandy ? groundNormal(surface.lean) : viewNormal(surface.lean);
    material.roughnessNode = ground.roughness;
    glint = viewNormal(surface.lean.add(surface.glint.tilt));
  }
  const setup = material.setupLightingModel.bind(material);
  material.setupLightingModel = () => shaded(setup(), glint, surface.glint.lit, kind === 'snow');
  if (fringe) Object.assign(material, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  return material;
}
