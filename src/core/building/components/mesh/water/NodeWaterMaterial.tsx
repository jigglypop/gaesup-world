
import { useEffect, useMemo } from 'react';

import type { Texture } from 'three';

import { createToonWaterMaterial } from '../../../../rendering/tsl/toonWater';
import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';

const NODE_WATER_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:water-node' };

export default function NodeWaterMaterial({ normalMap, brightness = 1 }: { normalMap?: Texture; brightness?: number }) {
  const { material, time, brightness: brightnessUniform } = useMemo(() => createToonWaterMaterial(normalMap), [normalMap]);
  useEffect(() => { brightnessUniform.value = brightness; }, [brightnessUniform, brightness]);
  useSharedFrame(NODE_WATER_FRAME, (_, elapsedSeconds) => { time.value = elapsedSeconds; });
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
