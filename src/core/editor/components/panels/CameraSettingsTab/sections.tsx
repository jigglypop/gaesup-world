import React, { type ReactNode } from 'react';

import { toBoolean, toNumber } from './helpers';
import type {
  CameraSettingsRenderContext,
  CameraSettingsRenderers,
  CameraSettingsResolvedField,
  CameraSettingsResolvedSection,
} from './types';

function renderField(
  context: CameraSettingsRenderContext,
  renderers: CameraSettingsRenderers | undefined,
  field: CameraSettingsResolvedField,
): ReactNode {
  if (renderers?.field) return renderers.field(context, field);
  const control =
    field.kind === 'checkbox' ? (
      <input
        aria-label={field.label}
        className={context.classNameFor('checkboxInput')}
        checked={toBoolean(field.value)}
        disabled={field.disabled}
        onChange={(event) => context.actions.updateField(field, event.target.checked)}
        style={context.styleFor('checkboxInput')}
        type="checkbox"
      />
    ) : (
      <input
        aria-label={field.label}
        className={context.classNameFor('rangeInput')}
        disabled={field.disabled}
        max={field.max}
        min={field.min}
        onChange={(event) => context.actions.updateField(field, Number(event.target.value))}
        step={field.step}
        style={context.styleFor('rangeInput')}
        type="range"
        value={toNumber(field.value)}
      />
    );
  return (
    <div
      className={context.classNameFor('field')}
      key={field.key}
      style={context.styleFor('field')}
    >
      <span className={context.classNameFor('fieldLabel')} style={context.styleFor('fieldLabel')}>
        {field.label}
      </span>
      <span
        className={context.classNameFor('fieldControl')}
        style={context.styleFor('fieldControl')}
      >
        {control}
      </span>
      <span className={context.classNameFor('fieldValue')} style={context.styleFor('fieldValue')}>
        {field.formattedValue}
      </span>
    </div>
  );
}
function renderSection(
  context: CameraSettingsRenderContext,
  renderers: CameraSettingsRenderers | undefined,
  section: CameraSettingsResolvedSection,
): ReactNode {
  const children = section.fields.map((field) => renderField(context, renderers, field));
  if (renderers?.section) return renderers.section(context, section, children);
  return (
    <section
      className={context.classNameFor('section')}
      key={section.key}
      style={context.styleFor('section')}
    >
      <h3 className={context.classNameFor('sectionTitle')} style={context.styleFor('sectionTitle')}>
        {section.title}
      </h3>
      {children}
    </section>
  );
}
function renderMode(
  context: CameraSettingsRenderContext,
  renderers: CameraSettingsRenderers | undefined,
): ReactNode {
  if (!context.showMode) return null;
  if (renderers?.mode) return renderers.mode(context);
  return (
    <div className={context.classNameFor('mode')} style={context.styleFor('mode')}>
      {context.labels.modePrefix}: {context.mode.control ?? context.labels.fallbackMode}
    </div>
  );
}
export function renderCameraSettingsTabContent(
  context: CameraSettingsRenderContext,
  renderers: CameraSettingsRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderMode(context, renderers)}
      {context.sections.map((section) => renderSection(context, renderers, section))}
      {children}
    </>
  );
}
