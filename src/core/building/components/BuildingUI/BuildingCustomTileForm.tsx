import type { BuildingUIState } from './useBuildingUIState';
import { createBuildingScopeId } from '../../id';
import { useBuildingStore } from '../../stores/buildingStore';

/** The custom floor form: name, color and texture. */
export function BuildingCustomTileForm({ ui }: { ui: BuildingUIState }) {
  const { tileCategories, selectedTileCategoryId, selectedTileGroupId, selectedTileId, setCurrentTileMaterialId, tileGroups, addMesh, updateTile, addTileGroup, buildingStore, showCustomSettings, customName, setCustomName, customColor, setCustomColor, customTexture, setCustomTexture, upsertCustomMesh } = ui;
  return (
    <>
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
                        createBuildingScopeId('custom-placement-tile-mesh'),
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
                const newId = createBuildingScopeId('custom-tile');
                const newMeshId = createBuildingScopeId('custom-floor-mesh');

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

                buildingStore.setState({ selectedTileGroupId: newId });
                setCustomName('');
              }
            }}
            className="building-ui-create-button"
          >
            새 유형 만들기
          </button>
        </div>
      )}
    </>
  );
}
