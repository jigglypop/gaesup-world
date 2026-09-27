import {
  Fn, abs, attribute, cameraPosition, cameraViewMatrix, clamp, cos, cross, dot, faceDirection, float, floor, fract, length, max, mix,
  modelPosition, normalize, positionGeometry, pow, sign, sin, smoothstep, sRGBTransferEOTF, texture, transformNormalToView, uniform, uv,
  varying, vec2, vec3, vec4,
} from 'three/tsl';
import {
  Color, DataTexture, DoubleSide, LinearFilter, MeshStandardNodeMaterial, NoColorSpace, RGBAFormat, RepeatWrapping, Vector3, type Node,
  type Texture,
} from 'three/webgpu';

const permute = Fn(([x]: [Node<'vec3'>]) => {
  const value = x.mul(34).add(1).mul(x).toVar();
  return value.sub(floor(value.mul(1 / 289)).mul(289));
});

const simplex = Fn(([v]: [Node<'vec2'>]) => {
  const i = floor(v.add(dot(v, vec2(0.366025403784439)))).toVar();
  const x0 = v.sub(i).add(dot(i, vec2(0.211324865405187))).toVar();
  const i1 = x0.x.greaterThan(x0.y).select(vec2(1, 0), vec2(0, 1)).toVar();
  const x12 = vec4(x0, x0).add(vec4(0.211324865405187, 0.211324865405187, -0.577350269189626, -0.577350269189626))
    .sub(vec4(i1, 0, 0)).toVar();
  i.assign(i.sub(floor(i.mul(1 / 289)).mul(289)));
  const p = permute(permute(i.y.add(vec3(0, i1.y, 1))).add(i.x).add(vec3(0, i1.x, 1))).toVar();
  const m = max(float(0.5).sub(vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw))), 0).pow(4).toVar();
  const x = fract(p.mul(0.024390243902439)).mul(2).sub(1).toVar();
  const h = x.abs().sub(0.5).toVar();
  const a0 = x.sub(floor(x.add(0.5))).toVar();
  m.mulAssign(float(1.79284291400159).sub(a0.mul(a0).add(h.mul(h)).mul(0.85373472095314)));
  const g = vec3(a0.x.mul(x0.x).add(h.x.mul(x0.y)), a0.yz.mul(x12.xz).add(h.yz.mul(x12.yw)));
  return dot(m, g).mul(130);
});

const rotate = Fn(([v, q]: [Node<'vec3'>, Node<'vec4'>]) => v.add(cross(q.xyz, cross(q.xyz, v).add(v.mul(q.w))).mul(2)));

export class GrassNodeMaterial extends MeshStandardNodeMaterial {
  readonly uniforms = {
    bladeHeight: uniform(1), time: uniform(0), windScale: uniform(1),
    trampleCenter: uniform(new Vector3(0, -9999, 0)), trampleRadius: uniform(1.4), trampleStrength: uniform(0.85),
    tipColor: uniform(new Color('#8fbc5a')),
    bottomColor: uniform(new Color('#355b2d')),
    uToon: uniform(0), uToonSteps: uniform(4),
  };

  constructor(map: Texture, alphaMap: Texture) {
    super({ side: DoubleSide, transparent: false, roughness: 1, metalness: 0, fog: false });
    this.normalNode = transformNormalToView(vec3(0, 1, 0));
    const u = this.uniforms;
    const offset = attribute<'vec3'>('offset', 'vec3');
    const orientation = attribute<'vec4'>('orientation', 'vec4');
    const stretch = attribute<'float'>('stretch', 'float');
    const rootSin = attribute<'float'>('halfRootAngleSin', 'float');
    const rootCos = attribute<'float'>('halfRootAngleCos', 'float');
    const p = positionGeometry;
    const fraction = p.y.div(u.bladeHeight);
    const windNoise = float(1).sub(simplex(vec2(u.time.sub(offset.x.div(50)), u.time.sub(offset.z.div(50)))));
    this.positionNode = Fn(() => {
      const bent = normalize(mix(vec4(0, rootSin, 0, rootCos), vec4(orientation.z.negate(), 0, orientation.x, orientation.w), fraction));
      const angle = windNoise.mul(0.3).mul(u.windScale);
      const rotated = rotate(vec3(p.x, p.y.add(p.y.mul(stretch)), p.z), bent);
      const position = rotate(rotated, vec4(sin(angle), 0, sin(angle).negate(), cos(angle))).toVar();
      const toCenter = offset.xz.sub(u.trampleCenter.xz).toVar();
      const distance = length(toCenter).toVar();
      const falloff = u.trampleRadius.greaterThan(0.0001)
        .select(clamp(float(1).sub(distance.div(max(u.trampleRadius, 0.0001))), 0, 1), float(0));
      const push = falloff.mul(falloff).mul(u.trampleStrength);
      const direction = distance.greaterThan(0.0001).select(toCenter.div(max(distance, 0.0001)), vec2(0));
      const shift = direction.mul(push).mul(0.45).mul(fraction);
      return offset.add(vec3(position.x.add(shift.x), position.y.mul(mix(1, 0.18, push)), position.z.add(shift.y)));
    })();
    const frc = varying(fraction);
    const cluster = varying(simplex(offset.xz.mul(0.11).add(vec2(3.7, -8.2))).mul(0.5).add(0.5));
    const dryness = varying(clamp(simplex(offset.xz.mul(0.18).add(vec2(-5.4, 12.6))).mul(0.5).add(0.5)
      .mul(0.7).add(float(1).sub(stretch).mul(0.45)), 0, 1));
    const shade = varying(clamp(float(0.82).add(windNoise.mul(0.08)).add(orientation.w.mul(0.06)), 0.72, 1.1));
    this.maskNode = texture(alphaMap).r.greaterThanEqual(0.15);
    this.colorNode = Fn(() => {
      const bottom = mix(mix(u.bottomColor, vec3(0.18, 0.31, 0.12), cluster.mul(0.35)), vec3(0.3, 0.23, 0.08), dryness.mul(0.85));
      const tip = mix(mix(u.tipColor, vec3(0.63, 0.82, 0.42), cluster.mul(0.28)), vec3(0.8, 0.74, 0.34), dryness);
      const denominator = max(u.uToonSteps.sub(1), 1);
      const stepped = mix(smoothstep(0, 1, frc), floor(frc.mul(u.uToonSteps)).div(denominator), u.uToon);
      const gradient = mix(bottom, tip, stepped).toVar();
      const rib = float(1).sub(smoothstep(0, 0.52, uv().x.sub(0.5).abs()));
      const color = mix(gradient.mul(0.72), texture(map).rgb.mul(gradient), mix(0.62, 0.35, u.uToon))
        .mul(mix(0.9, 1.1, cluster)).mul(mix(1, 0.82, dryness.mul(0.35))).mul(mix(0.94, 1.05, rib))
        .mul(mix(shade, floor(shade.mul(u.uToonSteps)).div(denominator), u.uToon)).toVar();
      const display = mix(color.div(color.add(vec3(1))), clamp(color, 0, 1), u.uToon).pow(1 / 2.2);
      return sRGBTransferEOTF(display) as Node<'vec3'>;
    })();
  }
}

export type GrassLook = 'lawn' | 'tall';

/** Blades past their distance share shrink away over this fraction of the draw order instead of popping. */
export const GRASS_FADE_BAND = 0.18;

/** Wind travels along this ground direction; gusts roll across the field at a few meters per second. */
const WIND = { x: 0.848, z: 0.53 };
const TAU = Math.PI * 2;

type Rgb = readonly [number, number, number];
type Look = {
  width: readonly [number, number]; calm: number; gust: number; flutter: number; thicken: number; round: number; upward: number;
  trample: number; base: Rgb; body: Rgb; tip: Rgb; fresh: Rgb;
};
/** Lawn: short, soft pastel blades that take the ground tint and brighten to warm tips. Tall: broad, stiff, deeper green. */
const LOOKS: Record<GrassLook, Look> = {
  lawn: {
    width: [0.085, 0.14], calm: 0.1, gust: 0.5, flutter: 0.06, thicken: 0.7, round: 0.7, upward: 0.42, trample: 0.9,
    base: [0.72, 0.74, 0.7], body: [1, 1.01, 0.98], tip: [1.2, 1.16, 0.88], fresh: [1.04, 1.15, 1.06],
  },
  tall: {
    width: [0.13, 0.2], calm: 0.06, gust: 0.3, flutter: 0.08, thicken: 0.55, round: 0.8, upward: 0.28, trample: 1.25,
    base: [0.22, 0.38, 0.28], body: [0.46, 0.72, 0.48], tip: [0.9, 1.08, 0.66], fresh: [0.72, 1.02, 0.78],
  },
};

/** Lattice cells per repeat of the baked gust noise. */
const GUST_PERIOD = 8;
let gustNoise: DataTexture | undefined;

/** Periodic gradient noise in [0, 1], baked once: one filtered fetch per vertex instead of 2D simplex noise. */
function gustTexture(): DataTexture {
  if (gustNoise) return gustNoise;
  const size = 128, scale = GUST_PERIOD / size, pixels = new Uint8Array(size * size * 4);
  const wrap = (value: number) => ((value % GUST_PERIOD) + GUST_PERIOD) % GUST_PERIOD;
  const gradient = (ix: number, iz: number) => {
    const n = Math.sin(wrap(ix) * 127.1 + wrap(iz) * 311.7) * 43758.5453, angle = (n - Math.floor(n)) * TAU;
    return [Math.cos(angle), Math.sin(angle)] as const;
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x * scale, v = y * scale, ix = Math.floor(u), iz = Math.floor(v), fx = u - ix, fz = v - iz;
      const corner = (cx: number, cz: number) => {
        const [gx, gz] = gradient(ix + cx, iz + cz);
        return gx * (fx - cx) + gz * (fz - cz);
      };
      const sx = fade(fx), sz = fade(fz);
      const top = corner(0, 0) + (corner(1, 0) - corner(0, 0)) * sx, bottom = corner(0, 1) + (corner(1, 1) - corner(0, 1)) * sx;
      const value = Math.max(0, Math.min(1, (top + (bottom - top) * sz) * 0.72 + 0.5)), index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = Math.round(value * 255);
      pixels[index + 3] = 255;
    }
  }
  gustNoise = new DataTexture(pixels, size, size, RGBAFormat);
  gustNoise.wrapS = gustNoise.wrapT = RepeatWrapping;
  gustNoise.minFilter = gustNoise.magFilter = LinearFilter;
  gustNoise.generateMipmaps = false;
  gustNoise.colorSpace = NoColorSpace;
  gustNoise.needsUpdate = true;
  return gustNoise;
}

export type GrassMaterialOptions = { look?: GrassLook; toon?: boolean; tipColor?: Color };

/**
 * Wind grass after choketmonster's field grass (in the spirit of Ghost of Tsushima): clumped blade profiles from the CPU,
 * a constant-length arc bend under rolling gust fronts and per-blade flutter, player trample, edge-on blades thickened
 * in screen space, rounded normals leaning to the sky, and a root-to-tip gradient over the ground tint beneath. Each
 * blade also shrinks along its draw rank with camera distance, matching the CPU draw count, so density thins smoothly.
 * Instance attributes: `offset` (root, rank), `shape` (lean x, lean z, height, yaw + 8 × tone step) and `tint`.
 * Blade roots are local to an unrotated, unscaled object.
 */
export class FieldGrassMaterial extends MeshStandardNodeMaterial {
  readonly uniforms = {
    time: uniform(0), wind: uniform(0.85), keep: uniform(1), near: uniform(22), far: uniform(60), strength: uniform(1.35),
    /** Trample center x, z on the ground and its strength. */
    trample: uniform(new Vector3(0, 0, 0)),
  };

  constructor({ look: name = 'tall', toon = false, tipColor }: GrassMaterialOptions = {}) {
    super({ side: DoubleSide, roughness: 0.9, metalness: 0, envMapIntensity: 0.35 });
    const look = LOOKS[name];
    const { time, wind, keep, near, far, strength, trample } = this.uniforms;
    const offset = attribute<'vec4'>('offset', 'vec4'), shape = attribute<'vec4'>('shape', 'vec4');
    const root = offset.xyz, rank = offset.w, world = root.add(modelPosition);
    const toneStep = floor(shape.w.div(8)), yaw = shape.w.sub(toneStep.mul(8)), tone = toneStep.div(15);
    const seed = fract(yaw.mul(1.7).add(world.x.mul(0.61)).add(world.z.mul(0.37)));
    const along = positionGeometry.y;

    const lod = pow(clamp(float(1).sub(length(cameraPosition.sub(world)).sub(near).div(far.sub(near))), 0, 1), strength);
    const kept = keep.mul(lod);
    // The last blades of the kept share shrink away across the band, down to nothing where the CPU draw count ends.
    const grow = smoothstep(0, 1, kept.mul(1 + GRASS_FADE_BAND).sub(rank).div(kept.mul(GRASS_FADE_BAND).add(1e-5)));

    const away = world.xz.sub(trample.xy), awayLength = max(length(away), 0.001);
    const press = clamp(float(1).sub(awayLength.div(look.trample)), 0, 1), pressed = press.mul(press).mul(trample.z);

    const clock = time.mul(4), downwind = world.x.mul(WIND.x).add(world.z.mul(WIND.z));
    const crosswind = world.z.mul(WIND.x).sub(world.x.mul(WIND.z));
    // Broad gust fronts roll downwind; a quicker ripple and per-blade flutter keep the field alive between them.
    const front = texture(gustTexture(), vec2(downwind.sub(clock.mul(3.2)).div(10), crosswind.div(17)).div(GUST_PERIOD)).r;
    const ripple = sin(downwind.mul(0.8).sub(clock.mul(4.1)).add(sin(crosswind.mul(0.35)).mul(1.7))).mul(0.5).add(0.5);
    const gust = smoothstep(0.2, 0.95, front.mul(0.8).add(ripple.mul(0.2)));
    const flutter = sin(clock.mul(mix(float(2.2), float(3.4), seed)).add(seed.mul(TAU)).add(downwind.mul(0.9)))
      .mul(look.flutter).mul(gust.add(0.35));
    const sway = wind.mul(gust.mul(look.gust).add(look.calm).add(flutter));
    const bend = shape.xy.add(vec2(WIND.x, WIND.z).mul(sway)).add(away.div(awayLength).mul(pressed.mul(1.15)));
    const bendLength = max(length(bend), 0.001), theta = clamp(bendLength, 0.001, 1.4), heading = bend.div(bendLength);
    const arc = theta.mul(along);
    const height = shape.z.mul(grow).mul(float(1).sub(pressed.mul(0.3)));
    // Constant-length circular bend: the tip travels along an arc instead of stretching sideways.
    const reach = height.mul(float(1).sub(cos(arc))).div(theta), rise = height.mul(sin(arc)).div(theta);
    const side = vec3(sin(yaw).negate(), 0, cos(yaw));
    const spine = vec3(root.x.add(heading.x.mul(reach)), root.y.add(rise), root.z.add(heading.y.mul(reach)));
    const tangent = vec3(heading.x.mul(sin(arc)), cos(arc), heading.y.mul(sin(arc)));
    const facing = cross(side, tangent);
    // Edge-on blades widen across the screen, so the field keeps its body from any camera angle.
    const view = normalize(cameraPosition.sub(spine.add(modelPosition)));
    const screen = cross(tangent, view), screenSide = screen.div(max(length(screen), 1e-4));
    const width = mix(float(look.width[0]), float(look.width[1]), fract(seed.mul(13.7))).mul(float(1).add(float(1).sub(lod).mul(0.8)));
    const across = positionGeometry.x.mul(width);
    const widen = screenSide.mul(sign(dot(screenSide, side))).mul(across).mul(float(1).sub(abs(dot(facing, view))).mul(look.thicken));
    this.positionNode = spine.add(side.mul(across)).add(widen);

    // Rounded cross-section: the visible face's normal tilts outward toward each edge, then leans to the sky, tips most.
    const faceNormal = varying(facing), edgeNormal = varying(side.mul(uv().x.mul(2).sub(1).mul(look.round)));
    const lit = mix(normalize(faceNormal.mul(faceDirection).add(edgeNormal)), vec3(0, 1, 0), mix(float(look.upward), float(0.72), smoothstep(0.45, 1, along)));
    this.normalNode = normalize(cameraViewMatrix.mul(vec4(normalize(lit), 0)).xyz);

    // The ground under the root tints the whole blade, so roots vanish into the ground they grow from.
    const ground = varying(attribute<'vec3'>('tint', 'vec3')), shade = varying(tone), breeze = varying(gust);
    const level = toon ? floor(along.mul(4)).div(3) : along;
    const lower = mix(ground.mul(vec3(...look.base)), ground.mul(vec3(...look.body)), smoothstep(0, 0.42, level));
    const crown = tipColor ? vec3(tipColor.r, tipColor.g, tipColor.b) : ground.mul(mix(vec3(...look.tip), vec3(...look.fresh), shade));
    const blade = mix(lower, crown, smoothstep(0.38, 1, level));
    const rib = float(1).sub(smoothstep(0, 0.5, abs(uv().x.sub(0.5))));
    this.colorNode = blade.mul(mix(float(0.84), float(1.13), shade)).mul(mix(float(0.95), float(1.04), rib)).mul(breeze.mul(along).mul(0.1).add(1));
  }
}
