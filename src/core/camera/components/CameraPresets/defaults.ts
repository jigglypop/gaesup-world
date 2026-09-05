import type { CameraPresetsClassNameSlot, CameraPresetsLabels, CameraPreset } from './types';

export const CAMERA_PRESETS_DEFAULT_SMOOTHING = { position: 0.1, rotation: 0.1, fov: 0.1 };
export const CAMERA_PRESETS_DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: 'classic',
    name: '기본',
    description: '일반적인 3인칭 시점입니다.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: CAMERA_PRESETS_DEFAULT_SMOOTHING,
    },
  },
  {
    id: 'cinematic',
    name: '영화처럼',
    description: '영화처럼 부드럽게 움직이는 시점입니다.',
    config: {
      mode: 'chase',
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 },
    },
  },
  {
    id: 'action',
    name: '액션',
    description: '빠른 움직임에 민첩하게 반응하는 시점입니다.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 },
    },
  },
  {
    id: 'strategy',
    name: '전략',
    description: '위에서 공간 전체를 살펴보는 시점입니다.',
    config: {
      mode: 'topDown',
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: CAMERA_PRESETS_DEFAULT_SMOOTHING,
    },
  },
  {
    id: 'retro',
    name: '복고풍',
    description: '옆에서 바라보는 횡스크롤 시점입니다.',
    config: {
      mode: 'sideScroll',
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 },
    },
  },
];
export const CAMERA_PRESETS_DEFAULT_LABELS: CameraPresetsLabels = {
  empty: '카메라 프리셋이 없습니다',
};
export const CAMERA_PRESETS_DEFAULT_CLASSES: Record<CameraPresetsClassNameSlot, string> = {
  root: 'camera-presets-panel',
  floatingRoot: 'camera-presets-panel--floating',
  grid: 'camera-presets-panel-grid',
  presetButton: 'camera-presets-panel-preset',
  activePresetButton: 'camera-presets-panel-preset--active',
  presetIcon: 'camera-presets-panel-icon',
  presetContent: 'camera-presets-panel-content',
  presetName: 'camera-presets-panel-name',
  presetDescription: 'camera-presets-panel-description',
  empty: 'camera-presets-panel-empty',
};
