import React, { useMemo, useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import type { BuildingUIProps } from './types';
import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../catalog';
import { useBuildingStore, useBuildingStoreApi } from '../../stores/buildingStore';
import { BUILDING_TILE_OBJECT_OPTIONS, BUILDING_TILE_SHAPE_OPTIONS, type MeshConfig } from '../../types';

/** Store selections, local drafts and handlers the building editor's sections share. */
export function useBuildingUIState(onClose: BuildingUIProps['onClose'], npcPanel: BuildingUIProps['npcPanel'] = false) {
  const buildingStore = useBuildingStoreApi();
  const {
    setEditMode,
    editMode,
    isInEditMode,
    currentTileMultiplier,
    setTileMultiplier,
    currentTileHeight,
    setTileHeight,
    currentTileShape,
    setTileShape,
    currentTileRotation,
    setTileRotation,
    currentWallRotation,
    setWallRotation,
    currentWallKind,
    setWallKind,
    applyWallPreset,
    wallCategories,
    tileCategories,
    selectedWallCategoryId,
    selectedTileCategoryId,
    selectedWallGroupId,
    selectedTileGroupId,
    selectedWallId,
    selectedTileId,
    setCurrentWallMaterialId,
    setCurrentTileMaterialId,
    setSelectedWallCategory,
    setSelectedTileCategory,
    wallGroups,
    tileGroups,
    meshes,
    updateMesh,
    addMesh,
    updateWall,
    moveWallToGroup,
    updateTile,
    addWallGroup,
    addTileGroup,
    selectedTileObjectType,
    setSelectedTileObjectType,
    currentCustomTileName,
    currentCustomTileColor,
    currentCustomTileTextureUrl,
    setCustomTileDraft,
    applyTilePreset,
    applyCustomTile,
    selectedPlacedObjectType,
    setSelectedPlacedObjectType,
    currentObjectRotation,
    setObjectRotation,
    selectedModelObjectId,
    setSelectedModelObjectId,
    currentModelUrl,
    setModelUrl,
    currentModelScale,
    setModelScale,
    currentModelColor,
    setModelColor,
    currentObjectPrimaryColor,
    setObjectPrimaryColor,
    currentObjectSecondaryColor,
    setObjectSecondaryColor,
    currentTreeKind,
    setTreeKind,
    currentFlagWidth,
    setFlagWidth,
    currentFlagHeight,
    setFlagHeight,
    currentFlagImageUrl,
    setFlagImageUrl,
    currentFlagStyle,
    setFlagStyle,
    currentFireIntensity,
    setFireIntensity,
    currentFireWidth,
    setFireWidth,
    currentFireHeight,
    setFireHeight,
    currentFireColor,
    setFireColor,
    currentBillboardText,
    setBillboardText,
    currentBillboardImageUrl,
    setBillboardImageUrl,
    currentBillboardColor,
    setBillboardColor,
    currentBillboardWidth,
    setBillboardWidth,
    currentBillboardHeight,
    setBillboardHeight,
    currentBillboardScale,
    setBillboardScale,
    currentBillboardOffsetY,
    setBillboardOffsetY,
    currentBillboardElevation,
    setBillboardElevation,
    currentBillboardIntensity,
    setBillboardIntensity,
    showSnow,
    setShowSnow,
    showFog,
    setShowFog,
    fogColor,
    setFogColor,
    weatherEffect,
    setWeatherEffect,
    worldSurface,
    setWorldSurface,
  } = useBuildingStore(
    useShallow((state) => ({
      setEditMode: state.setEditMode,
      editMode: state.editMode,
      isInEditMode: state.isInEditMode,
      currentTileMultiplier: state.currentTileMultiplier,
      setTileMultiplier: state.setTileMultiplier,
      currentTileHeight: state.currentTileHeight,
      setTileHeight: state.setTileHeight,
      currentTileShape: state.currentTileShape,
      setTileShape: state.setTileShape,
      currentTileRotation: state.currentTileRotation,
      setTileRotation: state.setTileRotation,
      currentWallRotation: state.currentWallRotation,
      setWallRotation: state.setWallRotation,
      currentWallKind: state.currentWallKind,
      setWallKind: state.setWallKind,
      applyWallPreset: state.applyWallPreset,
      wallCategories: state.wallCategories,
      tileCategories: state.tileCategories,
      selectedWallCategoryId: state.selectedWallCategoryId,
      selectedTileCategoryId: state.selectedTileCategoryId,
      selectedWallGroupId: state.selectedWallGroupId,
      selectedTileGroupId: state.selectedTileGroupId,
      selectedWallId: state.selectedWallId,
      selectedTileId: state.selectedTileId,
      setCurrentWallMaterialId: state.setCurrentWallMaterialId,
      setCurrentTileMaterialId: state.setCurrentTileMaterialId,
      setSelectedWallCategory: state.setSelectedWallCategory,
      setSelectedTileCategory: state.setSelectedTileCategory,
      wallGroups: state.wallGroups,
      tileGroups: state.tileGroups,
      meshes: state.meshes,
      updateMesh: state.updateMesh,
      addMesh: state.addMesh,
      updateWall: state.updateWall,
      moveWallToGroup: state.moveWallToGroup,
      updateTile: state.updateTile,
      addWallGroup: state.addWallGroup,
      addTileGroup: state.addTileGroup,
      selectedTileObjectType: state.selectedTileObjectType,
      setSelectedTileObjectType: state.setSelectedTileObjectType,
      currentCustomTileName: state.currentCustomTileName,
      currentCustomTileColor: state.currentCustomTileColor,
      currentCustomTileTextureUrl: state.currentCustomTileTextureUrl,
      setCustomTileDraft: state.setCustomTileDraft,
      applyTilePreset: state.applyTilePreset,
      applyCustomTile: state.applyCustomTile,
      selectedPlacedObjectType: state.selectedPlacedObjectType,
      setSelectedPlacedObjectType: state.setSelectedPlacedObjectType,
      currentObjectRotation: state.currentObjectRotation,
      setObjectRotation: state.setObjectRotation,
      selectedModelObjectId: state.selectedModelObjectId,
      setSelectedModelObjectId: state.setSelectedModelObjectId,
      currentModelUrl: state.currentModelUrl,
      setModelUrl: state.setModelUrl,
      currentModelScale: state.currentModelScale,
      setModelScale: state.setModelScale,
      currentModelColor: state.currentModelColor,
      setModelColor: state.setModelColor,
      currentObjectPrimaryColor: state.currentObjectPrimaryColor,
      setObjectPrimaryColor: state.setObjectPrimaryColor,
      currentObjectSecondaryColor: state.currentObjectSecondaryColor,
      setObjectSecondaryColor: state.setObjectSecondaryColor,
      currentTreeKind: state.currentTreeKind,
      setTreeKind: state.setTreeKind,
      currentFlagWidth: state.currentFlagWidth,
      setFlagWidth: state.setFlagWidth,
      currentFlagHeight: state.currentFlagHeight,
      setFlagHeight: state.setFlagHeight,
      currentFlagImageUrl: state.currentFlagImageUrl,
      setFlagImageUrl: state.setFlagImageUrl,
      currentFlagStyle: state.currentFlagStyle,
      setFlagStyle: state.setFlagStyle,
      currentFireIntensity: state.currentFireIntensity,
      setFireIntensity: state.setFireIntensity,
      currentFireWidth: state.currentFireWidth,
      setFireWidth: state.setFireWidth,
      currentFireHeight: state.currentFireHeight,
      setFireHeight: state.setFireHeight,
      currentFireColor: state.currentFireColor,
      setFireColor: state.setFireColor,
      currentBillboardText: state.currentBillboardText,
      setBillboardText: state.setBillboardText,
      currentBillboardImageUrl: state.currentBillboardImageUrl,
      setBillboardImageUrl: state.setBillboardImageUrl,
      currentBillboardColor: state.currentBillboardColor,
      setBillboardColor: state.setBillboardColor,
      currentBillboardWidth: state.currentBillboardWidth,
      setBillboardWidth: state.setBillboardWidth,
      currentBillboardHeight: state.currentBillboardHeight,
      setBillboardHeight: state.setBillboardHeight,
      currentBillboardScale: state.currentBillboardScale,
      setBillboardScale: state.setBillboardScale,
      currentBillboardOffsetY: state.currentBillboardOffsetY,
      setBillboardOffsetY: state.setBillboardOffsetY,
      currentBillboardElevation: state.currentBillboardElevation,
      setBillboardElevation: state.setBillboardElevation,
      currentBillboardIntensity: state.currentBillboardIntensity,
      setBillboardIntensity: state.setBillboardIntensity,
      showSnow: state.showSnow,
      setShowSnow: state.setShowSnow,
      showFog: state.showFog,
      setShowFog: state.setShowFog,
      fogColor: state.fogColor,
      setFogColor: state.setFogColor,
      weatherEffect: state.weatherEffect,
      setWeatherEffect: state.setWeatherEffect,
      worldSurface: state.worldSurface,
      setWorldSurface: state.setWorldSurface,
    })),
  );
  const isEditing = isInEditMode();

  const [showCustomSettings, setShowCustomSettings] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customColor, setCustomColor] = React.useState('#808080');
  const [customTexture, setCustomTexture] = React.useState('');

  const tileCategoriesArray = useMemo(() => Array.from(tileCategories.values()), [tileCategories]);
  const wallCategoriesArray = useMemo(() => Array.from(wallCategories.values()), [wallCategories]);
  const hasNPCPanel = npcPanel !== false && npcPanel !== null && npcPanel !== undefined;
  const selectedTileObjectLabel = useMemo(
    () =>
      BUILDING_TILE_OBJECT_OPTIONS.find((option) => option.type === selectedTileObjectType)
        ?.labelKo ?? selectedTileObjectType,
    [selectedTileObjectType],
  );
  const selectedTileShapeLabel = useMemo(
    () =>
      BUILDING_TILE_SHAPE_OPTIONS.find((option) => option.type === currentTileShape)?.labelKo ??
      currentTileShape,
    [currentTileShape],
  );
  const selectedModelObject = useMemo(
    () => getDefaultBuildingObject(selectedModelObjectId) ?? DEFAULT_BUILDING_OBJECT_CATALOG[0],
    [selectedModelObjectId],
  );
  const wallGroupByWallId = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const group of wallGroups.values()) {
      for (const wall of group.walls) {
        lookup.set(wall.id, group.id);
      }
    }
    return lookup;
  }, [wallGroups]);

  const upsertCustomMesh = useCallback(
    (sourceMeshId: string | undefined, nextMeshId: string): string => {
      const base = sourceMeshId ? meshes.get(sourceMeshId) : undefined;
      const { mapTextureUrl, textureUrl, ...baseWithoutTexture } = base ?? {};
      void mapTextureUrl;
      void textureUrl;
      const nextMesh: MeshConfig = {
        ...baseWithoutTexture,
        id: nextMeshId,
        color: customColor,
        material: 'STANDARD',
        ...(customTexture ? { mapTextureUrl: customTexture, textureUrl: customTexture } : {}),
      };

      if (meshes.has(nextMeshId)) {
        updateMesh(nextMeshId, nextMesh);
      } else {
        addMesh(nextMesh);
      }
      return nextMeshId;
    },
    [addMesh, customColor, customTexture, meshes, updateMesh],
  );

  const findWallGroupByWallId = useCallback(
    (wallId: string) => {
      const groupId = wallGroupByWallId.get(wallId);
      return groupId ? wallGroups.get(groupId) : undefined;
    },
    [wallGroupByWallId, wallGroups],
  );
  const selectedWallTypeGroupId = selectedWallId
    ? findWallGroupByWallId(selectedWallId)?.id
    : selectedWallGroupId;
  const selectedWallGroup = selectedWallId
    ? findWallGroupByWallId(selectedWallId)
    : wallGroups.get(selectedWallGroupId ?? '');
  const selectedWall = selectedWallId
    ? selectedWallGroup?.walls.find((wall) => wall.id === selectedWallId)
    : undefined;

  // Callbacks
  const handleEditModeClose = useCallback(() => {
    setEditMode('none');
    onClose?.();
  }, [setEditMode, onClose]);
  const handleToggleCustomSettings = useCallback(() => setShowCustomSettings((prev) => !prev), []);

  React.useEffect(() => {
    if (editMode === 'wall' && selectedWallGroupId) {
      const wallGroup = selectedWallId
        ? findWallGroupByWallId(selectedWallId)
        : wallGroups.get(selectedWallGroupId);
      const selectedWall = selectedWallId
        ? wallGroup?.walls.find((wall) => wall.id === selectedWallId)
        : undefined;
      const meshId = selectedWall?.materialId ?? wallGroup?.frontMeshId;
      if (meshId) {
        const mesh = meshes.get(meshId);
        if (mesh) {
          setCustomColor(mesh.color || '#808080');
          setCustomTexture(mesh.mapTextureUrl || '');
        }
      }
    } else if (editMode === 'tile' && selectedTileGroupId) {
      const tileGroup = tileGroups.get(selectedTileGroupId);
      if (tileGroup && tileGroup.floorMeshId) {
        const mesh = meshes.get(tileGroup.floorMeshId);
        if (mesh) {
          setCustomColor(mesh.color || '#808080');
          setCustomTexture(mesh.mapTextureUrl || '');
        }
      }
    }
  }, [
    editMode,
    selectedWallGroupId,
    selectedTileGroupId,
    selectedWallId,
    findWallGroupByWallId,
    wallGroups,
    tileGroups,
    meshes,
  ]);

  return {
    setEditMode,
    editMode,
    isInEditMode,
    currentTileMultiplier,
    setTileMultiplier,
    currentTileHeight,
    setTileHeight,
    currentTileShape,
    setTileShape,
    currentTileRotation,
    setTileRotation,
    currentWallRotation,
    setWallRotation,
    currentWallKind,
    setWallKind,
    applyWallPreset,
    wallCategories,
    tileCategories,
    selectedWallCategoryId,
    selectedTileCategoryId,
    selectedWallGroupId,
    selectedTileGroupId,
    selectedWallId,
    selectedTileId,
    setCurrentWallMaterialId,
    setCurrentTileMaterialId,
    setSelectedWallCategory,
    setSelectedTileCategory,
    wallGroups,
    tileGroups,
    meshes,
    updateMesh,
    addMesh,
    updateWall,
    moveWallToGroup,
    updateTile,
    addWallGroup,
    addTileGroup,
    selectedTileObjectType,
    setSelectedTileObjectType,
    currentCustomTileName,
    currentCustomTileColor,
    currentCustomTileTextureUrl,
    setCustomTileDraft,
    applyTilePreset,
    applyCustomTile,
    selectedPlacedObjectType,
    setSelectedPlacedObjectType,
    currentObjectRotation,
    setObjectRotation,
    selectedModelObjectId,
    setSelectedModelObjectId,
    currentModelUrl,
    setModelUrl,
    currentModelScale,
    setModelScale,
    currentModelColor,
    setModelColor,
    currentObjectPrimaryColor,
    setObjectPrimaryColor,
    currentObjectSecondaryColor,
    setObjectSecondaryColor,
    currentTreeKind,
    setTreeKind,
    currentFlagWidth,
    setFlagWidth,
    currentFlagHeight,
    setFlagHeight,
    currentFlagImageUrl,
    setFlagImageUrl,
    currentFlagStyle,
    setFlagStyle,
    currentFireIntensity,
    setFireIntensity,
    currentFireWidth,
    setFireWidth,
    currentFireHeight,
    setFireHeight,
    currentFireColor,
    setFireColor,
    currentBillboardText,
    setBillboardText,
    currentBillboardImageUrl,
    setBillboardImageUrl,
    currentBillboardColor,
    setBillboardColor,
    currentBillboardWidth,
    setBillboardWidth,
    currentBillboardHeight,
    setBillboardHeight,
    currentBillboardScale,
    setBillboardScale,
    currentBillboardOffsetY,
    setBillboardOffsetY,
    currentBillboardElevation,
    setBillboardElevation,
    currentBillboardIntensity,
    setBillboardIntensity,
    showSnow,
    setShowSnow,
    showFog,
    setShowFog,
    fogColor,
    setFogColor,
    weatherEffect,
    setWeatherEffect,
    worldSurface,
    setWorldSurface,
    buildingStore,
    isEditing,
    showCustomSettings,
    setShowCustomSettings,
    customName,
    setCustomName,
    customColor,
    setCustomColor,
    customTexture,
    setCustomTexture,
    tileCategoriesArray,
    wallCategoriesArray,
    hasNPCPanel,
    selectedTileObjectLabel,
    selectedTileShapeLabel,
    selectedModelObject,
    wallGroupByWallId,
    upsertCustomMesh,
    findWallGroupByWallId,
    selectedWallTypeGroupId,
    selectedWallGroup,
    selectedWall,
    handleEditModeClose,
    handleToggleCustomSettings,
  };
}

export type BuildingUIState = ReturnType<typeof useBuildingUIState>;
