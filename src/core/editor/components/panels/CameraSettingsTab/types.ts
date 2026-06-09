import type { CSSProperties, ReactNode } from 'react';

import type { CameraOptionType } from '../../../../camera/core/types';

export type CameraSettingsMode = {
  control?: string;
};
export type CameraSettingsFieldKind = 'range' | 'checkbox';
export type CameraSettingsFieldValue = number | boolean;
export type CameraSettingsFieldPath =
  | 'xDistance'
  | 'yDistance'
  | 'zDistance'
  | 'fov'
  | 'enableZoom'
  | 'zoomSpeed'
  | 'minZoom'
  | 'maxZoom'
  | 'enableCollision'
  | 'enableFocus'
  | 'focusDistance'
  | 'maxDistance'
  | 'smoothing.position'
  | 'smoothing.rotation'
  | 'smoothing.fov'
  | 'bounds.minY'
  | 'bounds.maxY';
export type CameraSettingsField = {
  key: string;
  label: string;
  kind: CameraSettingsFieldKind;
  defaultValue: CameraSettingsFieldValue;
  path?: CameraSettingsFieldPath;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  visible?: boolean;
  getValue?: (cameraOption: CameraOptionType) => CameraSettingsFieldValue;
  createUpdate?: (
    cameraOption: CameraOptionType,
    value: CameraSettingsFieldValue,
  ) => Partial<CameraOptionType>;
};
export type CameraSettingsSection = {
  key: string;
  title: string;
  fields: readonly CameraSettingsField[];
  visible?: boolean;
};
export type CameraSettingsResolvedField = CameraSettingsField & {
  value: CameraSettingsFieldValue;
  formattedValue: ReactNode;
};
export type CameraSettingsResolvedSection = Omit<CameraSettingsSection, 'fields'> & {
  fields: readonly CameraSettingsResolvedField[];
};
export type CameraSettingsLabels = {
  modePrefix: string;
  fallbackMode: string;
  enabled: string;
  disabled: string;
};
export type CameraSettingsClassNameSlot =
  | 'root'
  | 'mode'
  | 'section'
  | 'sectionTitle'
  | 'field'
  | 'fieldLabel'
  | 'fieldControl'
  | 'rangeInput'
  | 'checkboxInput'
  | 'fieldValue';
export type CameraSettingsClassNames = Partial<Record<CameraSettingsClassNameSlot, string>>;
export type CameraSettingsStyles = Partial<Record<CameraSettingsClassNameSlot, CSSProperties>>;
export type CameraSettingsActions = {
  updateField: (field: CameraSettingsField, value: CameraSettingsFieldValue) => void;
};
export type CameraSettingsRenderContext = {
  cameraOption: CameraOptionType;
  mode: CameraSettingsMode;
  labels: CameraSettingsLabels;
  sections: readonly CameraSettingsResolvedSection[];
  showMode: boolean;
  classNameFor: (slot: CameraSettingsClassNameSlot, extra?: string) => string;
  styleFor: (slot: CameraSettingsClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: CameraSettingsActions;
};
export type CameraSettingsRenderers = {
  root?: (context: CameraSettingsRenderContext, children: ReactNode) => ReactNode;
  mode?: (context: CameraSettingsRenderContext) => ReactNode;
  section?: (
    context: CameraSettingsRenderContext,
    section: CameraSettingsResolvedSection,
    children: ReactNode,
  ) => ReactNode;
  field?: (context: CameraSettingsRenderContext, field: CameraSettingsResolvedField) => ReactNode;
};
export type CameraSettingsTabProps = {
  cameraOption?: CameraOptionType;
  mode?: CameraSettingsMode;
  sections?: readonly CameraSettingsSection[];
  showMode?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: CameraSettingsClassNames;
  styles?: CameraSettingsStyles;
  labels?: Partial<CameraSettingsLabels>;
  renderers?: CameraSettingsRenderers;
  formatValue?: (
    field: CameraSettingsField,
    value: CameraSettingsFieldValue,
    labels: CameraSettingsLabels,
  ) => ReactNode;
  onCameraOptionChange?: (
    update: Partial<CameraOptionType>,
    field: CameraSettingsField,
    value: CameraSettingsFieldValue,
  ) => void;
  children?: ReactNode;
};
