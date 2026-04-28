import { useCallback, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingStore } from '../stores/buildingStore';
import { Rotation3D } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

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
  const addBlock = useBuildingStore((s) => s.addBlock);
  const addObject = useBuildingStore((s) => s.addObject);
  const setSelectedWallId = useBuildingStore((s) => s.setSelectedWallId);
  const setSelectedTileId = useBuildingStore((s) => s.setSelectedTileId);
  const setSelectedBlockId = useBuildingStore((s) => s.setSelectedBlockId);
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);

  const raycastGround = useCallback(() => {
    _vec2.set(mouseRef.current.x, mouseRef.current.y);
    raycaster.setFromCamera(_vec2, camera);
    if (raycaster.ray.intersectPlane(_groundPlane, _intersection)) {
      return snapPosition({ x: _intersection.x, y: 0, z: _intersection.z });
    }
    return null;
  }, [camera, raycaster, snapPosition]);

  /**
   * Box-style stacking hover: snaps to the XZ grid first, then asks the store
   * what the highest existing tile under that footprint is, and returns that
   * height as the suggested Y. Walls/objects keep ground semantics.
   */
  const raycastStackable = useCallback(() => {
    const grounded = raycastGround();
    if (!grounded) return null;
    const support = useBuildingStore.getState().getSupportHeightAt(grounded);
    return { ...grounded, y: support };
  }, [raycastGround]);

  const updateMousePosition = useCallback((event: MouseEvent) => {
    const canvas = event.target as HTMLCanvasElement;
    mouseRef.current.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

    const mode = useBuildingStore.getState().editMode;
    if (mode === 'tile' || mode === 'block') {
      setHoverPosition(raycastStackable());
    } else if (mode === 'wall' || mode === 'npc' || mode === 'object') {
      setHoverPosition(raycastGround());
    } else {
      setHoverPosition(null);
    }
  }, [raycastGround, raycastStackable, setHoverPosition]);

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
      getSupportHeightAt,
      currentTileMultiplier,
      currentTileHeight,
      currentTileShape,
      currentTileRotation,
      hoverPosition,
    } = useBuildingStore.getState();
    if (mode !== 'tile' || !groupId || !hoverPosition) return;

    // Stacking semantics:
    //  - For ordinary box tiles, the cursor's Y already includes the stacked
    //    support height (computed in updateMousePosition). The user-controlled
    //    `currentTileHeight` is added as an explicit raise on top of that.
    //  - Stairs/ramps still require height >= 1 step to make a usable slope.
    const heightStep = TILE_CONSTANTS.HEIGHT_STEP;
    const supportY = getSupportHeightAt(hoverPosition);
    const baseY =
      currentTileShape === 'box' || currentTileShape === 'round'
        ? supportY + currentTileHeight * heightStep
        : Math.max(1, currentTileHeight) * heightStep;

    const placement = { ...hoverPosition, y: baseY };
    if (checkTilePosition(placement)) return;
    addTile(groupId, {
      id: `tile-${++_idSeq}-${Date.now()}`,
      position: placement,
      tileGroupId: groupId,
      size: currentTileMultiplier,
      rotation: currentTileRotation,
      shape: currentTileShape,
    });
  }, [addTile]);

  const placeBlock = useCallback(() => {
    const {
      editMode: mode,
      checkBlockPosition,
      getSupportHeightAt,
      currentTileMultiplier,
      currentTileHeight,
      hoverPosition,
    } = useBuildingStore.getState();
    if (mode !== 'block' || !hoverPosition) return;

    const heightStep = TILE_CONSTANTS.HEIGHT_STEP;
    const supportY = getSupportHeightAt(hoverPosition);
    const sizeXZ = Math.max(1, Math.round(currentTileMultiplier));
    const placement = {
      ...hoverPosition,
      y: supportY + currentTileHeight * heightStep,
    };
    const block = {
      id: `block-${++_idSeq}-${Date.now()}`,
      position: placement,
      size: { x: sizeXZ, y: 1, z: sizeXZ },
      materialId: 'default-block',
    };

    if (checkBlockPosition(block)) return;
    addBlock(block);
  }, [addBlock]);

  const placeObject = useCallback(() => {
    const {
      editMode: mode,
      selectedPlacedObjectType,
      hoverPosition,
      tileGroups,
      currentObjectRotation,
      currentObjectPrimaryColor,
      currentObjectSecondaryColor,
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
        ? {
            size: useBuildingStore.getState().currentTileMultiplier * cellSize,
            primaryColor: currentObjectPrimaryColor,
            secondaryColor: currentObjectSecondaryColor,
          }
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
    const { editMode: mode } = useBuildingStore.getState();
    if (mode === 'wall') {
      setSelectedWallId(wallId);
    }
  }, [setSelectedWallId]);

  const handleTileClick = useCallback((tileId: string) => {
    const { editMode: mode } = useBuildingStore.getState();
    if (mode === 'tile') {
      setSelectedTileId(tileId);
    }
  }, [setSelectedTileId]);

  const handleBlockClick = useCallback((blockId: string) => {
    const { editMode: mode } = useBuildingStore.getState();
    if (mode === 'block') {
      setSelectedBlockId(blockId);
    }
  }, [setSelectedBlockId]);

  return {
    updateMousePosition,
    placeWall,
    placeTile,
    placeBlock,
    placeObject,
    handleWallClick,
    handleTileClick,
    handleBlockClick,
    getGroundPosition: raycastGround,
  };
}
