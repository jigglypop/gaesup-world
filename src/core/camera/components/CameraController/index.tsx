import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { CameraType } from '../core/types';
import './styles.css';
import { CameraControllerProps, CameraModeConfig } from './types';

const CAMERA_MODES: Array<CameraModeConfig> = [
  { value: 'thirdPerson', label: '3인칭', icon: '👁️' },
  { value: 'firstPerson', label: '1인칭', icon: '🎯' },
  { value: 'chase', label: '추적', icon: '🚗' },
  { value: 'topDown', label: '탑다운', icon: '⬇️' },
  { value: 'isometric', label: '등각', icon: '📐' },
  { value: 'side', label: '횡스크롤', icon: '➡️' },
  { value: 'fixed', label: '고정', icon: '📍' },
];

export function CameraController({ 
  position = 'top-right', 
  showLabels = true,
  compact = false
}: CameraControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    mode, 
    setMode,
    cameraOption,
    setCameraOption 
  } = useGaesupStore();

  const handleModeChange = (type: CameraType) => {
    setMode({ control: type });
    
    const defaultOptions = {
      thirdPerson: { distance: { x: 0, y: 8, z: 10 }, fov: 75 },
      firstPerson: { distance: { x: 0, y: 2.5, z: 0 }, fov: 75 },
      chase: { distance: { x: 0, y: 6, z: 8 }, fov: 75 },
      topDown: { distance: { x: 0, y: 20, z: 0 }, fov: 45 },
      isometric: { distance: { x: 10, y: 15, z: 10 }, fov: 50 },
      side: { distance: { x: 10, y: 3, z: 0 }, fov: 75 },
      fixed: { distance: { x: 0, y: 8, z: 10 }, fov: 75 },
    };
    
    setCameraOption({
      ...cameraOption,
      ...defaultOptions[type]
    });
  };

  return (
    <div className={`camera-controller camera-controller--${position} ${compact ? 'camera-controller--compact' : ''}`}>
      <div className="camera-controller__header">
        {showLabels && <span className="camera-controller__title">카메라</span>}
      </div>
      
      <div className="camera-controller__grid">
        {CAMERA_MODES.map((cameraMode) => (
          <button
            key={cameraMode.value}
            className={`camera-controller__button ${
              cameraMode.value === mode?.control ? 'camera-controller__button--active' : ''
            }`}
            onClick={() => handleModeChange(cameraMode.value)}
            title={cameraMode.label}
          >
            <span className="camera-controller__icon">{cameraMode.icon}</span>
            {showLabels && !compact && (
              <span className="camera-controller__label">{cameraMode.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
