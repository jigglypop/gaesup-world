import { useEffect, useMemo } from 'react';

import { InstancedBufferAttribute, Sprite } from 'three/webgpu';

import type { NodeWeatherProps } from './types';
import { WeatherNodeMaterial } from '../../../rendering/tsl/weather';
import { useEngineFrame } from '../../../runtime/frame';

export default function NodeWeather({ geometry, material, onObject, kind, area, height, wind = 0 }: NodeWeatherProps) {
  const sprite = useMemo(() => {
    const positions = geometry.getAttribute('position');
    const speeds = geometry.getAttribute('aSpeed');
    const object = new Sprite(new WeatherNodeMaterial(material, { kind, area, height, wind }));
    object.geometry = object.geometry.clone();
    object.geometry.setAttribute('weatherPosition', new InstancedBufferAttribute(positions.array, 3));
    object.geometry.setAttribute('weatherSpeed', new InstancedBufferAttribute(speeds.array, 1));
    object.count = positions.count;
    object.frustumCulled = false;
    return object;
  }, [geometry, material, kind, area, height, wind]);
  useEffect(() => () => {
    sprite.geometry.dispose();
    sprite.material.dispose();
  }, [sprite]);
  useEngineFrame('effects', (delta) => {
    (sprite.material as WeatherNodeMaterial).time += delta;
  }, { label: 'weather:node-time' });
  return <primitive object={sprite} ref={onObject} />;
}
