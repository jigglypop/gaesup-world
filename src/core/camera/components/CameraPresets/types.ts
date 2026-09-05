import type { CSSProperties, ReactNode } from 'react';

import type { CameraOptionType, CameraType } from '../../core/types';

export type CameraPreset = {
  id: string;
  name: string;
  description: string;
  icon?: ReactNode;
  config: {
    mode: CameraType;
    distance: { x: number; y: number; z: number };
    fov: number;
    smoothing?: {
      position: number;
      rotation: number;
      fov: number;
    };
  };
};
export type CameraPresetsLabels = {
  empty: string;
};
export type CameraPresetsClassNameSlot =
  | 'root'
  | 'floatingRoot'
  | 'grid'
  | 'presetButton'
  | 'activePresetButton'
  | 'presetIcon'
  | 'presetContent'
  | 'presetName'
  | 'presetDescription'
  | 'empty';
export type CameraPresetsClassNames = Partial<Record<CameraPresetsClassNameSlot, string>>;
export type CameraPresetsStyles = Partial<Record<CameraPresetsClassNameSlot, CSSProperties>>;
export type CameraPresetsPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type CameraPresetsActions = {
  applyPreset: (preset: CameraPreset) => void;
};
export type CameraPresetsRenderContext = {
  presets: readonly CameraPreset[];
  currentPresetId: string | null;
  mode: CameraType | undefined;
  cameraOption: CameraOptionType | undefined;
  labels: CameraPresetsLabels;
  position: CameraPresetsPosition | undefined;
  classNameFor: (slot: CameraPresetsClassNameSlot, extra?: string) => string;
  styleFor: (slot: CameraPresetsClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: CameraPresetsActions;
};
export type CameraPresetsRenderers = {
  root?: (context: CameraPresetsRenderContext, children: ReactNode) => ReactNode;
  grid?: (context: CameraPresetsRenderContext, children: ReactNode) => ReactNode;
  presetButton?: (
    context: CameraPresetsRenderContext,
    preset: CameraPreset,
    active: boolean,
  ) => ReactNode;
  empty?: (context: CameraPresetsRenderContext) => ReactNode;
};
export type CameraPresetsProps = {
  position?: CameraPresetsPosition;
  presets?: readonly CameraPreset[];
  className?: string;
  style?: CSSProperties;
  classNames?: CameraPresetsClassNames;
  styles?: CameraPresetsStyles;
  labels?: Partial<CameraPresetsLabels>;
  renderers?: CameraPresetsRenderers;
  onApplyPreset?: (preset: CameraPreset) => void;
  children?: ReactNode;
};
