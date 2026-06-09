import React, { useCallback, useMemo, type CSSProperties } from 'react';

import {
  CAMERA_SETTINGS_DEFAULT_CLASSES,
  CAMERA_SETTINGS_DEFAULT_LABELS,
  CAMERA_SETTINGS_DEFAULT_SECTIONS,
} from './defaults';
import {
  createCameraSettingsUpdate,
  cx,
  formatCameraSettingsValue,
  mergeLabels,
  mergeStyle,
  readCameraSettingsValue,
  resolveVisibleSections,
} from './helpers';
import { renderCameraSettingsTabContent } from './sections';
import type {
  CameraSettingsClassNameSlot,
  CameraSettingsField,
  CameraSettingsFieldValue,
  CameraSettingsRenderContext,
  CameraSettingsResolvedSection,
  CameraSettingsTabProps,
} from './types';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import './styles.css';

export function CameraSettingsTab({
  cameraOption,
  mode,
  sections = CAMERA_SETTINGS_DEFAULT_SECTIONS,
  showMode = true,
  className,
  style,
  classNames,
  styles,
  labels: labelOverrides,
  renderers,
  formatValue,
  onCameraOptionChange,
  children,
}: CameraSettingsTabProps = {}) {
  const storeCameraOption = useGaesupStore((state) => state.cameraOption);
  const storeMode = useGaesupStore((state) => state.mode);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const resolvedCameraOption = cameraOption ?? storeCameraOption;
  const resolvedMode = mode ?? storeMode;
  const labels = useMemo(() => mergeLabels(labelOverrides), [labelOverrides]);
  const handleUpdateField = useCallback(
    (field: CameraSettingsField, value: CameraSettingsFieldValue) => {
      const update = createCameraSettingsUpdate(resolvedCameraOption, field, value);
      if (onCameraOptionChange) {
        onCameraOptionChange(update, field, value);
        return;
      }
      setCameraOption(update);
    },
    [onCameraOptionChange, resolvedCameraOption, setCameraOption],
  );
  const resolvedSections = useMemo<CameraSettingsResolvedSection[]>(() => {
    return resolveVisibleSections(sections).map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const value = readCameraSettingsValue(resolvedCameraOption, field);
        return {
          ...field,
          value,
          formattedValue:
            formatValue?.(field, value, labels) ?? formatCameraSettingsValue(field, value, labels),
        };
      }),
    }));
  }, [formatValue, labels, resolvedCameraOption, sections]);
  const classNameFor = useCallback(
    (slot: CameraSettingsClassNameSlot, extra?: string) =>
      cx(
        CAMERA_SETTINGS_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: CameraSettingsClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, ...style };
    },
    [style, styles],
  );
  const context = useMemo<CameraSettingsRenderContext>(
    () => ({
      cameraOption: resolvedCameraOption,
      mode: resolvedMode,
      labels,
      sections: resolvedSections,
      showMode,
      classNameFor,
      styleFor,
      actions: { updateField: handleUpdateField },
    }),
    [
      classNameFor,
      handleUpdateField,
      labels,
      resolvedCameraOption,
      resolvedMode,
      resolvedSections,
      showMode,
      styleFor,
    ],
  );
  const content = renderCameraSettingsTabContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  CAMERA_SETTINGS_DEFAULT_CLASSES,
  CAMERA_SETTINGS_DEFAULT_LABELS,
  CAMERA_SETTINGS_DEFAULT_SECTIONS,
};
export type * from './types';
