import type { CSSProperties, ReactNode } from 'react';

import type { CameraSettingsTabProps } from './CameraSettingsTab';
import type {
  AnimationControllerProps,
  AnimationDebugPanelProps,
  AnimationPlayerProps,
} from '../../../animation/components';
import type {
  CameraControllerProps,
  CameraDebugPanelProps,
  CameraPresetsProps,
} from '../../../camera/components';
import type { MotionControllerProps } from '../../../motions/controller/MotionController/types';
import type { MotionDebugPanelProps } from '../../../motions/ui/MotionDebugPanel/types';

export type EditorPanelBaseProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type AnimationPanelTab = 'Player' | 'Controller' | 'Debug';
export type CameraPanelTab = 'Controller' | 'Presets' | 'Debug' | 'Settings';
export type MotionPanelTab = 'Controller' | 'Debug';
export type AnimationPanelLabels = Record<AnimationPanelTab, string>;
export type AnimationPanelTabConfig = {
  id: AnimationPanelTab;
  label: string;
  disabled?: boolean;
  render?: (context: AnimationPanelRenderContext) => ReactNode;
};
export type AnimationPanelComponentProps = {
  player?: AnimationPlayerProps;
  controller?: AnimationControllerProps;
  debug?: AnimationDebugPanelProps;
};
export type AnimationPanelClassNameSlot =
  | 'root'
  | 'tabs'
  | 'tab'
  | 'activeTab'
  | 'content'
  | 'contentWrapper';
export type AnimationPanelClassNames = Partial<Record<AnimationPanelClassNameSlot, string>>;
export type AnimationPanelStyles = Partial<Record<AnimationPanelClassNameSlot, CSSProperties>>;
export type AnimationPanelActions = {
  setActiveTab: (tab: AnimationPanelTab) => void;
};
export type AnimationPanelRenderContext = {
  activeTab: AnimationPanelTab;
  tabs: readonly AnimationPanelTabConfig[];
  labels: AnimationPanelLabels;
  componentProps: AnimationPanelComponentProps;
  classNameFor: (slot: AnimationPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: AnimationPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: AnimationPanelActions;
};
export type AnimationPanelRenderers = {
  root?: (context: AnimationPanelRenderContext, children: ReactNode) => ReactNode;
  tabs?: (context: AnimationPanelRenderContext, children: ReactNode) => ReactNode;
  tab?: (
    context: AnimationPanelRenderContext,
    tab: AnimationPanelTabConfig,
    active: boolean,
  ) => ReactNode;
  content?: (context: AnimationPanelRenderContext, children: ReactNode) => ReactNode;
};
export type AnimationPanelProps = EditorPanelBaseProps & {
  activeTab?: AnimationPanelTab;
  defaultTab?: AnimationPanelTab;
  tabs?: readonly AnimationPanelTabConfig[];
  labels?: Partial<AnimationPanelLabels>;
  componentProps?: AnimationPanelComponentProps;
  classNames?: AnimationPanelClassNames;
  styles?: AnimationPanelStyles;
  renderers?: AnimationPanelRenderers;
  onTabChange?: (tab: AnimationPanelTab) => void;
};
export type MotionPanelLabels = Record<MotionPanelTab, string>;
export type MotionPanelTabConfig = {
  id: MotionPanelTab;
  label: string;
  disabled?: boolean;
  render?: (context: MotionPanelRenderContext) => ReactNode;
};
export type MotionPanelComponentProps = {
  controller?: MotionControllerProps;
  debug?: MotionDebugPanelProps;
};
export type MotionPanelClassNameSlot =
  | 'root'
  | 'tabs'
  | 'tab'
  | 'activeTab'
  | 'content'
  | 'contentWrapper';
export type MotionPanelClassNames = Partial<Record<MotionPanelClassNameSlot, string>>;
export type MotionPanelStyles = Partial<Record<MotionPanelClassNameSlot, CSSProperties>>;
export type MotionPanelActions = {
  setActiveTab: (tab: MotionPanelTab) => void;
};
export type MotionPanelRenderContext = {
  activeTab: MotionPanelTab;
  tabs: readonly MotionPanelTabConfig[];
  labels: MotionPanelLabels;
  componentProps: MotionPanelComponentProps;
  classNameFor: (slot: MotionPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: MotionPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: MotionPanelActions;
};
export type MotionPanelRenderers = {
  root?: (context: MotionPanelRenderContext, children: ReactNode) => ReactNode;
  tabs?: (context: MotionPanelRenderContext, children: ReactNode) => ReactNode;
  tab?: (
    context: MotionPanelRenderContext,
    tab: MotionPanelTabConfig,
    active: boolean,
  ) => ReactNode;
  content?: (context: MotionPanelRenderContext, children: ReactNode) => ReactNode;
};
export type MotionPanelProps = EditorPanelBaseProps & {
  activeTab?: MotionPanelTab;
  defaultTab?: MotionPanelTab;
  tabs?: readonly MotionPanelTabConfig[];
  labels?: Partial<MotionPanelLabels>;
  componentProps?: MotionPanelComponentProps;
  classNames?: MotionPanelClassNames;
  styles?: MotionPanelStyles;
  renderers?: MotionPanelRenderers;
  onTabChange?: (tab: MotionPanelTab) => void;
};
export type CameraPanelLabels = Record<CameraPanelTab, string>;
export type CameraPanelTabConfig = {
  id: CameraPanelTab;
  label: string;
  disabled?: boolean;
  render?: (context: CameraPanelRenderContext) => ReactNode;
};
export type CameraPanelComponentProps = {
  settings?: CameraSettingsTabProps;
  controller?: CameraControllerProps;
  presets?: CameraPresetsProps;
  debug?: CameraDebugPanelProps;
};
export type CameraPanelClassNameSlot = 'root' | 'tabs' | 'tab' | 'activeTab' | 'content';
export type CameraPanelClassNames = Partial<Record<CameraPanelClassNameSlot, string>>;
export type CameraPanelStyles = Partial<Record<CameraPanelClassNameSlot, CSSProperties>>;
export type CameraPanelActions = {
  setActiveTab: (tab: CameraPanelTab) => void;
};
export type CameraPanelRenderContext = {
  activeTab: CameraPanelTab;
  tabs: readonly CameraPanelTabConfig[];
  labels: CameraPanelLabels;
  componentProps: CameraPanelComponentProps;
  classNameFor: (slot: CameraPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: CameraPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: CameraPanelActions;
};
export type CameraPanelRenderers = {
  root?: (context: CameraPanelRenderContext, children: ReactNode) => ReactNode;
  tabs?: (context: CameraPanelRenderContext, children: ReactNode) => ReactNode;
  tab?: (
    context: CameraPanelRenderContext,
    tab: CameraPanelTabConfig,
    active: boolean,
  ) => ReactNode;
  content?: (context: CameraPanelRenderContext, children: ReactNode) => ReactNode;
};
export type CameraPanelProps = EditorPanelBaseProps & {
  activeTab?: CameraPanelTab;
  defaultTab?: CameraPanelTab;
  tabs?: readonly CameraPanelTabConfig[];
  labels?: Partial<CameraPanelLabels>;
  componentProps?: CameraPanelComponentProps;
  classNames?: CameraPanelClassNames;
  styles?: CameraPanelStyles;
  renderers?: CameraPanelRenderers;
  onTabChange?: (tab: CameraPanelTab) => void;
};

export type BlueprintType =
  | 'character'
  | 'vehicle'
  | 'airplane'
  | 'animation'
  | 'behavior'
  | 'item';

export type BlueprintCategory = {
  id: string;
  name: string;
  type: BlueprintType;
  count: number;
};

export type BlueprintItem = {
  id: string;
  name: string;
  type: BlueprintType;
  version: string;
  tags: string[];
  description?: string;
  lastModified: string;
  thumbnail?: string;
};
