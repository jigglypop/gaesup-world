import type { CameraPresetsClassNameSlot, CameraPresetsLabels, CameraPreset } from './types';

export const CAMERA_PRESETS_DEFAULT_SMOOTHING = { position: 0.1, rotation: 0.1, fov: 0.1 };
export const CAMERA_PRESETS_DEFAULT_PRESETS: CameraPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'A traditional third-person view.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: CAMERA_PRESETS_DEFAULT_SMOOTHING,
    },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Smooth, movie-like camera work.',
    config: {
      mode: 'chase',
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 },
    },
  },
  {
    id: 'action',
    name: 'Action',
    description: 'Responsive camera for fast gameplay.',
    config: {
      mode: 'thirdPerson',
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 },
    },
  },
  {
    id: 'strategy',
    name: 'Strategy',
    description: 'Top-down view for an overview.',
    config: {
      mode: 'topDown',
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: CAMERA_PRESETS_DEFAULT_SMOOTHING,
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Classic side-scroller style.',
    config: {
      mode: 'sideScroll',
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 },
    },
  },
];
export const CAMERA_PRESETS_DEFAULT_LABELS: CameraPresetsLabels = {
  empty: 'No camera presets',
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
