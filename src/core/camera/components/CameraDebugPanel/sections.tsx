import React, { Fragment, type ReactNode } from 'react';

import type {
  CameraDebugPanelRenderContext,
  CameraDebugPanelRenderers,
  CameraDebugPanelResolvedField,
} from './types';

function renderField(
  context: CameraDebugPanelRenderContext,
  renderers: CameraDebugPanelRenderers | undefined,
  field: CameraDebugPanelResolvedField,
): ReactNode {
  if (renderers?.field)
    return <Fragment key={field.key}>{renderers.field(context, field)}</Fragment>;
  return (
    <div key={field.key} className={context.classNameFor('item')} style={context.styleFor('item')}>
      <span className={context.classNameFor('label')} style={context.styleFor('label')}>
        {field.label}
      </span>
      <span className={context.classNameFor('value')} style={context.styleFor('value')}>
        {field.formattedValue}
      </span>
    </div>
  );
}
function renderEmpty(
  context: CameraDebugPanelRenderContext,
  renderers?: CameraDebugPanelRenderers,
): ReactNode {
  if (renderers?.empty) return renderers.empty(context);
  return (
    <div className={context.classNameFor('empty')} style={context.styleFor('empty')}>
      {context.labels.empty}
    </div>
  );
}
function renderGrid(
  context: CameraDebugPanelRenderContext,
  renderers?: CameraDebugPanelRenderers,
): ReactNode {
  const children =
    context.fields.length > 0
      ? context.fields.map((field) => renderField(context, renderers, field))
      : renderEmpty(context, renderers);
  if (renderers?.grid) return renderers.grid(context, children);
  return (
    <div className={context.classNameFor('grid')} style={context.styleFor('grid')}>
      {children}
    </div>
  );
}
export function renderCameraDebugPanelContent(
  context: CameraDebugPanelRenderContext,
  renderers: CameraDebugPanelRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderGrid(context, renderers)}
      {children}
    </>
  );
}
