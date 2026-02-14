import React, { useCallback, useState } from 'react';

import type { MotionControllerProps } from './types';
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

function getPanelStyle(position: MotionControllerProps['position'] | undefined, zIndex: number | undefined) {
  const pos = position ?? 'bottom-left';
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: zIndex ?? 10000,
  };
  if (pos.includes('top')) style.top = 12;
  if (pos.includes('bottom')) style.bottom = 12;
  if (pos.includes('left')) style.left = 12;
  if (pos.includes('right')) style.right = 12;
  return style;
}

export function MotionController(props: MotionControllerProps) {
  const panelStyle = getPanelStyle(props.position, props.zIndex);
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);
  const setPhysics = useGaesupStore((state) => state.setPhysics);
  
  const currentType: 'character' | 'vehicle' = mode?.type === 'vehicle' ? 'vehicle' : 'character';
  const presets = currentType === 'vehicle' ? VEHICLE_PRESETS : MOTION_PRESETS;
  const [activePresetId, setActivePresetId] = useState<string>(
    currentType === 'vehicle' ? 'comfort' : 'normal',
  );

  const applyPreset = useCallback(
    (motionType: 'character' | 'vehicle', presetId: string) => {
      const list = motionType === 'vehicle' ? VEHICLE_PRESETS : MOTION_PRESETS;
      const preset = list.find((p) => p.id === presetId);
      if (!preset) return;

      if (motionType === 'vehicle') {
        setPhysics({ maxSpeed: preset.maxSpeed, accelRatio: preset.acceleration });
        return;
      }

      setPhysics({
        walkSpeed: Math.max(1, preset.maxSpeed * 0.5),
        runSpeed: preset.maxSpeed,
        accelRatio: preset.acceleration,
      });
    },
    [setPhysics],
  );

  const handlePresetChange = useCallback((presetId: string) => {
    setActivePresetId(presetId);
    applyPreset(currentType, presetId);
    props.onPresetChange?.(presetId);
  }, [applyPreset, currentType, props]);
  
  const handleMotionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'character' | 'vehicle';
    setMode({ type: newType });
    const defaultPreset = newType === 'vehicle' ? 'comfort' : 'normal';
    setActivePresetId(defaultPreset);
    applyPreset(newType, defaultPreset);
    props.onPresetChange?.(defaultPreset);
  }, [applyPreset, setMode, props]);

  return (
    <div className={`mc-panel ${props.compact ? 'compact' : ''}`} style={panelStyle}>
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
