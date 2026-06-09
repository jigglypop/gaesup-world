import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  CAMERA_DEBUG_PANEL_DEFAULT_CLASSES,
  CAMERA_DEBUG_PANEL_DEFAULT_FIELDS,
  CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL,
  CAMERA_DEBUG_PANEL_DEFAULT_LABELS,
  CAMERA_DEBUG_PANEL_DEFAULT_PRECISION,
  createInitialCameraMetrics,
} from './defaults';
import {
  cx,
  formatDebugValue,
  hasMetricChanged,
  mergeLabels,
  mergeStyle,
  readMetricValue,
  resolveEnabledFields,
  toVec3,
} from './helpers';
import { renderCameraDebugPanelContent } from './sections';
import type {
  CameraDebugValue,
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelProps,
  CameraDebugPanelRenderContext,
  CameraDebugPanelResolvedField,
  CameraMetrics,
} from './types';
import { useStateSystem } from '../../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../../stores/gaesupStore';
import './styles.css';

export function CameraDebugPanel({
  position,
  visible = true,
  updateInterval = CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL,
  zIndex,
  compact = false,
  theme = 'dark',
  fields = CAMERA_DEBUG_PANEL_DEFAULT_FIELDS,
  precision = CAMERA_DEBUG_PANEL_DEFAULT_PRECISION,
  width,
  height,
  customFields,
  className,
  style,
  classNames,
  styles,
  labels: labelOverrides,
  renderers,
  formatValue,
  children,
}: CameraDebugPanelProps = {}) {
  const initialMetrics = useMemo(() => createInitialCameraMetrics(), []);
  const [metrics, setMetrics] = useState<CameraMetrics>(initialMetrics);
  const mode = useGaesupStore((state) => state.mode);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const { activeState } = useStateSystem();
  const metricsRef = useRef<CameraMetrics>(initialMetrics);
  const labels = useMemo(() => mergeLabels(labelOverrides), [labelOverrides]);
  const updateMetrics = useCallback(() => {
    const distance =
      cameraOption?.xDistance !== undefined &&
      cameraOption?.yDistance !== undefined &&
      cameraOption?.zDistance !== undefined
        ? {
            x: cameraOption.xDistance,
            y: cameraOption.yDistance,
            z: cameraOption.zDistance,
          }
        : null;
    const lastUpdateTime = Date.now();
    const newMetrics: CameraMetrics = {
      ...metricsRef.current,
      frameCount: metricsRef.current.frameCount + 1,
      averageFrameTime: lastUpdateTime - metricsRef.current.lastUpdateTime,
      mode: mode?.control ?? 'unknown',
      activeController: cameraOption?.mode ?? mode?.control ?? 'unknown',
      distance,
      fov: cameraOption?.fov ?? 0,
      position: toVec3(activeState?.position),
      targetPosition: toVec3(cameraOption?.target),
      velocity: toVec3(activeState?.velocity),
      rotation: toVec3(activeState?.euler),
      lastUpdateTime,
      ...(cameraOption?.zoom !== undefined ? { zoom: cameraOption.zoom } : {}),
    };
    const hasChanged = Object.keys(newMetrics).some((key) =>
      hasMetricChanged(
        newMetrics[key as keyof CameraMetrics],
        metricsRef.current[key as keyof CameraMetrics],
      ),
    );
    if (hasChanged) {
      metricsRef.current = newMetrics;
      setMetrics(newMetrics);
    }
  }, [activeState, cameraOption, mode]);
  useEffect(() => {
    if (!visible) return undefined;
    updateMetrics();
    const intervalId = setInterval(updateMetrics, updateInterval);
    return () => {
      clearInterval(intervalId);
    };
  }, [updateInterval, updateMetrics, visible]);
  const resolvedFields = useMemo<CameraDebugPanelResolvedField[]>(() => {
    return resolveEnabledFields(fields, customFields).map((field) => {
      const value: CameraDebugValue =
        'getValue' in field ? field.getValue() : readMetricValue(metrics, field.key);
      const fieldPrecision = field.precision ?? precision;
      const formattedValue =
        formatValue?.(value, field, fieldPrecision) ??
        formatDebugValue(value, fieldPrecision, labels.unavailable);
      return {
        key: field.key,
        label: field.label,
        value,
        formattedValue,
        ...(field.format ? { format: field.format } : {}),
      };
    });
  }, [customFields, fields, formatValue, labels.unavailable, metrics, precision]);
  const classNameFor = useCallback(
    (slot: CameraDebugPanelClassNameSlot, extra?: string) =>
      cx(
        CAMERA_DEBUG_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && position && CAMERA_DEBUG_PANEL_DEFAULT_CLASSES.floatingRoot,
        slot === 'root' && position && `camera-debug-panel--${position}`,
        slot === 'root' && compact && CAMERA_DEBUG_PANEL_DEFAULT_CLASSES.compactRoot,
        slot === 'root' && theme && `camera-debug-panel--${theme}`,
        slot === 'root' && className,
        extra,
      ),
    [className, classNames, compact, position, theme],
  );
  const styleFor = useCallback(
    (slot: CameraDebugPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, width, height, zIndex, ...style };
    },
    [height, style, styles, width, zIndex],
  );
  const context = useMemo<CameraDebugPanelRenderContext>(
    () => ({
      metrics,
      fields: resolvedFields,
      labels,
      visible,
      compact,
      theme,
      position,
      classNameFor,
      styleFor,
    }),
    [classNameFor, compact, labels, metrics, position, resolvedFields, styleFor, theme, visible],
  );
  if (!visible) return null;
  const content = renderCameraDebugPanelContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  CAMERA_DEBUG_PANEL_DEFAULT_CLASSES,
  CAMERA_DEBUG_PANEL_DEFAULT_FIELDS,
  CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL,
  CAMERA_DEBUG_PANEL_DEFAULT_LABELS,
  CAMERA_DEBUG_PANEL_DEFAULT_PRECISION,
  createInitialCameraMetrics,
};
export type * from './types';
