import { BuildingObjectSection } from './BuildingObjectSection';
import { BuildingTileSection } from './BuildingTileSection';
import { BuildingWallSection } from './BuildingWallSection';
import type { BuildingUIProps } from './types';
import { useBuildingUIState } from './useBuildingUIState';
import { createBuildingScopeId } from '../../id';
import { BUILDING_WEATHER_EFFECT_OPTIONS, BUILDING_WORLD_SURFACE_OPTIONS } from '../../types';
import './styles.css';

export type { BuildingUINPCPanelContext, BuildingUINPCPanelRenderer, BuildingUIProps } from './types';

export const createCustomMeshId = createBuildingScopeId;

export function BuildingUI({
  onClose,
  canEdit = true,
  npcPanel = false,
  extensionPanel,
}: BuildingUIProps) {
  const ui = useBuildingUIState(onClose, npcPanel);
  const { setEditMode, editMode, currentTileMultiplier, setTileMultiplier, currentTileHeight, setTileHeight, showSnow, setShowSnow, showFog, setShowFog, fogColor, setFogColor, weatherEffect, setWeatherEffect, worldSurface, setWorldSurface, isEditing, hasNPCPanel, handleEditModeClose } = ui;

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

            <BuildingTileSection ui={ui} />

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

            <BuildingObjectSection ui={ui} />

            <BuildingWallSection ui={ui} />

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
