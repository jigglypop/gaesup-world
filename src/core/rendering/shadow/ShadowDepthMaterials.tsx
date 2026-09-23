import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';

import { createShadowDepthMaterialCache } from './depthMaterialCache';
import { useEngineFrame } from '../../runtime/frame';

const SHADOW_DEPTH_REFRESH_MS = 500;

export function ShadowDepthMaterials() {
  const scene = useThree((state) => state.scene);
  const cache = useMemo(() => createShadowDepthMaterialCache(), []);

  useEffect(() => () => {
    cache.release(scene);
    cache.dispose();
  }, [cache, scene]);

  useEngineFrame('lateUpdate', () => cache.assign(scene), {
    throttleMs: SHADOW_DEPTH_REFRESH_MS,
    label: 'rendering:shadow-depth',
  });

  return null;
}
