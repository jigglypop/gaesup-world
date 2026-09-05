import type { CSSProperties } from 'react';

import { CAMERA_PRESETS_DEFAULT_CLASSES, CAMERA_PRESETS_DEFAULT_LABELS } from './defaults';
import type {
  CameraPreset,
  CameraPresetsClassNameSlot,
  CameraPresetsLabels,
  CameraPresetsRenderContext,
  CameraPresetsStyles,
} from './types';
import type { CameraOptionType } from '../../core/types';

export type CameraPresetDistance = { x: number; y: number; z: number };
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function compareDistance(
  left: CameraPresetDistance | undefined,
  right: CameraPresetDistance | undefined,
): boolean {
  if (!left || !right) return false;
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
export function getOptionDistance(
  option: CameraOptionType | undefined,
): CameraPresetDistance | undefined {
  const x = option?.xDistance;
  const y = option?.yDistance;
  const z = option?.zDistance;
  if (x === undefined || y === undefined || z === undefined) return undefined;
  return { x, y, z };
}
export function getCurrentPresetId(
  presets: readonly CameraPreset[],
  mode: CameraPresetsRenderContext['mode'],
  cameraOption: CameraPresetsRenderContext['cameraOption'],
): string | null {
  const foundPreset = presets.find(
    (preset) =>
      preset.config.mode === mode &&
      compareDistance(preset.config.distance, getOptionDistance(cameraOption)),
  );
  return foundPreset?.id ?? null;
}
export function mergeLabels(overrides?: Partial<CameraPresetsLabels>): CameraPresetsLabels {
  return { ...CAMERA_PRESETS_DEFAULT_LABELS, ...overrides };
}
export function mergeStyle(
  styles: CameraPresetsStyles | undefined,
  slot: CameraPresetsClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
export function defaultClassFor(slot: CameraPresetsClassNameSlot): string {
  return CAMERA_PRESETS_DEFAULT_CLASSES[slot];
}
