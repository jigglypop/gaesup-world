import { useCallback, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingStore } from '../stores/buildingStore';
import { Position3D, Rotation3D } from '../types';

const _vec2 = new THREE.Vector2();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersection = new THREE.Vector3();

export function useBuildingEditor() {
  const { camera, raycaster } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  const editMode = useBuildingStore((s) => s.editMode);
  const selectedWallGroupId = useBuildingStore((s) => s.selectedWallGroupId);
  const selectedTileGroupId = useBuildingStore((s) => s.selectedTileGroupId);
  const snapPosition = useBuildingStore((s) => s.snapPosition);
  const addWall = useBuildingStore((s) => s.addWall);
  const addTile = useBuildingStore((s) => s.addTile);
  const removeWall = useBuildingStore((s) => s.removeWall);
  const removeTile = useBuildingStore((s) => s.removeTile);
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);

  const raycastGround = useCallback((): Position3D | null => {
    _vec2.set(mouseRef.current.x, mouseRef.current.y);
    raycaster.setFromCamera(_vec2, camera);
    if (raycaster.ray.intersectPlane(_groundPlane, _intersection)) {
      return snapPosition({ x: _intersection.x, y: 0, z: _intersection.z });
    }
    return null;
  }, [camera, raycaster, snapPosition]);

  const updateMousePosition = useCallback((event: MouseEvent) => {
    const canvas = event.target as HTMLCanvasElement;
    mouseRef.current.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

    const mode = useBuildingStore.getState().editMode;
    if (mode === 'tile' || mode === 'wall' || mode === 'npc') {
      const pos = raycastGround();
      setHoverPosition(pos);
    } else {
      setHoverPosition(null);
    }
  }, [raycastGround, setHoverPosition]);

  const placeWall = useCallback(() => {
    const { editMode: mode, selectedWallGroupId: groupId, currentWallRotation, checkWallPosition } = useBuildingStore.getState();
    if (mode !== 'wall' || !groupId) return;
    const position = raycastGround();
    if (!position) return;
    if (checkWallPosition(position, currentWallRotation)) return;
    const rotation: Rotation3D = { x: 0, y: currentWallRotation, z: 0 };
    addWall(groupId, {
      id: `wall-${Date.now()}`,
      position,
      rotation,
      wallGroupId: groupId,
    });
  }, [raycastGround, addWall]);

  const placeTile = useCallback(() => {
    const { editMode: mode, selectedTileGroupId: groupId, checkTilePosition, currentTileMultiplier } = useBuildingStore.getState();
    if (mode !== 'tile' || !groupId) return;
    const position = raycastGround();
    if (!position) return;
    if (checkTilePosition(position)) return;
    addTile(groupId, {
      id: `tile-${Date.now()}`,
      position,
      tileGroupId: groupId,
      size: currentTileMultiplier,
    });
  }, [raycastGround, addTile]);

  const handleWallClick = useCallback((wallId: string) => {
    const { editMode: mode, selectedWallGroupId: groupId } = useBuildingStore.getState();
    if (mode === 'wall' && groupId) {
      removeWall(groupId, wallId);
    }
  }, [removeWall]);

  const handleTileClick = useCallback((tileId: string) => {
    const { editMode: mode, selectedTileGroupId: groupId } = useBuildingStore.getState();
    if (mode === 'tile' && groupId) {
      removeTile(groupId, tileId);
    }
  }, [removeTile]);

  return {
    updateMousePosition,
    placeWall,
    placeTile,
    handleWallClick,
    handleTileClick,
    getGroundPosition: raycastGround,
  };
} 