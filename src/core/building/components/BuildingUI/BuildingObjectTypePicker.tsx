import type { BuildingUIState } from './useBuildingUIState';
import { DEFAULT_BUILDING_OBJECT_CATALOG } from '../../catalog';
import { BUILDING_BASIC_OBJECT_OPTIONS } from '../../types';

/** The placed object type and its rotation. */
export function BuildingObjectTypePicker({ ui }: { ui: BuildingUIState }) {
  const { selectedPlacedObjectType, setSelectedPlacedObjectType, currentObjectRotation, setObjectRotation, selectedModelObjectId, setSelectedModelObjectId, setModelUrl, setModelScale, setModelColor } = ui;
  return (
    <>
      <div className="building-ui-object-group">
        <span className="building-ui-label">소품 유형:</span>
        <div className="building-ui-object-buttons">
          {BUILDING_BASIC_OBJECT_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedPlacedObjectType(option.type)}
              className={`building-ui-object-button ${selectedPlacedObjectType === option.type ? 'active' : ''}`}
            >
              {option.labelKo}
            </button>
          ))}
          {DEFAULT_BUILDING_OBJECT_CATALOG.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedPlacedObjectType('model');
                setSelectedModelObjectId(item.id);
                // Placing multiplies the catalog's own scale by this one: 1 is the catalog size.
                setModelScale(1);
                setModelColor(item.defaultColor);
                setModelUrl(item.modelUrl ?? '');
              }}
              className={`building-ui-object-button ${selectedPlacedObjectType === 'model' && selectedModelObjectId === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="building-ui-size-group">
        <span className="building-ui-label">소품 회전:</span>
        <div className="building-ui-size-buttons">
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
            <button
              key={rotation}
              onClick={() => setObjectRotation(rotation)}
              className={`building-ui-size-button ${Math.abs(currentObjectRotation - rotation) < 0.0001 ? 'active' : ''}`}
            >
              {index * 90}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
