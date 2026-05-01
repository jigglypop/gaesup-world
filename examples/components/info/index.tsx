import { useState } from 'react';

import { CameraSettings } from './CameraSettings';
import { CAMERA_PRESETS } from './constants';
import { SpeechBalloonSettings } from './SpeechBalloonSettings';
import { useGaesupStore } from '../../../src';
import './styles.css';

type CameraControl = keyof typeof CAMERA_PRESETS;
type InfoSection = 'help' | 'camera' | 'speech';
type WorldType = 'character' | 'vehicle' | 'airplane';
type MenuOption = {
  value: string;
  label: string;
  isSelected: boolean;
};

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

function MenuOptionGroup({
  title,
  options,
  onSelect,
}: {
  title: string;
  options: MenuOption[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="info-menu-group">
      <div className="info-menu-label">{title}</div>
      <div className="info-menu-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`glass-button ${option.isSelected ? 'glass-button--active' : ''}`}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
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

  const sectionButtons: { id: InfoSection; label: string }[] = [
    { id: 'help', label: '도움말' },
    { id: 'camera', label: '카메라' },
    { id: 'speech', label: '말풍선' },
  ];

  return (
    <div className="info-style gp-glass gp-glass-strong">
      <div className="info-menu-header">
        <div>
          <div className="gp-panel-title">메뉴</div>
          <h2>월드 설정</h2>
        </div>
      </div>

      <MenuOptionGroup title="플레이 모드" options={typeOptions} onSelect={setType} />
      <MenuOptionGroup title="카메라 모드" options={controlOptions} onSelect={setControl} />

      <div className="info-section-menu">
        {sectionButtons.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`glass-button ${activeSection === section.id ? 'glass-button--active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
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
