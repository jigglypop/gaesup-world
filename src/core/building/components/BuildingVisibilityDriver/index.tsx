import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingStore } from '../../stores/buildingStore';
import {
  buildVisibilityIndex,
  collectCandidateIds,
  type VisibilityRecord,
  VISIBILITY_MAX_DISTANCE,
  VISIBILITY_UPDATE_INTERVAL,
} from '../../visibility/core';
import { useBuildingVisibilityStore } from '../../visibility/store';

function appendVisibleIds(
  out: Set<string>,
  candidates: Iterable<string>,
  byId: Map<string, VisibilityRecord>,
  frustum: THREE.Frustum,
  cameraPosition: THREE.Vector3,
  sphere: THREE.Sphere,
  maxDistance: number,
): void {
  for (const id of candidates) {
    const record = byId.get(id);
    if (!record) continue;
    const dx = record.centerX - cameraPosition.x;
    const dy = record.centerY - cameraPosition.y;
    const dz = record.centerZ - cameraPosition.z;
    const limit = maxDistance + record.radius;
    if (dx * dx + dy * dy + dz * dz > limit * limit) continue;
    sphere.center.set(record.centerX, record.centerY, record.centerZ);
    sphere.radius = record.radius;
    if (!frustum.intersectsSphere(sphere)) continue;
    out.add(id);
  }
}

export function BuildingVisibilityDriver() {
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const wallGroups = useBuildingStore((s) => s.wallGroups);
  const tileGroups = useBuildingStore((s) => s.tileGroups);
  const blocks = useBuildingStore((s) => s.blocks);
  const objects = useBuildingStore((s) => s.objects);
  const gpuCullingActive = useBuildingGpuCullingStore((s) => s.active);
  const gpuCullingVersion = useBuildingGpuCullingStore((s) => s.version);
  const gpuCamera = useBuildingGpuCullingStore((s) => s.camera);
  const gpuTileIds = useBuildingGpuCullingStore((s) => s.visibleTileGroupIds);
  const gpuWallIds = useBuildingGpuCullingStore((s) => s.visibleWallGroupIds);
  const gpuBlockIds = useBuildingGpuCullingStore((s) => s.visibleBlockIds);
  const gpuObjectIds = useBuildingGpuCullingStore((s) => s.visibleObjectIds);
  const setVisible = useBuildingVisibilityStore((s) => s.setVisible);
  const reset = useBuildingVisibilityStore((s) => s.reset);

  const index = useMemo(
    () => buildVisibilityIndex(
      Array.from(wallGroups.values()),
      Array.from(tileGroups.values()),
      objects,
      blocks ?? [],
    ),
    [wallGroups, tileGroups, objects, blocks],
  );

  const accumRef = useRef(0);
  const cacheRef = useRef<Parameters<typeof setVisible>[0] | null>(null);
  const scratch = useMemo(
    () => ({
      frustum: new THREE.Frustum(),
      matrix: new THREE.Matrix4(),
      previousMatrix: new THREE.Matrix4(),
      camera: new THREE.Vector3(),
      sphere: new THREE.Sphere(),
    }),
    [],
  );

  useEffect(() => {
    cacheRef.current = null;
  }, [index, snapshot.version, gpuCullingActive, gpuCullingVersion, gpuCamera, gpuTileIds, gpuWallIds, gpuBlockIds, gpuObjectIds]);

  useEffect(() => reset, [reset]);

  useFrame((state, delta) => {
    if (snapshot.ids.length === 0) return;
    accumRef.current += Math.max(0, delta);
    if (accumRef.current < VISIBILITY_UPDATE_INTERVAL) return;
    accumRef.current = 0;

    state.camera.updateWorldMatrix(true, false);
    scratch.matrix.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    if (!scratch.matrix.equals(scratch.previousMatrix)) {
      cacheRef.current = null;
      scratch.previousMatrix.copy(scratch.matrix);
    }
    const cached = cacheRef.current;
    if (cached) {
      setVisible(cached);
      return;
    }
    scratch.frustum.setFromProjectionMatrix(scratch.matrix, state.camera.coordinateSystem, state.camera.reversedDepth);
    state.camera.getWorldPosition(scratch.camera);

    const useGpuCandidates = gpuCullingActive && gpuCullingVersion === snapshot.version &&
      gpuCamera !== null && gpuCamera.coordinateSystem === state.camera.coordinateSystem &&
      gpuCamera.reversedDepth === state.camera.reversedDepth &&
      scratch.matrix.elements.every((value, i) => value === gpuCamera.viewProjection[i]) &&
      scratch.camera.x === gpuCamera.position[0] &&
      scratch.camera.y === gpuCamera.position[1] &&
      scratch.camera.z === gpuCamera.position[2];
    const tileCandidates = useGpuCandidates
      ? gpuTileIds
      : collectCandidateIds(
          index.tileBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const wallCandidates = useGpuCandidates
      ? gpuWallIds
      : collectCandidateIds(
          index.wallBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const objectCandidates = useGpuCandidates
      ? gpuObjectIds
      : collectCandidateIds(
          index.objectBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const blockCandidates = useGpuCandidates
      ? gpuBlockIds
      : collectCandidateIds(
          index.blockBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const tileIds = new Set<string>();
    const wallIds = new Set<string>();
    const blockIds = new Set<string>();
    const objectIds = new Set<string>();

    appendVisibleIds(
      tileIds,
      tileCandidates,
      index.tileById,
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      VISIBILITY_MAX_DISTANCE,
    );
    appendVisibleIds(
      wallIds,
      wallCandidates,
      index.wallById,
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      VISIBILITY_MAX_DISTANCE,
    );
    appendVisibleIds(
      objectIds,
      objectCandidates,
      index.objectById,
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      VISIBILITY_MAX_DISTANCE,
    );
    appendVisibleIds(
      blockIds,
      blockCandidates,
      index.blockById,
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      VISIBILITY_MAX_DISTANCE,
    );

    const payload = { tileIds, wallIds, blockIds, objectIds };
    cacheRef.current = payload;
    setVisible(payload);
  });

  return null;
}

export default BuildingVisibilityDriver;
