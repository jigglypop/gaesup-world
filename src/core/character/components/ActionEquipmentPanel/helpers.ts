import type { CSSProperties } from 'react';

import {
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
} from './defaults';
import type {
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabels,
  ActionEquipmentPanelStyles,
} from './types';
import type { FaceStyle } from '../../types';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function mergeActionEquipmentPanelFeatures(
  overrides?: ActionEquipmentPanelFeatures,
): Required<ActionEquipmentPanelFeatures> {
  return { ...ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES, ...overrides };
}
export function mergeActionEquipmentPanelLabels(
  overrides?: Partial<ActionEquipmentPanelLabels>,
): ActionEquipmentPanelLabels {
  return { ...ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS, ...overrides };
}
export function mergeActionEquipmentPanelFaceLabels(
  overrides?: Partial<Record<FaceStyle, string>>,
): Record<FaceStyle, string> {
  return { ...ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS, ...overrides };
}
export function mergeActionEquipmentPanelStyle(
  styles: ActionEquipmentPanelStyles | undefined,
  slot: ActionEquipmentPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
