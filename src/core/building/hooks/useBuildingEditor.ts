import { useCallback, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingStore } from '../stores/buildingStore';
import { TILE_CONSTANTS } from '../types/constants';
import { Rotation3D } from '../types';

const _vec2 = new THREE.Vector2();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersection = new THREE.Vector3();
let _idSeq = 0;

export function useBuildingEditor() {
  const { camera, raycaster } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  const snapPosition = useBuildingStore((s) => s.snapPosition);
  const addWall = useBuildingStore((s) => s.addWall);
  const addTile = useBuildingStore((s) => s.addTile);
  const addObject = useBuildingStore((s) => s.addObject);
  const removeWall = useBuildingStore((s) => s.removeWall);
  const removeTile = useBuildingStore((s) => s.removeTile);
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);

  const raycastGround = useCallback(() => {
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
    if (mode === 'tile' || mode === 'wall' || mode === 'npc' || mode === 'object') {
      const pos = raycastGround();
      setHoverPosition(pos);
    } else {
      setHoverPosition(null);
    }
  }, [raycastGround, setHoverPosition]);

  const placeWall = useCallback(() => {
    const {
      editMode: mode,
      selectedWallGroupId: groupId,
      currentWallRotation,
      checkWallPosition,
      hoverPosition,
    } = useBuildingStore.getState();
    if (mode !== 'wall' || !groupId || !hoverPosition) return;
    if (checkWallPosition(hoverPosition, currentWallRotation)) return;
    const rotation: Rotation3D = { x: 0, y: currentWallRotation, z: 0 };
    addWall(groupId, {
      id: `wall-${++_idSeq}-${Date.now()}`,
      position: hoverPosition,
      rotation,
      wallGroupId: groupId,
    });
  }, [addWall]);

  const placeTile = useCallback(() => {
    const {
      editMode: mode,
      selectedTileGroupId: groupId,
      checkTilePosition,
      currentTileMultiplier,
      currentTileHeight,
      currentTileShape,
      currentTileRotation,
      hoverPosition,
    } = useBuildingStore.getState();
    if (mode !== 'tile' || !groupId || !hoverPosition) return;
    if (checkTilePosition(hoverPosition)) return;
    const effectiveHeight = currentTileShape === 'stairs' || currentTileShape === 'ramp'
      ? Math.max(1, currentTileHeight)
      : currentTileHeight;
    addTile(groupId, {
      id: `tile-${++_idSeq}-${Date.now()}`,
      position: {
        ...hoverPosition,
        y: effectiveHeight * TILE_CONSTANTS.HEIGHT_STEP,
      },
      tileGroupId: groupId,
      size: currentTileMultiplier,
      rotation: currentTileRotation,
      shape: currentTileShape,
    });
  }, [addTile]);

  const placeObject = useCallback(() => {
    const {
      editMode: mode,
      selectedPlacedObjectType,
      hoverPosition,
      tileGroups,
      currentObjectRotation,
      currentFlagWidth,
      currentFlagHeight,
      currentFlagStyle,
      currentFlagImageUrl,
      currentFireIntensity,
      currentFireWidth,
      currentFireHeight,
      currentFireColor,
      currentBillboardText,
      currentBillboardColor,
      currentBillboardImageUrl,
    } = useBuildingStore.getState();
    if (mode !== 'object' || selectedPlacedObjectType === 'none' || !hoverPosition) return;

    let tileY = 0;
    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
    for (const group of tileGroups.values()) {
      for (const tile of group.tiles) {
        const half = ((tile.size || 1) * cellSize) / 2;
        if (
          Math.abs(tile.position.x - hoverPosition.x) < half &&
          Math.abs(tile.position.z - hoverPosition.z) < half
        ) {
          tileY = Math.max(tileY, tile.position.y);
        }
      }
    }

    const config =
      selectedPlacedObjectType === 'sakura'
        ? { size: useBuildingStore.getState().currentTileMultiplier * cellSize }
        : selectedPlacedObjectType === 'flag'
          ? {
              flagWidth: currentFlagWidth,
              flagHeight: currentFlagHeight,
              flagStyle: currentFlagStyle,
              ...(currentFlagImageUrl ? { flagTexture: currentFlagImageUrl } : {}),
            }
          : selectedPlacedObjectType === 'fire'
            ? { fireIntensity: currentFireIntensity, fireWidth: currentFireWidth, fireHeight: currentFireHeight, fireColor: currentFireColor }
            : selectedPlacedObjectType === 'billboard'
              ? {
                  billboardText: currentBillboardText,
                  billboardColor: currentBillboardColor,
                  ...(currentBillboardImageUrl ? { billboardImageUrl: currentBillboardImageUrl } : {}),
                }
              : undefined;

    addObject({
      id: `obj-${++_idSeq}-${Date.now()}`,
      type: selectedPlacedObjectType,
      position: { ...hoverPosition, y: tileY },
      ...(currentObjectRotation !== 0 ? { rotation: currentObjectRotation } : {}),
      ...(config ? { config } : {}),
    });
  }, [addObject]);

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
    placeObject,
    handleWallClick,
    handleTileClick,
    getGroundPosition: raycastGround,
  };
}
