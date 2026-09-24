import { attribute, floor, fract, mod, sin, time as nodeTime, uniform, vec3 } from 'three/tsl';
import { PointsNodeMaterial, type PointsMaterial } from 'three/webgpu';

export type WeatherMotionOptions = {
  kind: 'rain' | 'snow' | 'storm' | 'wind';
  area: number;
  height: number;
  wind?: number;
};

export class WeatherNodeMaterial extends PointsNodeMaterial {
  // Motion parameters are uniforms so wind or area changes never rebuild the node graph or its pipeline.
  private readonly areaValue = uniform(1);
  private readonly heightValue = uniform(1);
  private readonly windValue = uniform(0);

  setMotion(motion: Pick<WeatherMotionOptions, 'area' | 'height' | 'wind'>): void {
    this.areaValue.value = Math.max(0.001, motion.area);
    this.heightValue.value = Math.max(0.001, motion.height);
    this.windValue.value = motion.wind ?? 0;
  }

  constructor(source: PointsMaterial, motion?: WeatherMotionOptions) {
    super({
      color: source.color,
      size: source.size,
      opacity: source.opacity,
      transparent: true,
      depthWrite: false,
      map: source.map,
      sizeAttenuation: true,
    });
    const initial = attribute<'vec3'>('weatherPosition', 'vec3');
    if (!motion) {
      this.positionNode = initial;
      return;
    }
    // Immutable instance data: animation changes one uniform, never a position buffer.
    const speed = attribute<'float'>('weatherSpeed', 'float');
    this.setMotion(motion);
    const time = nodeTime;
    const area = this.areaValue;
    const height = this.heightValue;
    const seed = initial.x.mul(12.9898).add(initial.z.mul(78.233)).add(speed.mul(37.719));
    if (motion.kind === 'wind') {
      const travel = initial.x.add(area.mul(0.5)).add(time.mul(speed));
      const cycle = floor(travel.div(area));
      const x = mod(travel, area).sub(area.mul(0.5));
      const respawnY = fract(sin(seed.add(cycle.mul(19.19))).mul(43758.5453)).mul(height);
      const respawnZ = fract(sin(seed.add(cycle.mul(47.77))).mul(22578.1459)).sub(0.5).mul(area);
      const y = cycle.equal(0).select(initial.y, respawnY);
      const z = cycle.equal(0).select(initial.z, respawnZ);
      this.positionNode = vec3(x, y.add(sin(time.mul(0.7).add(seed)).mul(0.25)), z);
    } else {
      const travel = time.mul(speed).mul(motion.kind === 'snow' ? 1 : 6);
      const cycle = floor(travel.add(height).sub(initial.y).div(height));
      const y = mod(initial.y.sub(travel), height);
      const respawnX = fract(sin(seed.add(cycle.mul(19.19))).mul(43758.5453)).sub(0.5).mul(area);
      const respawnZ = fract(sin(seed.add(cycle.mul(47.77))).mul(22578.1459)).sub(0.5).mul(area);
      const x = cycle.equal(0).select(initial.x, respawnX);
      const z = cycle.equal(0).select(initial.z, respawnZ);
      this.positionNode = vec3(motion.kind === 'snow' ? mod(x.add(time.mul(this.windValue)).add(area.mul(0.5)), area).sub(area.mul(0.5)).add(sin(time.mul(0.5).add(seed)).mul(0.6)) : x, y, z);
    }
  }
}
