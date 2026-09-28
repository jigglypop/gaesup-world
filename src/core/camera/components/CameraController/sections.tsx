import { Fragment, type ReactNode } from 'react';

import { cx } from './helpers';
import type {
  CameraCollisionModeConfig,
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
function renderButton(
  context: CameraControllerRenderContext,
  option: CameraModeConfig | CameraCollisionModeConfig,
  active: boolean,
  select: () => void,
): ReactNode {
  return (
    <button
      key={option.value}
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
      onClick={select}
      aria-pressed={active}
    >
      {option.icon && (
        <span className={context.classNameFor('modeIcon')} style={context.styleFor('modeIcon')}>
          {option.icon}
        </span>
      )}
      {context.showLabels && (
        <span className={context.classNameFor('modeLabel')} style={context.styleFor('modeLabel')}>
          {option.label}
        </span>
      )}
    </button>
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
  return renderButton(context, mode, active, () => context.actions.selectMode(mode.value));
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
function renderCollisionList(
  context: CameraControllerRenderContext,
  renderers?: CameraControllerRenderers,
): ReactNode {
  if (context.collisionModes.length === 0) return null;
  const children = context.collisionModes.map((mode) => {
    const active = context.activeCollisionMode === mode.value;
    if (renderers?.collisionButton) {
      return <Fragment key={mode.value}>{renderers.collisionButton(context, mode, active)}</Fragment>;
    }
    return renderButton(context, mode, active, () => context.actions.selectCollisionMode(mode.value));
  });
  return (
    <div
      role="group"
      aria-label={context.labels.collision}
      className={context.classNameFor('list', 'camera-controller-panel-list--collision')}
      style={context.styleFor('list')}
    >
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
      {renderCollisionList(context, renderers)}
      {children}
    </>
  );
}
