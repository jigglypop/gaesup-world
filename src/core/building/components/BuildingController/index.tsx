import { useCallback, useEffect, useRef } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { NPCSystem } from '../../../npc/components/NPCSystem';
import { useBuildingEditor } from '../../hooks/useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';
import { BuildingGpuCullingDriver } from '../BuildingGpuCullingDriver';
import { BuildingGpuMirrorDriver } from '../BuildingGpuMirrorDriver';
import { BuildingGpuUploadDriver } from '../BuildingGpuUploadDriver';
import { BuildingIndirectArgsUploadDriver } from '../BuildingIndirectArgsUploadDriver';
import { BuildingIndirectDrawDriver } from '../BuildingIndirectDrawDriver';
import { BuildingRenderStateDriver } from '../BuildingRenderStateDriver';
import { BuildingSystem } from '../BuildingSystem';
import { BuildingVisibilityDriver } from '../BuildingVisibilityDriver';

const DRAG_THRESHOLD_SQ = 9;
const PLACE_COOLDOWN_MS = 150;

export function BuildingController() {
  const { gl } = useThree();
  const {
    updateMousePosition,
    placeWall,
    placeTile,
    placeBlock,
    placeObject,
    handleWallClick,
    handleTileClick,
    handleBlockClick,
  } = useBuildingEditor();
  
  const editMode = useBuildingStore((s) => s.editMode);
  const isEditing = editMode !== 'none';
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);
  const setWallRotation = useBuildingStore((s) => s.setWallRotation);
  const setTileRotation = useBuildingStore((s) => s.setTileRotation);
  const setObjectRotation = useBuildingStore((s) => s.setObjectRotation);
  const setTileHeight = useBuildingStore((s) => s.setTileHeight);
  const initialized = useBuildingStore((s) => s.initialized);
  const initializeDefaults = useBuildingStore((s) => s.initializeDefaults);

  const downPosRef = useRef({ x: 0, y: 0 });
  const lastPlaceRef = useRef(0);

  // OrbitControls: 좌클릭 비활성, 우클릭으로 회전
  const configureOrbit = useCallback((controls: OrbitControlsImpl | null) => {
    if (!controls) return;
    controls.mouseButtons = {
      LEFT: -1 as THREE.MOUSE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
  }, []);

  useEffect(() => {
    if (!initialized) {
      initializeDefaults();
    }
  }, [initialized, initializeDefaults]);

  useEffect(() => {
    if (editMode !== 'wall' && editMode !== 'tile' && editMode !== 'block' && editMode !== 'object') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const applyRotation = (rotation: number) => {
        if (editMode === 'wall') setWallRotation(rotation);
        else if (editMode === 'tile') setTileRotation(rotation);
        else if (editMode === 'object') setObjectRotation(rotation);
      };

      switch (e.key) {
        case 'ArrowUp':    applyRotation(0); break;
        case 'ArrowRight': applyRotation(Math.PI / 2); break;
        case 'ArrowDown':  applyRotation(Math.PI); break;
        case 'ArrowLeft':  applyRotation(Math.PI * 1.5); break;
      }

      // Q/E: manual layer offset for stacking on top of (or above)
      // the auto-detected support height. Only meaningful in tile mode.
      if (editMode === 'tile' || editMode === 'block') {
        if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q') {
          const cur = useBuildingStore.getState().currentTileHeight;
          setTileHeight(cur - 1);
        } else if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
          const cur = useBuildingStore.getState().currentTileHeight;
          setTileHeight(cur + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, setTileRotation, setWallRotation, setObjectRotation, setTileHeight]);

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
      else if (mode === 'block') placeBlock();
      else if (mode === 'object') placeObject();
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
  }, [gl, updateMousePosition, placeWall, placeTile, placeBlock, placeObject, setHoverPosition]);

  return (
    <>
      <BuildingRenderStateDriver />
      <BuildingGpuMirrorDriver />
      <BuildingGpuUploadDriver />
      <BuildingGpuCullingDriver />
      <BuildingIndirectDrawDriver />
      <BuildingIndirectArgsUploadDriver />
      <BuildingVisibilityDriver />
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
        onBlockClick={handleBlockClick}
        onWallDelete={handleWallClick}
        onTileDelete={handleTileClick}
        onBlockDelete={handleBlockClick}
      />
      <NPCSystem />
    </>
  );
}
