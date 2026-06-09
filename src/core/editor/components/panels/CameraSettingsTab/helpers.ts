import type { CSSProperties, ReactNode } from 'react';

import { CAMERA_SETTINGS_DEFAULT_CLASSES, CAMERA_SETTINGS_DEFAULT_LABELS } from './defaults';
import type {
  CameraSettingsClassNameSlot,
  CameraSettingsField,
  CameraSettingsFieldValue,
  CameraSettingsLabels,
  CameraSettingsSection,
  CameraSettingsStyles,
} from './types';
import type { CameraOptionType } from '../../../../camera/core/types';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function toNumber(value: CameraSettingsFieldValue): number {
  return typeof value === 'number' ? value : Number(value);
}
export function toBoolean(value: CameraSettingsFieldValue): boolean {
  return typeof value === 'boolean' ? value : Boolean(value);
}
export function mergeLabels(overrides?: Partial<CameraSettingsLabels>): CameraSettingsLabels {
  return { ...CAMERA_SETTINGS_DEFAULT_LABELS, ...overrides };
}
export function mergeStyle(
  styles: CameraSettingsStyles | undefined,
  slot: CameraSettingsClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
export function defaultClassFor(slot: CameraSettingsClassNameSlot): string {
  return CAMERA_SETTINGS_DEFAULT_CLASSES[slot];
}
export function resolveVisibleSections(
  sections: readonly CameraSettingsSection[],
): CameraSettingsSection[] {
  return sections
    .filter((section) => section.visible !== false)
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) => field.visible !== false),
    }))
    .filter((section) => section.fields.length > 0);
}
export function readCameraSettingsValue(
  cameraOption: CameraOptionType,
  field: CameraSettingsField,
): CameraSettingsFieldValue {
  if (field.getValue) return field.getValue(cameraOption);
  switch (field.path) {
    case 'xDistance':
      return cameraOption.xDistance ?? field.defaultValue;
    case 'yDistance':
      return cameraOption.yDistance ?? field.defaultValue;
    case 'zDistance':
      return cameraOption.zDistance ?? field.defaultValue;
    case 'fov':
      return cameraOption.fov ?? field.defaultValue;
    case 'enableZoom':
      return cameraOption.enableZoom ?? field.defaultValue;
    case 'zoomSpeed':
      return cameraOption.zoomSpeed ?? field.defaultValue;
    case 'minZoom':
      return cameraOption.minZoom ?? field.defaultValue;
    case 'maxZoom':
      return cameraOption.maxZoom ?? field.defaultValue;
    case 'enableCollision':
      return cameraOption.enableCollision ?? field.defaultValue;
    case 'enableFocus':
      return cameraOption.enableFocus ?? field.defaultValue;
    case 'focusDistance':
      return cameraOption.focusDistance ?? field.defaultValue;
    case 'maxDistance':
      return cameraOption.maxDistance ?? field.defaultValue;
    case 'smoothing.position':
      return cameraOption.smoothing?.position ?? field.defaultValue;
    case 'smoothing.rotation':
      return cameraOption.smoothing?.rotation ?? field.defaultValue;
    case 'smoothing.fov':
      return cameraOption.smoothing?.fov ?? field.defaultValue;
    case 'bounds.minY':
      return cameraOption.bounds?.minY ?? field.defaultValue;
    case 'bounds.maxY':
      return cameraOption.bounds?.maxY ?? field.defaultValue;
    default:
      return field.defaultValue;
  }
}
export function createCameraSettingsUpdate(
  cameraOption: CameraOptionType,
  field: CameraSettingsField,
  value: CameraSettingsFieldValue,
): Partial<CameraOptionType> {
  if (field.createUpdate) return field.createUpdate(cameraOption, value);
  switch (field.path) {
    case 'xDistance':
      return { xDistance: toNumber(value) };
    case 'yDistance':
      return { yDistance: toNumber(value) };
    case 'zDistance':
      return { zDistance: toNumber(value) };
    case 'fov':
      return { fov: toNumber(value) };
    case 'enableZoom':
      return { enableZoom: toBoolean(value) };
    case 'zoomSpeed':
      return { zoomSpeed: toNumber(value) };
    case 'minZoom':
      return { minZoom: toNumber(value) };
    case 'maxZoom':
      return { maxZoom: toNumber(value) };
    case 'enableCollision':
      return { enableCollision: toBoolean(value) };
    case 'enableFocus':
      return { enableFocus: toBoolean(value) };
    case 'focusDistance':
      return { focusDistance: toNumber(value) };
    case 'maxDistance':
      return { maxDistance: toNumber(value) };
    case 'smoothing.position':
      return { smoothing: { ...cameraOption.smoothing, position: toNumber(value) } };
    case 'smoothing.rotation':
      return { smoothing: { ...cameraOption.smoothing, rotation: toNumber(value) } };
    case 'smoothing.fov':
      return { smoothing: { ...cameraOption.smoothing, fov: toNumber(value) } };
    case 'bounds.minY':
      return { bounds: { ...cameraOption.bounds, minY: toNumber(value) } };
    case 'bounds.maxY':
      return { bounds: { ...cameraOption.bounds, maxY: toNumber(value) } };
    default:
      return {};
  }
}
export function formatCameraSettingsValue(
  field: CameraSettingsField,
  value: CameraSettingsFieldValue,
  labels: CameraSettingsLabels,
): ReactNode {
  if (field.kind === 'checkbox') return toBoolean(value) ? labels.enabled : labels.disabled;
  const nextValue = toNumber(value);
  const text =
    field.step !== undefined && field.step < 1 ? nextValue.toFixed(2) : String(nextValue);
  return `${text}${field.suffix ?? ''}`;
}
