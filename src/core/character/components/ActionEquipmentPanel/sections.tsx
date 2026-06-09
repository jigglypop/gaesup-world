import { Fragment, type CSSProperties, type ReactNode } from 'react';

import { cx } from './helpers';
import type {
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelRenderContext,
  ActionEquipmentPanelRenderers,
} from './types';
import type { CharacterEquipmentPreset } from '../../actionEquipment';

function renderHeader(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (!context.features.header) return null;
  if (renderers?.header) return renderers.header(context);
  return (
    <div className={context.classNameFor('header')} style={context.styleFor('header')}>
      <span className={context.classNameFor('title')} style={context.styleFor('title')}>
        {context.labels.title}
      </span>
      {context.features.meta && (
        <span className={context.classNameFor('meta')} style={context.styleFor('meta')}>
          {context.metaLabel}
        </span>
      )}
    </div>
  );
}
function renderButtonStyle(
  context: ActionEquipmentPanelRenderContext,
  slot: ActionEquipmentPanelClassNameSlot,
  active = false,
): CSSProperties {
  const variantStyle = context.styleFor(slot, context.styleFor('button'));
  return active ? context.styleFor('activeButton', variantStyle) : variantStyle;
}
function renderFaceButton(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (!context.features.faceCycle) return null;
  if (renderers?.faceButton) return renderers.faceButton(context);
  return (
    <button
      type="button"
      className={cx(context.classNameFor('button'), context.classNameFor('faceButton'))}
      style={renderButtonStyle(context, 'faceButton')}
      onClick={context.actions.cycleFace}
    >
      {context.faceButtonLabel}
    </button>
  );
}
function renderWeaponButton(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (!context.features.weaponToggle) return null;
  if (renderers?.weaponButton) return renderers.weaponButton(context);
  return (
    <button
      type="button"
      className={cx(
        context.classNameFor('button'),
        context.classNameFor('weaponButton'),
        context.weaponEquipped && context.classNameFor('activeButton'),
      )}
      style={renderButtonStyle(context, 'weaponButton', context.weaponEquipped)}
      onClick={context.actions.toggleWeapon}
    >
      {context.weaponButtonLabel}
    </button>
  );
}
function renderPresetButton(
  context: ActionEquipmentPanelRenderContext,
  renderers: ActionEquipmentPanelRenderers | undefined,
  preset: CharacterEquipmentPreset,
): ReactNode {
  if (renderers?.presetButton) {
    return <Fragment key={preset.id}>{renderers.presetButton(context, preset)}</Fragment>;
  }
  return (
    <button
      key={preset.id}
      type="button"
      className={cx(context.classNameFor('button'), context.classNameFor('presetButton'))}
      style={renderButtonStyle(context, 'presetButton')}
      onClick={() => context.actions.applyPreset(preset)}
    >
      {preset.label}
    </button>
  );
}
function renderResetButton(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (!context.features.reset) return null;
  if (renderers?.resetButton) return renderers.resetButton(context);
  return (
    <button
      type="button"
      className={cx(context.classNameFor('button'), context.classNameFor('resetButton'))}
      style={renderButtonStyle(context, 'resetButton')}
      onClick={context.actions.reset}
    >
      {context.labels.reset}
    </button>
  );
}
function renderEmptyPresets(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (renderers?.emptyPresets) return renderers.emptyPresets(context);
  return (
    <span className={context.classNameFor('emptyPresets')} style={context.styleFor('emptyPresets')}>
      {context.labels.emptyPresets}
    </span>
  );
}
function renderActionRow(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  const children = (
    <>
      {renderFaceButton(context, renderers)}
      {renderWeaponButton(context, renderers)}
    </>
  );
  if (!context.features.faceCycle && !context.features.weaponToggle) return null;
  if (renderers?.actionRow) return renderers.actionRow(context, children);
  return (
    <div className={context.classNameFor('actionRow')} style={context.styleFor('actionRow')}>
      {children}
    </div>
  );
}
function renderPresetRow(
  context: ActionEquipmentPanelRenderContext,
  renderers?: ActionEquipmentPanelRenderers,
): ReactNode {
  if (!context.features.presets && !context.features.reset) return null;
  const presetContent = context.features.presets
    ? context.presets.length > 0
      ? context.presets.map((preset) => renderPresetButton(context, renderers, preset))
      : renderEmptyPresets(context, renderers)
    : null;
  const children = (
    <>
      {presetContent}
      {renderResetButton(context, renderers)}
    </>
  );
  if (renderers?.presetRow) return renderers.presetRow(context, children);
  return (
    <div className={context.classNameFor('presetRow')} style={context.styleFor('presetRow')}>
      {children}
    </div>
  );
}
export function renderActionEquipmentPanelContent(
  context: ActionEquipmentPanelRenderContext,
  renderers: ActionEquipmentPanelRenderers | undefined,
  children: ReactNode,
): ReactNode {
  return (
    <>
      {renderHeader(context, renderers)}
      {renderActionRow(context, renderers)}
      {renderPresetRow(context, renderers)}
      {children}
    </>
  );
}
