import { useEffect, useState } from 'react';
import { useGaesupStore } from '../../../../src/gaesup';
import { useFocus } from '../../hooks/useFocus';
import './style.css';

interface FocusedObject {
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  type: string;
  description: string;
  properties: Record<string, string>;
}

interface ObjectInfoPanelProps {
  focusedObject: FocusedObject | null;
  onClose: () => void;
}

export function ObjectInfoPanel({ focusedObject, onClose }: ObjectInfoPanelProps) {
  const { focusOff } = useFocus();
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (focusedObject) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [focusedObject]);
  const handleClose = async () => {
    setIsVisible(false);
    await focusOff({ zoom: 1 });
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`object-info-panel ${isVisible ? 'visible' : ''}`}>
      {focusedObject && (
        <>
          <div className="panel-header">
            <div className="header-content">
              <div className="object-icon" style={{ backgroundColor: focusedObject.color }}></div>
              <div className="title-section">
                <h2>{focusedObject.name}</h2>
                <span className="object-type">{focusedObject.type}</span>
              </div>
            </div>
            <button className="close-button" onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className="panel-content">
            <div className="description-section">
              <h3>📖 설명</h3>
              <p className="description-text">{focusedObject.description}</p>
            </div>

            <div className="properties-section">
              <h3>🔍 속성</h3>
              <div className="properties-list">
                {Object.entries(focusedObject.properties).map(([key, value]) => (
                  <div key={key} className="property-item">
                    <span className="property-key">{key}</span>
                    <span className="property-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="location-section">
              <h3>📍 위치</h3>
              <div className="location-coords">
                <div className="coord-item">
                  <span className="coord-label">X</span>
                  <span className="coord-value">{focusedObject.position.x.toFixed(1)}</span>
                </div>
                <div className="coord-item">
                  <span className="coord-label">Y</span>
                  <span className="coord-value">{focusedObject.position.y.toFixed(1)}</span>
                </div>
                <div className="coord-item">
                  <span className="coord-label">Z</span>
                  <span className="coord-value">{focusedObject.position.z.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="camera-section">
              <h3>📷 카메라</h3>
              <div className="camera-status">
                <div className="status-item">
                  <span className="status-label">포커스:</span>
                  <span className={`status-value ${cameraOption.focus ? 'active' : 'inactive'}`}>
                    {cameraOption.focus ? '🎯 활성' : '❌ 비활성'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">줌:</span>
                  <span className="status-value">{(cameraOption.zoom || 1).toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-footer">
            <button className="return-button" onClick={handleClose}>
              🏃 캐릭터로 돌아가기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
