import React, { useState, useEffect } from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { CameraOptionType } from '../core/types';
import './styles.css';
import { CameraPreset } from './types';

const DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional third-person view.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Smooth, movie-like camera work.',
    config: {
      mode: 'chase',
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 }
    }
  },
  {
    id: 'action',
    name: 'Action',
    description: 'Responsive camera for fast gameplay.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 }
    }
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Top-down view for an overview.',
    config: {
      mode: 'topDown',
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Classic side-scroller style.',
    config: {
      mode: 'side',
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];

export function CameraPresets() {
  const [presets] = useState<CameraPreset[]>(DEFAULT_PRESETS);
  const { 
    setMode,
    setCameraOption,
    mode,
    cameraOption 
  } = useGaesupStore();
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
  
  const applyPreset = (preset: CameraPreset) => {
    setMode({ control: preset.config.mode });
    const newOptions: CameraOptionType = {
      ...cameraOption,
      distance: preset.config.distance,
      fov: preset.config.fov,
      smoothing: preset.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    };
    setCameraOption(newOptions);
  };

  useEffect(() => {
    const foundPreset = presets.find(p => 
      p.config.mode === mode?.control &&
      JSON.stringify(p.config.distance) === JSON.stringify(cameraOption?.distance)
    );
    setCurrentPresetId(foundPreset ? foundPreset.id : null);
  }, [mode, cameraOption, presets]);

  return (
    <div className="cp-panel">
      <div className="cp-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className={`cp-item ${currentPresetId === preset.id ? 'active' : ''}`}
            onClick={() => applyPreset(preset)}
          >
            <div className="cp-name">{preset.name}</div>
            <div className="cp-description">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
