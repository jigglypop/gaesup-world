import { attribute, positionLocal, sin, sRGBTransferEOTF, texture, uniform, uv, vec2, vec3 } from 'three/tsl';
import { DoubleSide, MeshBasicNodeMaterial, type Node, type Texture } from 'three/webgpu';

export class FlagNodeMaterial extends MeshBasicNodeMaterial {
  private readonly timeValue = uniform(0);
  private readonly windValue = uniform(1);

  get time(): number { return this.timeValue.value; }
  set time(value: number) { this.timeValue.value = value; }
  get windStrength(): number { return this.windValue.value; }
  set windStrength(value: number) { this.windValue.value = value; }

  constructor(map: Texture, instanced = false) {
    super({ side: DoubleSide, transparent: true, alphaTest: 0.01, fog: false, toneMapped: false });
    const coords = uv();
    const fixed = coords.x.mul(coords.x);
    const motion = instanced ? attribute<'vec2'>('flagMotion', 'vec2') : vec2(0, 1);
    const phase = motion.x;
    const time = this.timeValue;
    const wave = sin(coords.x.mul(4).add(time).add(phase)).mul(0.12)
      .add(sin(coords.x.mul(7).add(time.mul(1.7)).add(1.3).add(phase.mul(0.7))).mul(0.06))
      .add(sin(coords.x.mul(13).add(time.mul(2.9)).add(2.7).add(phase.mul(1.3))).mul(0.025));
    const ripple = sin(coords.y.mul(6).add(time.mul(0.8)).add(phase.mul(0.4))).mul(0.02).mul(fixed);
    const p = positionLocal;
    this.positionNode = vec3(p.x, p.y.sub(fixed.mul(0.03).mul(this.windValue).mul(motion.y)),
      p.z.add(wave.mul(fixed).mul(this.windValue)).add(ripple));
    const sampled = texture(map);
    this.colorNode = sRGBTransferEOTF(sampled.rgb) as Node<'vec3'>;
    this.opacityNode = sampled.a.mul(0.95);
  }
}
