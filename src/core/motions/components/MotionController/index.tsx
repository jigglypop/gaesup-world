import React from 'react';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';

const MOTION_PRESETS = [
  { id: 'slow', name: 'Slow', maxSpeed: 5, acceleration: 8 },
  { id: 'normal', name: 'Normal', maxSpeed: 10, acceleration: 15 },
  { id: 'fast', name: 'Fast', maxSpeed: 20, acceleration: 25 },
  { id: 'sprint', name: 'Sprint', maxSpeed: 35, acceleration: 40 }
];

const VEHICLE_PRESETS = [
  { id: 'eco', name: 'Eco', maxSpeed: 15, acceleration: 10 },
  { id: 'comfort', name: 'Comfort', maxSpeed: 25, acceleration: 20 },
  { id: 'sport', name: 'Sport', maxSpeed: 40, acceleration: 35 },
  { id: 'turbo', name: 'Turbo', maxSpeed: 60, acceleration: 50 }
];

export function MotionController() {
  const { mode, motion, setCurrentPreset, setMotionType } = useGaesupStore();
  
  // Determine current motion type and active preset from the store
  const currentType = motion?.motionType || mode?.type || 'character';
  const activePresetId = motion?.currentPreset || 'normal';
  
  const presets = currentType === 'vehicle' ? VEHICLE_PRESETS : MOTION_PRESETS;

  const handlePresetChange = (presetId: string) => {
    setCurrentPreset(presetId);
  };
  
  const handleMotionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'character' | 'vehicle';
    setMotionType(newType);
    // Set a default preset for the new type
    const defaultPreset = newType === 'vehicle' ? 'comfort' : 'normal';
    setCurrentPreset(defaultPreset);
  }

  return (
    <div className="mc-panel">
      <div className="mc-setting-row">
        <label htmlFor="motion-type-select" className="mc-label">Motion Type</label>
        <select 
          id="motion-type-select"
          className="mc-select"
          value={currentType}
          onChange={handleMotionTypeChange}
        >
          <option value="character">Character</option>
          <option value="vehicle">Vehicle</option>
        </select>
      </div>

      <div className="mc-setting-row">
        <label className="mc-label">Presets</label>
        <div className="mc-presets-grid">
          {presets.map((preset) => (
            <button
              key={preset.id}
              className={`mc-preset-btn ${preset.id === activePresetId ? 'active' : ''}`}
              onClick={() => handlePresetChange(preset.id)}
              title={`Max Speed: ${preset.maxSpeed}, Accel: ${preset.acceleration}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
