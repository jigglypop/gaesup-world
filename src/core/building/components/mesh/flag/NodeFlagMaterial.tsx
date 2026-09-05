import { useEffect, useMemo } from 'react';

import type { FlagSurfaceMaterialProps } from './type';
import { FlagNodeMaterial } from '../../../../rendering/tsl/flag';

export default function NodeFlagMaterial({ materialRef, texture, windStrength, instanced = false }: FlagSurfaceMaterialProps) {
  const material = useMemo(() => new FlagNodeMaterial(texture, instanced), [texture, instanced]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive ref={materialRef} object={material} attach="material" windStrength={windStrength} />;
}
