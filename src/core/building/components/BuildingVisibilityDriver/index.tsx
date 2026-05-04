import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingStore } from '../../stores/buildingStore';
import {
  buildVisibilityIndex,
  collectCandidateIds,
  createVisibilityQueryKey,
  type VisibilityRecord,
  VISIBILITY_MAX_DISTANCE,
  VISIBILITY_UPDATE_INTERVAL,
} from '../../visibility/core';
import { useBuildingVisibilityStore } from '../../visibility/store';

function appendVisibleIds(
  out: Set<string>,
  candidates: Set<string>,
  byId: Map<string, VisibilityRecord>,
  selfKind: 'tile' | 'wall' | 'block' | 'object',
  frustum: THREE.Frustum,
  cameraPosition: THREE.Vector3,
  sphere: THREE.Sphere,
  maxDistanceSq: number,
): void {
  void selfKind;
  for (const id of candidates) {
    const record = byId.get(id);
    if (!record) continue;
    const dx = record.centerX - cameraPosition.x;
    const dy = record.centerY - cameraPosition.y;
    const dz = record.centerZ - cameraPosition.z;
    const limit = maxDistanceSq + record.radius * record.radius;
    if (dx * dx + dy * dy + dz * dz > limit) continue;
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
  const cacheRef = useRef(new Map<string, {
    tileIds: Set<string>;
    wallIds: Set<string>;
    blockIds: Set<string>;
    objectIds: Set<string>;
  }>());
  const scratch = useMemo(
    () => ({
      frustum: new THREE.Frustum(),
      matrix: new THREE.Matrix4(),
      camera: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      sphere: new THREE.Sphere(),
    }),
    [],
  );

  useEffect(() => {
    cacheRef.current.clear();
  }, [index]);

  useEffect(() => {
    cacheRef.current.clear();
  }, [gpuCullingActive, gpuCullingVersion]);

  useEffect(() => reset, [reset]);

  useFrame((state, delta) => {
    if (snapshot.ids.length === 0) return;
    accumRef.current += Math.max(0, delta);
    if (accumRef.current < VISIBILITY_UPDATE_INTERVAL) return;
    accumRef.current = 0;

    scratch.matrix.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse);
    scratch.frustum.setFromProjectionMatrix(scratch.matrix);
    scratch.camera.copy(state.camera.position);
    state.camera.getWorldDirection(scratch.forward);

    const queryKey = createVisibilityQueryKey(
      scratch.camera.x,
      scratch.camera.z,
      scratch.forward.x,
      scratch.forward.z,
    );
    const cached = cacheRef.current.get(queryKey);
    if (cached) {
      setVisible(cached);
      return;
    }

    const useGpuCandidates = gpuCullingActive && gpuCullingVersion === snapshot.version;
    const tileCandidates = useGpuCandidates
      ? new Set(gpuTileIds)
      : collectCandidateIds(
          index.tileBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const wallCandidates = useGpuCandidates
      ? new Set(gpuWallIds)
      : collectCandidateIds(
          index.wallBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const objectCandidates = useGpuCandidates
      ? new Set(gpuObjectIds)
      : collectCandidateIds(
          index.objectBuckets,
          scratch.camera.x,
          scratch.camera.z,
          VISIBILITY_MAX_DISTANCE,
        );
    const blockCandidates = useGpuCandidates
      ? new Set(gpuBlockIds)
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
    const maxDistanceSq = VISIBILITY_MAX_DISTANCE * VISIBILITY_MAX_DISTANCE;

    appendVisibleIds(
      tileIds,
      tileCandidates,
      index.tileById,
      'tile',
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      maxDistanceSq,
    );
    appendVisibleIds(
      wallIds,
      wallCandidates,
      index.wallById,
      'wall',
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      maxDistanceSq,
    );
    appendVisibleIds(
      objectIds,
      objectCandidates,
      index.objectById,
      'object',
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      maxDistanceSq,
    );
    appendVisibleIds(
      blockIds,
      blockCandidates,
      index.blockById,
      'block',
      scratch.frustum,
      scratch.camera,
      scratch.sphere,
      maxDistanceSq,
    );

    const payload = { tileIds, wallIds, blockIds, objectIds };
    cacheRef.current.set(queryKey, payload);
    if (cacheRef.current.size > 96) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) cacheRef.current.delete(oldestKey);
    }
    setVisible({
      tileIds: payload.tileIds,
      wallIds: payload.wallIds,
      blockIds: payload.blockIds,
      objectIds: payload.objectIds,
    });
  });

  return null;
}

export default BuildingVisibilityDriver;
