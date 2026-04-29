import React, { useMemo, useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useAuthStore } from '../../../../admin/store/authStore';
import { useNPCStore } from '../../../npc/stores/npcStore';
import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../catalog';
import { useBuildingStore } from '../../stores/buildingStore';
import type { MeshConfig, TileObjectType, TileShapeType } from '../../types';
import './styles.css';

export type BuildingUIProps = {
  onClose?: () => void;
};

const TILE_OBJECT_OPTIONS: { type: TileObjectType; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'water', label: 'Water' },
  { type: 'grass', label: 'Grass' },
  { type: 'sand', label: 'Sand' },
  { type: 'snowfield', label: 'Snowfield' },
];

const TILE_SHAPE_OPTIONS: { type: TileShapeType; label: string }[] = [
  { type: 'box', label: 'Box' },
  { type: 'stairs', label: 'Stairs' },
  { type: 'round', label: 'Round' },
  { type: 'ramp', label: 'Ramp' },
];

export function createCustomMeshId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BuildingUI({ onClose }: BuildingUIProps) {
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
  })));
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isEditing = isInEditMode();
  
  const {
    templates: npcTemplates,
    selectedTemplateId: selectedNPCTemplateId,
    setSelectedTemplate: setSelectedNPCTemplate,
    initializeDefaults: initializeNPCDefaults,
    selectedInstanceId: selectedNPCInstanceId,
  } = useNPCStore(useShallow((state) => ({
    templates: state.templates,
    selectedTemplateId: state.selectedTemplateId,
    setSelectedTemplate: state.setSelectedTemplate,
    initializeDefaults: state.initializeDefaults,
    selectedInstanceId: state.selectedInstanceId,
  })));
  
  const [showCustomSettings, setShowCustomSettings] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customColor, setCustomColor] = React.useState('#808080');
  const [customTexture, setCustomTexture] = React.useState('');

  const tileCategoriesArray = useMemo(() => Array.from(tileCategories.values()), [tileCategories]);
  const wallCategoriesArray = useMemo(() => Array.from(wallCategories.values()), [wallCategories]);
  const npcTemplatesArray = useMemo(() => Array.from(npcTemplates.values()), [npcTemplates]);
  const selectedTileObjectLabel = useMemo(
    () => TILE_OBJECT_OPTIONS.find((option) => option.type === selectedTileObjectType)?.label ?? selectedTileObjectType,
    [selectedTileObjectType],
  );
  const selectedTileShapeLabel = useMemo(
    () => TILE_SHAPE_OPTIONS.find((option) => option.type === currentTileShape)?.label ?? currentTileShape,
    [currentTileShape],
  );
  const selectedModelObject = useMemo(
    () => getDefaultBuildingObject(selectedModelObjectId) ?? DEFAULT_BUILDING_OBJECT_CATALOG[0],
    [selectedModelObjectId],
  );

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

  const findWallGroupByWallId = useCallback((wallId: string) => (
    Array.from(wallGroups.values()).find((group) => group.walls.some((wall) => wall.id === wallId))
  ), [wallGroups]);
  const selectedWallTypeGroupId = selectedWallId
    ? findWallGroupByWallId(selectedWallId)?.id
    : selectedWallGroupId;
  
  // Callbacks
  const handleEditModeClose = useCallback(() => {
    setEditMode('none');
    onClose?.();
  }, [setEditMode, onClose]);
  const handleToggleCustomSettings = useCallback(() => setShowCustomSettings(prev => !prev), []);
  
  React.useEffect(() => {
    initializeNPCDefaults();
  }, [initializeNPCDefaults]);
  
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
  
  if (!isLoggedIn) {
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
              <button 
                onClick={() => setEditMode('npc')}
                className={`building-ui-mode-button ${editMode === 'npc' ? 'active' : ''}`}
              >
                NPC Mode
              </button>
              <button
                onClick={() => {
                  setSelectedPlacedObjectType('model');
                  setEditMode('object');
                }}
                className={`building-ui-mode-button ${editMode === 'object' ? 'active' : ''}`}
              >
                Object Mode
              </button>
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
                    {TILE_SHAPE_OPTIONS.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => setTileShape(shape.type)}
                        className={`building-ui-size-button ${currentTileShape === shape.type ? 'active' : ''}`}
                      >
                        {shape.label}
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
                        onClick={() => setObjectRotation(rotation)}
                        className={`building-ui-size-button ${Math.abs(currentObjectRotation - rotation) < 0.0001 ? 'active' : ''}`}
                      >
                        {index * 90}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="building-ui-object-group">
                  <span className="building-ui-label">Tile Object:</span>
                  <div className="building-ui-object-buttons">
                    {TILE_OBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedTileObjectType(option.type)}
                        className={`building-ui-object-button ${selectedTileObjectType === option.type ? 'active' : ''}`}
                      >
                        {option.label}
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
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Object:</span>
                  <select
                    value={selectedModelObjectId}
                    onChange={(e) => {
                      const next = getDefaultBuildingObject(e.target.value);
                      setSelectedModelObjectId(e.target.value);
                      if (next) {
                        setSelectedPlacedObjectType('model');
                        setModelScale(next.defaultScale);
                        setModelColor(next.defaultColor);
                        setModelUrl(next.modelUrl ?? '');
                      }
                    }}
                    className="building-ui-select"
                  >
                    {DEFAULT_BUILDING_OBJECT_CATALOG.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="building-ui-object-group">
                  <span className="building-ui-label">Basic Objects:</span>
                  <div className="building-ui-object-buttons">
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
                        className={`building-ui-object-button ${selectedModelObjectId === item.id ? 'active' : ''}`}
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
                        onClick={() => setTileRotation(rotation)}
                        className={`building-ui-size-button ${Math.abs(currentTileRotation - rotation) < 0.0001 ? 'active' : ''}`}
                      >
                        {index * 90}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="building-ui-custom-settings">
                  <div className="building-ui-input-group">
                    <span className="building-ui-label">GLB URL:</span>
                    <input
                      type="text"
                      value={currentModelUrl}
                      onChange={(e) => {
                        setSelectedPlacedObjectType('model');
                        setModelUrl(e.target.value);
                      }}
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

                <div className="building-ui-info">
                  <p>Type: {selectedPlacedObjectType === 'model' ? selectedModelObject?.label : 'None'}</p>
                  <p>Fallback: {selectedModelObject?.fallbackKind ?? 'generic'}</p>
                  <p>GLB URL이 비어 있으면 기본 프리미티브로 표시됩니다.</p>
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
            
            {editMode === 'npc' && (
              <>
                <div className="building-ui-category-group">
                  <span className="building-ui-label">캐릭터:</span>
                  <select 
                    value={selectedNPCTemplateId || ''} 
                    onChange={(e) => setSelectedNPCTemplate(e.target.value)}
                    className="building-ui-select"
                  >
                    {npcTemplatesArray.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">옷:</span>
                  <div className="building-ui-clothing-buttons">
                    {['rabbit-outfit', 'basic-suit', 'formal-suit'].map(clothingId => {
                      const clothing = useNPCStore.getState().clothingSets.get(clothingId);
                      return clothing ? (
                        <button
                          key={clothing.id}
                          onClick={() => useNPCStore.getState().setSelectedClothingSet(clothing.id)}
                          className={`building-ui-clothing-button ${useNPCStore.getState().selectedClothingSetId === clothing.id ? 'active' : ''}`}
                        >
                          {clothing.name}
                        </button>
                      ) : null;
                    })}
                    <button
                      onClick={() => useNPCStore.getState().setSelectedClothingSet('')}
                      className={`building-ui-clothing-button ${!useNPCStore.getState().selectedClothingSetId ? 'active' : ''}`}
                    >
                      없음
                    </button>
                  </div>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">모자:</span>
                  <div className="building-ui-clothing-buttons">
                    {['hat-set-a', 'hat-set-b', 'hat-set-c'].map(hatId => {
                      const hat = useNPCStore.getState().clothingSets.get(hatId);
                      return hat ? (
                        <button
                          key={hat.id}
                          onClick={() => {
                            useNPCStore.getState().setPreviewAccessory('hat', hat.id);
                            const instanceId = useNPCStore.getState().selectedInstanceId;
                            const part = hat.parts[0];
                            if (instanceId && part) {
                              useNPCStore.getState().updateInstancePart(instanceId, part.id, part);
                            }
                          }}
                          className={`building-ui-clothing-button ${useNPCStore.getState().previewAccessories.hat === hat.id ? 'active' : ''}`}
                        >
                          {hat.name}
                        </button>
                      ) : null;
                    })}
                    <button
                      onClick={() => useNPCStore.getState().setPreviewAccessory('hat', '')}
                      className={`building-ui-clothing-button ${!useNPCStore.getState().previewAccessories.hat ? 'active' : ''}`}
                    >
                      없음
                    </button>
                  </div>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">안경:</span>
                  <div className="building-ui-clothing-buttons">
                    {['glasses-set-a', 'glasses-set-b'].map(glassesId => {
                      const glasses = useNPCStore.getState().clothingSets.get(glassesId);
                      return glasses ? (
                        <button
                          key={glasses.id}
                          onClick={() => useNPCStore.getState().setPreviewAccessory('glasses', glasses.id)}
                          className={`building-ui-clothing-button ${useNPCStore.getState().previewAccessories.glasses === glasses.id ? 'active' : ''}`}
                        >
                          {glasses.name}
                        </button>
                      ) : null;
                    })}
                    <button
                      onClick={() => useNPCStore.getState().setPreviewAccessory('glasses', '')}
                      className={`building-ui-clothing-button ${!useNPCStore.getState().previewAccessories.glasses ? 'active' : ''}`}
                    >
                      없음
                    </button>
                  </div>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Selected Instance:</span>
                  <span className="building-ui-info-value">{selectedNPCInstanceId || 'None'}</span>
                </div>
                
                {selectedNPCTemplateId && npcTemplates.get(selectedNPCTemplateId) && (
                  <div className="building-ui-info">
                    <p>현재 선택: {npcTemplates.get(selectedNPCTemplateId)?.name}</p>
                    <p>클릭하여 NPC 배치</p>
                    <p>배치된 NPC를 클릭하여 선택</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
} 
