import { useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useGrassManager } from './useGrassManager';
import { MILLISECONDS_IN_SECOND } from '../../../../boilerplate/types';
import { useEngineFrame } from '../../../../runtime/frame';

/**
 * Single shared engine-frame driver for every grass tile in the scene.
 *
 * Mount one instance inside the world canvas (typically next to other
 * scenery components). The driver collects camera + frustum once per
 * frame and asks the grass manager to update all registered tiles in
 * a single batch — replacing N independent frame callbacks with
 * a single one regardless of how many grass tiles are placed.
 */
export function GrassDriver() {
  const manager = useGrassManager();
  const scratch = useMemo(() => ({
    frustum: new THREE.Frustum(),
    matrix: new THREE.Matrix4(),
    camPos: new THREE.Vector3(),
  }), []);

  const getThreeState = useThree((state) => state.get);

  useEngineFrame('effects', (delta, elapsedMs) => {
    if (!manager.isEnabled() || manager.size() === 0) return;
    const camera = getThreeState().camera;
    camera.updateWorldMatrix(true, false);
    scratch.matrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    scratch.frustum.setFromProjectionMatrix(scratch.matrix, camera.coordinateSystem, camera.reversedDepth);
    camera.getWorldPosition(scratch.camPos);

    manager.tick({
      elapsedTime: elapsedMs / MILLISECONDS_IN_SECOND,
      delta,
      cameraPosition: scratch.camPos,
      frustum: scratch.frustum,
    });
  }, { label: 'building:grass' });

  return null;
}

export default GrassDriver;
