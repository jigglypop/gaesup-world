import React, { Fragment, type ReactNode } from 'react';

import { cx } from './helpers';
import type {
  CameraControllerRenderContext,
  CameraControllerRenderers,
  CameraModeConfig,
} from './types';

function renderHeader(
  context: CameraControllerRenderContext,
  renderers?: CameraControllerRenderers,
): ReactNode {
  if (!context.showTitle) return null;
  if (renderers?.header) return renderers.header(context);
  return (
    <div className={context.classNameFor('header')} style={context.styleFor('header')}>
      <span className={context.classNameFor('title')} style={context.styleFor('title')}>
        {context.labels.title}
      </span>
    </div>
  );
}
function renderModeButton(
  context: CameraControllerRenderContext,
  renderers: CameraControllerRenderers | undefined,
  mode: CameraModeConfig,
): ReactNode {
  const active = context.activeMode === mode.value;
  if (renderers?.modeButton) {
    return <Fragment key={mode.value}>{renderers.modeButton(context, mode, active)}</Fragment>;
  }
  return (
    <button
      key={mode.value}
      type="button"
      className={cx(
        context.classNameFor('modeButton'),
        active && context.classNameFor('activeModeButton'),
      )}
      style={
        active
          ? context.styleFor('activeModeButton', context.styleFor('modeButton'))
          : context.styleFor('modeButton')
      }
      onClick={() => context.actions.selectMode(mode.value)}
      aria-pressed={active}
    >
      {mode.icon && (
        <span className={context.classNameFor('modeIcon')} style={context.styleFor('modeIcon')}>
          {mode.icon}
        </span>
      )}
      {context.showLabels && (
        <span className={context.classNameFor('modeLabel')} style={context.styleFor('modeLabel')}>
          {mode.label}
        </span>
      )}
    </button>
  );
}
function renderList(
  context: CameraControllerRenderContext,
  renderers?: CameraControllerRenderers,
): ReactNode {
  const children = context.modes.map((mode) => renderModeButton(context, renderers, mode));
  if (renderers?.list) return renderers.list(context, children);
  return (
    <div className={context.classNameFor('list')} style={context.styleFor('list')}>
      {children}
    </div>
  );
}
export function renderCameraControllerContent(
  context: CameraControllerRenderContext,
  renderers: CameraControllerRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderHeader(context, renderers)}
      {renderList(context, renderers)}
      {children}
    </>
  );
}
