import { attribute, cos, exp, float, mod, positionView, screenDPR, sin, uniform, uv, vec3 } from 'three/tsl';
import { PointsNodeMaterial, Vector3 } from 'three/webgpu';

export class SnowNodeMaterial extends PointsNodeMaterial {
  private readonly timeValue = uniform(0);
  private readonly originValue = uniform(new Vector3());
  private readonly pixelScaleValue = uniform(1);

  get time(): number { return this.timeValue.value; }
  set time(value: number) { this.timeValue.value = value; }
  get origin(): Vector3 { return this.originValue.value; }
  get pixelScale(): number { return this.pixelScaleValue.value; }
  set pixelScale(value: number) { this.pixelScaleValue.value = value; }

  constructor(halfRange: number, height: number) {
    super({ size: 0.08, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false, toneMapped: false, alphaTest: 0.0001 });
    this.sizeNode = this.pixelScaleValue.mul(0.08).div(positionView.z.negate()).div(screenDPR);
    const particle = attribute<'vec4'>('snowParticle', 'vec4');
    const drift = attribute<'float'>('snowDrift', 'float');
    const seed = particle.x;
    const time = this.timeValue;
    const origin = this.originValue;
    const fall = float(height).sub(mod(time.mul(particle.w).add(seed.mul(height * 2)), height * 1.4));
    const dx = sin(time.mul(0.7).add(seed.mul(6.2831))).mul(drift);
    const dz = cos(time.mul(0.5).add(seed.mul(3.1415))).mul(drift);
    this.positionNode = vec3(
      origin.x.add(mod(particle.y.add(dx).sub(origin.x).add(halfRange), halfRange * 2)).sub(halfRange),
      origin.y.add(fall).sub(height * 0.5),
      origin.z.add(mod(particle.z.add(dz).sub(origin.z).add(halfRange), halfRange * 2)).sub(halfRange),
    );
    const distance = uv().sub(0.5);
    const radiusSquared = distance.dot(distance);
    this.opacityNode = radiusSquared.lessThanEqual(0.25).select(exp(radiusSquared.mul(-6)).mul(0.85), 0);
  }
}
