import { useCallback, useMemo, type CSSProperties } from 'react';

import {
  ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT,
} from './defaults';
import {
  cx,
  mergeActionEquipmentPanelFaceLabels,
  mergeActionEquipmentPanelFeatures,
  mergeActionEquipmentPanelLabels,
  mergeActionEquipmentPanelStyle,
} from './helpers';
import { renderActionEquipmentPanelContent } from './sections';
import type {
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelProps,
  ActionEquipmentPanelRenderContext,
} from './types';
import {
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  applyCharacterEquipmentPreset,
  toggleCharacterWeapon,
} from '../../actionEquipment';
import { useCharacterStore } from '../../stores/characterStore';
import './styles.css';
export function ActionEquipmentPanel({
  presets = DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  weaponItemId = 'starter-weapon-layer',
  outfitSlotCount = ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT,
  faceSequence = ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE,
  className,
  style,
  classNames,
  styles,
  labels: labelOverrides,
  labelMaps,
  features: featureOverrides,
  renderers,
  formatFaceLabel,
  formatWeaponLabel,
  formatMetaLabel,
  children,
}: ActionEquipmentPanelProps = {}) {
  const face = useCharacterStore((state) => state.appearance.face);
  const outfits = useCharacterStore((state) => state.outfits);
  const setFace = useCharacterStore((state) => state.setFace);
  const resetAppearance = useCharacterStore((state) => state.resetAppearance);
  const normalizedFaceSequence = useMemo(
    () => (faceSequence.length > 0 ? faceSequence : ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE),
    [faceSequence],
  );
  const equippedCount = useMemo(() => Object.values(outfits).filter(Boolean).length, [outfits]);
  const features = useMemo(
    () => mergeActionEquipmentPanelFeatures(featureOverrides),
    [featureOverrides],
  );
  const labels = useMemo(() => mergeActionEquipmentPanelLabels(labelOverrides), [labelOverrides]);
  const faceLabels = useMemo(
    () => mergeActionEquipmentPanelFaceLabels(labelMaps?.face),
    [labelMaps?.face],
  );
  const faceLabel = faceLabels[face];
  const weaponEquipped = outfits.weapon === weaponItemId;
  const faceButtonLabel = useMemo(
    () => formatFaceLabel?.(face, faceLabel) ?? `${labels.face}: ${faceLabel}`,
    [face, faceLabel, formatFaceLabel, labels.face],
  );
  const weaponButtonLabel = useMemo(
    () =>
      formatWeaponLabel?.(weaponEquipped, labels) ??
      (weaponEquipped ? labels.unequipWeapon : labels.equipWeapon),
    [formatWeaponLabel, labels, weaponEquipped],
  );
  const metaLabel = useMemo(
    () =>
      formatMetaLabel?.(equippedCount, outfitSlotCount) ?? `${equippedCount}/${outfitSlotCount}`,
    [equippedCount, formatMetaLabel, outfitSlotCount],
  );
  const cycleFace = useCallback(() => {
    const index = normalizedFaceSequence.indexOf(face);
    setFace(normalizedFaceSequence[(index + 1) % normalizedFaceSequence.length] ?? 'default');
  }, [face, normalizedFaceSequence, setFace]);
  const toggleWeapon = useCallback(() => {
    toggleCharacterWeapon(weaponItemId);
  }, [weaponItemId]);
  const applyPreset = useCallback((preset: (typeof presets)[number]) => {
    applyCharacterEquipmentPreset(preset);
  }, []);
  const actions = useMemo(
    () => ({ cycleFace, toggleWeapon, applyPreset, reset: resetAppearance }),
    [applyPreset, cycleFace, resetAppearance, toggleWeapon],
  );
  const classNameFor = useCallback(
    (slot: ActionEquipmentPanelClassNameSlot, extra?: string) =>
      cx(
        ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: ActionEquipmentPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeActionEquipmentPanelStyle(styles, slot, base);
      return slot === 'root' ? { ...nextStyle, ...style } : nextStyle;
    },
    [style, styles],
  );
  const context = useMemo<ActionEquipmentPanelRenderContext>(
    () => ({
      face,
      faceLabel,
      faceButtonLabel,
      weaponButtonLabel,
      metaLabel,
      outfits,
      equippedCount,
      outfitSlotCount,
      weaponItemId,
      weaponEquipped,
      presets,
      faceSequence: normalizedFaceSequence,
      labels,
      faceLabels,
      features,
      classNameFor,
      styleFor,
      actions,
    }),
    [
      actions,
      classNameFor,
      equippedCount,
      face,
      faceButtonLabel,
      faceLabel,
      faceLabels,
      features,
      labels,
      metaLabel,
      normalizedFaceSequence,
      outfitSlotCount,
      outfits,
      presets,
      styleFor,
      weaponButtonLabel,
      weaponEquipped,
      weaponItemId,
    ],
  );
  const content = renderActionEquipmentPanelContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
  ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT,
};
export type {
  ActionEquipmentPanelActions,
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelClassNames,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabelMaps,
  ActionEquipmentPanelLabels,
  ActionEquipmentPanelProps,
  ActionEquipmentPanelRenderContext,
  ActionEquipmentPanelRenderers,
  ActionEquipmentPanelStyles,
} from './types';
