import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { CameraType } from '../core/types';
import './styles.css';

const CAMERA_MODES: Array<{ value: CameraType; label: string }> = [
  { value: 'thirdPerson', label: 'Third Person' },
  { value: 'firstPerson', label: 'First Person' },
  { value: 'chase', label: 'Chase' },
  { value: 'topDown', label: 'Top Down' },
  { value: 'isometric', label: 'Isometric' },
  { value: 'side', label: 'Side-Scroller' },
  { value: 'fixed', label: 'Fixed' },
];

export function CameraController() {
  const { mode, setMode } = useGaesupStore();
  const activeMode = mode?.control || 'thirdPerson';

  return (
    <div className="cc-panel">
      <div className="cc-list">
        {CAMERA_MODES.map((cameraMode) => (
          <button
            key={cameraMode.value}
            className={`cc-button ${activeMode === cameraMode.value ? 'active' : ''}`}
            onClick={() => setMode({ control: cameraMode.value })}
          >
            {cameraMode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
