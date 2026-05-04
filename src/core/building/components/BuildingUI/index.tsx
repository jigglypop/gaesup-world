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
  } = useBuildingStore(useShallow((state) => ({
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
  })));
  const isEditing = isInEditMode();
  
  const [showCustomSettings, setShowCustomSettings] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customColor, setCustomColor] = React.useState('#808080');
  const [customTexture, setCustomTexture] = React.useState('');

  const tileCategoriesArray = useMemo(() => Array.from(tileCategories.values()), [tileCategories]);
  const wallCategoriesArray = useMemo(() => Array.from(wallCategories.values()), [wallCategories]);
  const hasNPCPanel = npcPanel !== false && npcPanel !== null && npcPanel !== undefined;
  const selectedTileObjectLabel = useMemo(
    () => BUILDING_TILE_OBJECT_OPTIONS.find((option) => option.type === selectedTileObjectType)?.labelEn ?? selectedTileObjectType,
    [selectedTileObjectType],
  );
  const selectedTileShapeLabel = useMemo(
    () => BUILDING_TILE_SHAPE_OPTIONS.find((option) => option.type === currentTileShape)?.labelEn ?? currentTileShape,
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

  const upsertCustomMesh = useCallback((sourceMeshId: string | undefined, nextMeshId: string): string => {
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
  }, [addMesh, customColor, customTexture, meshes, updateMesh]);

  const findWallGroupByWallId = useCallback((wallId: string) => {
    const groupId = wallGroupByWallId.get(wallId);
    return groupId ? wallGroups.get(groupId) : undefined;
  }, [wallGroupByWallId, wallGroups]);
  const selectedWallTypeGroupId = selectedWallId
    ? findWallGroupByWallId(selectedWallId)?.id
    : selectedWallGroupId;
  const selectedWallGroup = selectedWallId ? findWallGroupByWallId(selectedWallId) : wallGroups.get(selectedWallGroupId ?? '');
  const selectedWall = selectedWallId
    ? selectedWallGroup?.walls.find((wall) => wall.id === selectedWallId)
    : undefined;
  
  // Callbacks
  const handleEditModeClose = useCallback(() => {
    setEditMode('none');
    onClose?.();
  }, [setEditMode, onClose]);
  const handleToggleCustomSettings = useCallback(() => setShowCustomSettings(prev => !prev), []);
  
  React.useEffect(() => {
    if (editMode === 'wall' && selectedWallGroupId) {
      const wallGroup = selectedWallId ? findWallGroupByWallId(selectedWallId) : wallGroups.get(selectedWallGroupId);
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
  }, [editMode, selectedWallGroupId, selectedTileGroupId, selectedWallId, findWallGroupByWallId, wallGroups, tileGroups, meshes]);
  
  if (!canEdit) {
    return null;
  }
  
  return (
    <>
      {isEditing && (
        <div className="building-edit-mode-overlay" />
      )}
      
      <div className="building-ui-container">
        {isEditing ? (
          <div className="building-ui-panel">
            <div className="building-ui-header">
              <span className="building-ui-title">Building Mode</span>
              <button 
                onClick={handleEditModeClose}
                className="building-ui-close"
              >
                ×
              </button>
            </div>
            
            <div className="building-ui-mode-group">
              <button 
                onClick={() => setEditMode('wall')} 
                className={`building-ui-mode-button ${editMode === 'wall' ? 'active' : ''}`}
              >
                Wall Mode
              </button>
              <button 
                onClick={() => setEditMode('tile')}
                className={`building-ui-mode-button ${editMode === 'tile' ? 'active' : ''}`}
              >
                Tile Mode
              </button>
              <button
                onClick={() => setEditMode('block')}
                className={`building-ui-mode-button ${editMode === 'block' ? 'active' : ''}`}
              >
                Block Mode
              </button>
              {hasNPCPanel && (
                <button
                  onClick={() => setEditMode('npc')}
                  className={`building-ui-mode-button ${editMode === 'npc' ? 'active' : ''}`}
                >
                  NPC Mode
                </button>
              )}
              <button
                onClick={() => setEditMode('object')}
                className={`building-ui-mode-button ${editMode === 'object' ? 'active' : ''}`}
              >
                Object Mode
              </button>
            </div>

            <div className="building-ui-object-group">
              <span className="building-ui-label">World Environment:</span>
              <div className="building-ui-object-buttons">
                <button
                  onClick={() => setShowSnow(!showSnow)}
                  className={`building-ui-object-button ${showSnow ? 'active' : ''}`}
                >
                  Snow {showSnow ? 'ON' : 'OFF'}
                </button>
                {BUILDING_WEATHER_EFFECT_OPTIONS.filter((option) => option.type !== 'snow').map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setWeatherEffect(option.type)}
                    className={`building-ui-object-button ${weatherEffect === option.type ? 'active' : ''}`}
                  >
                    {option.labelEn}
                  </button>
                ))}
                <button
                  onClick={() => setShowFog(!showFog)}
                  className={`building-ui-object-button ${showFog ? 'active' : ''}`}
                >
                  Fog {showFog ? 'ON' : 'OFF'}
                </button>
                <label className="building-ui-object-button">
                  Fog Color
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
                  <span className="building-ui-label">Category:</span>
                  <select 
                    value={selectedTileCategoryId || ''} 
                    onChange={(e) => setSelectedTileCategory(e.target.value)}
                    className="building-ui-select"
                  >
                    {tileCategoriesArray.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Type:</span>
                  <select 
                    value={selectedTileGroupId || ''} 
                    onChange={(e) => useBuildingStore.setState({ selectedTileGroupId: e.target.value })}
                    className="building-ui-select"
                  >
                    {selectedTileCategoryId && tileCategories.get(selectedTileCategoryId)?.tileGroupIds.map(groupId => {
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
                  <span className="building-ui-label">Wall Preset:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_WALL_PRESETS.map((preset) => {
                      const groupId = `${preset.id}-walls`;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyWallPreset(preset.id)}
                          className={`building-ui-object-button ${selectedWallGroupId === groupId ? 'active' : ''}`}
                        >
                          {preset.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">Wall Module:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_WALL_KIND_OPTIONS.map((kind) => (
                      <button
                        key={kind.type}
                        onClick={() => setWallKind(kind.type)}
                        className={`building-ui-object-button ${(selectedWall?.wallKind ?? currentWallKind) === kind.type ? 'active' : ''}`}
                      >
                        {kind.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!selectedWallId || !selectedWallGroup) return;
                    updateWall(selectedWallGroup.id, selectedWallId, { flipSides: !selectedWall?.flipSides });
                  }}
                  className="building-ui-apply-button"
                  disabled={!selectedWallId || !selectedWallGroup}
                >
                  Flip Interior/Exterior
                </button>
                
                <button 
                  onClick={handleToggleCustomSettings}
                  className="building-ui-custom-toggle"
                >
                  {showCustomSettings ? 'Hide' : 'Show'} Custom Settings
                </button>
                
                {showCustomSettings && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Name:</span>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Custom Floor Name"
                        className="building-ui-input"
                      />
                    </div>
                    
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Color:</span>
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
                      <span className="building-ui-label">Texture URL:</span>
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
                              ? upsertCustomMesh(tileGroup.floorMeshId, `custom-tile-mesh-${selectedTileId}`)
                              : upsertCustomMesh(tileGroup.floorMeshId, createCustomMeshId('custom-placement-tile-mesh'));
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
                      Apply Changes
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
                            roughness: 0.6
                          });
                          
                          // Create new tile group
                          addTileGroup({
                            id: newId,
                            name: customName,
                            floorMeshId: newMeshId,
                            tiles: []
                          });
                          
                          // Add to current category
                          if (selectedTileCategoryId) {
                            const category = tileCategories.get(selectedTileCategoryId);
                            if (category) {
                              useBuildingStore.getState().updateTileCategory(selectedTileCategoryId, {
                                tileGroupIds: [...category.tileGroupIds, newId]
                              });
                            }
                          }
                          
                          useBuildingStore.setState({ selectedTileGroupId: newId });
                          setCustomName('');
                        }
                      }}
                      className="building-ui-create-button"
                    >
                      Create New Type
                    </button>
                  </div>
                )}
                
                <div className="building-ui-size-group">
                  <span className="building-ui-label">Tile Size:</span>
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
                  <span className="building-ui-label">Tile Height:</span>
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
                  <span className="building-ui-label">Tile Shape:</span>
                  <div className="building-ui-size-buttons">
                    {BUILDING_TILE_SHAPE_OPTIONS.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => setTileShape(shape.type)}
                        className={`building-ui-size-button ${currentTileShape === shape.type ? 'active' : ''}`}
                      >
                        {shape.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-size-group">
                  <span className="building-ui-label">Tile Rotation:</span>
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
                  <span className="building-ui-label">Tile Preset:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_TILE_PRESETS.map((preset) => {
                      const groupId = `${preset.id}-floor`;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyTilePreset(preset.id)}
                          className={`building-ui-object-button ${selectedTileGroupId === groupId ? 'active' : ''}`}
                        >
                          {preset.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="building-ui-custom-settings">
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">Custom Tile:</span>
                    <input
                      type="text"
                      value={currentCustomTileName}
                      onChange={(e) => setCustomTileDraft({ name: e.target.value })}
                      className="building-ui-input"
                    />
                  </div>
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">Color:</span>
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
                    <span className="building-ui-label">Texture URL:</span>
                    <input
                      type="text"
                      value={currentCustomTileTextureUrl}
                      onChange={(e) => setCustomTileDraft({ textureUrl: e.target.value })}
                      placeholder="textures/floor.png"
                      className="building-ui-input"
                    />
                  </div>
                  <button onClick={applyCustomTile} className="building-ui-action-button">
                    Create/Select Separate Tile Map
                  </button>
                </div>
                
                <div className="building-ui-object-group">
                  <span className="building-ui-label">Tile Object:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_TILE_OBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedTileObjectType(option.type)}
                        className={`building-ui-object-button ${selectedTileObjectType === option.type ? 'active' : ''}`}
                      >
                        {option.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="building-ui-info">
                  <p>Category: {tileCategories.get(selectedTileCategoryId || '')?.name}</p>
                  <p>Type: {tileGroups.get(selectedTileGroupId || '')?.name}</p>
                  <p>Size: {currentTileMultiplier}x{currentTileMultiplier} ({currentTileMultiplier * 4}m)</p>
                  <p>Height: {currentTileHeight}</p>
                  <p>Shape: {selectedTileShapeLabel}</p>
                  <p>Object: {selectedTileObjectLabel}</p>
                  <p>Click to place tiles</p>
                  <p>Amber = Occupied, Blue = Available</p>
                </div>
              </>
            )}

            {editMode === 'block' && (
              <>
                <div className="building-ui-size-group">
                  <span className="building-ui-label">Block Size:</span>
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
                  <span className="building-ui-label">Layer Offset:</span>
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
                  <p>Size: {currentTileMultiplier}x{currentTileMultiplier}</p>
                  <p>Layer offset: {currentTileHeight}</p>
                  <p>Click to place voxel blocks</p>
                  <p>Click highlighted blocks to delete</p>
                </div>
              </>
            )}

            {editMode === 'object' && (
              <>
                <div className="building-ui-object-group">
                  <span className="building-ui-label">Object Type:</span>
                  <div className="building-ui-object-buttons">
                    {BUILDING_BASIC_OBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedPlacedObjectType(option.type)}
                        className={`building-ui-object-button ${selectedPlacedObjectType === option.type ? 'active' : ''}`}
                      >
                        {option.labelEn}
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
                  <span className="building-ui-label">Object Rotation:</span>
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
                      <span className="building-ui-label">Tree Type:</span>
                      <div className="building-ui-object-buttons">
                        {BUILDING_TREE_OPTIONS.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => setTreeKind(option.type)}
                            className={`building-ui-object-button ${currentTreeKind === option.type ? 'active' : ''}`}
                          >
                            {option.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Leaf/Flower Color:</span>
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
                      <span className="building-ui-label">Bark Color:</span>
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
                      <span className="building-ui-label">Flag Style:</span>
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
                      <span className="building-ui-label">Width:</span>
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
                      <span className="building-ui-label">Height:</span>
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
                      <span className="building-ui-label">Image URL:</span>
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
                      <span className="building-ui-label">Intensity:</span>
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
                      <span className="building-ui-label">Width:</span>
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
                      <span className="building-ui-label">Height:</span>
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
                      <span className="building-ui-label">Color:</span>
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
                      <span className="building-ui-label">Billboard Size:</span>
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
                      <span className="building-ui-label">Billboard Height:</span>
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
                      <span className="building-ui-label">Text:</span>
                      <input
                        type="text"
                        value={currentBillboardText}
                        onChange={(e) => setBillboardText(e.target.value)}
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Image URL:</span>
                      <input
                        type="text"
                        value={currentBillboardImageUrl}
                        onChange={(e) => setBillboardImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Color:</span>
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
                      <span className="building-ui-label">Custom Size:</span>
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
                      <span className="building-ui-label">Custom Height:</span>
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
                      <span className="building-ui-label">Panel Width:</span>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        step="0.1"
                        value={currentBillboardWidth}
                        onChange={(e) => setBillboardWidth(Number(e.target.value) || 0)}
                        className="building-ui-input"
                      />
                      <span className="building-ui-help">0 = image ratio auto</span>
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Panel Height:</span>
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
                      <span className="building-ui-label">Post Height:</span>
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
                      <span className="building-ui-label">Brightness:</span>
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
                      <span className="building-ui-label">GLB URL:</span>
                      <input
                        type="text"
                        value={currentModelUrl}
                        onChange={(e) => setModelUrl(e.target.value)}
                        placeholder="gltf/props/door.glb"
                        className="building-ui-input"
                      />
                    </div>

                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Scale:</span>
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
                      <span className="building-ui-label">Color:</span>
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
                  <p>Type: {selectedPlacedObjectType === 'model' ? selectedModelObject?.label : selectedPlacedObjectType}</p>
                  {selectedPlacedObjectType === 'model' && (
                    <>
                      <p>Fallback: {selectedModelObject?.fallbackKind ?? 'generic'}</p>
                      <p>GLB URL이 비어 있으면 기본 프리미티브로 표시됩니다.</p>
                    </>
                  )}
                  <p>Click to place objects</p>
                </div>
              </>
            )}
            
            {editMode === 'wall' && (
              <>
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Category:</span>
                  <select 
                    value={selectedWallCategoryId || ''} 
                    onChange={(e) => setSelectedWallCategory(e.target.value)}
                    className="building-ui-select"
                  >
                    {wallCategoriesArray.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Type:</span>
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
                    {selectedWallCategoryId && wallCategories.get(selectedWallCategoryId)?.wallGroupIds.map(groupId => {
                      const group = wallGroups.get(groupId);
                      return group ? (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>
                
                <button 
                  onClick={handleToggleCustomSettings}
                  className="building-ui-custom-toggle"
                >
                  {showCustomSettings ? 'Hide' : 'Show'} Custom Settings
                </button>
                
                {showCustomSettings && (
                  <div className="building-ui-custom-settings">
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Name:</span>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Custom Wall Name"
                        className="building-ui-input"
                      />
                    </div>
                    
                    <div className="building-ui-input-group">
                      <span className="building-ui-label">Color:</span>
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
                      <span className="building-ui-label">Texture URL:</span>
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
                          const wallGroup = selectedWallId ? findWallGroupByWallId(selectedWallId) : wallGroups.get(selectedWallGroupId);
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
                      Apply Changes
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
                            roughness: 0.7
                          });
                          
                          // Create new wall group
                          addWallGroup({
                            id: newId,
                            name: customName,
                            frontMeshId: newMeshId,
                            backMeshId: newMeshId,
                            sideMeshId: newMeshId,
                            walls: []
                          });
                          
                          // Add to current category
                          if (selectedWallCategoryId) {
                            const category = wallCategories.get(selectedWallCategoryId);
                            if (category) {
                              useBuildingStore.getState().updateWallCategory(selectedWallCategoryId, {
                                wallGroupIds: [...category.wallGroupIds, newId]
                              });
                            }
                          }
                          
                          useBuildingStore.setState({ selectedWallGroupId: newId });
                          setCustomName('');
                        }
                      }}
                      className="building-ui-create-button"
                    >
                      Create New Type
                    </button>
                  </div>
                )}
                
                <div className="building-ui-direction-group">
                  <span className="building-ui-label">Wall Direction:</span>
                  <div className="building-ui-direction-buttons">
                    <button
                      onClick={() => setWallRotation(0)}
                      className={`building-ui-direction-button ${currentWallRotation === 0 ? 'active' : ''}`}
                      title="North"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI / 2)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI / 2 ? 'active' : ''}`}
                      title="East"
                    >
                      →
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI ? 'active' : ''}`}
                      title="South"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setWallRotation(Math.PI * 1.5)}
                      className={`building-ui-direction-button ${currentWallRotation === Math.PI * 1.5 ? 'active' : ''}`}
                      title="West"
                    >
                      ←
                    </button>
                  </div>
                </div>
                <div className="building-ui-info">
                  <p>Category: {wallCategories.get(selectedWallCategoryId || '')?.name}</p>
                  <p>Type: {wallGroups.get(selectedWallGroupId || '')?.name}</p>
                  <p>Use arrow keys to rotate</p>
                  <p>Click to place walls</p>
                  <p>Amber = Occupied, Blue = Available</p>
                  <p>Click highlighted markers to delete</p>
                </div>
              </>
            )}
            
            {editMode === 'npc' && hasNPCPanel && (
              typeof npcPanel === 'function'
                ? npcPanel({ editMode: 'npc' })
                : npcPanel
            )}
            {extensionPanel}
          </div>
        ) : null}
      </div>
    </>
  );
} 
