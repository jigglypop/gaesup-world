import { useEffect, useLayoutEffect, useMemo } from 'react';

import type { NodeGrassMaterialProps } from './type';
import { GrassNodeMaterial } from '../../../../rendering/tsl/grassMaterial';

export default function NodeGrassMaterial({ materialRef, texture, alphaMap, toon, tipColor, bottomColor }: NodeGrassMaterialProps) {
  const material = useMemo(() => new GrassNodeMaterial(texture, alphaMap), [texture, alphaMap]);
  useLayoutEffect(() => {
    material.uniforms.uToon.value = toon ? 1 : 0;
    material.uniforms.tipColor.value.copy(tipColor);
    material.uniforms.bottomColor.value.copy(bottomColor);
  }, [material, toon, tipColor, bottomColor]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} ref={materialRef} attach="material" />;
}
