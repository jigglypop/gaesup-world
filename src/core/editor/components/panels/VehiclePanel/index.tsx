import React, { FC } from 'react';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { ModeType } from '../../../../stores/types';
import './styles.css';

export const VehiclePanel: FC = () => {
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);

  const handleModeChange = (newMode: ModeType) => {
    const newModeConfig = {
      type: newMode,
      controller: 'keyboard',
      control: newMode === 'airplane' ? 'chase' : newMode === 'vehicle' ? 'chase' : 'thirdPerson'
    };
    setMode(newModeConfig);
  };

  const modes: { type: ModeType; label: string; description: string }[] = [
    { type: 'character', label: 'Character', description: 'Walk around as character' },
    { type: 'vehicle', label: 'Vehicle', description: 'Drive a ground vehicle' },
    { type: 'airplane', label: 'Airplane', description: 'Fly an airplane' }
  ];

  return (
    <div className="vehicle-panel">
      <div className="vehicle-panel__modes">
        {modes.map((modeConfig) => (
          <button
            key={modeConfig.type}
            className={`vehicle-panel__mode-button ${mode.type === modeConfig.type ? 'vehicle-panel__mode-button--active' : ''}`}
            onClick={() => handleModeChange(modeConfig.type)}
          >
            <span className="vehicle-panel__mode-label">{modeConfig.label}</span>
            <span className="vehicle-panel__mode-description">{modeConfig.description}</span>
          </button>
        ))}
      </div>
      
      <div className="vehicle-panel__info">
        <div className="vehicle-panel__info-item">
          <span className="vehicle-panel__info-label">Current Mode:</span>
          <span className="vehicle-panel__info-value">{mode.type}</span>
        </div>
        <div className="vehicle-panel__info-item">
          <span className="vehicle-panel__info-label">Controls:</span>
          <span className="vehicle-panel__info-value">
            {mode.type === 'airplane' ? 'WASD + Space/Shift' : 'WASD + Space'}
          </span>
        </div>
      </div>
    </div>
  );
}; 