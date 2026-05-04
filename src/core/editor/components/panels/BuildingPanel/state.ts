import { useMemo } from 'react';

import { isBuildingMaterialAsset } from './helpers';
import type { AssetRecord } from '../../../../assets';
import { useAssetStore } from '../../../../assets';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import { useNPCStore } from '../../../../npc/stores/npcStore';

export function useBuildingPanelState() {
  const editMode = useBuildingStore((state) => state.editMode);
  const setEditMode = useBuildingStore((state) => state.setEditMode);
  const selectedWallId = useBuildingStore((state) => state.selectedWallId);
  const selectedTileId = useBuildingStore((state) => state.selectedTileId);
  const selectedBlockId = useBuildingStore((state) => state.selectedBlockId);
  const selectedWallGroupId = useBuildingStore((state) => state.selectedWallGroupId);
  const hoverPosition = useBuildingStore((state) => state.hoverPosition);
  const currentTileMultiplier = useBuildingStore((state) => state.currentTileMultiplier);
  const setTileMultiplier = useBuildingStore((state) => state.setTileMultiplier);
  const currentTileHeight = useBuildingStore((state) => state.currentTileHeight);
  const setTileHeight = useBuildingStore((state) => state.setTileHeight);
  const currentTileShape = useBuildingStore((state) => state.currentTileShape);
  const setTileShape = useBuildingStore((state) => state.setTileShape);
  const currentTileRotation = useBuildingStore((state) => state.currentTileRotation);
  const setTileRotation = useBuildingStore((state) => state.setTileRotation);
  const currentTileMaterialId = useBuildingStore((state) => state.currentTileMaterialId);
  const setCurrentTileMaterialId = useBuildingStore((state) => state.setCurrentTileMaterialId);
  const currentCustomTileName = useBuildingStore((state) => state.currentCustomTileName);
  const currentCustomTileColor = useBuildingStore((state) => state.currentCustomTileColor);
  const currentCustomTileTextureUrl = useBuildingStore((state) => state.currentCustomTileTextureUrl);
  const setCustomTileDraft = useBuildingStore((state) => state.setCustomTileDraft);
  const applyTilePreset = useBuildingStore((state) => state.applyTilePreset);
  const applyCustomTile = useBuildingStore((state) => state.applyCustomTile);
  const currentWallRotation = useBuildingStore((state) => state.currentWallRotation);
  const setWallRotation = useBuildingStore((state) => state.setWallRotation);
  const currentWallKind = useBuildingStore((state) => state.currentWallKind);
  const setWallKind = useBuildingStore((state) => state.setWallKind);
  const applyWallPreset = useBuildingStore((state) => state.applyWallPreset);
  const selectedTileObjectType = useBuildingStore((state) => state.selectedTileObjectType);
  const setSelectedTileObjectType = useBuildingStore((state) => state.setSelectedTileObjectType);
  const currentTerrainColor = useBuildingStore((state) => state.currentTerrainColor);
  const currentTerrainAccentColor = useBuildingStore((state) => state.currentTerrainAccentColor);
  const setTerrainColors = useBuildingStore((state) => state.setTerrainColors);
  const selectedPlacedObjectType = useBuildingStore((state) => state.selectedPlacedObjectType);
  const setSelectedPlacedObjectType = useBuildingStore((state) => state.setSelectedPlacedObjectType);
  const selectedModelObjectId = useBuildingStore((state) => state.selectedModelObjectId);
  const setSelectedModelObjectId = useBuildingStore((state) => state.setSelectedModelObjectId);
  const currentModelUrl = useBuildingStore((state) => state.currentModelUrl);
  const setModelUrl = useBuildingStore((state) => state.setModelUrl);
  const currentModelScale = useBuildingStore((state) => state.currentModelScale);
  const setModelScale = useBuildingStore((state) => state.setModelScale);
  const currentModelColor = useBuildingStore((state) => state.currentModelColor);
  const setModelColor = useBuildingStore((state) => state.setModelColor);
  const snapToGrid = useBuildingStore((state) => state.snapToGrid);
  const setSnapToGrid = useBuildingStore((state) => state.setSnapToGrid);
  const currentFlagWidth = useBuildingStore((state) => state.currentFlagWidth);
  const currentFlagHeight = useBuildingStore((state) => state.currentFlagHeight);
  const currentFlagImageUrl = useBuildingStore((state) => state.currentFlagImageUrl);
  const setFlagWidth = useBuildingStore((state) => state.setFlagWidth);
  const setFlagHeight = useBuildingStore((state) => state.setFlagHeight);
  const setFlagImageUrl = useBuildingStore((state) => state.setFlagImageUrl);
  const currentFlagStyle = useBuildingStore((state) => state.currentFlagStyle);
  const setFlagStyle = useBuildingStore((state) => state.setFlagStyle);
  const currentFireIntensity = useBuildingStore((state) => state.currentFireIntensity);
  const currentFireWidth = useBuildingStore((state) => state.currentFireWidth);
  const currentFireHeight = useBuildingStore((state) => state.currentFireHeight);
  const currentFireColor = useBuildingStore((state) => state.currentFireColor);
  const setFireIntensity = useBuildingStore((state) => state.setFireIntensity);
  const setFireWidth = useBuildingStore((state) => state.setFireWidth);
  const setFireHeight = useBuildingStore((state) => state.setFireHeight);
  const setFireColor = useBuildingStore((state) => state.setFireColor);
  const currentObjectRotation = useBuildingStore((state) => state.currentObjectRotation);
  const setObjectRotation = useBuildingStore((state) => state.setObjectRotation);
  const selectedTileGroupId = useBuildingStore((state) => state.selectedTileGroupId);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const meshes = useBuildingStore((state) => state.meshes);
  const addMesh = useBuildingStore((state) => state.addMesh);
  const updateMesh = useBuildingStore((state) => state.updateMesh);
  const updateWall = useBuildingStore((state) => state.updateWall);
  const updateTile = useBuildingStore((state) => state.updateTile);
  const setCurrentWallMaterialId = useBuildingStore((state) => state.setCurrentWallMaterialId);
  const removeWall = useBuildingStore((state) => state.removeWall);
  const removeTile = useBuildingStore((state) => state.removeTile);
  const removeBlock = useBuildingStore((state) => state.removeBlock);
  const currentBillboardText = useBuildingStore((state) => state.currentBillboardText);
  const currentBillboardImageUrl = useBuildingStore((state) => state.currentBillboardImageUrl);
  const currentBillboardColor = useBuildingStore((state) => state.currentBillboardColor);
  const currentBillboardWidth = useBuildingStore((state) => state.currentBillboardWidth);
  const currentBillboardHeight = useBuildingStore((state) => state.currentBillboardHeight);
  const currentBillboardScale = useBuildingStore((state) => state.currentBillboardScale);
  const currentBillboardOffsetY = useBuildingStore((state) => state.currentBillboardOffsetY);
  const currentBillboardElevation = useBuildingStore((state) => state.currentBillboardElevation);
  const currentBillboardIntensity = useBuildingStore((state) => state.currentBillboardIntensity);
  const setBillboardText = useBuildingStore((state) => state.setBillboardText);
  const setBillboardImageUrl = useBuildingStore((state) => state.setBillboardImageUrl);
  const setBillboardColor = useBuildingStore((state) => state.setBillboardColor);
  const setBillboardWidth = useBuildingStore((state) => state.setBillboardWidth);
  const setBillboardHeight = useBuildingStore((state) => state.setBillboardHeight);
  const setBillboardScale = useBuildingStore((state) => state.setBillboardScale);
  const setBillboardOffsetY = useBuildingStore((state) => state.setBillboardOffsetY);
  const setBillboardElevation = useBuildingStore((state) => state.setBillboardElevation);
  const setBillboardIntensity = useBuildingStore((state) => state.setBillboardIntensity);
  const currentObjectPrimaryColor = useBuildingStore((state) => state.currentObjectPrimaryColor);
  const currentObjectSecondaryColor = useBuildingStore((state) => state.currentObjectSecondaryColor);
  const currentTreeKind = useBuildingStore((state) => state.currentTreeKind);
  const setObjectPrimaryColor = useBuildingStore((state) => state.setObjectPrimaryColor);
  const setObjectSecondaryColor = useBuildingStore((state) => state.setObjectSecondaryColor);
  const setTreeKind = useBuildingStore((state) => state.setTreeKind);
  const showSnow = useBuildingStore((state) => state.showSnow);
  const setShowSnow = useBuildingStore((state) => state.setShowSnow);
  const showFog = useBuildingStore((state) => state.showFog);
  const setShowFog = useBuildingStore((state) => state.setShowFog);
  const fogColor = useBuildingStore((state) => state.fogColor);
  const setFogColor = useBuildingStore((state) => state.setFogColor);
  const weatherEffect = useBuildingStore((state) => state.weatherEffect);
  const setWeatherEffect = useBuildingStore((state) => state.setWeatherEffect);

  const npcTemplates = useNPCStore((state) => state.templates);
  const npcInstances = useNPCStore((state) => state.instances);
  const npcAnimations = useNPCStore((state) => state.animations);
  const npcBrainBlueprints = useNPCStore((state) => state.brainBlueprints);
  const selectedNPCTemplateId = useNPCStore((state) => state.selectedTemplateId);
  const selectedNPCInstanceId = useNPCStore((state) => state.selectedInstanceId);
  const setSelectedNPCTemplate = useNPCStore((state) => state.setSelectedTemplate);
  const setSelectedNPCInstance = useNPCStore((state) => state.setSelectedInstance);
  const updateNPCInstance = useNPCStore((state) => state.updateInstance);
  const setNPCNavigation = useNPCStore((state) => state.setNavigation);
  const clearNPCNavigation = useNPCStore((state) => state.clearNavigation);
  const updateNPCBehavior = useNPCStore((state) => state.updateInstanceBehavior);
  const updateNPCBrain = useNPCStore((state) => state.updateInstanceBrain);
  const updateNPCPerception = useNPCStore((state) => state.updateInstancePerception);
  const addNPCBrainBlueprint = useNPCStore((state) => state.addBrainBlueprint);
  const updateNPCBrainBlueprint = useNPCStore((state) => state.updateBrainBlueprint);
  const initializeNPCDefaults = useNPCStore((state) => state.initializeDefaults);

  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const buildingAssets = useMemo(
    () => assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter(isBuildingMaterialAsset),
    [assetIds, assetRecords],
  );
  const npcTemplatesArray = useMemo(() => Array.from(npcTemplates.values()), [npcTemplates]);
  const npcInstancesArray = useMemo(() => Array.from(npcInstances.values()), [npcInstances]);
  const npcAnimationsArray = useMemo(() => Array.from(npcAnimations.values()), [npcAnimations]);
  const npcBrainBlueprintsArray = useMemo(() => Array.from(npcBrainBlueprints.values()), [npcBrainBlueprints]);

  return {
    editMode,
    setEditMode,
    selectedWallId,
    selectedTileId,
    selectedBlockId,
    selectedWallGroupId,
    hoverPosition,
    currentTileMultiplier,
    setTileMultiplier,
    currentTileHeight,
    setTileHeight,
    currentTileShape,
    setTileShape,
    currentTileRotation,
    setTileRotation,
    currentTileMaterialId,
    setCurrentTileMaterialId,
    currentCustomTileName,
    currentCustomTileColor,
    currentCustomTileTextureUrl,
    setCustomTileDraft,
    applyTilePreset,
    applyCustomTile,
    currentWallRotation,
    setWallRotation,
    currentWallKind,
    setWallKind,
    applyWallPreset,
    selectedTileObjectType,
    setSelectedTileObjectType,
    currentTerrainColor,
    currentTerrainAccentColor,
    setTerrainColors,
    selectedPlacedObjectType,
    setSelectedPlacedObjectType,
    selectedModelObjectId,
    setSelectedModelObjectId,
    currentModelUrl,
    setModelUrl,
    currentModelScale,
    setModelScale,
    currentModelColor,
    setModelColor,
    snapToGrid,
    setSnapToGrid,
    currentFlagWidth,
    currentFlagHeight,
    currentFlagImageUrl,
    setFlagWidth,
    setFlagHeight,
    setFlagImageUrl,
    currentFlagStyle,
    setFlagStyle,
    currentFireIntensity,
    currentFireWidth,
    currentFireHeight,
    currentFireColor,
    setFireIntensity,
    setFireWidth,
    setFireHeight,
    setFireColor,
    currentObjectRotation,
    setObjectRotation,
    selectedTileGroupId,
    tileGroups,
    wallGroups,
    meshes,
    addMesh,
    updateMesh,
    updateWall,
    updateTile,
    setCurrentWallMaterialId,
    removeWall,
    removeTile,
    removeBlock,
    currentBillboardText,
    currentBillboardImageUrl,
    currentBillboardColor,
    currentBillboardWidth,
    currentBillboardHeight,
    currentBillboardScale,
    currentBillboardOffsetY,
    currentBillboardElevation,
    currentBillboardIntensity,
    setBillboardText,
    setBillboardImageUrl,
    setBillboardColor,
    setBillboardWidth,
    setBillboardHeight,
    setBillboardScale,
    setBillboardOffsetY,
    setBillboardElevation,
    setBillboardIntensity,
    currentObjectPrimaryColor,
    currentObjectSecondaryColor,
    currentTreeKind,
    setObjectPrimaryColor,
    setObjectSecondaryColor,
    setTreeKind,
    showSnow,
    setShowSnow,
    showFog,
    setShowFog,
    fogColor,
    setFogColor,
    weatherEffect,
    setWeatherEffect,
    npcInstances,
    npcBrainBlueprints,
    selectedNPCTemplateId,
    selectedNPCInstanceId,
    setSelectedNPCTemplate,
    setSelectedNPCInstance,
    updateNPCInstance,
    setNPCNavigation,
    clearNPCNavigation,
    updateNPCBehavior,
    updateNPCBrain,
    updateNPCPerception,
    addNPCBrainBlueprint,
    updateNPCBrainBlueprint,
    initializeNPCDefaults,
    buildingAssets,
    npcTemplatesArray,
    npcInstancesArray,
    npcAnimationsArray,
    npcBrainBlueprintsArray,
  };
}
