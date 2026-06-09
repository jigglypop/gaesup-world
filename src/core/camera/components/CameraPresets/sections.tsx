import React, { Fragment, type ReactNode } from 'react';

import { cx } from './helpers';
import type { CameraPreset, CameraPresetsRenderContext, CameraPresetsRenderers } from './types';

function renderPresetButton(
  context: CameraPresetsRenderContext,
  renderers: CameraPresetsRenderers | undefined,
  preset: CameraPreset,
): ReactNode {
  const active = context.currentPresetId === preset.id;
  if (renderers?.presetButton) {
    return <Fragment key={preset.id}>{renderers.presetButton(context, preset, active)}</Fragment>;
  }
  return (
    <button
      key={preset.id}
      type="button"
      className={cx(
        context.classNameFor('presetButton'),
        active && context.classNameFor('activePresetButton'),
      )}
      style={
        active
          ? context.styleFor('activePresetButton', context.styleFor('presetButton'))
          : context.styleFor('presetButton')
      }
      onClick={() => context.actions.applyPreset(preset)}
      aria-pressed={active}
    >
      {preset.icon && (
        <span className={context.classNameFor('presetIcon')} style={context.styleFor('presetIcon')}>
          {preset.icon}
        </span>
      )}
      <span
        className={context.classNameFor('presetContent')}
        style={context.styleFor('presetContent')}
      >
        <span className={context.classNameFor('presetName')} style={context.styleFor('presetName')}>
          {preset.name}
        </span>
        <span
          className={context.classNameFor('presetDescription')}
          style={context.styleFor('presetDescription')}
        >
          {preset.description}
        </span>
      </span>
    </button>
  );
}
function renderEmpty(
  context: CameraPresetsRenderContext,
  renderers?: CameraPresetsRenderers,
): ReactNode {
  if (renderers?.empty) return renderers.empty(context);
  return (
    <div className={context.classNameFor('empty')} style={context.styleFor('empty')}>
      {context.labels.empty}
    </div>
  );
}
function renderGrid(
  context: CameraPresetsRenderContext,
  renderers?: CameraPresetsRenderers,
): ReactNode {
  const children =
    context.presets.length > 0
      ? context.presets.map((preset) => renderPresetButton(context, renderers, preset))
      : renderEmpty(context, renderers);
  if (renderers?.grid) return renderers.grid(context, children);
  return (
    <div className={context.classNameFor('grid')} style={context.styleFor('grid')}>
      {children}
    </div>
  );
}
export function renderCameraPresetsContent(
  context: CameraPresetsRenderContext,
  renderers: CameraPresetsRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderGrid(context, renderers)}
      {children}
    </>
  );
}
