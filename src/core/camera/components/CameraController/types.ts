import type { CSSProperties, ReactNode } from 'react';

import type { CameraCollisionMode, CameraOptionType, CameraType } from '../../core/types';

export type CameraControllerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type CameraModeConfig = {
  value: CameraType;
  label: string;
  icon?: ReactNode;
};
/** A button that picks what the camera does about occluders (`cameraOption.collisionMode`). */
export type CameraCollisionModeConfig = {
  value: CameraCollisionMode;
  label: string;
  icon?: ReactNode;
};
export type CameraControllerModeOption = Partial<
  Pick<
    CameraOptionType,
    | 'xDistance'
    | 'yDistance'
    | 'zDistance'
    | 'fov'
    | 'enableCollision'
    | 'enableZoom'
    | 'zoom'
    | 'minZoom'
    | 'maxZoom'
    | 'zoomSpeed'
    | 'smoothing'
  >
>;
export type CameraControllerLabels = {
  title: string;
  /** Accessible name of the occlusion buttons. */
  collision?: string;
};
export type CameraControllerClassNameSlot =
  | 'root'
  | 'floatingRoot'
  | 'compactRoot'
  | 'header'
  | 'title'
  | 'list'
  | 'modeButton'
  | 'activeModeButton'
  | 'modeIcon'
  | 'modeLabel';
export type CameraControllerClassNames = Partial<Record<CameraControllerClassNameSlot, string>>;
export type CameraControllerStyles = Partial<Record<CameraControllerClassNameSlot, CSSProperties>>;
export type CameraControllerActions = {
  selectMode: (mode: CameraType) => void;
  selectCollisionMode: (mode: CameraCollisionMode) => void;
};
export type CameraControllerRenderContext = {
  activeMode: CameraType;
  modes: readonly CameraModeConfig[];
  activeCollisionMode: CameraCollisionMode;
  collisionModes: readonly CameraCollisionModeConfig[];
  labels: CameraControllerLabels;
  showLabels: boolean;
  showTitle: boolean;
  compact: boolean;
  position: CameraControllerPosition | undefined;
  classNameFor: (slot: CameraControllerClassNameSlot, extra?: string) => string;
  styleFor: (slot: CameraControllerClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: CameraControllerActions;
};
export type CameraControllerRenderers = {
  root?: (context: CameraControllerRenderContext, children: ReactNode) => ReactNode;
  header?: (context: CameraControllerRenderContext) => ReactNode;
  list?: (context: CameraControllerRenderContext, children: ReactNode) => ReactNode;
  modeButton?: (
    context: CameraControllerRenderContext,
    mode: CameraModeConfig,
    active: boolean,
  ) => ReactNode;
  collisionButton?: (
    context: CameraControllerRenderContext,
    mode: CameraCollisionModeConfig,
    active: boolean,
  ) => ReactNode;
};
export type CameraControllerProps = {
  position?: CameraControllerPosition;
  showLabels?: boolean;
  showTitle?: boolean;
  compact?: boolean;
  modes?: readonly CameraModeConfig[];
  /** Occlusion buttons under the modes; an empty list hides them. */
  collisionModes?: readonly CameraCollisionModeConfig[];
  className?: string;
  style?: CSSProperties;
  classNames?: CameraControllerClassNames;
  styles?: CameraControllerStyles;
  labels?: Partial<CameraControllerLabels>;
  renderers?: CameraControllerRenderers;
  onModeChange?: (mode: CameraType) => void;
  onCollisionModeChange?: (mode: CameraCollisionMode) => void;
  children?: ReactNode;
};
