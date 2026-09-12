import { useEffect, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import type { BufferGeometry } from 'three';
import { attribute, cos, exp, float, fract, pow, sin, uniform, uv, vec3 } from 'three/tsl';
import { InstancedBufferAttribute, PointsNodeMaterial, Sprite } from 'three/webgpu';

import { getFrameElapsedSeconds } from '../../../boilerplate/hooks/frameTime';
import { useWeatherStore } from '../../../weather/stores/weatherStore';

type TreeParticleProps = {
  geometry: BufferGeometry;
  size: number;
  opacity: number;
  falling?: boolean;
};

export default function NodeTreeParticles({ geometry, size, opacity, falling = false }: TreeParticleProps) {
  const owned = useMemo(() => {
    const time = uniform(0);
    const wind = uniform(1);
    const material = new PointsNodeMaterial({
      size, sizeAttenuation: true, transparent: true, depthWrite: false,
    });
    const sprite = new Sprite(material);
    sprite.geometry = sprite.geometry.clone();
    for (const [sourceName, targetName] of [
      ['position', 'particlePosition'], ['color', 'particleColor'],
      ['aParams1', 'aParams1'], ['aParams2', 'aParams2'],
      ['aTreePos', 'aTreePos'], ['aPointScale', 'aPointScale'],
    ] as const) {
      const source = geometry.getAttribute(sourceName);
      if (source) {
        sprite.geometry.setAttribute(targetName, new InstancedBufferAttribute(source.array, source.itemSize));
      }
    }
    const position = attribute<'vec3'>('particlePosition', 'vec3');
    material.positionNode = position;
    material.colorNode = attribute<'vec3'>('particleColor', 'vec3');
    if (falling) {
      const parameters = attribute<'vec4'>('aParams1', 'vec4');
      const drift = attribute<'vec2'>('aParams2', 'vec2');
      const cycle = fract(time.mul(parameters.x).add(parameters.y));
      const phase = time.mul(parameters.w).add(parameters.y.mul(Math.PI * 2));
      const positionNode = vec3(
        position.x.add(sin(phase).mul(parameters.z).mul(wind)).add(drift.x.mul(cycle).mul(wind)),
        float(0.18).add(position.y.mul(float(1).sub(pow(cycle, 1.22)))).add(sin(phase.mul(0.6)).mul(0.06)),
        position.z.add(cos(phase.mul(0.82)).mul(parameters.z).mul(0.72).mul(wind)).add(drift.y.mul(cycle).mul(wind)),
      );
      material.positionNode = geometry.hasAttribute('aTreePos')
        ? positionNode.add(attribute<'vec3'>('aTreePos', 'vec3')) : positionNode;
      if (geometry.hasAttribute('aPointScale')) {
        material.sizeNode = attribute<'float'>('aPointScale', 'float').mul(size);
      }
    }
    const offset = uv().sub(0.5);
    const radiusSquared = offset.dot(offset);
    material.opacityNode = radiusSquared.lessThanEqual(0.25)
      .select(exp(radiusSquared.mul(-8)).mul(opacity), 0);
    sprite.count = geometry.getAttribute('position').count;
    sprite.frustumCulled = false;
    return { sprite, time, wind };
  }, [geometry, size, opacity, falling]);

  useEffect(() => () => {
    owned.sprite.geometry.dispose();
    owned.sprite.material.dispose();
  }, [owned]);

  useFrame((state) => {
    if (!falling || (owned.sprite.parent && !owned.sprite.parent.visible)) return;
    owned.time.value = getFrameElapsedSeconds(state);
    const weather = useWeatherStore.getState().current;
    const base = weather?.kind === 'storm' ? 2.4 : weather?.kind === 'rain' ? 1.6
      : weather?.kind === 'snow' ? 1.2 : weather?.kind === 'cloudy' ? 1.1 : 0.9;
    owned.wind.value = base + (weather?.intensity ?? 0) * 0.7;
  });

  return <primitive object={owned.sprite} dispose={null} />;
}
