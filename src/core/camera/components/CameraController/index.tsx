import React, { useCallback, useMemo, type CSSProperties } from 'react';

import { useShallow } from 'zustand/react/shallow';

import {
  CAMERA_CONTROLLER_DEFAULT_CLASSES,
  CAMERA_CONTROLLER_DEFAULT_LABELS,
  CAMERA_CONTROLLER_DEFAULT_MODES,
  CAMERA_CONTROLLER_MODE_OPTIONS,
} from './defaults';
import { cx, mergeLabels, mergeStyle } from './helpers';
import { renderCameraControllerContent } from './sections';
import type {
  CameraControllerClassNameSlot,
  CameraControllerProps,
  CameraControllerRenderContext,
} from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import type { CameraType } from '../../core/types';
import './styles.css';

export function CameraController({
  position,
  showLabels = true,
  showTitle = false,
  compact = false,
  modes = CAMERA_CONTROLLER_DEFAULT_MODES,
  className,
  style,
  classNames,
  styles,
  labels: labelOverrides,
  renderers,
  onModeChange,
  children,
}: CameraControllerProps = {}) {
  const { mode, setCameraOption, setMode } = useGaesupStore(
    useShallow((state) => ({
      mode: state.mode,
      setCameraOption: state.setCameraOption,
      setMode: state.setMode,
    })),
  );
  const activeMode = mode?.control || 'thirdPerson';
  const labels = useMemo(() => mergeLabels(labelOverrides), [labelOverrides]);
  const selectMode = useCallback(
    (nextMode: CameraType) => {
      setMode({ control: nextMode });
      setCameraOption(CAMERA_CONTROLLER_MODE_OPTIONS[nextMode]);
      onModeChange?.(nextMode);
    },
    [onModeChange, setCameraOption, setMode],
  );
  const classNameFor = useCallback(
    (slot: CameraControllerClassNameSlot, extra?: string) =>
      cx(
        CAMERA_CONTROLLER_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && position && `camera-controller-panel--${position}`,
        slot === 'root' && position && CAMERA_CONTROLLER_DEFAULT_CLASSES.floatingRoot,
        slot === 'root' && compact && CAMERA_CONTROLLER_DEFAULT_CLASSES.compactRoot,
        slot === 'root' && className,
        extra,
      ),
    [className, classNames, compact, position],
  );
  const styleFor = useCallback(
    (slot: CameraControllerClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      return slot === 'root' ? { ...nextStyle, ...style } : nextStyle;
    },
    [style, styles],
  );
  const context = useMemo<CameraControllerRenderContext>(
    () => ({
      activeMode,
      modes,
      labels,
      showLabels,
      showTitle,
      compact,
      position,
      classNameFor,
      styleFor,
      actions: { selectMode },
    }),
    [
      activeMode,
      classNameFor,
      compact,
      labels,
      modes,
      position,
      selectMode,
      showLabels,
      showTitle,
      styleFor,
    ],
  );
  const content = renderCameraControllerContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  CAMERA_CONTROLLER_DEFAULT_CLASSES,
  CAMERA_CONTROLLER_DEFAULT_LABELS,
  CAMERA_CONTROLLER_DEFAULT_MODES,
  CAMERA_CONTROLLER_MODE_OPTIONS,
};
export type {
  CameraControllerActions,
  CameraControllerClassNameSlot,
  CameraControllerClassNames,
  CameraControllerLabels,
  CameraControllerModeOption,
  CameraControllerPosition,
  CameraControllerProps,
  CameraControllerRenderContext,
  CameraControllerRenderers,
  CameraControllerStyles,
  CameraModeConfig,
} from './types';
