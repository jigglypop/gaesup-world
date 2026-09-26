import { BuildingCustomWallForm } from './BuildingCustomWallForm';
import type { BuildingUIState } from './useBuildingUIState';

/** Wall mode: presets, categories, kinds, rotation and custom walls. */
export function BuildingWallSection({ ui }: { ui: BuildingUIState }) {
  const { editMode, currentWallRotation, setWallRotation, wallCategories, selectedWallCategoryId, selectedWallGroupId, selectedWallId, setSelectedWallCategory, wallGroups, moveWallToGroup, buildingStore, showCustomSettings, wallCategoriesArray, selectedWallTypeGroupId, handleToggleCustomSettings } = ui;
  return (
    <>
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
                buildingStore.setState({ selectedWallGroupId: nextGroupId });
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

          <BuildingCustomWallForm ui={ui} />

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
    </>
  );
}
