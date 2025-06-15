import { useState } from 'react';
import { useGaesupStore } from '../../../src/core';
import { Icon } from '../icon';
import './styles.css';

const CAMERA_PRESETS = {
  firstPerson: {
    yDistance: 1.6,
    fov: 75,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.05 },
  },
  thirdPerson: {
    xDistance: 15,
    yDistance: 8,
    zDistance: 15,
    enableCollision: true,
    smoothing: { position: 1, rotation: 0.1, fov: 0.1 },
    bounds: { minY: 2, maxY: 50 },
  },
  chase: {
    xDistance: 20,
    yDistance: 10,
    zDistance: 20,
    smoothing: { position: 0.1, rotation: 0.15, fov: 0.1 },
  },
  topDown: {
    yDistance: 25,
    xDistance: 0,
    zDistance: 0,
    fov: 60,
    bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
  },
  sideScroll: {
    xDistance: -20,
    yDistance: 5,
    zDistance: 0,
    bounds: { minX: -50, maxX: 50, minY: 2, maxY: 30 },
  },
};

const CAMERA_DESCRIPTIONS = {
  firstPerson: '1인칭 시점',
  thirdPerson: '3인칭 카메라',
  chase: '추적 카메라',
  topDown: '탑뷰 카메라',
  sideScroll: '사이드뷰 카메라',
};

export default function Info() {
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);
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

  const updateCameraOption = (key: string, value: number | boolean) => {
    setCameraOption({
      [key]: value,
    });
  };

  const updateSmoothingOption = (key: string, value: number) => {
    setCameraOption({
      smoothing: {
        ...cameraOption.smoothing,
        [key]: value,
      },
    });
  };

  const resetToPreset = () => {
    const control = mode.control;
    const preset = CAMERA_PRESETS[control] || CAMERA_PRESETS['thirdPerson'];

    setCameraOption(preset);
  };

  const getCurrentCameraDescription = () => {
    const control = mode.control;
    const controllerDesc = ' (WASD + Mouse Click으로 조작 가능)';
    return (CAMERA_DESCRIPTIONS[control] || CAMERA_DESCRIPTIONS['thirdPerson']) + controllerDesc;
  };

  return (
    <>
      <div className="info-style">
        <Icon
          ToolTip={
            <>
              <p
                className={`p-recipe ${mode.type === 'character' ? 'selected' : ''}`}
                onClick={() => setType('character')}
              >
                캐릭터
              </p>
              <p
                className={`p-recipe ${mode.type === 'vehicle' ? 'selected' : ''}`}
                onClick={() => setType('vehicle')}
              >
                차량
              </p>
              <p
                className={`p-recipe ${mode.type === 'airplane' ? 'selected' : ''}`}
                onClick={() => setType('airplane')}
              >
                비행기
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className="glass-button">
            {mode.type === 'character' && '캐릭터'}
            {mode.type === 'vehicle' && '차량'}
            {mode.type === 'airplane' && '비행기'}
          </button>
        </Icon>

        <Icon
          ToolTip={
            <>
              <p
                className={`p-recipe ${mode.control === 'firstPerson' ? 'selected' : ''}`}
                onClick={() => setControl('firstPerson')}
              >
                firstPerson
              </p>
              <p
                className={`p-recipe ${mode.control === 'thirdPerson' || mode.control === 'normal' ? 'selected' : ''}`}
                onClick={() => setControl('thirdPerson')}
              >
                thirdPerson
              </p>
              <p
                className={`p-recipe ${mode.control === 'chase' ? 'selected' : ''}`}
                onClick={() => setControl('chase')}
              >
                chase
              </p>
              <p
                className={`p-recipe ${mode.control === 'topDown' ? 'selected' : ''}`}
                onClick={() => setControl('topDown')}
              >
                topDown
              </p>
              <p
                className={`p-recipe ${mode.control === 'sideScroll' ? 'selected' : ''}`}
                onClick={() => setControl('sideScroll')}
              >
                sideScroll
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className="glass-button">
            {mode.control === 'firstPerson' && 'firstPerson'}
            {mode.control === 'thirdPerson' && 'thirdPerson'}
            {mode.control === 'chase' && 'chase'}
            {mode.control === 'topDown' && 'topDown'}
            {mode.control === 'sideScroll' && 'sideScroll'}
          </button>
        </Icon>

        <Icon
          ToolTip={<>⚙️ 카메라 설정</>}
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button
            className="glass-button"
            onClick={() => setShowCameraSettings(!showCameraSettings)}
          >
            ⚙️ 설정
          </button>
        </Icon>
      </div>

      <div className="camera-description">{getCurrentCameraDescription()}</div>

      {showCameraSettings && (
        <div className="camera-settings">
          <div className="settings-header">
            <h3>Camera Settings - {mode.control}</h3>
            <button onClick={resetToPreset} className="reset-button">
              Reset to Preset
            </button>
          </div>

          <div className="settings-grid">
            <div className="setting-group">
              <label>Distance</label>
              <div className="input-row">
                <span>X:</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={cameraOption.xDistance ?? cameraOption.XDistance ?? 0}
                  onChange={(e) => updateCameraOption('xDistance', Number(e.target.value))}
                />
                <span>{cameraOption.xDistance ?? cameraOption.XDistance ?? 0}</span>
              </div>
              <div className="input-row">
                <span>Y:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={cameraOption.yDistance ?? cameraOption.YDistance ?? 0}
                  onChange={(e) => updateCameraOption('yDistance', Number(e.target.value))}
                />
                <span>{cameraOption.yDistance ?? cameraOption.YDistance ?? 0}</span>
              </div>
              <div className="input-row">
                <span>Z:</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={cameraOption.zDistance ?? cameraOption.ZDistance ?? 0}
                  onChange={(e) => updateCameraOption('zDistance', Number(e.target.value))}
                />
                <span>{cameraOption.zDistance ?? cameraOption.ZDistance ?? 0}</span>
              </div>
            </div>

            <div className="setting-group">
              <label>FOV & Smoothing</label>
              <div className="input-row">
                <span>FOV:</span>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={cameraOption.fov ?? 75}
                  onChange={(e) => updateCameraOption('fov', Number(e.target.value))}
                />
                <span>{cameraOption.fov ?? 75}°</span>
              </div>
              <div className="input-row">
                <span>Position:</span>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={cameraOption.smoothing?.position ?? 0.1}
                  onChange={(e) => updateSmoothingOption('position', Number(e.target.value))}
                />
                <span>{(cameraOption.smoothing?.position ?? 0.1).toFixed(2)}</span>
              </div>
              <div className="input-row">
                <span>Rotation:</span>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={cameraOption.smoothing?.rotation ?? 0.1}
                  onChange={(e) => updateSmoothingOption('rotation', Number(e.target.value))}
                />
                <span>{(cameraOption.smoothing?.rotation ?? 0.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="setting-group">
              <label>Options</label>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={cameraOption.enableCollision ?? false}
                  onChange={(e) => updateCameraOption('enableCollision', e.target.checked)}
                />
                <span>Enable Collision</span>
              </div>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={cameraOption.focus ?? false}
                  onChange={(e) => updateCameraOption('focus', e.target.checked)}
                />
                <span>Focus Mode</span>
              </div>
            </div>
          </div>

          <div className="quick-presets">
            <h4>Quick Presets:</h4>
            <div className="preset-buttons">
              {Object.keys(CAMERA_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  className="preset-button"
                  onClick={() => setControl(presetName as keyof typeof CAMERA_PRESETS)}
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
