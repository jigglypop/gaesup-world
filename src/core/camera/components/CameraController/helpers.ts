import type { CSSProperties } from 'react';

import { CAMERA_CONTROLLER_DEFAULT_CLASSES, CAMERA_CONTROLLER_DEFAULT_LABELS } from './defaults';
import type {
  CameraControllerClassNameSlot,
  CameraControllerLabels,
  CameraControllerStyles,
} from './types';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function mergeLabels(overrides?: Partial<CameraControllerLabels>): CameraControllerLabels {
  return { ...CAMERA_CONTROLLER_DEFAULT_LABELS, ...overrides };
}
export function mergeStyle(
  styles: CameraControllerStyles | undefined,
  slot: CameraControllerClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
export function defaultClassFor(slot: CameraControllerClassNameSlot): string {
  return CAMERA_CONTROLLER_DEFAULT_CLASSES[slot];
}
