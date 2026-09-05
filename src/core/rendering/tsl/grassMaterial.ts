import {
  Fn, attribute, clamp, cos, cross, dot, float, floor, fract, length, max, mix,
  normalize, positionGeometry, sin, smoothstep, sRGBTransferEOTF, texture, uniform, uv, varying, vec2, vec3, vec4,
} from 'three/tsl';
import { Color, DoubleSide, MeshBasicNodeMaterial, Vector3, type Node, type Texture } from 'three/webgpu';

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

export class GrassNodeMaterial extends MeshBasicNodeMaterial {
  readonly uniforms = {
    bladeHeight: uniform(1), time: uniform(0), windScale: uniform(1),
    trampleCenter: uniform(new Vector3(0, -9999, 0)), trampleRadius: uniform(1.4), trampleStrength: uniform(0.85),
    tipColor: uniform(new Color('#8fbc5a').convertSRGBToLinear()),
    bottomColor: uniform(new Color('#355b2d').convertSRGBToLinear()),
    uToon: uniform(0), uToonSteps: uniform(4),
  };

  constructor(map: Texture, alphaMap: Texture) {
    super({ side: DoubleSide, transparent: true, toneMapped: false, fog: false });
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
