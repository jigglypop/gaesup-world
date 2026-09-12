import {
  abs,
  attribute,
  cos,
  fract,
  length,
  mix,
  mx_noise_float,
  pow,
  sin,
  smoothstep,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import { AdditiveBlending, Color, SpriteNodeMaterial } from 'three/webgpu';

export class FireSpriteNodeMaterial extends SpriteNodeMaterial {
  private readonly timeValue = uniform(0);

  get time(): number { return this.timeValue.value; }
  set time(value: number) { this.timeValue.value = value; }

  constructor() {
    super({ transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending });
    const coords = uv();
    const y = coords.y.clamp();
    const seed = attribute<'float'>('fireSeed', 'float');
    const lean = attribute<'float'>('fireLean', 'float');
    const flare = attribute<'float'>('fireFlare', 'float');
    const intensity = attribute<'float'>('fireIntensity', 'float');
    const speed = attribute<'float'>('fireSpeed', 'float');
    const offset = attribute<'float'>('fireTimeOffset', 'float');
    const tint = attribute<'vec3'>('fireTint', 'vec3');
    const animatedTime = this.timeValue.mul(speed).add(offset);
    const noise = mx_noise_float(vec3(coords.x.mul(4).add(seed.mul(3)), coords.y.mul(6).sub(animatedTime), animatedTime.mul(0.35)))
      .mul(0.5).add(0.5);
    const skew = lean.mul(pow(y, 1.2));
    const x = coords.x.sub(0.5).sub(skew).add(noise.sub(0.5).mul(0.24).mul(y.oneMinus().mul(0.35).add(0.65)));
    const width = mix(flare.mul(0.46), 0.02, pow(y, 0.72));
    const body = smoothstep(width.add(0.07), width.sub(0.025), abs(x));
    const base = smoothstep(0.45, 0.04, length(coords.sub(vec2(0.5, 0.1)))).mul(0.45);
    const topFade = smoothstep(1, 0.76, y);
    const fire = body.add(base).add(noise.mul(0.16)).mul(topFade).clamp();
    const core = smoothstep(0.16, 0.01, abs(x));
    let flameColor = mix(vec3(0.35, 0.02, 0), vec3(1, 0.38, 0.04), smoothstep(0.05, 0.42, fire));
    flameColor = mix(flameColor, vec3(1, 0.88, 0.55), smoothstep(0.35, 0.75, fire));
    flameColor = mix(flameColor, vec3(1, 0.97, 0.92), smoothstep(0.62, 1, fire.mul(core)));
    this.positionNode = attribute<'vec3'>('firePosition', 'vec3');
    this.scaleNode = attribute<'vec2'>('fireScale', 'vec2');
    this.colorNode = flameColor.mul(tint).mul(intensity.mul(0.48).add(0.62));
    this.opacityNode = smoothstep(0.06, 0.34, fire).mul(intensity.mul(0.26).add(0.5).min(1));
    this.alphaTestNode = uniform(0.01);
  }
}

export class EmberSpriteNodeMaterial extends SpriteNodeMaterial {
  private readonly timeValue = uniform(0);

  get time(): number { return this.timeValue.value; }
  set time(value: number) { this.timeValue.value = value; }

  constructor() {
    super({ transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending });
    const life = attribute<'float'>('emberLife', 'float');
    const speed = attribute<'float'>('emberSpeed', 'float');
    const drift = attribute<'float'>('emberDrift', 'float');
    const base = attribute<'vec3'>('emberBase', 'vec3');
    const cycle = fract(this.timeValue.mul(speed).add(life));
    const angle = cycle.mul(8).add(drift);
    const radius = cycle.mul(0.2).add(0.08);
    this.positionNode = base.add(vec3(
      sin(angle).mul(radius),
      cycle.mul(cycle).mul(3.2),
      cos(angle).mul(radius),
    ));
    this.scaleNode = vec2(mix(0.1, 0.018, cycle));
    const radial = length(uv().sub(0.5));
    const glow = smoothstep(0.5, 0.05, radial);
    const heat = cycle.mul(0.85).oneMinus();
    let emberColor = mix(vec3(0.75, 0.12, 0.02), vec3(1, 0.5, 0.08), heat);
    emberColor = mix(emberColor, vec3(1, 0.92, 0.65), heat.mul(heat));
    const flicker = sin(this.timeValue.mul(14).add(drift.mul(4))).mul(0.25).add(0.75);
    this.colorNode = emberColor.mul(glow).mul(1.4);
    this.opacityNode = cycle.oneMinus().mul(cycle.oneMinus()).mul(0.9).mul(flicker).mul(glow);
    this.alphaTestNode = uniform(0.001);
  }
}

export class BloomSpriteNodeMaterial extends SpriteNodeMaterial {
  constructor(color: string) {
    super({ transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending });
    this.positionNode = attribute<'vec3'>('bloomPosition', 'vec3');
    this.scaleNode = attribute<'vec2'>('bloomScale', 'vec2');
    const radial = uv().mul(2).sub(1).dot(uv().mul(2).sub(1));
    const glow = smoothstep(1, 0, radial);
    this.colorNode = uniform(new Color(color));
    this.opacityNode = glow.mul(glow).mul(0.58);
    this.alphaTestNode = uniform(0.01);
  }
}
