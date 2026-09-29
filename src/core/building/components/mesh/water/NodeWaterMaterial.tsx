import { useEffect, useMemo } from 'react';

import type { Texture } from 'three';

import { createToonWaterMaterial, type WaterMaterialOptions } from '../../../../rendering/tsl/toonWater';
import { createWaterBedMaterial } from '../../../../rendering/tsl/waterBed';
import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';

const NODE_WATER_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:water-node' };

type NodeWaterMaterialProps = WaterMaterialOptions & { normalMap?: Texture; brightness?: number };

export default function NodeWaterMaterial({ normalMap, brightness = 1, toon, field, open, lod }: NodeWaterMaterialProps) {
  const { material, time, brightness: brightnessUniform } = useMemo(
    () => createToonWaterMaterial(normalMap, { toon, field, open, lod }),
    [normalMap, toon, field, open, lod],
  );
  useEffect(() => { brightnessUniform.value = brightness; }, [brightnessUniform, brightness]);
  useSharedFrame(NODE_WATER_FRAME, (_, elapsedSeconds) => { time.value = elapsedSeconds; });
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

/** The floor under a node water surface. */
export function NodeWaterBed({ field = null, open = false, normalMap }: Pick<NodeWaterMaterialProps, 'field' | 'open' | 'normalMap'>) {
  const material = useMemo(() => createWaterBedMaterial(field, open, normalMap), [field, open, normalMap]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
