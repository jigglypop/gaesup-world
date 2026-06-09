import React, { useCallback, useMemo, type CSSProperties } from 'react';

import {
  CAMERA_PRESETS_DEFAULT_CLASSES,
  CAMERA_PRESETS_DEFAULT_LABELS,
  CAMERA_PRESETS_DEFAULT_PRESETS,
  CAMERA_PRESETS_DEFAULT_SMOOTHING,
} from './defaults';
import { cx, getCurrentPresetId, mergeLabels, mergeStyle } from './helpers';
import { renderCameraPresetsContent } from './sections';
import type {
  CameraPreset,
  CameraPresetsClassNameSlot,
  CameraPresetsProps,
  CameraPresetsRenderContext,
} from './types';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';

export function CameraPresets({
  position,
  presets = CAMERA_PRESETS_DEFAULT_PRESETS,
  className,
  style,
  classNames,
  styles,
  labels: labelOverrides,
  renderers,
  onApplyPreset,
  children,
}: CameraPresetsProps = {}) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const mode = useGaesupStore((state) => state.mode?.control);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const labels = useMemo(() => mergeLabels(labelOverrides), [labelOverrides]);
  const currentPresetId = useMemo(
    () => getCurrentPresetId(presets, mode, cameraOption),
    [cameraOption, mode, presets],
  );
  const applyPreset = useCallback(
    (preset: CameraPreset) => {
      setMode({ control: preset.config.mode });
      setCameraOption({
        xDistance: preset.config.distance.x,
        yDistance: preset.config.distance.y,
        zDistance: preset.config.distance.z,
        fov: preset.config.fov,
        smoothing: preset.config.smoothing ?? CAMERA_PRESETS_DEFAULT_SMOOTHING,
      });
      onApplyPreset?.(preset);
    },
    [onApplyPreset, setCameraOption, setMode],
  );
  const classNameFor = useCallback(
    (slot: CameraPresetsClassNameSlot, extra?: string) =>
      cx(
        CAMERA_PRESETS_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && position && CAMERA_PRESETS_DEFAULT_CLASSES.floatingRoot,
        slot === 'root' && position && `camera-presets-panel--${position}`,
        slot === 'root' && className,
        extra,
      ),
    [className, classNames, position],
  );
  const styleFor = useCallback(
    (slot: CameraPresetsClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      return slot === 'root' ? { ...nextStyle, ...style } : nextStyle;
    },
    [style, styles],
  );
  const context = useMemo<CameraPresetsRenderContext>(
    () => ({
      presets,
      currentPresetId,
      mode,
      cameraOption,
      labels,
      position,
      classNameFor,
      styleFor,
      actions: { applyPreset },
    }),
    [
      applyPreset,
      cameraOption,
      classNameFor,
      currentPresetId,
      labels,
      mode,
      position,
      presets,
      styleFor,
    ],
  );
  const content = renderCameraPresetsContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  CAMERA_PRESETS_DEFAULT_CLASSES,
  CAMERA_PRESETS_DEFAULT_LABELS,
  CAMERA_PRESETS_DEFAULT_PRESETS,
  CAMERA_PRESETS_DEFAULT_SMOOTHING,
};
export type {
  CameraPreset,
  CameraPresetsActions,
  CameraPresetsClassNameSlot,
  CameraPresetsClassNames,
  CameraPresetsLabels,
  CameraPresetsPosition,
  CameraPresetsProps,
  CameraPresetsRenderContext,
  CameraPresetsRenderers,
  CameraPresetsStyles,
} from './types';
