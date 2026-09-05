import type {
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelLabels,
  CameraMetrics,
  DebugField,
} from './types';

export const CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL = 100;
export const CAMERA_DEBUG_PANEL_DEFAULT_PRECISION = 2;
export const CAMERA_DEBUG_PANEL_DEFAULT_LABELS: CameraDebugPanelLabels = {
  empty: '표시할 진단 항목이 없습니다',
  unavailable: '정보 없음',
};
export const CAMERA_DEBUG_PANEL_DEFAULT_FIELDS: DebugField[] = [
  { key: 'mode', label: '모드', enabled: true, format: 'text' },
  { key: 'position', label: '조작 대상 위치', enabled: true, format: 'vector3', precision: 2 },
  { key: 'distance', label: '거리 설정', enabled: true, format: 'vector3', precision: 2 },
  { key: 'fov', label: '시야각 설정', enabled: true, format: 'angle', precision: 1 },
  { key: 'velocity', label: '조작 대상 속도', enabled: false, format: 'vector3', precision: 2 },
  { key: 'rotation', label: '조작 대상 회전', enabled: false, format: 'vector3', precision: 2 },
  { key: 'zoom', label: '확대', enabled: false, format: 'number', precision: 2 },
  { key: 'activeController', label: '컨트롤러', enabled: true, format: 'text' },
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
