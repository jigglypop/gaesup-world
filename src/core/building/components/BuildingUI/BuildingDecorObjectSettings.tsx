import type { BuildingUIState } from './useBuildingUIState';
import { BUILDING_FLAG_STYLE_OPTIONS, BUILDING_TREE_OPTIONS } from '../../types';

/** Tree, flag and fire settings. */
export function BuildingDecorObjectSettings({ ui }: { ui: BuildingUIState }) {
  const { selectedPlacedObjectType, currentObjectPrimaryColor, setObjectPrimaryColor, currentObjectSecondaryColor, setObjectSecondaryColor, currentTreeKind, setTreeKind, currentFlagWidth, setFlagWidth, currentFlagHeight, setFlagHeight, currentFlagImageUrl, setFlagImageUrl, currentFlagStyle, setFlagStyle, currentFireIntensity, setFireIntensity, currentFireWidth, setFireWidth, currentFireHeight, setFireHeight, currentFireColor, setFireColor } = ui;
  return (
    <>
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
    </>
  );
}
