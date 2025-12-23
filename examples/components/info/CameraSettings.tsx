import { CheckboxInput } from './CheckboxInput';
import { CAMERA_PRESETS } from './constants';
import { RangeInput } from './RangeInput';
import { useGaesupStore } from '../../../src/core';

interface CameraSettingsProps {
  mode: { control: string };
  onControlChange: (control: string) => void;
  onClose?: () => void;
}

export function CameraSettings({ mode, onControlChange, onClose }: CameraSettingsProps) {
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);

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

  const getDistanceValue = (key: string) => {
    return cameraOption[key] ?? cameraOption[key.charAt(0).toUpperCase() + key.slice(1)] ?? 0;
  };

  return (
    <div className="camera-settings">
      <div className="settings-header">
        <h3>Camera Settings - {mode.control}</h3>
        <button onClick={resetToPreset} className="reset-button">
          Reset to Preset
        </button>
        {onClose && (
          <button onClick={onClose} className="reset-button">
            Close
          </button>
        )}
      </div>
      <div className="settings-grid">
        <div className="setting-group">
          <label>Distance</label>
          <RangeInput
            label="X"
            min={-50}
            max={50}
            step={1}
            value={getDistanceValue('xDistance')}
            onChange={(value) => updateCameraOption('xDistance', value)}
          />
          <RangeInput
            label="Y"
            min={0}
            max={50}
            step={1}
            value={getDistanceValue('yDistance')}
            onChange={(value) => updateCameraOption('yDistance', value)}
          />
          <RangeInput
            label="Z"
            min={-50}
            max={50}
            step={1}
            value={getDistanceValue('zDistance')}
            onChange={(value) => updateCameraOption('zDistance', value)}
          />
        </div>
        <div className="setting-group">
          <label>FOV & Smoothing</label>
          <RangeInput
            label="FOV"
            min={30}
            max={120}
            step={5}
            value={cameraOption.fov ?? 75}
            suffix="°"
            onChange={(value) => updateCameraOption('fov', value)}
          />
          <RangeInput
            label="Position"
            min={0.01}
            max={1}
            step={0.01}
            value={cameraOption.smoothing?.position ?? 0.1}
            formatter={(val) => val.toFixed(2)}
            onChange={(value) => updateSmoothingOption('position', value)}
          />
          <RangeInput
            label="Rotation"
            min={0.01}
            max={1}
            step={0.01}
            value={cameraOption.smoothing?.rotation ?? 0.1}
            formatter={(val) => val.toFixed(2)}
            onChange={(value) => updateSmoothingOption('rotation', value)}
          />
        </div>
        <div className="setting-group">
          <label>Options</label>
          <CheckboxInput
            label="Enable Collision"
            checked={cameraOption.enableCollision ?? false}
            onChange={(checked) => updateCameraOption('enableCollision', checked)}
          />
          <CheckboxInput
            label="Focus Mode"
            checked={cameraOption.focus ?? false}
            onChange={(checked) => updateCameraOption('focus', checked)}
          />
        </div>
      </div>
      <div className="quick-presets">
        <h4>Quick Presets:</h4>
        <div className="preset-buttons">
          {Object.keys(CAMERA_PRESETS).map((presetName) => (
            <button
              key={presetName}
              className="preset-button"
              onClick={() => onControlChange(presetName)}
            >
              {presetName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 