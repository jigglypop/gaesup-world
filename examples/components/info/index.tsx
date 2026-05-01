import { useState } from 'react';

import { CameraSettings } from './CameraSettings';
import { CAMERA_PRESETS } from './constants';
import { SelectionTooltip } from './SelectionTooltip';
import { SpeechBalloonSettings } from './SpeechBalloonSettings';
import { useGaesupStore } from '../../../src';
import { InfoTabs } from '../infoTabs';
import './styles.css';

type CameraControl = keyof typeof CAMERA_PRESETS;
type InfoSection = 'help' | 'camera' | 'speech';
type WorldType = 'character' | 'vehicle' | 'airplane';

const cameraControlLabels: Record<CameraControl, string> = {
  firstPerson: '1인칭',
  thirdPerson: '3인칭',
  chase: '추적',
  topDown: '탑뷰',
  sideScroll: '사이드',
};

function isCameraControl(value: string): value is CameraControl {
  return value in CAMERA_PRESETS;
}

function isWorldType(value: string): value is WorldType {
  return value === 'character' || value === 'vehicle' || value === 'airplane';
}

export default function Info() {
  const [activeSection, setActiveSection] = useState<InfoSection>('help');
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const setType = (value: string) => {
    if (!isWorldType(value)) return;
    setMode({
      type: value,
      control: value === 'character' ? 'thirdPerson' : 'chase',
    });
  };
  const setControl = (control: string) => {
    const nextControl = isCameraControl(control) ? control : 'thirdPerson';
    const preset = CAMERA_PRESETS[nextControl];
    setMode({
      control: nextControl,
    });
    setCameraOption(preset);
  };
  const typeOptions = [
    { value: 'character', label: '캐릭터', isSelected: mode.type === 'character' },
    { value: 'vehicle', label: '차량', isSelected: mode.type === 'vehicle' },
    { value: 'airplane', label: '비행기', isSelected: mode.type === 'airplane' },
  ];
  const controlOptions = [
    { value: 'firstPerson', label: cameraControlLabels.firstPerson, isSelected: mode.control === 'firstPerson' },
    { value: 'thirdPerson', label: cameraControlLabels.thirdPerson, isSelected: mode.control === 'thirdPerson' },
    { value: 'chase', label: cameraControlLabels.chase, isSelected: mode.control === 'chase' },
    { value: 'topDown', label: cameraControlLabels.topDown, isSelected: mode.control === 'topDown' },
    { value: 'sideScroll', label: cameraControlLabels.sideScroll, isSelected: mode.control === 'sideScroll' },
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
    const control = isCameraControl(mode.control) ? mode.control : 'thirdPerson';
    return cameraControlLabels[control];
  };

  const sectionButtons: { id: InfoSection; label: string }[] = [
    { id: 'help', label: '도움말' },
    { id: 'camera', label: '카메라' },
    { id: 'speech', label: '말풍선' },
  ];

  return (
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
      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12 }}>
        {sectionButtons.map((section) => (
          <button
            key={section.id}
            className="glass-button"
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
      {activeSection === 'help' && <InfoTabs />}
      {activeSection === 'camera' && (
        <CameraSettings
          mode={{ control: isCameraControl(mode.control) ? mode.control : 'thirdPerson' }}
          onControlChange={setControl}
        />
      )}
      {activeSection === 'speech' && <SpeechBalloonSettings />}
    </div>
  );
}
