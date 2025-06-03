'use client';

import { useAtom } from 'jotai';
import { useState } from 'react';

import { cameraOptionAtom, modeAtom } from '../../src/gaesup/atoms';
import { Icon } from '../icon';
import * as style from './style.css';

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
    smoothing: { position: 0.08, rotation: 0.1, fov: 0.1 },
    bounds: { minY: 2, maxY: 50 },
  },
  thirdPersonOrbit: {
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
  thirdPersonOrbit: '궤도 카메라',
  topDown: '탑뷰 카메라',
  sideScroll: '사이드뷰 카메라',
};

export default function Info() {
  const [mode, setMode] = useAtom(modeAtom);
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const [showCameraSettings, setShowCameraSettings] = useState(false);

  const setType = (type: 'character' | 'vehicle' | 'airplane') => {
    setMode({
      ...mode,
      type: type,
      control: 'thirdPersonOrbit',
    });
  };

  const setController = (controller: 'keyboard' | 'clicker') => {
    setMode({
      ...mode,
      controller,
    });
  };

  const setControl = (
    control:
      | 'thirdPersonOrbit'
      | 'thirdPerson'
      | 'firstPerson'
      | 'topDown'
      | 'sideScroll'
      | 'orbit'
      | 'normal',
  ) => {
    const preset =
      CAMERA_PRESETS[control] ||
      CAMERA_PRESETS[
        control === 'normal'
          ? 'thirdPerson'
          : control === 'orbit'
            ? 'thirdPersonOrbit'
            : 'thirdPerson'
      ];

    setMode({
      ...mode,
      control,
    });

    setCameraOption((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const updateCameraOption = (key: string, value: any) => {
    setCameraOption((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSmoothingOption = (key: string, value: number) => {
    setCameraOption((prev) => ({
      ...prev,
      smoothing: {
        ...prev.smoothing,
        [key]: value,
      },
    }));
  };

  const resetToPreset = () => {
    const control = mode.control;
    const preset =
      CAMERA_PRESETS[control] ||
      CAMERA_PRESETS[
        control === 'normal'
          ? 'thirdPerson'
          : control === 'orbit'
            ? 'thirdPersonOrbit'
            : 'thirdPerson'
      ];

    setCameraOption((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const getCurrentCameraDescription = () => {
    const control = mode.control;
    const controllerDesc = ' (WASD + Mouse Click으로 조작 가능)';
    return (
      (CAMERA_DESCRIPTIONS[control] ||
        CAMERA_DESCRIPTIONS[
          control === 'normal'
            ? 'thirdPerson'
            : control === 'orbit'
              ? 'thirdPersonOrbit'
              : 'thirdPerson'
        ]) + controllerDesc
    );
  };

  return (
    <>
      <div className={style.infoStyle}>
        <Icon
          ToolTip={
            <>
              <p
                className={style.pRecipe({ selected: mode.type === 'character' })}
                onClick={() => setType('character')}
              >
                🚶 캐릭터
              </p>
              <p
                className={style.pRecipe({ selected: mode.type === 'vehicle' })}
                onClick={() => setType('vehicle')}
              >
                🚗 차량
              </p>
              <p
                className={style.pRecipe({ selected: mode.type === 'airplane' })}
                onClick={() => setType('airplane')}
              >
                ✈️ 비행기
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className={style.glassButton}>
            {mode.type === 'character' && '🚶 캐릭터'}
            {mode.type === 'vehicle' && '🚗 차량'}
            {mode.type === 'airplane' && '✈️ 비행기'}
          </button>
        </Icon>

        <Icon
          ToolTip={
            <>
              <p
                className={style.pRecipe({ selected: mode.control === 'firstPerson' })}
                onClick={() => setControl('firstPerson')}
              >
                🎯 1인칭
              </p>
              <p
                className={style.pRecipe({
                  selected: mode.control === 'thirdPerson' || mode.control === 'normal',
                })}
                onClick={() => setControl('thirdPerson')}
              >
                📷 3인칭
              </p>
              <p
                className={style.pRecipe({
                  selected: mode.control === 'thirdPersonOrbit' || mode.control === 'orbit',
                })}
                onClick={() => setControl('thirdPersonOrbit')}
              >
                🔄 궤도 카메라
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'topDown' })}
                onClick={() => setControl('topDown')}
              >
                🗺️ 탑뷰
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'sideScroll' })}
                onClick={() => setControl('sideScroll')}
              >
                📖 사이드뷰
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className={style.glassButton}>
            {mode.control === 'firstPerson' && '🎯 1인칭'}
            {mode.control === 'thirdPerson' && '📷 3인칭'}
            {mode.control === 'thirdPersonOrbit' && '🔄 궤도'}
            {mode.control === 'topDown' && '🗺️ 탑뷰'}
            {mode.control === 'sideScroll' && '📖 사이드'}
            {(mode.control === 'normal' || mode.control === 'orbit') && '📷 3인칭'}
          </button>
        </Icon>

        <Icon
          ToolTip={<>⚙️ 카메라 설정</>}
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button
            className={style.glassButton}
            onClick={() => setShowCameraSettings(!showCameraSettings)}
          >
            ⚙️ 설정
          </button>
        </Icon>
      </div>

      <div className={style.cameraDescription}>{getCurrentCameraDescription()}</div>

      {showCameraSettings && (
        <div className={style.cameraSettings}>
          <div className={style.settingsHeader}>
            <h3>Camera Settings - {mode.control}</h3>
            <button onClick={resetToPreset} className={style.resetButton}>
              Reset to Preset
            </button>
          </div>

          <div className={style.settingsGrid}>
            <div className={style.settingGroup}>
              <label>Distance</label>
              <div className={style.inputRow}>
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
              <div className={style.inputRow}>
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
              <div className={style.inputRow}>
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

            <div className={style.settingGroup}>
              <label>FOV & Smoothing</label>
              <div className={style.inputRow}>
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
              <div className={style.inputRow}>
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
              <div className={style.inputRow}>
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

            <div className={style.settingGroup}>
              <label>Options</label>
              <div className={style.checkboxRow}>
                <input
                  type="checkbox"
                  checked={cameraOption.enableCollision ?? false}
                  onChange={(e) => updateCameraOption('enableCollision', e.target.checked)}
                />
                <span>Enable Collision</span>
              </div>
              <div className={style.checkboxRow}>
                <input
                  type="checkbox"
                  checked={cameraOption.focus ?? false}
                  onChange={(e) => updateCameraOption('focus', e.target.checked)}
                />
                <span>Focus Mode</span>
              </div>
            </div>
          </div>

          <div className={style.quickPresets}>
            <h4>Quick Presets:</h4>
            <div className={style.presetButtons}>
              {Object.keys(CAMERA_PRESETS).map((presetName) => (
                <button
                  key={presetName}
                  className={style.presetButton}
                  onClick={() => setControl(presetName as any)}
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
