import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useFocusable } from '../../context/FocusContext';
import { cameraOptionAtom } from '../../../../src/gaesup/atoms';
import './style.css';

interface FocusedObject {
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  type: string;
}

interface FocusModalProps {
  focusedObject: FocusedObject | null;
  onClose: () => void;
}

export function FocusModal({ focusedObject, onClose }: FocusModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (focusedObject) {
      setIsVisible(true);
    }
  }, [focusedObject]);

  const handleClose = async () => {
    setIsVisible(false);
    // 애니메이션 완료 후 onClose 호출
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!focusedObject) return null;

  return (
    <>
      {/* 백드롭 */}
      <div className={`focus-modal-backdrop ${isVisible ? 'visible' : ''}`} onClick={handleClose} />

      {/* 모달 */}
      <div className={`focus-modal ${isVisible ? 'visible' : ''}`}>
        <div className="focus-modal-header">
          <h2>{focusedObject.name}</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="focus-modal-content">
          <div className="object-info">
            <div className="info-row">
              <span className="label">타입:</span>
              <span className="value">{focusedObject.type}</span>
            </div>
            <div className="info-row">
              <span className="label">위치:</span>
              <span className="value">
                X: {focusedObject.position.x.toFixed(1)}, Y: {focusedObject.position.y.toFixed(1)},
                Z: {focusedObject.position.z.toFixed(1)}
              </span>
            </div>
            <div className="info-row">
              <span className="label">색상:</span>
              <div
                className="color-indicator"
                style={{ backgroundColor: focusedObject.color }}
              ></div>
              <span className="value">{focusedObject.color}</span>
            </div>
          </div>

          <div className="camera-info">
            <h3>카메라 상태</h3>
            <div className="info-row">
              <span className="label">포커스:</span>
              <span className="value">{cameraOption.focus ? '활성' : '비활성'}</span>
            </div>
            <div className="info-row">
              <span className="label">FOV:</span>
              <span className="value">{cameraOption.fov}°</span>
            </div>
          </div>
        </div>

        <div className="focus-modal-footer">
          <button className="zoom-out-button" onClick={handleClose}>
            줌아웃하고 닫기
          </button>
        </div>
      </div>
    </>
  );
}
