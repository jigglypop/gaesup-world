import { attribute, floor, fract, mod, sin, uniform, vec3 } from 'three/tsl';
import { PointsNodeMaterial, type PointsMaterial } from 'three/webgpu';

export type WeatherMotionOptions = {
  kind: 'rain' | 'snow' | 'storm' | 'wind';
  area: number;
  height: number;
  wind?: number;
};

export class WeatherNodeMaterial extends PointsNodeMaterial {
  private readonly timeValue = uniform(0);

  get time(): number { return this.timeValue.value; }
  set time(value: number) { this.timeValue.value = value; }

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
    const time = this.timeValue;
    const area = Math.max(0.001, motion.area);
    const height = Math.max(0.001, motion.height);
    const seed = initial.x.mul(12.9898).add(initial.z.mul(78.233)).add(speed.mul(37.719));
    if (motion.kind === 'wind') {
      const travel = initial.x.add(area * 0.5).add(time.mul(speed));
      const cycle = floor(travel.div(area));
      const x = mod(travel, area).sub(area * 0.5);
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
      this.positionNode = vec3(motion.kind === 'snow' ? mod(x.add(time.mul(motion.wind ?? 0)).add(area * 0.5), area).sub(area * 0.5).add(sin(time.mul(0.5).add(seed)).mul(0.6)) : x, y, z);
    }
  }
}
