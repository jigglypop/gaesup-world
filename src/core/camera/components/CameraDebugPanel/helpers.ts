import type { CSSProperties, ReactNode } from 'react';

import {
  CAMERA_DEBUG_PANEL_DEFAULT_CLASSES,
  CAMERA_DEBUG_PANEL_DEFAULT_LABELS,
  CAMERA_DEBUG_PANEL_DEFAULT_PRECISION,
} from './defaults';
import type {
  CameraDebugValue,
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelLabels,
  CameraDebugPanelStyles,
  CameraMetrics,
  CustomField,
  DebugField,
} from './types';

export type Vec3Like = { x: number; y: number; z: number };
export type PartialVec3Like = { x?: number; y?: number; z?: number };
export type MetricValue = CameraMetrics[keyof CameraMetrics] | undefined;
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function isVec3Like(
  value: PartialVec3Like | MetricValue | CameraDebugValue,
): value is Vec3Like {
  if (typeof value !== 'object' || value === null) return false;
  const nextValue = value as PartialVec3Like;
  return (
    typeof nextValue.x === 'number' &&
    typeof nextValue.y === 'number' &&
    typeof nextValue.z === 'number'
  );
}
export function toVec3(value: PartialVec3Like | null | undefined): Vec3Like | null {
  if (!isVec3Like(value)) return null;
  return { x: value.x, y: value.y, z: value.z };
}
export function hasMetricChanged(newValue: MetricValue, oldValue: MetricValue): boolean {
  if (newValue === oldValue) return false;
  if (isVec3Like(newValue)) {
    if (!isVec3Like(oldValue)) return true;
    return newValue.x !== oldValue.x || newValue.y !== oldValue.y || newValue.z !== oldValue.z;
  }
  if (typeof newValue !== 'object' || newValue === null) return true;
  return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}
export function formatDebugValue(
  value: CameraDebugValue,
  precision = CAMERA_DEBUG_PANEL_DEFAULT_PRECISION,
  unavailable = CAMERA_DEBUG_PANEL_DEFAULT_LABELS.unavailable,
): ReactNode {
  if (value === null || value === undefined) return unavailable;
  if (isVec3Like(value)) {
    return `X:${value.x.toFixed(precision)} Y:${value.y.toFixed(precision)} Z:${value.z.toFixed(precision)}`;
  }
  if (typeof value === 'number') return value.toFixed(precision);
  return value.toString();
}
export function readMetricValue(metrics: CameraMetrics, key: string): CameraDebugValue {
  if (key in metrics) return metrics[key as keyof CameraMetrics] as CameraDebugValue;
  return undefined;
}
export function mergeLabels(overrides?: Partial<CameraDebugPanelLabels>): CameraDebugPanelLabels {
  return { ...CAMERA_DEBUG_PANEL_DEFAULT_LABELS, ...overrides };
}
export function mergeStyle(
  styles: CameraDebugPanelStyles | undefined,
  slot: CameraDebugPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
export function defaultClassFor(slot: CameraDebugPanelClassNameSlot): string {
  return CAMERA_DEBUG_PANEL_DEFAULT_CLASSES[slot];
}
export function resolveEnabledFields(
  fields: readonly DebugField[],
  customFields: readonly CustomField[] | undefined,
): Array<DebugField | CustomField> {
  return [...fields.filter((field) => field.enabled), ...(customFields ?? [])];
}
