import { FC } from 'react';

import { useGaesupStore } from '../../../../stores/gaesupStore';
import { ModeType } from '../../../../stores/types';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

const MODES: { type: ModeType; label: string; description: string }[] = [
  { type: 'character', label: '캐릭터', description: '캐릭터로 걸어 다닙니다' },
  { type: 'vehicle', label: '차량', description: '차량을 운전합니다' },
  { type: 'airplane', label: '비행기', description: '비행기를 조종합니다' },
];

export const VehiclePanel: FC<EditorPanelBaseProps> = ({ className = '', style, children }) => {
  const modeType = useGaesupStore((state) => state.mode.type);
  const setMode = useGaesupStore((state) => state.setMode);

  const handleModeChange = (newMode: ModeType) => {
    setMode({
      type: newMode,
      controller: 'keyboard',
      control: newMode === 'airplane' ? 'chase' : newMode === 'vehicle' ? 'chase' : 'thirdPerson',
    });
  };

  return (
    <div className={`vehicle-panel ${className}`} style={style}>
      <div className="vehicle-panel__modes">
        {MODES.map((modeConfig) => (
          <button
            key={modeConfig.type}
            type="button"
            aria-pressed={modeType === modeConfig.type}
            className={`vehicle-panel__mode-button ${modeType === modeConfig.type ? 'vehicle-panel__mode-button--active' : ''}`}
            onClick={() => handleModeChange(modeConfig.type)}
          >
            <span className="vehicle-panel__mode-label">{modeConfig.label}</span>
            <span className="vehicle-panel__mode-description">{modeConfig.description}</span>
          </button>
        ))}
      </div>

      <div className="vehicle-panel__info">
        <div className="vehicle-panel__info-item">
          <span className="vehicle-panel__info-label">현재 모드:</span>
          <span className="vehicle-panel__info-value">
            {MODES.find((mode) => mode.type === modeType)?.label ?? modeType}
          </span>
        </div>
        <div className="vehicle-panel__info-item">
          <span className="vehicle-panel__info-label">조작:</span>
          <span className="vehicle-panel__info-value">
            {modeType === 'airplane' ? 'WASD + 스페이스/Shift' : 'WASD + 스페이스'}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
};
