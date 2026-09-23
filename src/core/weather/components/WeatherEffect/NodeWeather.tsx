import { useEffect, useMemo } from 'react';

import { InstancedBufferAttribute, Sprite } from 'three/webgpu';

import type { NodeWeatherProps } from './types';
import { WeatherNodeMaterial } from '../../../rendering/tsl/weather';
import { useEngineFrame } from '../../../runtime/frame';

export default function NodeWeather({ geometry, material, onObject }: NodeWeatherProps) {
  const sprite = useMemo(() => {
    const positions = geometry.getAttribute('position');
    const object = new Sprite(new WeatherNodeMaterial(material));
    object.geometry = object.geometry.clone();
    object.geometry.setAttribute('weatherPosition', new InstancedBufferAttribute(positions.array, 3));
    object.count = positions.count;
    object.frustumCulled = false;
    return object;
  }, [geometry, material]);
  useEffect(() => () => {
    sprite.geometry.dispose();
    sprite.material.dispose();
  }, [sprite]);
  useEngineFrame('effects', () => { sprite.geometry.getAttribute('weatherPosition').needsUpdate = true; }, { label: 'weather:node-sprite' });
  return <primitive object={sprite} ref={onObject} />;
}
