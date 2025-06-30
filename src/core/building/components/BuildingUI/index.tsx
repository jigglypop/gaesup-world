import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { useAuthStore } from '../../../../admin/store/authStore';
import { TILE_CONSTANTS } from '../../types/constants';
import './styles.css';

export function BuildingUI() {
  const { 
    setEditMode, 
    editMode, 
    isInEditMode, 
    currentTileMultiplier, 
    setTileMultiplier,
    currentWallRotation,
    setWallRotation,
    wallCategories,
    tileCategories,
    selectedWallCategoryId,
    selectedTileCategoryId,
    selectedWallGroupId,
    selectedTileGroupId,
    setSelectedWallCategory,
    setSelectedTileCategory,
    wallGroups,
    tileGroups,
    meshes,
    updateMesh,
    addMesh,
    addWallGroup,
    addTileGroup
  } = useBuildingStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isEditing = isInEditMode();
  
  const [showCustomSettings, setShowCustomSettings] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customColor, setCustomColor] = React.useState('#808080');
  const [customTexture, setCustomTexture] = React.useState('');
  
  React.useEffect(() => {
    if (editMode === 'wall' && selectedWallGroupId) {
      const wallGroup = wallGroups.get(selectedWallGroupId);
      if (wallGroup && wallGroup.frontMeshId) {
        const mesh = meshes.get(wallGroup.frontMeshId);
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
  }, [editMode, selectedWallGroupId, selectedTileGroupId, wallGroups, tileGroups, meshes]);
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <>
      {isEditing && (
        <div className="building-edit-mode-overlay" />
      )}
      
      <div className="building-ui-container">
        {!isEditing ? (
          <button 
            onClick={() => setEditMode('wall')} 
            className="building-ui-toggle"
          >
            Building Editor
          </button>
        ) : (
          <div className="building-ui-panel">
            <div className="building-ui-header">
              <span className="building-ui-title">Building Mode</span>
              <button 
                onClick={() => setEditMode('none')}
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
                    {Array.from(tileCategories.values()).map(category => (
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
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
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
                            updateMesh(tileGroup.floorMeshId, {
                              color: customColor,
                              mapTextureUrl: customTexture || undefined
                            });
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
                            mapTextureUrl: customTexture || undefined,
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
                <div className="building-ui-info">
                  <p>Category: {tileCategories.get(selectedTileCategoryId || '')?.name}</p>
                  <p>Type: {tileGroups.get(selectedTileGroupId || '')?.name}</p>
                  <p>Size: {currentTileMultiplier}x{currentTileMultiplier} ({currentTileMultiplier * 4}m)</p>
                  <p>Click to place tiles</p>
                  <p>Red = Occupied, Green = Available</p>
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
                    {Array.from(wallCategories.values()).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="building-ui-category-group">
                  <span className="building-ui-label">Type:</span>
                  <select 
                    value={selectedWallGroupId || ''} 
                    onChange={(e) => useBuildingStore.setState({ selectedWallGroupId: e.target.value })}
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
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
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
                          const wallGroup = wallGroups.get(selectedWallGroupId);
                          if (wallGroup && wallGroup.frontMeshId) {
                            updateMesh(wallGroup.frontMeshId, {
                              color: customColor,
                              mapTextureUrl: customTexture || undefined
                            });
                            // Update back and side meshes too
                            if (wallGroup.backMeshId) {
                              updateMesh(wallGroup.backMeshId, {
                                color: customColor,
                                mapTextureUrl: customTexture || undefined
                              });
                            }
                            if (wallGroup.sideMeshId) {
                              updateMesh(wallGroup.sideMeshId, {
                                color: customColor,
                                mapTextureUrl: customTexture || undefined
                              });
                            }
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
                          const newId = `custom-wall-${Date.now()}`;
                          const newMeshId = `custom-mesh-${Date.now()}`;
                          
                          // Create new mesh
                          addMesh({
                            id: newMeshId,
                            color: customColor,
                            material: 'STANDARD',
                            mapTextureUrl: customTexture || undefined,
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
                  <p>Red = Occupied, Green = Available</p>
                  <p>Click red boxes to delete</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
} 