import type { BuildingUIState } from './useBuildingUIState';
import { createBuildingScopeId } from '../../id';
import { useBuildingStore } from '../../stores/buildingStore';

/** The custom wall form: name, color and texture. */
export function BuildingCustomWallForm({ ui }: { ui: BuildingUIState }) {
  const { wallCategories, selectedWallCategoryId, selectedWallGroupId, selectedWallId, setCurrentWallMaterialId, wallGroups, addMesh, updateWall, addWallGroup, buildingStore, showCustomSettings, customName, setCustomName, customColor, setCustomColor, customTexture, setCustomTexture, upsertCustomMesh, findWallGroupByWallId } = ui;
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
                    : createBuildingScopeId('custom-placement-wall-mesh'),
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
                const newId = createBuildingScopeId('custom-wall');
                const newMeshId = createBuildingScopeId('custom-mesh');

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

                buildingStore.setState({ selectedWallGroupId: newId });
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
