import { useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';

import { NPCSystem } from '../../../npc/components/NPCSystem';
import { useBuildingEditor } from '../../hooks/useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';
import { BUILDING_TILE_GROUP_DRAG_TYPE, BUILDING_TILE_PRESET_DRAG_TYPE } from '../../types';
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
  const setHoverPosition = useBuildingStore((s) => s.setHoverPosition);
  const setWallRotation = useBuildingStore((s) => s.setWallRotation);
  const setTileRotation = useBuildingStore((s) => s.setTileRotation);
  const setObjectRotation = useBuildingStore((s) => s.setObjectRotation);
  const setTileHeight = useBuildingStore((s) => s.setTileHeight);
  const initialized = useBuildingStore((s) => s.initialized);
  const initializeDefaults = useBuildingStore((s) => s.initializeDefaults);

  const downPosRef = useRef({ x: 0, y: 0 });
  const lastPlaceRef = useRef(0);

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

    // 패널의 타일 프리셋/커스텀 타일 맵을 캔버스 위로 끌어다 놓으면 해당 위치에 배치한다.
    const isTileDrag = (e: DragEvent) =>
      Boolean(
        e.dataTransfer?.types.includes(BUILDING_TILE_PRESET_DRAG_TYPE) ||
          e.dataTransfer?.types.includes(BUILDING_TILE_GROUP_DRAG_TYPE),
      );

    const handleDragOver = (e: DragEvent) => {
      if (!isTileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
      if (useBuildingStore.getState().editMode !== 'tile') {
        useBuildingStore.getState().setEditMode('tile');
      }
      updateMousePosition(e);
    };

    const handleDrop = (e: DragEvent) => {
      const presetId = e.dataTransfer?.getData(BUILDING_TILE_PRESET_DRAG_TYPE);
      const groupId = e.dataTransfer?.getData(BUILDING_TILE_GROUP_DRAG_TYPE);
      if (!presetId && !groupId) return;
      e.preventDefault();
      const store = useBuildingStore.getState();
      if (store.editMode !== 'tile') store.setEditMode('tile');
      if (presetId) {
        store.applyTilePreset(presetId);
      } else if (groupId && store.tileGroups.has(groupId)) {
        useBuildingStore.setState((state) => {
          state.selectedTileGroupId = groupId;
          state.currentTileMaterialId = null;
        });
      }
      updateMousePosition(e);
      placeTile();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.target !== canvas) return;
      setHoverPosition(null);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragleave', handleDragLeave);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragleave', handleDragLeave);
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
