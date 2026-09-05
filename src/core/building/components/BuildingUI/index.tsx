import React, { useMemo, useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../catalog';
import { createBuildingScopeId } from '../../id';
import { useBuildingStore } from '../../stores/buildingStore';
import {
  BUILDING_BASIC_OBJECT_OPTIONS,
  BUILDING_FLAG_STYLE_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WALL_PRESETS,
  BUILDING_TILE_PRESETS,
  BUILDING_TREE_OPTIONS,
  BUILDING_TILE_OBJECT_OPTIONS,
  BUILDING_TILE_SHAPE_OPTIONS,
  BUILDING_WEATHER_EFFECT_OPTIONS,
  BUILDING_WORLD_SURFACE_OPTIONS,
  type MeshConfig,
} from '../../types';
import './styles.css';

export type BuildingUINPCPanelContext = {
  editMode: 'npc';
};

export type BuildingUINPCPanelRenderer =
  | React.ReactNode
  | ((context: BuildingUINPCPanelContext) => React.ReactNode);

export type BuildingUIProps = {
  onClose?: () => void;
  canEdit?: boolean;
  npcPanel?: BuildingUINPCPanelRenderer | false;
  extensionPanel?: React.ReactNode;
};

export const createCustomMeshId = createBuildingScopeId;

export function BuildingUI({
  onClose,
  canEdit = true,
  npcPanel = false,
  extensionPanel,
}: BuildingUIProps) {
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

  if (!canEdit) {
    return null;
  }

  return (
    <>
      {isEditing && <div className="building-edit-mode-overlay" />}

      <div className="building-ui-container">
        {isEditing ? (
          <div className="building-ui-panel">
            <div className="building-ui-header">
              <span className="building-ui-title">건축 모드</span>
              <button onClick={handleEditModeClose} className="building-ui-close">
                ×
              </button>
            </div>

            <div className="building-ui-mode-group">
              <button
                onClick={() => setEditMode('wall')}
                className={`building-ui-mode-button ${editMode === 'wall' ? 'active' : ''}`}
              >
                벽
              </button>
              <button
                onClick={() => setEditMode('tile')}
                className={`building-ui-mode-button ${editMode === 'tile' ? 'active' : ''}`}
              >
                바닥
              </button>
              <button
                onClick={() => setEditMode('block')}
                className={`building-ui-mode-button ${editMode === 'block' ? 'active' : ''}`}
              >
                블록
              </button>
              {hasNPCPanel && (
                <button
                  onClick={() => setEditMode('npc')}
                  className={`building-ui-mode-button ${editMode === 'npc' ? 'active' : ''}`}
                >
                  NPC
                </button>
              )}
              <button
                onClick={() => setEditMode('object')}
                className={`building-ui-mode-button ${editMode === 'object' ? 'active' : ''}`}
              >
                소품
              </button>
            </div>

            <div className="building-ui-object-group">
              <span className="building-ui-label">월드 환경:</span>
              <div className="building-ui-object-buttons">
                <button
                  onClick={() => setShowSnow(!showSnow)}
                  className={`building-ui-object-button ${showSnow ? 'active' : ''}`}
                >
                  눈 {showSnow ? '켜짐' : '꺼짐'}
                </button>
                {BUILDING_WEATHER_EFFECT_OPTIONS.filter((option) => option.type !== 'snow').map(
                  (option) => (
                    <button
                      key={option.type}
                      onClick={() => setWeatherEffect(option.type)}
                      className={`building-ui-object-button ${weatherEffect === option.type ? 'active' : ''}`}
                    >
                      {option.labelKo}
                    </button>
                  ),
                )}
                {BUILDING_WORLD_SURFACE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setWorldSurface(option.type)}
                    className={`building-ui-object-button ${worldSurface === option.type ? 'active' : ''}`}
                  >
                    {option.labelKo}
                  </button>
                ))}
                <button
                  onClick={() => setShowFog(!showFog)}
                  className={`building-ui-object-button ${showFog ? 'active' : ''}`}
                >
                  안개 {showFog ? '켜짐' : '꺼짐'}
                </button>
                <label className="building-ui-object-button">
                  안개 색상
                  <input
                    type="color"
                    value={fogColor}
                    onChange={(e) => setFogColor(e.target.value)}
                    style={{ marginLeft: 8 }}
                  />
                </label>
              </div>
            </div>

            {editMode === 'tile' && (
              <>
                <div className="building-ui-category-group">
                  <span className="building-ui-label">분류:</span>
                  <select
                    value={selectedTileCategoryId || ''}
                    onChange={(e) => setSelectedTileCategory(e.target.value)}
                    className="building-ui-select"
                  >
                    {tileCategoriesArray.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="building-ui-category-group">
                  <span className="building-ui-label">유형:</span>
                  <select
                    value={selectedTileGroupId || ''}
                    onChange={(e) =>
                      useBuildingStore.setState({ selectedTileGroupId: e.target.value })
                    }
                    className="building-ui-select"
                  >
                    {selectedTileCategoryId &&
                      tileCategories.get(selectedTileCategoryId)?.tileGroupIds.map((groupId) => {
                        const group = tileGroups.get(groupId);
                        return group ? (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ) : null;
                      })}
                  </select>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">벽 프리셋:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_WALL_PRESETS.map((preset) => {
                      const groupId = `${preset.id}-walls`;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyWallPreset(preset.id)}
                          className={`building-ui-object-button ${selectedWallGroupId === groupId ? 'active' : ''}`}
                        >
                          {preset.labelKo}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">벽 모듈:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_WALL_KIND_OPTIONS.map((kind) => (
                      <button
                        key={kind.type}
                        onClick={() => setWallKind(kind.type)}
                        className={`building-ui-object-button ${(selectedWall?.wallKind ?? currentWallKind) === kind.type ? 'active' : ''}`}
                      >
                        {kind.labelKo}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!selectedWallId || !selectedWallGroup) return;
                    updateWall(selectedWallGroup.id, selectedWallId, {
                      flipSides: !selectedWall?.flipSides,
                    });
                  }}
                  className="building-ui-apply-button"
                  disabled={!selectedWallId || !selectedWallGroup}
                >
                  안쪽·바깥쪽 뒤집기
                </button>

                <button onClick={handleToggleCustomSettings} className="building-ui-custom-toggle">
                  커스텀 설정 {showCustomSettings ? '숨기기' : '보기'}
                </button>

                {showCustomSettings && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">이름:</span>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="바닥 이름"
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">텍스처 주소:</span>
                      <input
                        type="text"
                        value={customTexture}
                        onChange={(e) => setCustomTexture(e.target.value)}
                        placeholder="https://..."
                        className="building-ui-input"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (selectedTileGroupId) {
                          const tileGroup = tileGroups.get(selectedTileGroupId);
                          if (tileGroup && tileGroup.floorMeshId) {
                            const meshId = selectedTileId
                              ? upsertCustomMesh(
                                  tileGroup.floorMeshId,
                                  `custom-tile-mesh-${selectedTileId}`,
                                )
                              : upsertCustomMesh(
                                  tileGroup.floorMeshId,
                                  createCustomMeshId('custom-placement-tile-mesh'),
                                );
                            if (selectedTileId) {
                              updateTile(tileGroup.id, selectedTileId, { materialId: meshId });
                              return;
                            }
                            setCurrentTileMaterialId(meshId);
                          }
                        }
                      }}
                      className="building-ui-apply-button"
                    >
                      변경 적용
                    </button>

                    <button
                      onClick={() => {
                        if (customName) {
                          const newId = `custom-tile-${Date.now()}`;
                          const newMeshId = `custom-floor-mesh-${Date.now()}`;

                          // Create new mesh
                          addMesh({
                            id: newMeshId,
                            color: customColor,
                            material: 'STANDARD',
                            ...(customTexture ? { mapTextureUrl: customTexture } : {}),
                            roughness: 0.6,
                          });

                          // Create new tile group
                          addTileGroup({
                            id: newId,
                            name: customName,
                            floorMeshId: newMeshId,
                            tiles: [],
                          });

                          // Add to current category
                          if (selectedTileCategoryId) {
                            const category = tileCategories.get(selectedTileCategoryId);
                            if (category) {
                              useBuildingStore
                                .getState()
                                .updateTileCategory(selectedTileCategoryId, {
                                  tileGroupIds: [...category.tileGroupIds, newId],
                                });
                            }
                          }

                          useBuildingStore.setState({ selectedTileGroupId: newId });
                          setCustomName('');
                        }
                      }}
                      className="building-ui-create-button"
                    >
                      새 유형 만들기
                    </button>
                  </div>
                )}

                <div className="building-ui-size-group">
                  <span className="building-ui-label">바닥 크기:</span>
                  <div className="building-ui-size-buttons">
                    <button
                      onClick={() => setTileMultiplier(1)}
                      className={`building-ui-size-button ${currentTileMultiplier === 1 ? 'active' : ''}`}
                    >
                      1x1
                    </button>
                    <button
                      onClick={() => setTileMultiplier(2)}
                      className={`building-ui-size-button ${currentTileMultiplier === 2 ? 'active' : ''}`}
                    >
                      2x2
                    </button>
                    <button
                      onClick={() => setTileMultiplier(3)}
                      className={`building-ui-size-button ${currentTileMultiplier === 3 ? 'active' : ''}`}
                    >
                      3x3
                    </button>
                    <button
                      onClick={() => setTileMultiplier(4)}
                      className={`building-ui-size-button ${currentTileMultiplier === 4 ? 'active' : ''}`}
                    >
                      4x4
                    </button>
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">바닥 높이:</span>
                  <div className="building-ui-size-buttons">
                    {[0, 1, 2, 3, 4].map((height) => (
                      <button
                        key={height}
                        onClick={() => setTileHeight(height)}
                        className={`building-ui-size-button ${currentTileHeight === height ? 'active' : ''}`}
                      >
                        {height}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">바닥 모양:</span>
                  <div className="building-ui-size-buttons">
                    {BUILDING_TILE_SHAPE_OPTIONS.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => setTileShape(shape.type)}
                        className={`building-ui-size-button ${currentTileShape === shape.type ? 'active' : ''}`}
                      >
                        {shape.labelKo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">바닥 회전:</span>
                  <div className="building-ui-size-buttons">
                    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
                      <button
                        key={rotation}
                        onClick={() => setTileRotation(rotation)}
                        className={`building-ui-size-button ${Math.abs(currentTileRotation - rotation) < 0.0001 ? 'active' : ''}`}
                      >
                        {index * 90}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">바닥 프리셋:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_TILE_PRESETS.map((preset) => {
                      const groupId = `${preset.id}-floor`;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyTilePreset(preset.id)}
                          className={`building-ui-object-button ${selectedTileGroupId === groupId ? 'active' : ''}`}
                        >
                          {preset.labelKo}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="building-ui-custom-settings">
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">사용자 지정 바닥:</span>
                    <input
                      type="text"
                      value={currentCustomTileName}
                      onChange={(e) => setCustomTileDraft({ name: e.target.value })}
                      className="building-ui-input"
                    />
                  </div>
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">색상:</span>
                    <div className="building-ui-color-input">
                      <input
                        type="color"
                        value={currentCustomTileColor}
                        onChange={(e) => setCustomTileDraft({ color: e.target.value })}
                        className="building-ui-color-picker"
                      />
                      <input
                        type="text"
                        value={currentCustomTileColor}
                        onChange={(e) => setCustomTileDraft({ color: e.target.value })}
                        className="building-ui-input"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </div>
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">텍스처 주소:</span>
                    <input
                      type="text"
                      value={currentCustomTileTextureUrl}
                      onChange={(e) => setCustomTileDraft({ textureUrl: e.target.value })}
                      placeholder="textures/floor.png"
                      className="building-ui-input"
                    />
                  </div>
                  <button onClick={applyCustomTile} className="building-ui-action-button">
                    별도 바닥 맵 만들기·선택
                  </button>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">바닥 소품:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_TILE_OBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedTileObjectType(option.type)}
                        className={`building-ui-object-button ${selectedTileObjectType === option.type ? 'active' : ''}`}
                      >
                        {option.labelKo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-info">
                  <p>분류: {tileCategories.get(selectedTileCategoryId || '')?.name}</p>
                  <p>유형: {tileGroups.get(selectedTileGroupId || '')?.name}</p>
                  <p>
                    크기: {currentTileMultiplier}x{currentTileMultiplier} (
                    {currentTileMultiplier * 4}m)
                  </p>
                  <p>높이: {currentTileHeight}</p>
                  <p>모양: {selectedTileShapeLabel}</p>
                  <p>소품: {selectedTileObjectLabel}</p>
                  <p>클릭하여 바닥을 배치하세요</p>
                  <p>주황색: 배치 불가 · 파란색: 배치 가능</p>
                </div>
              </>
            )}

            {editMode === 'block' && (
              <>
                <div className="building-ui-size-group">
                  <span className="building-ui-label">블록 크기:</span>
                  <div className="building-ui-size-buttons">
                    {[1, 2, 3, 4].map((size) => (
                      <button
                        key={size}
                        onClick={() => setTileMultiplier(size)}
                        className={`building-ui-size-button ${currentTileMultiplier === size ? 'active' : ''}`}
                      >
                        {size}x{size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">층 오프셋:</span>
                  <div className="building-ui-size-buttons">
                    {[0, 1, 2, 3, 4].map((height) => (
                      <button
                        key={height}
                        onClick={() => setTileHeight(height)}
                        className={`building-ui-size-button ${currentTileHeight === height ? 'active' : ''}`}
                      >
                        {height}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-info">
                  <p>
                    크기: {currentTileMultiplier}x{currentTileMultiplier}
                  </p>
                  <p>층 오프셋: {currentTileHeight}</p>
                  <p>클릭하여 복셀 블록을 배치하세요</p>
                  <p>강조된 블록을 클릭하면 삭제됩니다</p>
                </div>
              </>
            )}

            {editMode === 'object' && (
              <>
                <div className="building-ui-object-group">
                  <span className="building-ui-label">소품 유형:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_BASIC_OBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedPlacedObjectType(option.type)}
                        className={`building-ui-object-button ${selectedPlacedObjectType === option.type ? 'active' : ''}`}
                      >
                        {option.labelKo}
                      </button>
                    ))}
                    {DEFAULT_BUILDING_OBJECT_CATALOG.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedPlacedObjectType('model');
                          setSelectedModelObjectId(item.id);
                          setModelScale(item.defaultScale);
                          setModelColor(item.defaultColor);
                          setModelUrl(item.modelUrl ?? '');
                        }}
                        className={`building-ui-object-button ${selectedPlacedObjectType === 'model' && selectedModelObjectId === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">소품 회전:</span>
                  <div className="building-ui-size-buttons">
                    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
                      <button
                        key={rotation}
                        onClick={() => setObjectRotation(rotation)}
                        className={`building-ui-size-button ${Math.abs(currentObjectRotation - rotation) < 0.0001 ? 'active' : ''}`}
                      >
                        {index * 90}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedPlacedObjectType === 'tree' || selectedPlacedObjectType === 'sakura') && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-object-group">
                      <span className="building-ui-label">나무 종류:</span>
                      <div className="building-ui-object-buttons">
                        {BUILDING_TREE_OPTIONS.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => setTreeKind(option.type)}
                            className={`building-ui-object-button ${currentTreeKind === option.type ? 'active' : ''}`}
                          >
                            {option.labelKo}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">잎·꽃 색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={currentObjectPrimaryColor}
                          onChange={(e) => setObjectPrimaryColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={currentObjectPrimaryColor}
                          onChange={(e) => setObjectPrimaryColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">나무껍질 색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={currentObjectSecondaryColor}
                          onChange={(e) => setObjectSecondaryColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={currentObjectSecondaryColor}
                          onChange={(e) => setObjectSecondaryColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlacedObjectType === 'flag' && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-object-group">
                      <span className="building-ui-label">깃발 모양:</span>
                      <div className="building-ui-object-buttons">
                        {BUILDING_FLAG_STYLE_OPTIONS.map(({ style, meta }) => (
                          <button
                            key={style}
                            onClick={() => setFlagStyle(style)}
                            className={`building-ui-object-button ${currentFlagStyle === style ? 'active' : ''}`}
                          >
                            {meta.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">너비:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="8"
                        step="0.1"
                        value={currentFlagWidth}
                        onChange={(e) => setFlagWidth(Number(e.target.value) || 1.5)}
                        className="building-ui-input"
                      />
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">높이:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="6"
                        step="0.1"
                        value={currentFlagHeight}
                        onChange={(e) => setFlagHeight(Number(e.target.value) || 1)}
                        className="building-ui-input"
                      />
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">이미지 주소:</span>
                      <input
                        type="text"
                        value={currentFlagImageUrl}
                        onChange={(e) => setFlagImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="building-ui-input"
                      />
                    </div>
                  </div>
                )}

                {selectedPlacedObjectType === 'fire' && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">강도:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={currentFireIntensity}
                        onChange={(e) => setFireIntensity(Number(e.target.value) || 1.5)}
                        className="building-ui-input"
                      />
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">너비:</span>
                      <input
                        type="number"
                        min="0.3"
                        max="4"
                        step="0.1"
                        value={currentFireWidth}
                        onChange={(e) => setFireWidth(Number(e.target.value) || 1)}
                        className="building-ui-input"
                      />
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">높이:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={currentFireHeight}
                        onChange={(e) => setFireHeight(Number(e.target.value) || 1.5)}
                        className="building-ui-input"
                      />
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={currentFireColor}
                          onChange={(e) => setFireColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={currentFireColor}
                          onChange={(e) => setFireColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPlacedObjectType === 'billboard' && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-size-group">
                      <span className="building-ui-label">안내판 크기:</span>
                      <div className="building-ui-size-buttons">
                        {[0.5, 1, 1.5, 2, 3, 4].map((size) => (
                          <button
                            key={size}
                            onClick={() => setBillboardScale(size)}
                            className={`building-ui-size-button ${Math.abs(currentBillboardScale - size) < 0.0001 ? 'active' : ''}`}
                          >
                            {size}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="building-ui-size-group">
                      <span className="building-ui-label">안내판 높이:</span>
                      <div className="building-ui-size-buttons">
                        {[-1, 0, 1, 2, 3, 4, 6].map((height) => (
                          <button
                            key={height}
                            onClick={() => setBillboardOffsetY(height)}
                            className={`building-ui-size-button ${Math.abs(currentBillboardOffsetY - height) < 0.0001 ? 'active' : ''}`}
                          >
                            {height}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">문구:</span>
                      <input
                        type="text"
                        value={currentBillboardText}
                        onChange={(e) => setBillboardText(e.target.value)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">이미지 주소:</span>
                      <input
                        type="text"
                        value={currentBillboardImageUrl}
                        onChange={(e) => setBillboardImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={currentBillboardColor}
                          onChange={(e) => setBillboardColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={currentBillboardColor}
                          onChange={(e) => setBillboardColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">사용자 지정 크기:</span>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={currentBillboardScale}
                        onChange={(e) => setBillboardScale(Number(e.target.value) || 1)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">사용자 지정 높이:</span>
                      <input
                        type="number"
                        min="-4"
                        max="12"
                        step="0.1"
                        value={currentBillboardOffsetY}
                        onChange={(e) => setBillboardOffsetY(Number(e.target.value) || 0)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">판 너비:</span>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        step="0.1"
                        value={currentBillboardWidth}
                        onChange={(e) => setBillboardWidth(Number(e.target.value) || 0)}
                        className="building-ui-input"
                      />
                      <span className="building-ui-help">0: 이미지 비율에 맞춤</span>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">판 높이:</span>
                      <input
                        type="number"
                        min="0.3"
                        max="5"
                        step="0.1"
                        value={currentBillboardHeight}
                        onChange={(e) => setBillboardHeight(Number(e.target.value) || 1.5)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">기둥 높이:</span>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        step="0.1"
                        value={currentBillboardElevation}
                        onChange={(e) => setBillboardElevation(Number(e.target.value) || 0)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">밝기:</span>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        step="0.1"
                        value={currentBillboardIntensity}
                        onChange={(e) => setBillboardIntensity(Number(e.target.value) || 0)}
                        className="building-ui-input"
                      />
                    </div>
                  </div>
                )}

                {selectedPlacedObjectType === 'model' && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">GLB 파일 주소:</span>
                      <input
                        type="text"
                        value={currentModelUrl}
                        onChange={(e) => setModelUrl(e.target.value)}
                        placeholder="gltf/props/door.glb"
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">배율:</span>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={currentModelScale}
                        onChange={(e) => setModelScale(Number(e.target.value) || 1)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={currentModelColor}
                          onChange={(e) => setModelColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={currentModelColor}
                          onChange={(e) => setModelColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="building-ui-info">
                  <p>
                    유형:{' '}
                    {selectedPlacedObjectType === 'model'
                      ? selectedModelObject?.label
                      : selectedPlacedObjectType}
                  </p>
                  {selectedPlacedObjectType === 'model' && (
                    <>
                      <p>대체 표시: {selectedModelObject?.fallbackKind ?? 'generic'}</p>
                      <p>GLB URL이 비어 있으면 기본 프리미티브로 표시됩니다.</p>
                    </>
                  )}
                  <p>클릭하여 소품을 배치하세요</p>
                </div>
              </>
            )}

            {editMode === 'wall' && (
              <>
                <div className="building-ui-category-group">
                  <span className="building-ui-label">분류:</span>
                  <select
                    value={selectedWallCategoryId || ''}
                    onChange={(e) => setSelectedWallCategory(e.target.value)}
                    className="building-ui-select"
                  >
                    {wallCategoriesArray.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="building-ui-category-group">
                  <span className="building-ui-label">유형:</span>
                  <select
                    value={selectedWallTypeGroupId || ''}
                    onChange={(e) => {
                      const nextGroupId = e.target.value;
                      if (selectedWallId) {
                        moveWallToGroup(selectedWallId, nextGroupId);
                        return;
                      }
                      useBuildingStore.setState({ selectedWallGroupId: nextGroupId });
                    }}
                    className="building-ui-select"
                  >
                    {selectedWallCategoryId &&
                      wallCategories.get(selectedWallCategoryId)?.wallGroupIds.map((groupId) => {
                        const group = wallGroups.get(groupId);
                        return group ? (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ) : null;
                      })}
                  </select>
                </div>

                <button onClick={handleToggleCustomSettings} className="building-ui-custom-toggle">
                  커스텀 설정 {showCustomSettings ? '숨기기' : '보기'}
                </button>

                {showCustomSettings && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">이름:</span>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="벽 이름"
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">색상:</span>
                      <div className="building-ui-color-input">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="building-ui-color-picker"
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="building-ui-input"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">텍스처 주소:</span>
                      <input
                        type="text"
                        value={customTexture}
                        onChange={(e) => setCustomTexture(e.target.value)}
                        placeholder="https://..."
                        className="building-ui-input"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (selectedWallGroupId) {
                          const wallGroup = selectedWallId
                            ? findWallGroupByWallId(selectedWallId)
                            : wallGroups.get(selectedWallGroupId);
                          if (!wallGroup) return;
                          const selectedWall = selectedWallId
                            ? wallGroup.walls.find((wall) => wall.id === selectedWallId)
                            : undefined;
                          const sourceMeshId = selectedWall?.materialId ?? wallGroup.frontMeshId;
                          const meshId = upsertCustomMesh(
                            sourceMeshId,
                            selectedWallId
                              ? `custom-wall-mesh-${selectedWallId}`
                              : createCustomMeshId('custom-placement-wall-mesh'),
                          );
                          if (selectedWallId) {
                            updateWall(wallGroup.id, selectedWallId, { materialId: meshId });
                            return;
                          }
                          setCurrentWallMaterialId(meshId);
                        }
                      }}
                      className="building-ui-apply-button"
                    >
                      변경 적용
                    </button>

                    <button
                      onClick={() => {
                        if (customName) {
                          const newId = `custom-wall-${Date.now()}`;
                          const newMeshId = `custom-mesh-${Date.now()}`;

                          // Create new mesh
                          addMesh({
                            id: newMeshId,
                            color: customColor,
                            material: 'STANDARD',
                            ...(customTexture ? { mapTextureUrl: customTexture } : {}),
                            roughness: 0.7,
                          });

                          // Create new wall group
                          addWallGroup({
                            id: newId,
                            name: customName,
                            frontMeshId: newMeshId,
                            backMeshId: newMeshId,
                            sideMeshId: newMeshId,
                            walls: [],
                          });

                          // Add to current category
                          if (selectedWallCategoryId) {
                            const category = wallCategories.get(selectedWallCategoryId);
                            if (category) {
                              useBuildingStore
                                .getState()
                                .updateWallCategory(selectedWallCategoryId, {
                                  wallGroupIds: [...category.wallGroupIds, newId],
                                });
                            }
                          }

                          useBuildingStore.setState({ selectedWallGroupId: newId });
                          setCustomName('');
                        }
                      }}
                      className="building-ui-create-button"
                    >
                      새 유형 만들기
                    </button>
                  </div>
                )}

                <div className="building-ui-direction-group">
                  <span className="building-ui-label">벽 방향:</span>
                  <div className="building-ui-direction-buttons">
                    <button
                      onClick={() => setWallRotation(0)}
                      className={`building-ui-direction-button ${currentWallRotation === 0 ? 'active' : ''}`}
                      title="북쪽"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI / 2)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI / 2 ? 'active' : ''}`}
                      title="동쪽"
                    >
                      →
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI ? 'active' : ''}`}
                      title="남쪽"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI * 1.5)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI * 1.5 ? 'active' : ''}`}
                      title="서쪽"
                    >
                      ←
                    </button>
                  </div>
                </div>
                <div className="building-ui-info">
                  <p>분류: {wallCategories.get(selectedWallCategoryId || '')?.name}</p>
                  <p>유형: {wallGroups.get(selectedWallGroupId || '')?.name}</p>
                  <p>방향키로 회전하세요</p>
                  <p>클릭하여 벽을 배치하세요</p>
                  <p>주황색: 배치 불가 · 파란색: 배치 가능</p>
                  <p>강조된 표시를 클릭하면 삭제됩니다</p>
                </div>
              </>
            )}

            {editMode === 'npc' &&
              hasNPCPanel &&
              (typeof npcPanel === 'function' ? npcPanel({ editMode: 'npc' }) : npcPanel)}
            {extensionPanel}
          </div>
        ) : null}
      </div>
    </>
  );
}
