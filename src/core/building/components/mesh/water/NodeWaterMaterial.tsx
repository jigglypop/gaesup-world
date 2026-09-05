import { useEffect, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';

import { getFrameElapsedSeconds } from '../../../../boilerplate/hooks/frameTime';
import { createToonWaterMaterial } from '../../../../rendering/tsl/toonWater';

export default function NodeWaterMaterial() {
  const { material, time } = useMemo(createToonWaterMaterial, []);
  useFrame((state) => { time.value = getFrameElapsedSeconds(state); });
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}
