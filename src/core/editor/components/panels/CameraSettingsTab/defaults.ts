import type {
  CameraSettingsClassNameSlot,
  CameraSettingsLabels,
  CameraSettingsSection,
} from './types';

const CAMERA_SETTINGS_DISTANCE_MIN = -50;
const CAMERA_SETTINGS_DISTANCE_MAX = 50;
const CAMERA_SETTINGS_HEIGHT_MIN = 0;
const CAMERA_SETTINGS_HEIGHT_MAX = 80;
const CAMERA_SETTINGS_FOV_MIN = 30;
const CAMERA_SETTINGS_FOV_MAX = 120;
const CAMERA_SETTINGS_FOV_STEP = 5;
const CAMERA_SETTINGS_SMOOTHING_MIN = 0.01;
const CAMERA_SETTINGS_SMOOTHING_MAX = 1;
const CAMERA_SETTINGS_SMOOTHING_STEP = 0.01;
const CAMERA_SETTINGS_ZOOM_SPEED_MIN = 0.0001;
const CAMERA_SETTINGS_ZOOM_SPEED_MAX = 0.01;
const CAMERA_SETTINGS_ZOOM_SPEED_STEP = 0.0001;
const CAMERA_SETTINGS_ZOOM_MIN = 0.1;
const CAMERA_SETTINGS_MIN_ZOOM_MAX = 2;
const CAMERA_SETTINGS_MAX_ZOOM_MIN = 1;
const CAMERA_SETTINGS_ZOOM_MAX = 5;
const CAMERA_SETTINGS_ZOOM_STEP = 0.1;
const CAMERA_SETTINGS_FOCUS_MIN = 1;
const CAMERA_SETTINGS_FOCUS_MAX = 50;
const CAMERA_SETTINGS_MAX_DISTANCE_MIN = 5;
const CAMERA_SETTINGS_MAX_DISTANCE_MAX = 100;
const CAMERA_SETTINGS_BOUND_MIN = -10;
const CAMERA_SETTINGS_BOUND_MAX = 100;
const CAMERA_SETTINGS_DISTANCE_STEP = 1;
export const CAMERA_SETTINGS_DEFAULT_LABELS: CameraSettingsLabels = {
  modePrefix: 'Mode',
  fallbackMode: 'thirdPerson',
  enabled: 'On',
  disabled: 'Off',
};
export const CAMERA_SETTINGS_DEFAULT_CLASSES: Record<CameraSettingsClassNameSlot, string> = {
  root: 'camera-settings-tab',
  mode: 'camera-settings-tab-mode',
  section: 'camera-settings-tab-section',
  sectionTitle: 'camera-settings-tab-section-title',
  field: 'camera-settings-tab-field',
  fieldLabel: 'camera-settings-tab-field-label',
  fieldControl: 'camera-settings-tab-field-control',
  rangeInput: 'camera-settings-tab-range',
  checkboxInput: 'camera-settings-tab-checkbox',
  fieldValue: 'camera-settings-tab-field-value',
};
export const CAMERA_SETTINGS_DEFAULT_SECTIONS: readonly CameraSettingsSection[] = [
  {
    key: 'distance',
    title: 'Distance',
    fields: [
      {
        key: 'xDistance',
        label: 'X',
        kind: 'range',
        path: 'xDistance',
        min: CAMERA_SETTINGS_DISTANCE_MIN,
        max: CAMERA_SETTINGS_DISTANCE_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 0,
      },
      {
        key: 'yDistance',
        label: 'Y',
        kind: 'range',
        path: 'yDistance',
        min: CAMERA_SETTINGS_HEIGHT_MIN,
        max: CAMERA_SETTINGS_HEIGHT_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 0,
      },
      {
        key: 'zDistance',
        label: 'Z',
        kind: 'range',
        path: 'zDistance',
        min: CAMERA_SETTINGS_DISTANCE_MIN,
        max: CAMERA_SETTINGS_DISTANCE_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 0,
      },
    ],
  },
  {
    key: 'fov',
    title: 'FOV / Smoothing',
    fields: [
      {
        key: 'fov',
        label: 'FOV',
        kind: 'range',
        path: 'fov',
        min: CAMERA_SETTINGS_FOV_MIN,
        max: CAMERA_SETTINGS_FOV_MAX,
        step: CAMERA_SETTINGS_FOV_STEP,
        suffix: 'deg',
        defaultValue: 75,
      },
      {
        key: 'smoothingPosition',
        label: 'Pos',
        kind: 'range',
        path: 'smoothing.position',
        min: CAMERA_SETTINGS_SMOOTHING_MIN,
        max: CAMERA_SETTINGS_SMOOTHING_MAX,
        step: CAMERA_SETTINGS_SMOOTHING_STEP,
        defaultValue: 0.1,
      },
      {
        key: 'smoothingRotation',
        label: 'Rot',
        kind: 'range',
        path: 'smoothing.rotation',
        min: CAMERA_SETTINGS_SMOOTHING_MIN,
        max: CAMERA_SETTINGS_SMOOTHING_MAX,
        step: CAMERA_SETTINGS_SMOOTHING_STEP,
        defaultValue: 0.1,
      },
      {
        key: 'smoothingFov',
        label: 'FOV Sm',
        kind: 'range',
        path: 'smoothing.fov',
        min: CAMERA_SETTINGS_SMOOTHING_MIN,
        max: CAMERA_SETTINGS_SMOOTHING_MAX,
        step: CAMERA_SETTINGS_SMOOTHING_STEP,
        defaultValue: 0.2,
      },
    ],
  },
  {
    key: 'zoom',
    title: 'Zoom',
    fields: [
      {
        key: 'enableZoom',
        label: 'Enable Zoom',
        kind: 'checkbox',
        path: 'enableZoom',
        defaultValue: false,
      },
      {
        key: 'zoomSpeed',
        label: 'Speed',
        kind: 'range',
        path: 'zoomSpeed',
        min: CAMERA_SETTINGS_ZOOM_SPEED_MIN,
        max: CAMERA_SETTINGS_ZOOM_SPEED_MAX,
        step: CAMERA_SETTINGS_ZOOM_SPEED_STEP,
        defaultValue: 0.001,
      },
      {
        key: 'minZoom',
        label: 'Min',
        kind: 'range',
        path: 'minZoom',
        min: CAMERA_SETTINGS_ZOOM_MIN,
        max: CAMERA_SETTINGS_MIN_ZOOM_MAX,
        step: CAMERA_SETTINGS_ZOOM_STEP,
        defaultValue: 0.5,
      },
      {
        key: 'maxZoom',
        label: 'Max',
        kind: 'range',
        path: 'maxZoom',
        min: CAMERA_SETTINGS_MAX_ZOOM_MIN,
        max: CAMERA_SETTINGS_ZOOM_MAX,
        step: CAMERA_SETTINGS_ZOOM_STEP,
        defaultValue: 2,
      },
    ],
  },
  {
    key: 'options',
    title: 'Options',
    fields: [
      {
        key: 'enableCollision',
        label: 'Collision',
        kind: 'checkbox',
        path: 'enableCollision',
        defaultValue: false,
      },
      {
        key: 'enableFocus',
        label: 'Focus Mode',
        kind: 'checkbox',
        path: 'enableFocus',
        defaultValue: false,
      },
      {
        key: 'focusDistance',
        label: 'Focus Dist',
        kind: 'range',
        path: 'focusDistance',
        min: CAMERA_SETTINGS_FOCUS_MIN,
        max: CAMERA_SETTINGS_FOCUS_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 15,
      },
      {
        key: 'maxDistance',
        label: 'Max Dist',
        kind: 'range',
        path: 'maxDistance',
        min: CAMERA_SETTINGS_MAX_DISTANCE_MIN,
        max: CAMERA_SETTINGS_MAX_DISTANCE_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 50,
      },
    ],
  },
  {
    key: 'bounds',
    title: 'Bounds',
    fields: [
      {
        key: 'boundsMinY',
        label: 'Min Y',
        kind: 'range',
        path: 'bounds.minY',
        min: CAMERA_SETTINGS_BOUND_MIN,
        max: CAMERA_SETTINGS_FOCUS_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 2,
      },
      {
        key: 'boundsMaxY',
        label: 'Max Y',
        kind: 'range',
        path: 'bounds.maxY',
        min: CAMERA_SETTINGS_MAX_DISTANCE_MIN,
        max: CAMERA_SETTINGS_BOUND_MAX,
        step: CAMERA_SETTINGS_DISTANCE_STEP,
        defaultValue: 50,
      },
    ],
  },
];
