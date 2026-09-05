import { attribute } from 'three/tsl';
import { PointsNodeMaterial, type PointsMaterial } from 'three/webgpu';

export class WeatherNodeMaterial extends PointsNodeMaterial {
  constructor(source: PointsMaterial) {
    super({
      color: source.color,
      size: source.size,
      opacity: source.opacity,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.positionNode = attribute<'vec3'>('weatherPosition', 'vec3');
  }
}
