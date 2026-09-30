import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useEngineFrame } from '../../../runtime/frame';
import { syncVisibilityIndex } from '../../render/core';
import { useBuildingRenderStateStore } from '../../render/store';
import {
  collectResidentIds,
  createVisibilityIndex,
  VISIBILITY_UPDATE_INTERVAL,
} from '../../visibility/core';
import { useBuildingVisibilityStoreApi } from '../../visibility/store';

/** Camera moves shorter than this keep the previous residency result. */
const MOVE_EPSILON_SQ = 1;

/** Publishes which building groups are within draw distance. Rotation never changes the result. */
export function BuildingVisibilityDriver() {
  const getThreeState = useThree((state) => state.get);
  const snapshot = useBuildingRenderStateStore((s) => s.snapshot);
  const visibilityStore = useBuildingVisibilityStoreApi();
  const index = useMemo(createVisibilityIndex, []);
  const tracker = useMemo(() => ({ accum: 0, dirty: true, camera: new THREE.Vector3(), last: new THREE.Vector3() }), []);

  useEffect(() => {
    syncVisibilityIndex(index, snapshot);
    tracker.dirty = true;
  }, [index, snapshot, tracker]);

  useEffect(() => visibilityStore.getState().reset, [visibilityStore]);

  useEngineFrame('effects', (delta) => {
    tracker.accum += Math.max(0, delta);
    if (tracker.accum < VISIBILITY_UPDATE_INTERVAL) return;
    tracker.accum = 0;

    getThreeState().camera.getWorldPosition(tracker.camera);
    if (!tracker.dirty && tracker.camera.distanceToSquared(tracker.last) < MOVE_EPSILON_SQ) return;
    tracker.dirty = false;
    tracker.last.copy(tracker.camera);

    const { x, y, z } = tracker.camera;
    const current = visibilityStore.getState();
    current.setVisible({
      tileIds: collectResidentIds(index.tile, x, y, z, current.visibleTileGroupIds),
      wallIds: collectResidentIds(index.wall, x, y, z, current.visibleWallGroupIds),
      blockIds: collectResidentIds(index.block, x, y, z, current.visibleBlockIds),
      objectIds: collectResidentIds(index.object, x, y, z, current.visibleObjectIds),
    });
  }, { label: 'building:visibility', active: snapshot.ids.length > 0 });

  return null;
}

export default BuildingVisibilityDriver;
