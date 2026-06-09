import type { CSSProperties, ReactNode } from 'react';

import type { DebugValue } from '@core/types/common';

export type CameraDebugPanelPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type CameraDebugPanelTheme = 'dark' | 'light' | 'glass';
export type DebugFieldFormat = 'number' | 'vector3' | 'text' | 'angle';
export type CameraDebugValue = DebugValue | null | undefined;
export type DebugField = {
  key: string;
  label: string;
  enabled: boolean;
  format?: DebugFieldFormat;
  precision?: number;
};
export type CustomField = {
  key: string;
  label: string;
  getValue: () => CameraDebugValue;
  format?: DebugFieldFormat;
  precision?: number;
};
export type CameraMetrics = {
  frameCount: number;
  averageFrameTime: number;
  lastUpdateTime: number;
  mode: string;
  activeController: string;
  distance: { x: number; y: number; z: number } | null;
  fov: number;
  position: { x: number; y: number; z: number } | null;
  targetPosition: { x: number; y: number; z: number } | null;
  velocity?: { x: number; y: number; z: number } | null;
  rotation?: { x: number; y: number; z: number } | null;
  zoom?: number;
};
export type CameraDebugPanelLabels = {
  empty: string;
  unavailable: string;
};
export type CameraDebugPanelClassNameSlot =
  | 'root'
  | 'floatingRoot'
  | 'compactRoot'
  | 'grid'
  | 'item'
  | 'label'
  | 'value'
  | 'empty';
export type CameraDebugPanelClassNames = Partial<Record<CameraDebugPanelClassNameSlot, string>>;
export type CameraDebugPanelStyles = Partial<Record<CameraDebugPanelClassNameSlot, CSSProperties>>;
export type CameraDebugPanelResolvedField = {
  key: string;
  label: string;
  value: CameraDebugValue;
  formattedValue: ReactNode;
  format?: DebugFieldFormat;
};
export type CameraDebugPanelRenderContext = {
  metrics: CameraMetrics;
  fields: readonly CameraDebugPanelResolvedField[];
  labels: CameraDebugPanelLabels;
  visible: boolean;
  compact: boolean;
  theme: CameraDebugPanelTheme;
  position: CameraDebugPanelPosition | undefined;
  classNameFor: (slot: CameraDebugPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: CameraDebugPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
};
export type CameraDebugPanelRenderers = {
  root?: (context: CameraDebugPanelRenderContext, children: ReactNode) => ReactNode;
  grid?: (context: CameraDebugPanelRenderContext, children: ReactNode) => ReactNode;
  field?: (
    context: CameraDebugPanelRenderContext,
    field: CameraDebugPanelResolvedField,
  ) => ReactNode;
  empty?: (context: CameraDebugPanelRenderContext) => ReactNode;
};
export type CameraDebugPanelProps = {
  position?: CameraDebugPanelPosition;
  visible?: boolean;
  updateInterval?: number;
  zIndex?: number;
  compact?: boolean;
  theme?: CameraDebugPanelTheme;
  fields?: readonly DebugField[];
  precision?: number;
  width?: number | string;
  height?: number | string;
  customFields?: readonly CustomField[];
  className?: string;
  style?: CSSProperties;
  classNames?: CameraDebugPanelClassNames;
  styles?: CameraDebugPanelStyles;
  labels?: Partial<CameraDebugPanelLabels>;
  renderers?: CameraDebugPanelRenderers;
  formatValue?: (
    value: CameraDebugValue,
    field: DebugField | CustomField,
    precision: number,
  ) => ReactNode;
  children?: ReactNode;
};
