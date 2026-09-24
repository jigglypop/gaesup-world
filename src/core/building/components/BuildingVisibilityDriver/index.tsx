import { useEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useEngineFrame } from '../../../runtime/frame';
import { syncVisibilityIndex } from '../../render/core';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingRenderStateStore } from '../../render/store';
import {
  collectCandidateIds,
  createVisibilityIndex,
  type VisibilityKind,
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
  const getThreeState = useThree((state) => state.get);
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const gpuCullingActive = useBuildingGpuCullingStore((s) => s.active);
  const gpuCullingVersion = useBuildingGpuCullingStore((s) => s.version);
  const gpuCamera = useBuildingGpuCullingStore((s) => s.camera);
  const gpuTileIds = useBuildingGpuCullingStore((s) => s.visibleTileGroupIds);
  const gpuWallIds = useBuildingGpuCullingStore((s) => s.visibleWallGroupIds);
  const gpuBlockIds = useBuildingGpuCullingStore((s) => s.visibleBlockIds);
  const gpuObjectIds = useBuildingGpuCullingStore((s) => s.visibleObjectIds);
  const setVisible = useBuildingVisibilityStore((s) => s.setVisible);
  const reset = useBuildingVisibilityStore((s) => s.reset);

  const index = useMemo(createVisibilityIndex, []);

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
    syncVisibilityIndex(index, snapshot);
  }, [index, snapshot]);

  useEffect(() => {
    cacheRef.current = null;
  }, [snapshot, gpuCullingActive, gpuCullingVersion, gpuCamera, gpuTileIds, gpuWallIds, gpuBlockIds, gpuObjectIds]);

  useEffect(() => reset, [reset]);

  useEngineFrame('effects', (delta) => {
    if (snapshot.ids.length === 0) return;
    accumRef.current += Math.max(0, delta);
    if (accumRef.current < VISIBILITY_UPDATE_INTERVAL) return;
    accumRef.current = 0;

    const { camera } = getThreeState();
    camera.updateWorldMatrix(true, false);
    scratch.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    if (!scratch.matrix.equals(scratch.previousMatrix)) {
      cacheRef.current = null;
      scratch.previousMatrix.copy(scratch.matrix);
    }
    const cached = cacheRef.current;
    if (cached) {
      setVisible(cached);
      return;
    }
    scratch.frustum.setFromProjectionMatrix(scratch.matrix, camera.coordinateSystem, camera.reversedDepth);
    camera.getWorldPosition(scratch.camera);

    const useGpuCandidates = gpuCullingActive && gpuCullingVersion === snapshot.version &&
      gpuCamera !== null && gpuCamera.coordinateSystem === camera.coordinateSystem &&
      gpuCamera.reversedDepth === camera.reversedDepth &&
      scratch.matrix.elements.every((value, i) => value === gpuCamera.viewProjection[i]) &&
      scratch.camera.x === gpuCamera.position[0] &&
      scratch.camera.y === gpuCamera.position[1] &&
      scratch.camera.z === gpuCamera.position[2];
    const gpuIds = { tile: gpuTileIds, wall: gpuWallIds, block: gpuBlockIds, object: gpuObjectIds };
    const visibleIds = (kind: VisibilityKind) => {
      const layer = index[kind];
      const ids = new Set<string>();
      appendVisibleIds(
        ids,
        useGpuCandidates ? gpuIds[kind] : collectCandidateIds(layer.buckets, scratch.camera.x, scratch.camera.z, VISIBILITY_MAX_DISTANCE),
        layer.byId,
        scratch.frustum,
        scratch.camera,
        scratch.sphere,
        VISIBILITY_MAX_DISTANCE,
      );
      return ids;
    };

    const payload = { tileIds: visibleIds('tile'), wallIds: visibleIds('wall'), blockIds: visibleIds('block'), objectIds: visibleIds('object') };
    cacheRef.current = payload;
    setVisible(payload);
  }, { label: 'building:visibility', active: snapshot.ids.length > 0 });

  return null;
}

export default BuildingVisibilityDriver;
