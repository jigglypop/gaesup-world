import React, { useState, useEffect } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { CameraOptionType, CameraType } from '../core/types';
import './styles.css';
import { CameraPreset, CameraPresetsProps } from './types';

const DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: 'classic',
    name: '클래식',
    description: '전통적인 3인칭 뷰',
    icon: '🎮',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: 'cinematic',
    name: '시네마틱',
    description: '영화 같은 카메라 워크',
    icon: '🎬',
    config: {
      mode: 'chase',
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 }
    }
  },
  {
    id: 'action',
    name: '액션',
    description: '빠른 반응 카메라',
    icon: '⚡',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 }
    }
  },
  {
    id: 'strategy',
    name: '전략',
    description: '전체적인 시야 확보',
    icon: '🗺️',
    config: {
      mode: 'topDown',
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: 'retro',
    name: '레트로',
    description: '클래식 게임 스타일',
    icon: '🕹️',
    config: {
      mode: 'side',
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];

export function CameraPresets({ position = 'top-left' }: CameraPresetsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presets] = useState<CameraPreset[]>(DEFAULT_PRESETS);
  
  const { 
    setMode,
    setCameraOption,
    mode,
    cameraOption 
  } = useGaesupStore();

  const applyPreset = (preset: CameraPreset) => {
    setMode({ control: preset.config.mode });
    
    const newOptions: CameraOptionType = {
      ...cameraOption,
      distance: preset.config.distance,
      fov: preset.config.fov,
      smoothing: preset.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    };
    
    setCameraOption(newOptions);
    setCurrentPresetId(preset.id);
    setIsOpen(false);
  };

  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);

  const checkCurrentPreset = () => {
    const foundPreset = presets.find(preset => 
      preset.config.mode === mode?.control &&
      Math.abs(preset.config.distance.x - (cameraOption?.distance?.x || 0)) < 0.1 &&
      Math.abs(preset.config.distance.y - (cameraOption?.distance?.y || 0)) < 0.1 &&
      Math.abs(preset.config.distance.z - (cameraOption?.distance?.z || 0)) < 0.1
    );
    if (foundPreset && currentPresetId !== foundPreset.id) {
      setCurrentPresetId(foundPreset.id);
    }
  };

  useEffect(() => {
    checkCurrentPreset();
  }, [mode, cameraOption]);

  if (!isOpen) {
    return (
      <button 
        className={`camera-presets-toggle camera-presets-toggle--${position}`}
        onClick={() => setIsOpen(true)}
        title="카메라 프리셋"
      >
        🎯
      </button>
    );
  }

  return (
    <div className={`camera-presets camera-presets--${position}`}>
      <div className="camera-presets__header">
        <span className="camera-presets__title">카메라 프리셋</span>
        <button 
          className="camera-presets__close"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="camera-presets__grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className={`camera-presets__item ${
              currentPresetId === preset.id ? 'camera-presets__item--active' : ''
            }`}
            onClick={() => applyPreset(preset)}
          >
            <div className="camera-presets__icon">{preset.icon}</div>
            <div className="camera-presets__content">
              <div className="camera-presets__name">{preset.name}</div>
              <div className="camera-presets__description">{preset.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
