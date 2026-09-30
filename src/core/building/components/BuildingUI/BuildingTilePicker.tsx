import type { BuildingUIState } from './useBuildingUIState';
import { BUILDING_WALL_KIND_OPTIONS, BUILDING_WALL_PRESETS } from '../../types';

/** Tile categories, groups, presets and the custom floor toggle. */
export function BuildingTilePicker({ ui }: { ui: BuildingUIState }) {
  const { currentWallKind, setWallKind, applyWallPreset, tileCategories, selectedTileCategoryId, selectedWallGroupId, selectedTileGroupId, selectedWallId, setSelectedTileCategory, tileGroups, updateWall, buildingStore, showCustomSettings, tileCategoriesArray, selectedWallGroup, selectedWall, handleToggleCustomSettings } = ui;
  return (
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
            buildingStore.setState({ selectedTileGroupId: e.target.value })
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
    </>
  );
}
