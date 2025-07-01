import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useBuildingStore } from '../stores/buildingStore';
import { Position3D, Rotation3D } from '../types';

export function useBuildingEditor() {
  const { camera, raycaster, scene } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const {
    editMode,
    selectedWallGroupId,
    selectedTileGroupId,
    snapPosition,
    addWall,
    addTile,
    removeWall,
    removeTile,
    setHoverPosition,
  } = useBuildingStore();

  const updateMousePosition = useCallback((event: MouseEvent) => {
    const canvas = event.target as HTMLCanvasElement;
    mouseRef.current.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
    
    if (editMode === 'tile' || editMode === 'wall' || editMode === 'npc') {
      raycaster.setFromCamera(
        new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
        camera
      );
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
        const snappedPosition = snapPosition({
          x: intersection.x,
          y: 0,
          z: intersection.z,
        });
        setHoverPosition(snappedPosition);
      } else {
        setHoverPosition(null);
      }
    } else {
      setHoverPosition(null);
    }
  }, [camera, raycaster, snapPosition, editMode, setHoverPosition]);

  const getGroundPosition = useCallback((): Position3D | null => {
    raycaster.setFromCamera(
      new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
      camera
    );

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
      return snapPosition({
        x: intersection.x,
        y: 0,
        z: intersection.z,
      });
    }
    
    return null;
  }, [camera, raycaster, snapPosition]);

  const placeWall = useCallback(() => {
    if (editMode !== 'wall' || !selectedWallGroupId) return;
    
    const position = getGroundPosition();
    if (!position) return;
    
    const { currentWallRotation, checkWallPosition } = useBuildingStore.getState();
    
    if (checkWallPosition(position, currentWallRotation)) {
      console.warn('Wall already exists at this position');
      return;
    }
    
    const rotation: Rotation3D = { x: 0, y: currentWallRotation, z: 0 };
    
    addWall(selectedWallGroupId, {
      id: `wall-${Date.now()}`,
      position,
      rotation,
      wallGroupId: selectedWallGroupId,
    });
  }, [editMode, selectedWallGroupId, getGroundPosition, addWall]);

  const placeTile = useCallback(() => {
    if (editMode !== 'tile' || !selectedTileGroupId) return;
    
    const position = getGroundPosition();
    if (!position) return;
    
    const { checkTilePosition, currentTileMultiplier } = useBuildingStore.getState();
    if (checkTilePosition(position)) {
      console.warn('Tile already exists at this position');
      return;
    }
    
    addTile(selectedTileGroupId, {
      id: `tile-${Date.now()}`,
      position,
      tileGroupId: selectedTileGroupId,
      size: currentTileMultiplier,
    });
  }, [editMode, selectedTileGroupId, getGroundPosition, addTile]);

  const handleWallClick = useCallback((wallId: string) => {
    if (editMode === 'wall' && selectedWallGroupId) {
      removeWall(selectedWallGroupId, wallId);
    }
  }, [editMode, selectedWallGroupId, removeWall]);

  const handleTileClick = useCallback((tileId: string) => {
    if (editMode === 'tile' && selectedTileGroupId) {
      removeTile(selectedTileGroupId, tileId);
    }
  }, [editMode, selectedTileGroupId, removeTile]);

  return {
    updateMousePosition,
    placeWall,
    placeTile,
    handleWallClick,
    handleTileClick,
    getGroundPosition,
  };
} 