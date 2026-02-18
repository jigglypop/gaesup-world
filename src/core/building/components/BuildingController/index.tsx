import { useCallback, useEffect, useRef } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { NPCSystem } from '../../../npc/components/NPCSystem';
import { useBuildingEditor } from '../../hooks/useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';
import { BuildingSystem } from '../BuildingSystem';

const DRAG_THRESHOLD_SQ = 9;
const PLACE_COOLDOWN_MS = 150;

export function BuildingController() {
  const { gl } = useThree();
  const {
    updateMousePosition,
    placeWall,
    placeTile,
    handleWallClick,
    handleTileClick,
  } = useBuildingEditor();
  
  const editMode = useBuildingStore((s) => s.editMode);
  const isEditing = editMode !== 'none';
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);
  const setWallRotation = useBuildingStore((s) => s.setWallRotation);
  const initialized = useBuildingStore((s) => s.initialized);
  const initializeDefaults = useBuildingStore((s) => s.initializeDefaults);

  const downPosRef = useRef({ x: 0, y: 0 });
  const lastPlaceRef = useRef(0);

  // OrbitControls: 좌클릭 비활성, 우클릭으로 회전
  const configureOrbit = useCallback((controls: any) => {
    if (!controls) return;
    controls.mouseButtons = { LEFT: -1, MIDDLE: 1, RIGHT: 0 };
  }, []);
  
  useEffect(() => {
    if (!initialized) {
      initializeDefaults();
    }
  }, [initialized, initializeDefaults]);

  useEffect(() => {
    if (editMode !== 'wall') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':    setWallRotation(0); break;
        case 'ArrowRight': setWallRotation(Math.PI / 2); break;
        case 'ArrowDown':  setWallRotation(Math.PI); break;
        case 'ArrowLeft':  setWallRotation(Math.PI * 1.5); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, setWallRotation]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      downPosRef.current.x = e.clientX;
      downPosRef.current.y = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => updateMousePosition(e);

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const dx = e.clientX - downPosRef.current.x;
      const dy = e.clientY - downPosRef.current.y;
      if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) return;

      const now = performance.now();
      if (now - lastPlaceRef.current < PLACE_COOLDOWN_MS) return;
      lastPlaceRef.current = now;

      const mode = useBuildingStore.getState().editMode;
      if (mode === 'npc') return;
      if (mode === 'wall') placeWall();
      else if (mode === 'tile') placeTile();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      setHoverPosition(null);
    };
  }, [gl, updateMousePosition, placeWall, placeTile, setHoverPosition]);

  return (
    <>
      {isEditing && (
        <OrbitControls
          ref={configureOrbit}
          enablePan
          enableZoom
          enableRotate
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
