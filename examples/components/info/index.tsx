import { useState } from 'react';
import { useGaesupStore } from '../../../src/core';
import { Icon } from '../icon';
import { CameraSettings } from './CameraSettings';
import { SelectionTooltip } from './SelectionTooltip';
import './styles.css';
import { CAMERA_PRESETS } from './constants';

export default function Info() {
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const setType = (type: 'character' | 'vehicle' | 'airplane') => {
    setMode({
      type: type,
      control: 'chase',
    });
  };
  const setControl = (
    control: 'chase' | 'thirdPerson' | 'firstPerson' | 'topDown' | 'sideScroll' | 'normal',
  ) => {
    const preset = CAMERA_PRESETS[control] || CAMERA_PRESETS['thirdPerson'];
    setMode({
      control,
    });
    setCameraOption(preset);
  };
  const typeOptions = [
    { value: 'character', label: '캐릭터', isSelected: mode.type === 'character' },
    { value: 'vehicle', label: '차량', isSelected: mode.type === 'vehicle' },
    { value: 'airplane', label: '비행기', isSelected: mode.type === 'airplane' },
  ];
  const controlOptions = [
    { value: 'firstPerson', label: 'firstPerson', isSelected: mode.control === 'firstPerson' },
    { value: 'thirdPerson', label: 'thirdPerson', isSelected: mode.control === 'thirdPerson' || mode.control === 'normal' },
    { value: 'chase', label: 'chase', isSelected: mode.control === 'chase' },
    { value: 'topDown', label: 'topDown', isSelected: mode.control === 'topDown' },
    { value: 'sideScroll', label: 'sideScroll', isSelected: mode.control === 'sideScroll' },
  ];
  const getCurrentTypeLabel = () => {
    switch (mode.type) {
      case 'character': return '캐릭터';
      case 'vehicle': return '차량';
      case 'airplane': return '비행기';
      default: return '캐릭터';
    }
  };
  const getCurrentControlLabel = () => {
    return mode.control || 'thirdPerson';
  };
  return (
    <>
      <div className="info-style">
        <SelectionTooltip
          options={typeOptions}
          onSelect={setType}
          currentLabel={getCurrentTypeLabel()}
        />
        <SelectionTooltip
          options={controlOptions}
          onSelect={setControl}
          currentLabel={getCurrentControlLabel()}
        />
        <Icon
          ToolTip={<>카메라 설정</>}
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button
            className="glass-button"
            onClick={() => setShowCameraSettings(!showCameraSettings)}
          >
            설정
          </button>
        </Icon>
      </div>
      {showCameraSettings && (
        <CameraSettings
          mode={mode}
          onControlChange={setControl}
          onClose={() => setShowCameraSettings(false)}
        />
      )}
    </>
  );
}