import { useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getGrassManager } from './manager';

/**
 * Single shared `useFrame` driver for every grass tile in the scene.
 *
 * Mount one instance inside the world canvas (typically next to other
 * scenery components). The driver collects camera + frustum once per
 * frame and asks the grass manager to update all registered tiles in
 * a single batch — replacing N independent `useFrame` callbacks with
 * a single one regardless of how many grass tiles are placed.
 */
export function GrassDriver() {
  const scratch = useMemo(() => ({
    frustum: new THREE.Frustum(),
    matrix: new THREE.Matrix4(),
    camPos: new THREE.Vector3(),
  }), []);

  useFrame((state, delta) => {
    const camera = state.camera;
    if (getGrassManager().size() === 0) return;
    scratch.matrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    scratch.frustum.setFromProjectionMatrix(scratch.matrix);
    scratch.camPos.copy(camera.position);

    getGrassManager().tick({
      elapsedTime: state.clock.elapsedTime,
      delta,
      cameraPosition: scratch.camPos,
      frustum: scratch.frustum,
    });
  });

  return null;
}

export default GrassDriver;
