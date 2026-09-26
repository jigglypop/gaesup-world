import { BuildingBillboardSettings } from './BuildingBillboardSettings';
import { BuildingDecorObjectSettings } from './BuildingDecorObjectSettings';
import { BuildingObjectTypePicker } from './BuildingObjectTypePicker';
import type { BuildingUIState } from './useBuildingUIState';

/** Object mode: the placed object type and its settings. */
export function BuildingObjectSection({ ui }: { ui: BuildingUIState }) {
  const { editMode, selectedPlacedObjectType, currentModelUrl, setModelUrl, currentModelScale, setModelScale, currentModelColor, setModelColor, selectedModelObject } = ui;
  return (
    <>
      {editMode === 'object' && (
        <>
          <BuildingObjectTypePicker ui={ui} />

          <BuildingDecorObjectSettings ui={ui} />

          <BuildingBillboardSettings ui={ui} />

          {selectedPlacedObjectType === 'model' && (
            <div className="building-ui-custom-settings">
              <div className="building-ui-input-group">
                <span className="building-ui-label">GLB 파일 주소:</span>
                <input
                  type="text"
                  value={currentModelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                  placeholder="gltf/props/door.glb"
                  className="building-ui-input"
                />
              </div>

              <div className="building-ui-input-group">
                <span className="building-ui-label">배율:</span>
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
                <span className="building-ui-label">색상:</span>
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
          )}

          <div className="building-ui-info">
            <p>
              유형:{' '}
              {selectedPlacedObjectType === 'model'
                ? selectedModelObject?.label
                : selectedPlacedObjectType}
            </p>
            {selectedPlacedObjectType === 'model' && (
              <>
                <p>대체 표시: {selectedModelObject?.fallbackKind ?? 'generic'}</p>
                <p>GLB URL이 비어 있으면 기본 프리미티브로 표시됩니다.</p>
              </>
            )}
            <p>클릭하여 소품을 배치하세요</p>
          </div>
        </>
      )}
    </>
  );
}
