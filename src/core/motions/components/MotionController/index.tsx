import React, { useState } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { MotionControllerProps } from './types';
import './styles.css';

const MOTION_PRESETS = [
  { id: 'slow', name: '느림', maxSpeed: 5, acceleration: 8, icon: '🐌' },
  { id: 'normal', name: '보통', maxSpeed: 10, acceleration: 15, icon: '🚶' },
  { id: 'fast', name: '빠름', maxSpeed: 20, acceleration: 25, icon: '🏃' },
  { id: 'sprint', name: '전력질주', maxSpeed: 35, acceleration: 40, icon: '💨' }
];

const VEHICLE_PRESETS = [
  { id: 'eco', name: '에코', maxSpeed: 15, acceleration: 10, icon: '🌱' },
  { id: 'comfort', name: '컴포트', maxSpeed: 25, acceleration: 20, icon: '🚗' },
  { id: 'sport', name: '스포츠', maxSpeed: 40, acceleration: 35, icon: '🏎️' },
  { id: 'turbo', name: '터보', maxSpeed: 60, acceleration: 50, icon: '🚀' }
];

export function MotionController({
  position = 'bottom-right',
  showLabels = true,
  compact = false
}: MotionControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('normal');
  
  const { mode, motion, setCurrentPreset, setMotionType } = useGaesupStore();
  const currentType = motion?.motionType || mode?.type || 'character';

  const presets = currentType === 'vehicle' ? VEHICLE_PRESETS : MOTION_PRESETS;

  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId);
    setCurrentPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      console.log(`Motion preset changed to: ${preset.name}`, preset);
    }
  };

  if (!isOpen) {
    return (
      <div className={`motion-controller-toggle motion-controller-toggle--${position}`}>
        <button
          className="motion-controller-toggle__button"
          onClick={() => setIsOpen(true)}
          title="모션 컨트롤러"
        >
          🎮
        </button>
      </div>
    );
  }

  return (
    <div className={`motion-controller motion-controller--${position} ${compact ? 'motion-controller--compact' : ''}`}>
      <div className="motion-controller__header">
        {showLabels && <span className="motion-controller__title">모션 설정</span>}
        <button
          className="motion-controller__close"
          onClick={() => setIsOpen(false)}
          title="닫기"
        >
          ✕
        </button>
      </div>
      
      <div className="motion-controller__current">
        <span className="motion-controller__current-label">현재 모드:</span>
        <span className="motion-controller__current-value">{currentType}</span>
      </div>

      <div className="motion-controller__presets">
        <div className="motion-controller__presets-label">프리셋:</div>
        <div className="motion-controller__presets-grid">
          {presets.map((preset) => (
            <button
              key={preset.id}
              className={`motion-controller__preset ${
                preset.id === activePreset ? 'motion-controller__preset--active' : ''
              }`}
              onClick={() => handlePresetChange(preset.id)}
              title={`${preset.name} (속도: ${preset.maxSpeed}, 가속: ${preset.acceleration})`}
            >
              <span className="motion-controller__preset-icon">{preset.icon}</span>
              {showLabels && !compact && (
                <span className="motion-controller__preset-label">{preset.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="motion-controller__info">
        <div className="motion-controller__info-item">
          <span>타입:</span>
          <span>{currentType}</span>
        </div>
        <div className="motion-controller__info-item">
          <span>프리셋:</span>
          <span>{presets.find(p => p.id === activePreset)?.name || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
}
