import { useEffect, useLayoutEffect, useMemo } from 'react';

import type { BufferGeometry } from 'three';
import { attribute, cos, exp, float, fract, pow, sin, uniform, uv, vec3 } from 'three/tsl';
import { InstancedBufferAttribute, PointsNodeMaterial, Sprite } from 'three/webgpu';

import { useSharedFrame, type SharedFrameChannel } from '../../../runtime/frame';
import { useWeatherStoreApi } from '../../../weather/stores/weatherStore';

const TREE_PARTICLE_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:tree-particles' };
const PARTICLE_ATTRIBUTES = [
  ['position', 'particlePosition'], ['color', 'particleColor'],
  ['aParams1', 'aParams1'], ['aParams2', 'aParams2'],
  ['aTreePos', 'aTreePos'], ['aPointScale', 'aPointScale'],
] as const;

type TreeParticleProps = {
  geometry: BufferGeometry;
  size: number;
  opacity: number;
  falling?: boolean;
};

/**
 * Canopy, ground or falling petals as instanced sprites (WebGPU draws points one pixel wide). The shader depends only on
 * which inputs the geometry has; size and opacity are uniforms and a new particle set swaps the instance buffers, so
 * trees added or rescaled reuse the pipeline.
 */
export default function NodeTreeParticles({ geometry, size, opacity, falling = false }: TreeParticleProps) {
  const weatherStore = useWeatherStoreApi();
  const hasTreePosition = geometry.hasAttribute('aTreePos');
  const hasPointScale = geometry.hasAttribute('aPointScale');
  const owned = useMemo(() => {
    const time = uniform(0);
    const wind = uniform(1);
    const size = uniform(1);
    const opacity = uniform(1);
    const material = new PointsNodeMaterial({ sizeAttenuation: true, transparent: true, depthWrite: false });
    const sprite = new Sprite(material);
    const quad = sprite.geometry;
    const position = attribute<'vec3'>('particlePosition', 'vec3');
    material.positionNode = position;
    material.colorNode = attribute<'vec3'>('particleColor', 'vec3');
    material.sizeNode = size;
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
      material.positionNode = hasTreePosition ? positionNode.add(attribute<'vec3'>('aTreePos', 'vec3')) : positionNode;
      if (hasPointScale) material.sizeNode = attribute<'float'>('aPointScale', 'float').mul(size);
    }
    const offset = uv().sub(0.5);
    const radiusSquared = offset.dot(offset);
    material.opacityNode = radiusSquared.lessThanEqual(0.25).select(exp(radiusSquared.mul(-8)).mul(opacity), 0);
    sprite.frustumCulled = false;
    return { sprite, quad, time, wind, size, opacity };
  }, [falling, hasTreePosition, hasPointScale]);

  // Each particle set gets its own copy of the sprite quad carrying the set as instance buffers.
  useLayoutEffect(() => {
    const instances = owned.quad.clone();
    for (const [sourceName, targetName] of PARTICLE_ATTRIBUTES) {
      const source = geometry.getAttribute(sourceName);
      if (source) instances.setAttribute(targetName, new InstancedBufferAttribute(source.array, source.itemSize));
    }
    owned.sprite.geometry = instances;
    owned.sprite.count = geometry.getAttribute('position').count;
    return () => instances.dispose();
  }, [geometry, owned]);

  useLayoutEffect(() => {
    owned.size.value = size;
    owned.opacity.value = opacity;
  }, [opacity, owned, size]);

  useEffect(() => () => {
    owned.quad.dispose();
    owned.sprite.material.dispose();
  }, [owned]);

  useSharedFrame(TREE_PARTICLE_FRAME, (_, elapsedSeconds) => {
    if (owned.sprite.parent && !owned.sprite.parent.visible) return;
    owned.time.value = elapsedSeconds;
    const weather = weatherStore.getState().current;
    const base = weather?.kind === 'storm' ? 2.4 : weather?.kind === 'rain' ? 1.6
      : weather?.kind === 'snow' ? 1.2 : weather?.kind === 'cloudy' ? 1.1 : 0.9;
    owned.wind.value = base + (weather?.intensity ?? 0) * 0.7;
  }, falling);

  return <primitive object={owned.sprite} dispose={null} />;
}
