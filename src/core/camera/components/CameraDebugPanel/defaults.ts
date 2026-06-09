import type {
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelLabels,
  CameraMetrics,
  DebugField,
} from './types';

export const CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL = 100;
export const CAMERA_DEBUG_PANEL_DEFAULT_PRECISION = 2;
export const CAMERA_DEBUG_PANEL_DEFAULT_LABELS: CameraDebugPanelLabels = {
  empty: 'No debug fields',
  unavailable: 'N/A',
};
export const CAMERA_DEBUG_PANEL_DEFAULT_FIELDS: DebugField[] = [
  { key: 'mode', label: 'Mode', enabled: true, format: 'text' },
  { key: 'position', label: 'Position', enabled: true, format: 'vector3', precision: 2 },
  { key: 'distance', label: 'Distance', enabled: true, format: 'vector3', precision: 2 },
  { key: 'fov', label: 'FOV', enabled: true, format: 'angle', precision: 1 },
  { key: 'velocity', label: 'Velocity', enabled: false, format: 'vector3', precision: 2 },
  { key: 'rotation', label: 'Rotation', enabled: false, format: 'vector3', precision: 2 },
  { key: 'zoom', label: 'Zoom', enabled: false, format: 'number', precision: 2 },
  { key: 'activeController', label: 'Controller', enabled: true, format: 'text' },
];
export const CAMERA_DEBUG_PANEL_DEFAULT_CLASSES: Record<CameraDebugPanelClassNameSlot, string> = {
  root: 'camera-debug-panel',
  floatingRoot: 'camera-debug-panel--floating',
  compactRoot: 'camera-debug-panel--compact',
  grid: 'camera-debug-panel-grid',
  item: 'camera-debug-panel-item',
  label: 'camera-debug-panel-label',
  value: 'camera-debug-panel-value',
  empty: 'camera-debug-panel-empty',
};
export function createInitialCameraMetrics(now = Date.now()): CameraMetrics {
  return {
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: now,
    mode: 'unknown',
    activeController: 'unknown',
    distance: null,
    fov: 0,
    position: null,
    targetPosition: null,
    velocity: null,
    rotation: null,
  };
}
