import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useFocus } from '../../hooks/useFocus';
import { cameraOptionAtom } from '../../atoms';
import './style.css';

interface FocusedObject {
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  type: string;
  description: string;
  properties: Record<string, string>;
}

interface ObjectModalProps {
  focusedObject: FocusedObject | null;
  onClose: () => void;
}

export function ObjectModal({ focusedObject, onClose }: ObjectModalProps) {
  const { focusOff } = useFocus();
  const cameraOption = useAtomValue(cameraOptionAtom);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (focusedObject) {
      setIsVisible(true);
    }
  }, [focusedObject]);

  const handleClose = async () => {
    setIsVisible(false);
    await focusOff({ zoom: 1 });
    // 애니메이션 완료 후 onClose 호출
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!focusedObject) return null;

  return (
    <>
      {/* 백드롭 */}
      <div 
        className={`object-modal-backdrop ${isVisible ? 'visible' : ''}`}
        onClick={handleClose}
      />
      
      {/* 모달 */}
      <div className={`object-modal ${isVisible ? 'visible' : ''}`}>
        <div className="object-modal-header">
          <div className="header-content">
            <div className="object-icon" style={{ backgroundColor: focusedObject.color }}></div>
            <div>
              <h2>{focusedObject.name}</h2>
              <span className="object-type">{focusedObject.type}</span>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="object-modal-content">
          <div className="description-section">
            <h3>📖 설명</h3>
            <p className="description-text">{focusedObject.description}</p>
          </div>
          
          <div className="properties-section">
            <h3>🔍 속성</h3>
            <div className="properties-grid">
              {Object.entries(focusedObject.properties).map(([key, value]) => (
                <div key={key} className="property-item">
                  <span className="property-key">{key}:</span>
                  <span className="property-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="location-section">
            <h3>📍 위치 정보</h3>
            <div className="location-grid">
              <div className="location-item">
                <span className="location-label">X:</span>
                <span className="location-value">{focusedObject.position.x.toFixed(1)}</span>
              </div>
              <div className="location-item">
                <span className="location-label">Y:</span>
                <span className="location-value">{focusedObject.position.y.toFixed(1)}</span>
              </div>
              <div className="location-item">
                <span className="location-label">Z:</span>
                <span className="location-value">{focusedObject.position.z.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="camera-section">
            <h3>📷 카메라 상태</h3>
            <div className="camera-info">
              <div className="info-item">
                <span className="info-label">포커스 모드:</span>
                <span className={`info-value ${cameraOption.focus ? 'active' : 'inactive'}`}>
                  {cameraOption.focus ? '🎯 활성' : '❌ 비활성'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">시야각:</span>
                <span className="info-value">{cameraOption.fov}°</span>
              </div>
              <div className="info-item">
                <span className="info-label">줌 레벨:</span>
                <span className="info-value">{(cameraOption.zoom || 1).toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="object-modal-footer">
          <div className="footer-info">
            <span className="tip">💡 마우스 휠로 줌 조절, 드래그로 회전 가능</span>
          </div>
          <button className="return-button" onClick={handleClose}>
            🏃 캐릭터로 돌아가기
          </button>
        </div>
      </div>
    </>
  );
} 