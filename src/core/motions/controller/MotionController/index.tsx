import React, { useCallback, useState } from 'react';

import type { MotionControllerProps } from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';

const MOTION_PRESETS = [
  { id: 'slow', name: '느리게', maxSpeed: 5, acceleration: 8 },
  { id: 'normal', name: '보통', maxSpeed: 10, acceleration: 15 },
  { id: 'fast', name: '빠르게', maxSpeed: 20, acceleration: 25 },
  { id: 'sprint', name: '전력 질주', maxSpeed: 35, acceleration: 40 },
];

const VEHICLE_PRESETS = [
  { id: 'eco', name: '절약', maxSpeed: 15, acceleration: 10 },
  { id: 'comfort', name: '편안하게', maxSpeed: 25, acceleration: 20 },
  { id: 'sport', name: '스포츠', maxSpeed: 40, acceleration: 35 },
  { id: 'turbo', name: '터보', maxSpeed: 60, acceleration: 50 },
];

function getPanelStyle(
  position: MotionControllerProps['position'] | undefined,
  zIndex: number | undefined,
) {
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
  const modeType = useGaesupStore((state) => state.mode.type);
  const setMode = useGaesupStore((state) => state.setMode);
  const setPhysics = useGaesupStore((state) => state.setPhysics);

  const currentType: 'character' | 'vehicle' = modeType === 'vehicle' ? 'vehicle' : 'character';
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

  const handlePresetChange = useCallback(
    (presetId: string) => {
      setActivePresetId(presetId);
      applyPreset(currentType, presetId);
      props.onPresetChange?.(presetId);
    },
    [applyPreset, currentType, props],
  );

  const handleMotionTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as 'character' | 'vehicle';
      setMode({ type: newType });
      const defaultPreset = newType === 'vehicle' ? 'comfort' : 'normal';
      setActivePresetId(defaultPreset);
      applyPreset(newType, defaultPreset);
      props.onPresetChange?.(defaultPreset);
    },
    [applyPreset, setMode, props],
  );

  return (
    <div className={`mc-panel ${props.compact ? 'compact' : ''}`} style={panelStyle}>
      <div className="mc-setting-row">
        <label htmlFor="motion-type-select" className="mc-label">
          이동 유형
        </label>
        <select
          id="motion-type-select"
          className="mc-select"
          value={currentType}
          onChange={handleMotionTypeChange}
        >
          <option value="character">캐릭터</option>
          <option value="vehicle">차량</option>
        </select>
      </div>

      <div className="mc-setting-row">
        <label className="mc-label">프리셋</label>
        <div className="mc-presets-grid">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={preset.id === activePresetId}
              className={`mc-preset-btn ${preset.id === activePresetId ? 'active' : ''}`}
              onClick={() => handlePresetChange(preset.id)}
              title={`최대 속도: ${preset.maxSpeed}, 가속: ${preset.acceleration}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
