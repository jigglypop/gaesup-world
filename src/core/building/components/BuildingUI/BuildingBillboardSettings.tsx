import type { BuildingUIState } from './useBuildingUIState';

/** Billboard text, image, color and layout settings. */
export function BuildingBillboardSettings({ ui }: { ui: BuildingUIState }) {
  const { selectedPlacedObjectType, currentBillboardText, setBillboardText, currentBillboardImageUrl, setBillboardImageUrl, currentBillboardColor, setBillboardColor, currentBillboardWidth, setBillboardWidth, currentBillboardHeight, setBillboardHeight, currentBillboardScale, setBillboardScale, currentBillboardOffsetY, setBillboardOffsetY, currentBillboardElevation, setBillboardElevation, currentBillboardIntensity, setBillboardIntensity } = ui;
  return (
    <>
      {selectedPlacedObjectType === 'billboard' && (
        <div className="building-ui-custom-settings">
          <div className="building-ui-size-group">
            <span className="building-ui-label">안내판 크기:</span>
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
            <span className="building-ui-label">안내판 높이:</span>
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
            <span className="building-ui-label">문구:</span>
            <input
              type="text"
              value={currentBillboardText}
              onChange={(e) => setBillboardText(e.target.value)}
              className="building-ui-input"
            />
          </div>

          <div className="building-ui-input-group">
            <span className="building-ui-label">이미지 주소:</span>
            <input
              type="text"
              value={currentBillboardImageUrl}
              onChange={(e) => setBillboardImageUrl(e.target.value)}
              placeholder="https://..."
              className="building-ui-input"
            />
          </div>

          <div className="building-ui-input-group">
            <span className="building-ui-label">색상:</span>
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
            <span className="building-ui-label">사용자 지정 크기:</span>
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
            <span className="building-ui-label">사용자 지정 높이:</span>
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
            <span className="building-ui-label">판 너비:</span>
            <input
              type="number"
              min="0"
              max="8"
              step="0.1"
              value={currentBillboardWidth}
              onChange={(e) => setBillboardWidth(Number(e.target.value) || 0)}
              className="building-ui-input"
            />
            <span className="building-ui-help">0: 이미지 비율에 맞춤</span>
          </div>

          <div className="building-ui-input-group">
            <span className="building-ui-label">판 높이:</span>
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
            <span className="building-ui-label">기둥 높이:</span>
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
            <span className="building-ui-label">밝기:</span>
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
    </>
  );
}
