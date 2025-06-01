'use client';

import { useContext, useState } from 'react';
import { useAtom } from 'jotai';

import { V3 } from '../../src';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../src/gaesup/world/context';
import { cameraOptionAtom } from '../../src/gaesup/atoms/cameraOptionAtom';
import { Icon } from '../icon';
import * as style from './style.css';
// FaCarSide lazy loading

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
  firstPerson: "캐릭터 눈높이 시점 - 이동하면 머리 흔들림 효과를 볼 수 있어요!",
  thirdPerson: "충돌 감지 기능이 있는 추적 카메라 - 물체 근처에서 걸어보세요!",
  thirdPersonOrbit: "캐릭터 중심으로 회전하는 궤도 카메라 - 좌우로 돌려보세요!",
  topDown: "새가 내려다보는 시점 - 전략 게임이나 전체 맵 보기에 좋아요!",
  sideScroll: "클래식 2D 플랫폼 게임 시점 - 좌우로 이동해보세요!",
};

export default function Info() {
  const { mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const [showCameraSettings, setShowCameraSettings] = useState(false);

  const setType = (type: 'character' | 'vehicle' | 'airplane') => {
    dispatch({
      type: 'update',
      payload: {
        mode: {
          ...mode,
          type: type,
          control: 'thirdPersonOrbit',
        },
      },
    });
  };

  const setController = (controller: 'keyboard' | 'clicker') => {
    dispatch({
      type: 'update',
      payload: {
        mode: {
          ...mode,
          controller,
        },
      },
    });
  };

  const setControl = (control: 'thirdPersonOrbit' | 'thirdPerson' | 'firstPerson' | 'topDown' | 'sideScroll' | 'orbit' | 'normal') => {
    const preset = CAMERA_PRESETS[control] || CAMERA_PRESETS[control === 'normal' ? 'thirdPerson' : control === 'orbit' ? 'thirdPersonOrbit' : 'thirdPerson'];
    
    dispatch({
      type: 'update',
      payload: {
        mode: {
          ...mode,
          control,
        },
      },
    });

    setCameraOption(prev => ({
      ...prev,
      ...preset,
    }));
  };

  const updateCameraOption = (key: string, value: any) => {
    setCameraOption(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSmoothingOption = (key: string, value: number) => {
    setCameraOption(prev => ({
      ...prev,
      smoothing: {
        ...prev.smoothing,
        [key]: value,
      },
    }));
  };

  const resetToPreset = () => {
    const control = mode.control;
    const preset = CAMERA_PRESETS[control] || CAMERA_PRESETS[control === 'normal' ? 'thirdPerson' : control === 'orbit' ? 'thirdPersonOrbit' : 'thirdPerson'];
    
    setCameraOption(prev => ({
      ...prev,
      ...preset,
    }));
  };

  const getCurrentCameraDescription = () => {
    const control = mode.control;
    const controllerDesc = ' (WASD/Arrow Keys + Mouse Click)';
    return (CAMERA_DESCRIPTIONS[control] || CAMERA_DESCRIPTIONS[control === 'normal' ? 'thirdPerson' : control === 'orbit' ? 'thirdPersonOrbit' : 'thirdPerson']) + controllerDesc;
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
                character
              </p>
              <p
                className={style.pRecipe({ selected: mode.type === 'vehicle' })}
                onClick={() => setType('vehicle')}
              >
                vehicle
              </p>
              <p
                className={style.pRecipe({ selected: mode.type === 'airplane' })}
                onClick={() => setType('airplane')}
              >
                airplane
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className={style.glassButton}>{mode.type}</button>
        </Icon>
        
        <Icon
          ToolTip={
            <>
              <p
                className={style.pRecipe({ selected: mode.control === 'firstPerson' })}
                onClick={() => setControl('firstPerson')}
              >
                🎯 firstPerson
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'thirdPerson' || mode.control === 'normal' })}
                onClick={() => setControl('thirdPerson')}
              >
                📷 thirdPerson
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'thirdPersonOrbit' || mode.control === 'orbit' })}
                onClick={() => setControl('thirdPersonOrbit')}
              >
                🔄 thirdPersonOrbit
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'topDown' })}
                onClick={() => setControl('topDown')}
              >
                🗺️ topDown
              </p>
              <p
                className={style.pRecipe({ selected: mode.control === 'sideScroll' })}
                onClick={() => setControl('sideScroll')}
              >
                📖 sideScroll
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className={style.glassButton}>{mode.control}</button>
        </Icon>

        <Icon
          ToolTip={
            <>
              <p className={style.pRecipe({ selected: true })}>
                🎮 Hybrid Control (Keyboard + Mouse)
              </p>
            </>
          }
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button className={style.glassButton}>
            🎮 Hybrid
          </button>
        </Icon>

        <Icon
          ToolTip={<>Camera Settings</>}
          toolTipStyles={{
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <button 
            className={style.glassButton}
            onClick={() => setShowCameraSettings(!showCameraSettings)}
          >
            ⚙️
          </button>
        </Icon>
      </div>

      <div className={style.cameraDescription}>
        {getCurrentCameraDescription()}
      </div>

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
