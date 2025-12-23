import React, { useState, useEffect, useCallback } from 'react';

import { useGaesupStore } from '../../../stores/gaesupStore';
import type { CameraOptionType } from '../../core/types';
import './styles.css';
import { CameraPreset } from './types';

const DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional third-person view.',
    icon: 'camera',
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
    icon: 'camera',
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
    icon: 'camera',
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
    icon: 'camera',
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
    icon: 'camera',
    config: {
      mode: 'sideScroll',
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];

function compareDistance(a: { x: number; y: number; z: number } | undefined, b: { x: number; y: number; z: number } | undefined): boolean {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function getOptionDistance(option: CameraOptionType | undefined) {
  const x = option?.xDistance;
  const y = option?.yDistance;
  const z = option?.zDistance;
  if (x === undefined || y === undefined || z === undefined) return undefined;
  return { x, y, z };
}

export function CameraPresets() {
  const [presets] = useState<CameraPreset[]>(DEFAULT_PRESETS);
  const setMode = useGaesupStore((state) => state.setMode);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const mode = useGaesupStore((state) => state.mode);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
  
  const applyPreset = useCallback((preset: CameraPreset) => {
    setMode({ control: preset.config.mode });
    setCameraOption({
      xDistance: preset.config.distance.x,
      yDistance: preset.config.distance.y,
      zDistance: preset.config.distance.z,
      fov: preset.config.fov,
      smoothing: preset.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 },
    });
  }, [setMode, setCameraOption, cameraOption]);

  useEffect(() => {
    const foundPreset = presets.find(p => 
      p.config.mode === mode?.control &&
      compareDistance(p.config.distance, getOptionDistance(cameraOption))
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
