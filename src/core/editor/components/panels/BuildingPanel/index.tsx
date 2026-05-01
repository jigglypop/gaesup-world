import React, { FC, useMemo } from 'react';

import {
  AssetPreviewCanvas,
  createScopedAssetMeshConfig,
  createScopedBuildingMeshId,
  type AssetRecord,
  useAssetStore,
} from '../../../../assets';
import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../../../building/catalog';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import {
  BUILDING_PLACED_OBJECT_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WALL_PRESETS,
  BUILDING_TILE_PRESETS,
  BUILDING_TILE_OBJECT_OPTIONS,
  BUILDING_TILE_SHAPE_OPTIONS,
  type MeshConfig,
} from '../../../../building/types';
import { useNPCStore } from '../../../../npc/stores/npcStore';
import { FieldColor, FieldRow } from '../../fields';
import type { EditorPanelBaseProps } from '../types';
import {
  createPlacementAssetScopeId,
  createScopedColorMeshConfig,
  isBuildingMaterialAsset,
} from './helpers';
import {
  NPCBrainSection,
  BillboardSettingsSection,
  BlockEditSection,
  EnvironmentSection,
  FireSettingsSection,
  FlagSettingsSection,
  FooterSummarySection,
  NPCAnimationSection,
  NPCMovementSection,
  NPCPerceptionSection,
  NPCTemplateSection,
  ObjectRotationSection,
  PanelActionsSection,
  PlacementSection,
  TreeSettingsSection,
  WallModuleSection,
  type BuildingPanelAction,
} from './sections';
import './styles.css';

export { createPlacementAssetScopeId, createScopedColorMeshConfig } from './helpers';

export type BuildingPanelSlot =
  | 'header'
  | 'beforeInspector'
  | 'afterWallSettings'
  | 'afterTileSettings'
  | 'afterObjectSettings'
  | 'beforeFooter'
  | 'footer';

export type { BuildingPanelAction } from './sections';

export type BuildingPanelProps = EditorPanelBaseProps & {
  slots?: Partial<Record<BuildingPanelSlot, React.ReactNode>>;
  actions?: BuildingPanelAction[];
  disabledSections?: string[];
};

export const BuildingPanel: FC<BuildingPanelProps> = ({
  className = '',
  style,
  children,
  slots = {},
  actions = [],
  disabledSections = [],
}) => {
  const disabledSectionSet = useMemo(() => new Set(disabledSections), [disabledSections]);
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

  const editModes: { type: typeof editMode; label: string; description: string }[] = [
    { type: 'none', label: '없음', description: '건축 편집을 끕니다' },
    { type: 'wall', label: '벽', description: '벽 조각을 배치합니다' },
    { type: 'tile', label: '타일', description: '바닥 타일을 배치합니다' },
    { type: 'block', label: '박스', description: '복셀 박스를 쌓습니다' },
    { type: 'object', label: '오브젝트', description: '타일 위에 장식을 배치합니다' },
    { type: 'npc', label: 'NPC', description: 'NPC를 배치합니다' },
  ];

  const rotations = [
    { value: 0, label: '0도' },
    { value: Math.PI / 2, label: '90도' },
    { value: Math.PI, label: '180도' },
    { value: Math.PI * 1.5, label: '270도' },
  ];
  const wallGroupIdByWallId = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const group of wallGroups.values()) {
      for (const wall of group.walls) {
        lookup.set(wall.id, group.id);
      }
    }
    return lookup;
  }, [wallGroups]);
  const tileGroupIdByTileId = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const group of tileGroups.values()) {
      for (const tile of group.tiles) {
        lookup.set(tile.id, group.id);
      }
    }
    return lookup;
  }, [tileGroups]);
  const selectedWallGroup = selectedWallId
    ? wallGroups.get(wallGroupIdByWallId.get(selectedWallId) ?? '')
    : wallGroups.get(selectedWallGroupId ?? '');
  const selectedTileGroup = selectedTileId
    ? tileGroups.get(tileGroupIdByTileId.get(selectedTileId) ?? '')
    : tileGroups.get(selectedTileGroupId ?? '');
  const selectedTile = selectedTileId
    ? selectedTileGroup?.tiles.find((tile) => tile.id === selectedTileId)
    : undefined;
  const selectedWall = selectedWallId
    ? selectedWallGroup?.walls.find((wall) => wall.id === selectedWallId)
    : undefined;
  const currentEditModeLabel = editModes.find((mode) => mode.type === editMode)?.label ?? editMode;
  const currentCoverLabel = BUILDING_TILE_OBJECT_OPTIONS.find((type) => type.type === selectedTileObjectType)?.labelKo ?? selectedTileObjectType;
  const currentPlacedObjectLabel = BUILDING_PLACED_OBJECT_OPTIONS.find((type) => type.type === selectedPlacedObjectType)?.labelKo ?? selectedPlacedObjectType;
  const currentTileShapeLabel = BUILDING_TILE_SHAPE_OPTIONS.find((shape) => shape.type === currentTileShape)?.labelKo ?? currentTileShape;
  const currentWallKindLabel = BUILDING_WALL_KIND_OPTIONS.find((kind) => kind.type === (selectedWall?.wallKind ?? currentWallKind))?.labelKo ?? currentWallKind;
  const selectedModelObject = getDefaultBuildingObject(selectedModelObjectId) ?? DEFAULT_BUILDING_OBJECT_CATALOG[0];
  const selectedNPCInstance = selectedNPCInstanceId ? npcInstances.get(selectedNPCInstanceId) : undefined;
  const selectedNPCBrainBlueprint = selectedNPCInstance?.brain?.blueprintId
    ? npcBrainBlueprints.get(selectedNPCInstance.brain.blueprintId)
    : undefined;
  const isWallMode = editMode === 'wall';
  const isTileMode = editMode === 'tile';
  const isBlockMode = editMode === 'block';
  const isObjectMode = editMode === 'object';
  const isNPCMode = editMode === 'npc';

  React.useEffect(() => {
    initializeNPCDefaults();
  }, [initializeNPCDefaults]);

  const handleDeleteSelectedWall = () => {
    if (!selectedWallId || !selectedWallGroup) return;
    removeWall(selectedWallGroup.id, selectedWallId);
  };

  const handleFlipSelectedWall = () => {
    if (!selectedWallId || !selectedWallGroup) return;
    updateWall(selectedWallGroup.id, selectedWallId, { flipSides: !selectedWall?.flipSides });
  };

  const handleDeleteSelectedTile = () => {
    if (!selectedTileId || !selectedTileGroup) return;
    removeTile(selectedTileGroup.id, selectedTileId);
  };

  const handleDeleteSelectedBlock = () => {
    if (!selectedBlockId) return;
    removeBlock(selectedBlockId);
  };

  const upsertScopedMesh = (
    sourceMeshId: string | undefined,
    scopeId: string,
    surface: string,
    asset: AssetRecord,
  ): string => {
    const nextMeshId = createScopedBuildingMeshId(scopeId, surface, asset.id);
    const base = sourceMeshId ? meshes.get(sourceMeshId) : undefined;
    const nextMesh: MeshConfig = createScopedAssetMeshConfig(nextMeshId, asset, base);
    if (meshes.has(nextMeshId)) {
      updateMesh(nextMeshId, nextMesh);
    } else {
      addMesh(nextMesh);
    }
    return nextMeshId;
  };

  const applyAssetToWall = (asset: AssetRecord) => {
    if (!selectedWallGroup) return;
    const selectedWall = selectedWallId
      ? selectedWallGroup.walls.find((wall) => wall.id === selectedWallId)
      : undefined;
    const sourceMeshId = selectedWall?.materialId ?? selectedWallGroup.frontMeshId;
    if (selectedWallId) {
      const wallScopedMeshId = upsertScopedMesh(sourceMeshId, selectedWallId, 'wall', asset);
      updateWall(selectedWallGroup.id, selectedWallId, { materialId: wallScopedMeshId });
      return;
    }

    const placementMeshId = upsertScopedMesh(
      selectedWallGroup.frontMeshId,
      createPlacementAssetScopeId('placement-wall'),
      'wall',
      asset,
    );
    setCurrentWallMaterialId(placementMeshId);
  };

  const applyAssetToTile = (asset: AssetRecord) => {
    if (!selectedTileGroup) return;
    if (selectedTileId) {
      const tileScopedMeshId = upsertScopedMesh(selectedTile?.materialId ?? selectedTileGroup.floorMeshId, selectedTileId, 'tile', asset);
      updateTile(selectedTileGroup.id, selectedTileId, { materialId: tileScopedMeshId });
      return;
    }
    const placementMeshId = upsertScopedMesh(
      selectedTileGroup.floorMeshId,
      createPlacementAssetScopeId('placement-tile'),
      'tile',
      asset,
    );
    setCurrentTileMaterialId(placementMeshId);
  };

  const applyColorToTile = (color: string) => {
    if (!selectedTileGroup) return;
    if (selectedTileId) {
      const sourceMeshId = selectedTile?.materialId ?? selectedTileGroup.floorMeshId;
      const meshId = createScopedBuildingMeshId(selectedTileId, 'tile-color', color);
      const mesh = createScopedColorMeshConfig(meshId, color, meshes.get(sourceMeshId));
      if (meshes.has(meshId)) updateMesh(meshId, mesh);
      else addMesh(mesh);
      updateTile(selectedTileGroup.id, selectedTileId, { materialId: meshId });
      return;
    }

    const sourceMeshId = currentTileMaterialId ?? selectedTileGroup.floorMeshId;
    const meshId = createScopedBuildingMeshId(createPlacementAssetScopeId('placement-tile-color'), 'tile', color);
    const mesh = createScopedColorMeshConfig(meshId, color, meshes.get(sourceMeshId));
    addMesh(mesh);
    setCurrentTileMaterialId(meshId);
  };

  const applyTerrainColors = (color: string, accentColor: string = currentTerrainAccentColor) => {
    setTerrainColors(color, accentColor);
    if (!selectedTileId || !selectedTileGroup) return;
    const tile = selectedTileGroup.tiles.find((entry) => entry.id === selectedTileId);
    if (!tile || !tile.objectType || tile.objectType === 'none' || tile.objectType === 'water') return;
    updateTile(selectedTileGroup.id, selectedTileId, {
      objectConfig: {
        ...(tile.objectConfig ?? {}),
        terrainColor: color,
        terrainAccentColor: accentColor,
      },
    });
  };

  return (
    <div className={`building-panel ${className}`} style={style}>
      <div className="building-panel__header">
        <div>
          <div className="building-panel__eyebrow">Mode</div>
          <div className="building-panel__title">{currentEditModeLabel} 인스펙터</div>
        </div>
        <div className="building-panel__mode-tabs">
          {editModes.map((m) => (
            <button
              key={m.type}
              className={`building-panel__mode-tab ${editMode === m.type ? 'building-panel__mode-tab--active' : ''}`}
              onClick={() => setEditMode(m.type)}
              title={m.description}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {slots.header}

      <div className="building-panel__inspector">
      {slots.beforeInspector}
      <PanelActionsSection actions={actions} />
      {isWallMode && !disabledSectionSet.has('wallPresets') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">벽 프리셋</div>
          <div className="building-panel__grid">
            {BUILDING_WALL_PRESETS.map((preset) => {
              const groupId = `${preset.id}-walls`;
              return (
                <button
                  key={preset.id}
                  className={`building-panel__grid-btn ${selectedWallGroupId === groupId ? 'building-panel__grid-btn--active' : ''}`}
                  onClick={() => applyWallPreset(preset.id)}
                  title={preset.labelEn}
                >
                  {preset.labelKo}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isWallMode && !disabledSectionSet.has('wallModules') && (
        <WallModuleSection
          currentWallKind={selectedWall?.wallKind ?? currentWallKind}
          currentWallKindLabel={currentWallKindLabel}
          setWallKind={setWallKind}
          currentWallRotation={currentWallRotation}
          setWallRotation={setWallRotation}
          rotations={rotations}
          selectedWallId={selectedWallId}
          hasSelectedWallGroup={Boolean(selectedWallGroup)}
          onFlipSelectedWall={handleFlipSelectedWall}
          onDeleteSelectedWall={handleDeleteSelectedWall}
        />
      )}
      {isWallMode && slots.afterWallSettings}

      {(isWallMode || isTileMode) && !disabledSectionSet.has('assetMaterials') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">에셋 재질</div>
          <div className="building-panel__asset-targets">
            {isWallMode && <span>벽: {selectedWallGroup?.name ?? '선택 없음'}</span>}
            {isTileMode && <span>타일: {selectedTileId ? `선택 타일 ${selectedTileId}` : '다음 생성 타일'}</span>}
            {isTileMode && <span>현재 생성 재질: {currentTileMaterialId ?? selectedTileGroup?.floorMeshId ?? '기본값'}</span>}
          </div>
          <div className="building-panel__asset-list">
            {buildingAssets.map((asset) => (
              <div key={asset.id} className="building-panel__asset-card">
                <AssetPreviewCanvas asset={asset} size={54} />
                <div className="building-panel__asset-info">
                  <strong>{asset.name}</strong>
                  <span>{asset.kind}</span>
                </div>
                <div className="building-panel__asset-actions">
                  {isWallMode && (
                    <button
                      className="building-panel__asset-action"
                      disabled={!selectedWallGroup}
                      onClick={() => applyAssetToWall(asset)}
                    >
                      벽
                    </button>
                  )}
                  {isTileMode && (
                    <button
                      className="building-panel__asset-action"
                      disabled={!selectedTileGroup}
                      onClick={() => applyAssetToTile(asset)}
                    >
                      타일
                    </button>
                  )}
                </div>
              </div>
            ))}
            {buildingAssets.length === 0 && (
              <div className="building-panel__empty">사용 가능한 빌딩 에셋이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {isTileMode && !disabledSectionSet.has('tilePresets') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">타일 프리셋</div>
          <div className="building-panel__grid">
            {BUILDING_TILE_PRESETS.map((preset) => {
              const groupId = `${preset.id}-floor`;
              return (
                <button
                  key={preset.id}
                  className={`building-panel__grid-btn ${selectedTileGroupId === groupId ? 'building-panel__grid-btn--active' : ''}`}
                  onClick={() => applyTilePreset(preset.id)}
                  title={preset.labelEn}
                >
                  {preset.labelKo}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isTileMode && !disabledSectionSet.has('customTile') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">커스텀 타일 맵</div>
          <div className="building-panel__info">
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">이름</span>
              <input
                type="text"
                value={currentCustomTileName}
                onChange={(event) => setCustomTileDraft({ name: event.target.value })}
                className="building-panel__text-input"
              />
            </label>
            <FieldRow label="기본색">
              <FieldColor
                value={currentCustomTileColor}
                onChange={(color) => setCustomTileDraft({ color })}
              />
            </FieldRow>
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">텍스처 URL</span>
              <input
                type="text"
                value={currentCustomTileTextureUrl}
                onChange={(event) => setCustomTileDraft({ textureUrl: event.target.value })}
                placeholder="textures/floor.png"
                className="building-panel__text-input"
              />
            </label>
            <button className="building-panel__asset-action" onClick={applyCustomTile}>
              별도 타일 맵 생성/선택
            </button>
          </div>
        </div>
      )}

      {isTileMode && !disabledSectionSet.has('terrainCover') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">지형 덮개</div>
          <div className="building-panel__grid">
            {BUILDING_TILE_OBJECT_OPTIONS.map((t) => (
              <button
                key={t.type}
                className={`building-panel__grid-btn ${selectedTileObjectType === t.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setSelectedTileObjectType(t.type)}
              >
                {t.labelKo}
              </button>
            ))}
          </div>
          <div className="building-panel__terrain-colors">
            <label>
              <span>기본색</span>
              <input
                type="color"
                value={currentTerrainColor}
                onChange={(event) => applyTerrainColors(event.target.value)}
              />
            </label>
            <label>
              <span>강조색</span>
              <input
                type="color"
                value={currentTerrainAccentColor}
                onChange={(event) => applyTerrainColors(currentTerrainColor, event.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {isObjectMode && !disabledSectionSet.has('objectPresets') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">배치 오브젝트</div>
          <div className="building-panel__grid">
            {BUILDING_PLACED_OBJECT_OPTIONS.map((t) => (
              <button
                key={t.type}
                className={`building-panel__grid-btn ${selectedPlacedObjectType === t.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => {
                  setSelectedPlacedObjectType(t.type);
                  if (t.type === 'model' && selectedModelObject) {
                    setModelScale(selectedModelObject.defaultScale);
                    setModelColor(selectedModelObject.defaultColor);
                    setModelUrl(selectedModelObject.modelUrl ?? '');
                  }
                }}
              >
                {t.labelKo}
              </button>
            ))}
          </div>
        </div>
      )}

      {isObjectMode && selectedPlacedObjectType === 'model' && !disabledSectionSet.has('modelSettings') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">기본 기물 GLB</div>
          <div className="building-panel__grid">
            {DEFAULT_BUILDING_OBJECT_CATALOG.map((item) => (
              <button
                key={item.id}
                className={`building-panel__grid-btn ${selectedModelObjectId === item.id ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => {
                  setSelectedModelObjectId(item.id);
                  setModelScale(item.defaultScale);
                  setModelColor(item.defaultColor);
                  setModelUrl(item.modelUrl ?? '');
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="building-panel__info">
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">GLB URL</span>
              <input
                type="text"
                value={currentModelUrl}
                onChange={(event) => setModelUrl(event.target.value)}
                placeholder="gltf/props/door.glb"
                className="building-panel__text-input"
              />
            </label>
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">스케일</span>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={currentModelScale}
                onChange={(event) => setModelScale(Number(event.target.value) || 1)}
                className="building-panel__number-input"
              />
            </label>
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">색상</span>
              <input
                type="color"
                value={currentModelColor}
                onChange={(event) => setModelColor(event.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentModelColor}</span>
            </label>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Fallback</span>
              <span className="building-panel__info-value">{selectedModelObject?.fallbackKind ?? 'generic'}</span>
            </div>
          </div>
        </div>
      )}

      {(isTileMode || isBlockMode) && !disabledSectionSet.has('placement') && (
        <PlacementSection
          isTileMode={isTileMode}
          currentTileMultiplier={currentTileMultiplier}
          setTileMultiplier={setTileMultiplier}
          currentTileHeight={currentTileHeight}
          setTileHeight={setTileHeight}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          currentTileShape={currentTileShape}
          setTileShape={setTileShape}
          currentTileRotation={currentTileRotation}
          setTileRotation={setTileRotation}
          rotations={rotations}
          selectedTileId={selectedTileId}
          hasSelectedTileGroup={Boolean(selectedTileGroup)}
          onDeleteSelectedTile={handleDeleteSelectedTile}
        />
      )}

      {isBlockMode && (
        <BlockEditSection
          currentTileMultiplier={currentTileMultiplier}
          currentTileHeight={currentTileHeight}
          selectedBlockId={selectedBlockId}
          onDeleteSelectedBlock={handleDeleteSelectedBlock}
        />
      )}

      {isTileMode && slots.afterTileSettings}

      {isTileMode && selectedTileGroupId && !disabledSectionSet.has('tileColor') && (() => {
        const tileGroup = tileGroups.get(selectedTileGroupId);
        const tileMeshId = selectedTile?.materialId ?? currentTileMaterialId ?? tileGroup?.floorMeshId;
        const tileMesh = tileMeshId ? meshes.get(tileMeshId) : undefined;
        return tileMesh ? (
          <div className="building-panel__section">
            <div className="building-panel__section-title">타일 색상</div>
            <div className="building-panel__info">
              <div className="building-panel__info-item">
                <span className="building-panel__info-label">색상</span>
                <input
                  type="color"
                  value={tileMesh.color || '#888888'}
                  onChange={(e) => applyColorToTile(e.target.value)}
                  style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{tileMesh.color || '#888888'}</span>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      <EnvironmentSection
        showSnow={showSnow}
        setShowSnow={setShowSnow}
        showFog={showFog}
        setShowFog={setShowFog}
        fogColor={fogColor}
        setFogColor={setFogColor}
        weatherEffect={weatherEffect}
        setWeatherEffect={setWeatherEffect}
      />

      {isNPCMode && (
        <NPCTemplateSection
          templates={npcTemplatesArray}
          selectedTemplateId={selectedNPCTemplateId}
          setSelectedTemplate={setSelectedNPCTemplate}
        />
      )}

      {isNPCMode && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">NPC 행동 / 이동 / 애니메이션</div>
          <div className="building-panel__asset-targets">
            <span>선택 NPC: {selectedNPCInstance?.name ?? selectedNPCInstanceId ?? '선택 없음'}</span>
            <span>행동: {selectedNPCInstance?.behavior?.mode ?? 'idle'} · 이동: {selectedNPCInstance?.navigation?.state ?? '없음'}</span>
            <span>현재 애니메이션: {selectedNPCInstance?.currentAnimation ?? 'idle'}</span>
          </div>

          <div className="building-panel__grid">
            {npcInstancesArray.map((instance) => (
              <button
                key={instance.id}
                className={`building-panel__grid-btn ${selectedNPCInstanceId === instance.id ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setSelectedNPCInstance(instance.id)}
              >
                {instance.name}
              </button>
            ))}
            {npcInstancesArray.length === 0 && (
              <div className="building-panel__empty">배치된 NPC가 없습니다.</div>
            )}
          </div>

          {selectedNPCInstance && (
            <>
              <NPCMovementSection
                instance={selectedNPCInstance}
                hoverPosition={hoverPosition}
                updateBehavior={updateNPCBehavior}
                setNavigation={setNPCNavigation}
                clearNavigation={clearNPCNavigation}
              />

              <NPCAnimationSection
                instance={selectedNPCInstance}
                animations={npcAnimationsArray}
                updateInstance={updateNPCInstance}
                updateBehavior={updateNPCBehavior}
              />

              <NPCBrainSection
                instance={selectedNPCInstance}
                blueprints={npcBrainBlueprintsArray}
                selectedBlueprint={selectedNPCBrainBlueprint}
                updateBrain={updateNPCBrain}
                addBrainBlueprint={addNPCBrainBlueprint}
                updateBrainBlueprint={updateNPCBrainBlueprint}
              />

              <NPCPerceptionSection
                instance={selectedNPCInstance}
                updateBrain={updateNPCBrain}
                updatePerception={updateNPCPerception}
              />
            </>
          )}
        </div>
      )}

      {isObjectMode && selectedPlacedObjectType !== 'none' && !disabledSectionSet.has('objectRotation') && (
        <ObjectRotationSection
          currentObjectRotation={currentObjectRotation}
          setObjectRotation={setObjectRotation}
        />
      )}

      {isObjectMode && (selectedPlacedObjectType === 'tree' || selectedPlacedObjectType === 'sakura') && !disabledSectionSet.has('treeSettings') && (
        <TreeSettingsSection
          currentTreeKind={currentTreeKind}
          setTreeKind={setTreeKind}
          currentObjectPrimaryColor={currentObjectPrimaryColor}
          setObjectPrimaryColor={setObjectPrimaryColor}
          currentObjectSecondaryColor={currentObjectSecondaryColor}
          setObjectSecondaryColor={setObjectSecondaryColor}
        />
      )}

      {isObjectMode && selectedPlacedObjectType === 'fire' && !disabledSectionSet.has('fireSettings') && (
        <FireSettingsSection
          currentFireIntensity={currentFireIntensity}
          setFireIntensity={setFireIntensity}
          currentFireWidth={currentFireWidth}
          setFireWidth={setFireWidth}
          currentFireHeight={currentFireHeight}
          setFireHeight={setFireHeight}
          currentFireColor={currentFireColor}
          setFireColor={setFireColor}
        />
      )}

      {isObjectMode && selectedPlacedObjectType === 'billboard' && !disabledSectionSet.has('billboardSettings') && (
        <BillboardSettingsSection
          currentBillboardScale={currentBillboardScale}
          setBillboardScale={setBillboardScale}
          currentBillboardOffsetY={currentBillboardOffsetY}
          setBillboardOffsetY={setBillboardOffsetY}
          currentBillboardWidth={currentBillboardWidth}
          setBillboardWidth={setBillboardWidth}
          currentBillboardHeight={currentBillboardHeight}
          setBillboardHeight={setBillboardHeight}
          currentBillboardElevation={currentBillboardElevation}
          setBillboardElevation={setBillboardElevation}
          currentBillboardIntensity={currentBillboardIntensity}
          setBillboardIntensity={setBillboardIntensity}
          currentBillboardText={currentBillboardText}
          setBillboardText={setBillboardText}
          currentBillboardImageUrl={currentBillboardImageUrl}
          setBillboardImageUrl={setBillboardImageUrl}
          currentBillboardColor={currentBillboardColor}
          setBillboardColor={setBillboardColor}
        />
      )}

      {isObjectMode && selectedPlacedObjectType === 'flag' && !disabledSectionSet.has('flagSettings') && (
        <FlagSettingsSection
          currentFlagStyle={currentFlagStyle}
          setFlagStyle={setFlagStyle}
          currentFlagWidth={currentFlagWidth}
          setFlagWidth={setFlagWidth}
          currentFlagHeight={currentFlagHeight}
          setFlagHeight={setFlagHeight}
          currentFlagImageUrl={currentFlagImageUrl}
          setFlagImageUrl={setFlagImageUrl}
        />
      )}
      {isObjectMode && slots.afterObjectSettings}
      {children}
      </div>

      {slots.beforeFooter}
      <FooterSummarySection
        currentEditModeLabel={currentEditModeLabel}
        currentCoverLabel={currentCoverLabel}
        currentPlacedObjectLabel={currentPlacedObjectLabel}
        currentTileHeight={currentTileHeight}
        currentTileShapeLabel={currentTileShapeLabel}
        footer={slots.footer}
      />
    </div>
  );
};
