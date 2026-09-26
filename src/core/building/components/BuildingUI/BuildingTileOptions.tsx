import type { BuildingUIState } from './useBuildingUIState';
import { BUILDING_TILE_PRESETS, BUILDING_TILE_OBJECT_OPTIONS, BUILDING_TILE_SHAPE_OPTIONS } from '../../types';

/** Tile size, height, shape, rotation, terrain object and surface options. */
export function BuildingTileOptions({ ui }: { ui: BuildingUIState }) {
  const { currentTileMultiplier, setTileMultiplier, currentTileHeight, setTileHeight, currentTileShape, setTileShape, currentTileRotation, setTileRotation, tileCategories, selectedTileCategoryId, selectedTileGroupId, tileGroups, selectedTileObjectType, setSelectedTileObjectType, currentCustomTileName, currentCustomTileColor, currentCustomTileTextureUrl, setCustomTileDraft, applyTilePreset, applyCustomTile, selectedTileObjectLabel, selectedTileShapeLabel } = ui;
  return (
    <>
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
  );
}
