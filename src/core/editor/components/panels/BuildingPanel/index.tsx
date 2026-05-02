import React, { FC, useMemo } from 'react';

import {
  AssetPreviewCanvas,
  createScopedAssetMeshConfig,
  createScopedBuildingMeshId,
  type AssetRecord,
} from '../../../../assets';
import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../../../building/catalog';
import {
  BUILDING_PLACED_OBJECT_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WALL_PRESETS,
  BUILDING_TILE_PRESETS,
  BUILDING_TILE_OBJECT_OPTIONS,
  type BuildingSystemState,
  type MeshConfig,
} from '../../../../building/types';
import { FieldColor, FieldRow } from '../../fields';
import type { EditorPanelBaseProps } from '../types';
import {
  createPlacementAssetScopeId,
  createScopedColorMeshConfig,
} from './helpers';
import {
  NPCBrainSection,
  BillboardSettingsSection,
  BlockEditSection,
  EnvironmentSection,
  FireSettingsSection,
  FlagSettingsSection,
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
import { useBuildingPanelState } from './state';
import './styles.css';

export { createPlacementAssetScopeId, createScopedColorMeshConfig } from './helpers';

export type BuildingPanelSlot =
  | 'header'
  | 'beforeInspector'
  | 'afterWallSettings'
  | 'afterTileSettings'
  | 'afterObjectSettings';

export type { BuildingPanelAction } from './sections';

export type BuildingPanelProps = EditorPanelBaseProps & {
  slots?: Partial<Record<BuildingPanelSlot, React.ReactNode>>;
  actions?: BuildingPanelAction[];
  disabledSections?: string[];
  forcedEditMode?: BuildingSystemState['editMode'];
};

export const BuildingPanel: FC<BuildingPanelProps> = ({
  className = '',
  style,
  children,
  slots = {},
  actions = [],
  disabledSections = [],
  forcedEditMode,
}) => {
  const disabledSectionSet = useMemo(() => new Set(disabledSections), [disabledSections]);
  const {
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
  } = useBuildingPanelState();

  const editModes: { type: typeof editMode; label: string; description: string }[] = [
    { type: 'none', label: '없음', description: '건축 편집을 끕니다' },
    { type: 'world', label: '전역', description: '전역 설정을 배치합니다' },
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
  const panelEditMode = forcedEditMode ?? editMode;
  const currentEditModeLabel = editModes.find((mode) => mode.type === panelEditMode)?.label ?? panelEditMode;
  const currentWallKindLabel = BUILDING_WALL_KIND_OPTIONS.find((kind) => kind.type === (selectedWall?.wallKind ?? currentWallKind))?.labelKo ?? currentWallKind;
  const selectedModelObject = getDefaultBuildingObject(selectedModelObjectId) ?? DEFAULT_BUILDING_OBJECT_CATALOG[0];
  const selectedNPCInstance = selectedNPCInstanceId ? npcInstances.get(selectedNPCInstanceId) : undefined;
  const selectedNPCBrainBlueprint = selectedNPCInstance?.brain?.blueprintId
    ? npcBrainBlueprints.get(selectedNPCInstance.brain.blueprintId)
    : undefined;
  const isWallMode = panelEditMode === 'wall';
  const isWorld = panelEditMode === 'world';
  const isTileMode = panelEditMode === 'tile';
  const isBlockMode = panelEditMode === 'block';
  const isObjectMode = panelEditMode === 'object';
  const isNPCMode = panelEditMode === 'npc';

  React.useEffect(() => {
    initializeNPCDefaults();
  }, [initializeNPCDefaults]);

  React.useEffect(() => {
    if (!forcedEditMode) return;
    if (editMode === forcedEditMode) return;
    setEditMode(forcedEditMode);
  }, [editMode, forcedEditMode, setEditMode]);

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
        {!forcedEditMode && (
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
        )}
      </div>
      {slots.header}

      <div className="building-panel__inspector">
      {slots.beforeInspector}
      <PanelActionsSection actions={actions} />
      {isWorld && !disabledSectionSet.has('environment') && (
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
      )}
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
    </div>
  );
};
