import { useEffect } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { NPCSystem } from '../../../npc/components/NPCSystem';
import { useBuildingEditor } from '../../hooks/useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';
import { BuildingSystem } from '../BuildingSystem';

export function BuildingController() {
  const { gl } = useThree();
  const {
    updateMousePosition,
    placeWall,
    placeTile,
    handleWallClick,
    handleTileClick,
  } = useBuildingEditor();
  
  const editMode = useBuildingStore((state) => state.editMode);
  const isEditing = editMode !== 'none';
  const setHoverPosition = useBuildingStore((state) => state.setHoverPosition);
  const setWallRotation = useBuildingStore((state) => state.setWallRotation);
  const initialized = useBuildingStore((state) => state.initialized);
  const initializeDefaults = useBuildingStore((state) => state.initializeDefaults);
  
  useEffect(() => {
    if (!initialized) {
      initializeDefaults();
    }
  }, [initialized, initializeDefaults]);

  useEffect(() => {
    if (editMode !== 'wall') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setWallRotation(0);
          break;
        case 'ArrowRight':
          setWallRotation(Math.PI / 2);
          break;
        case 'ArrowDown':
          setWallRotation(Math.PI);
          break;
        case 'ArrowLeft':
          setWallRotation(Math.PI * 1.5);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, setWallRotation]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleMouseMove = (e: MouseEvent) => updateMousePosition(e);
    const handleClick = (e: MouseEvent) => {
      if (editMode === 'npc') return; 
      e.preventDefault();
      if (editMode === 'wall') placeWall();
      else if (editMode === 'tile') placeTile();
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      setHoverPosition(null);
    };
  }, [gl, updateMousePosition, placeWall, placeTile, editMode, setHoverPosition]);

  return (
    <>
      {isEditing && (
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={100}
        />
      )}
      <BuildingSystem
        onWallClick={handleWallClick}
        onTileClick={handleTileClick}
        onWallDelete={handleWallClick}
        onTileDelete={handleTileClick}
      />
      <NPCSystem />
    </>
  );
} 