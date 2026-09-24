import { useEffect, useLayoutEffect, useMemo } from 'react';

import { InstancedBufferAttribute, Sprite } from 'three/webgpu';

import type { NodeWeatherProps } from './types';
import { WeatherNodeMaterial } from '../../../rendering/tsl/weather';

export default function NodeWeather({ geometry, material, onObject, kind, area, height, wind = 0 }: NodeWeatherProps) {
  const sprite = useMemo(() => {
    const positions = geometry.getAttribute('position');
    const speeds = geometry.getAttribute('aSpeed');
    // area/height/wind are uniforms: they seed the material here and later changes only update values, so
    // only geometry, material or kind rebuild the node graph and its pipeline.
    const object = new Sprite(new WeatherNodeMaterial(material, { kind, area, height, wind }));
    object.geometry = object.geometry.clone();
    object.geometry.setAttribute('weatherPosition', new InstancedBufferAttribute(positions.array, 3));
    object.geometry.setAttribute('weatherSpeed', new InstancedBufferAttribute(speeds.array, 1));
    object.count = positions.count;
    object.frustumCulled = false;
    return object;
  }, [geometry, material, kind]);
  useLayoutEffect(() => {
    (sprite.material as WeatherNodeMaterial).setMotion({ area, height, wind });
  }, [sprite, area, height, wind]);
  useEffect(() => () => {
    sprite.geometry.dispose();
    sprite.material.dispose();
  }, [sprite]);
  return <primitive object={sprite} ref={onObject} />;
}
