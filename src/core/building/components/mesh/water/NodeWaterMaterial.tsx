import { useEffect, useMemo } from 'react';

import { createToonWaterMaterial } from '../../../../rendering/tsl/toonWater';
import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';

const NODE_WATER_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:water-node' };

export default function NodeWaterMaterial() {
  const { material, time } = useMemo(createToonWaterMaterial, []);
  useSharedFrame(NODE_WATER_FRAME, (_, elapsedSeconds) => { time.value = elapsedSeconds; });
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
