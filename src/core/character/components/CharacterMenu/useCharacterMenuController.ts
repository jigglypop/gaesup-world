import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import {
  CHARACTER_MENU_DEFAULT_CLASSES,
  CHARACTER_MENU_DEFAULT_COLOR_OPTIONS,
  CHARACTER_MENU_DEFAULT_FACE_OPTIONS,
  CHARACTER_MENU_DEFAULT_HAIR_OPTIONS,
  CHARACTER_MENU_DEFAULT_LABELS,
} from './config';
import {
  cx,
  getAssetInitial,
  isOwnedAsset,
  matchesSlot,
  mergeFeatures,
  mergeLabelMaps,
  mergeStyles,
  resolvePreset,
  resolveSections,
  resolveSlots,
} from './helpers';
import type {
  CharacterMenuActions,
  CharacterMenuClassNameSlot,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuRenderContext,
  CharacterPreviewMode,
} from './types';
import { useAssetStore, type AssetRecord } from '../../../assets';
import { requestCameraCloseUp, restoreCameraCloseUp } from '../../../camera/closeUp';
import { useCharacterStore } from '../../stores/characterStore';
import type { OutfitSlot } from '../../types';

const DEFAULT_CLOSE_UP_TARGET: [number, number, number] = [0, 1.7, 3];
const DEFAULT_CLOSE_UP_OPTIONS = {
  focusDistance: 3,
  focusLerpSpeed: 8,
  fov: 50,
};
const MODAL_PANEL_STYLE: CSSProperties = {
  top: '50%',
  left: '50%',
  width: 'min(920px, calc(100vw - 32px))',
  maxHeight: 'calc(100vh - 32px)',
  transform: 'translate(-50%, -50%)',
};
const LEFT_SIDEBAR_PANEL_STYLE: CSSProperties = {
  top: 16,
  bottom: 16,
  left: 16,
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
};
const RIGHT_SIDEBAR_PANEL_STYLE: CSSProperties = {
  top: 16,
  bottom: 16,
  right: 16,
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
};
const FLOATING_PANEL_STYLE: CSSProperties = {
  right: 16,
  bottom: 16,
  width: 340,
  maxWidth: 'calc(100vw - 32px)',
  maxHeight: 'calc(100vh - 32px)',
};
const PANEL_SHADOW = '0 18px 42px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
const INACTIVE_SURFACE = 'rgba(255, 255, 255, 0.07)';
const SECTION_FALLBACK_SURFACE = 'rgba(255, 255, 255, 0.07)';
const ACTIVE_ALPHA = '26';
const SINGLE_BODY_COLUMNS = '1fr';
const WIDE_BODY_COLUMNS = 'minmax(240px, 0.85fr) minmax(320px, 1.15fr)';
const PREVIEW_COMPACT_WIDTH = 74;
const PREVIEW_COMPACT_HEIGHT = 118;
const PREVIEW_DEFAULT_WIDTH = 112;
const PREVIEW_DEFAULT_HEIGHT = 168;

function getLayoutStyle(preset: CharacterMenuPreset): CSSProperties {
  if (preset.layout === 'sidebar-left') return LEFT_SIDEBAR_PANEL_STYLE;
  if (preset.layout === 'sidebar-right') return RIGHT_SIDEBAR_PANEL_STYLE;
  if (preset.layout === 'floating') return FLOATING_PANEL_STYLE;
  return MODAL_PANEL_STYLE;
}
export function useCharacterMenuController({
  toggleKey,
  open,
  onClose,
  onOpenChange,
  preset: presetInput,
  customPresets,
  sections,
  hiddenSections,
  slots,
  hiddenSlots,
  features: featureOverrides,
  className,
  classNames,
  styles,
  labels: labelOverrides,
  labelMaps: labelMapOverrides,
  colorOptions: colorOptionOverrides,
  hairOptions: hairOptionOverrides,
  faceOptions: faceOptionOverrides,
  ownedOnlyDefault = false,
  tagFilterDefault = '',
  assetFilter,
  assetSort,
  isAssetOwned = isOwnedAsset,
  closeUpController,
}: CharacterMenuProps = {}): CharacterMenuRenderContext {
  const controlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? Boolean(open) : internalOpen;
  const [previewMode, setPreviewMode] = useState<CharacterPreviewMode>('normal');
  const [zoom, setZoomState] = useState(1);
  const [rotation, setRotationState] = useState(0);
  const [tagFilter, setTagFilter] = useState(tagFilterDefault);
  const [ownedOnly, setOwnedOnly] = useState(ownedOnlyDefault);
  const preset = useMemo(
    () => resolvePreset(presetInput, customPresets),
    [customPresets, presetInput],
  );
  const features = useMemo(
    () => mergeFeatures(preset, featureOverrides),
    [featureOverrides, preset],
  );
  const labels = useMemo(
    () => ({ ...CHARACTER_MENU_DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  );
  const labelMaps = useMemo(
    () => mergeLabelMaps(labelMapOverrides),
    [labelMapOverrides],
  );
  const colorOptions = useMemo(
    () =>
      colorOptionOverrides ??
      CHARACTER_MENU_DEFAULT_COLOR_OPTIONS.map((option) => ({
        ...option,
        label: labelMaps.colors[option.value],
      })),
    [colorOptionOverrides, labelMaps],
  );
  const hairOptions = useMemo(
    () =>
      hairOptionOverrides ??
      CHARACTER_MENU_DEFAULT_HAIR_OPTIONS.map((option) => ({
        ...option,
        label: labelMaps.hair[option.value],
      })),
    [hairOptionOverrides, labelMaps],
  );
  const faceOptions = useMemo(
    () =>
      faceOptionOverrides ??
      CHARACTER_MENU_DEFAULT_FACE_OPTIONS.map((option) => ({
        ...option,
        label: labelMaps.face[option.value],
      })),
    [faceOptionOverrides, labelMaps],
  );
  const selectedSections = useMemo(
    () =>
      resolveSections(sections, preset, hiddenSections, features),
    [features, hiddenSections, preset.sections, sections],
  );
  const selectedSlots = useMemo(
    () => resolveSlots(slots, preset, hiddenSlots),
    [hiddenSlots, preset, slots],
  );
  const rightSections = useMemo(
    () => selectedSections.filter((section) => section !== 'preview'),
    [selectedSections],
  );
  const compact = Boolean(preset.compact);
  const bodyColumns = compact || selectedSections.length <= 2 ? SINGLE_BODY_COLUMNS : WIDE_BODY_COLUMNS;
  const classNameFor = useCallback(
    (slot: CharacterMenuClassNameSlot, extra?: string) =>
      cx(CHARACTER_MENU_DEFAULT_CLASSES[slot], preset.classNames?.[slot], classNames?.[slot], extra),
    [classNames, preset.classNames],
  );
  const styleFor = useCallback(
    (slot: CharacterMenuClassNameSlot, base?: CSSProperties) => mergeStyles(slot, preset, styles, base),
    [preset, styles],
  );
  const appearance = useCharacterStore((state) => state.appearance);
  const outfits = useCharacterStore((state) => state.outfits);
  const setName = useCharacterStore((state) => state.setName);
  const setColor = useCharacterStore((state) => state.setColor);
  const setHair = useCharacterStore((state) => state.setHair);
  const setFace = useCharacterStore((state) => state.setFace);
  const equipOutfit = useCharacterStore((state) => state.equipOutfit);
  const resetAppearance = useCharacterStore((state) => state.resetAppearance);
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const restoreCloseUp = useCallback(() => {
    if (closeUpController) {
      closeUpController.restore();
      return;
    }
    restoreCameraCloseUp();
  }, [closeUpController]);
  const requestCloseUp = useCallback(() => {
    if (closeUpController) {
      closeUpController.request();
      return;
    }
    requestCameraCloseUp(DEFAULT_CLOSE_UP_TARGET, DEFAULT_CLOSE_UP_OPTIONS);
  }, [closeUpController]);
  const closeMenu = useCallback(() => {
    if (previewMode === 'closeUp') {
      restoreCloseUp();
      setPreviewMode('normal');
    }
    if (!controlled) setInternalOpen(false);
    onClose?.();
    onOpenChange?.(false);
  }, [controlled, onClose, onOpenChange, previewMode, restoreCloseUp]);
  const openMenu = useCallback(() => {
    if (!controlled) setInternalOpen(true);
    onOpenChange?.(true);
  }, [controlled, onOpenChange]);
  const toggleMenu = useCallback(() => {
    if (isOpen) closeMenu();
    else openMenu();
  }, [closeMenu, isOpen, openMenu]);
  const toggleCloseUp = useCallback(() => {
    if (previewMode === 'closeUp') {
      restoreCloseUp();
      setPreviewMode('normal');
      return;
    }
    requestCloseUp();
    setPreviewMode('closeUp');
  }, [previewMode, requestCloseUp, restoreCloseUp]);
  const setZoom = useCallback((value: number) => setZoomState(value), []);
  const setRotation = useCallback((value: number) => setRotationState(value), []);
  const rotatePreview = useCallback((delta: number) => {
    setRotationState((value) => value + delta);
  }, []);
  const reset = useCallback(() => {
    resetAppearance();
  }, [resetAppearance]);
  const assetsBySlot = useMemo(() => {
    const normalizedTag = tagFilter.trim().toLowerCase();
    const next: Partial<Record<OutfitSlot, AssetRecord[]>> = {};
    for (const slot of selectedSlots) {
      const selectedAssetId = outfits[slot];
      const assets = assetIds
        .map((id) => assetRecords[id])
        .filter((asset): asset is AssetRecord => Boolean(asset))
        .filter((asset) => matchesSlot(asset, slot))
        .filter((asset) => !ownedOnly || isAssetOwned(asset))
        .filter((asset) => {
          if (!normalizedTag) return true;
          return asset.tags?.some((tag) => tag.toLowerCase().includes(normalizedTag)) ?? false;
        })
        .filter((asset) =>
          assetFilter
            ? assetFilter({ asset, slot, tagFilter, ownedOnly, selectedAssetId })
            : true,
        );
      next[slot] = assetSort ? [...assets].sort((left, right) => assetSort(left, right, slot)) : assets;
    }
    return next;
  }, [
    assetFilter,
    assetIds,
    assetRecords,
    assetSort,
    isAssetOwned,
    outfits,
    ownedOnly,
    selectedSlots,
    tagFilter,
  ]);
  useEffect(() => {
    if (!toggleKey || controlled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const wantedKey = toggleKey.toLowerCase();
      const wantedCode = `Key${toggleKey.toUpperCase()}`;
      if (event.code !== wantedCode && event.key.toLowerCase() !== wantedKey) return;
      toggleMenu();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlled, toggleKey, toggleMenu]);
  useEffect(() => {
    if (isOpen || previewMode !== 'closeUp') return;
    restoreCloseUp();
    setPreviewMode('normal');
  }, [isOpen, previewMode, restoreCloseUp]);
  const previewModeRef = useRef(previewMode);
  const restoreCloseUpRef = useRef(restoreCloseUp);
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);
  useEffect(() => {
    restoreCloseUpRef.current = restoreCloseUp;
  }, [restoreCloseUp]);
  useEffect(
    () => () => {
      if (previewModeRef.current === 'closeUp') restoreCloseUpRef.current();
    },
    [],
  );
  const getButtonStyle = useCallback(
    (active = false): CSSProperties => ({
      background: active ? `${preset.theme.accentColor}${ACTIVE_ALPHA}` : INACTIVE_SURFACE,
      borderColor: active ? preset.theme.accentColor : preset.theme.borderColor,
      color: active ? preset.theme.accentColor : preset.theme.textColor,
    }),
    [preset.theme],
  );
  const getPanelStyle = useCallback(
    (): CSSProperties => ({
      background: preset.theme.bgColor,
      borderColor: preset.theme.borderColor,
      color: preset.theme.textColor,
      boxShadow: PANEL_SHADOW,
      ...getLayoutStyle(preset),
      ...preset.position,
    }),
    [preset],
  );
  const getSectionStyle = useCallback(
    (): CSSProperties => ({
      background: preset.theme.surfaceColor ?? SECTION_FALLBACK_SURFACE,
      borderColor: preset.theme.borderColor,
    }),
    [preset.theme],
  );
  const getPreviewGlyphStyle = useCallback(
    (): CSSProperties => ({
      width: compact ? PREVIEW_COMPACT_WIDTH : PREVIEW_DEFAULT_WIDTH,
      height: compact ? PREVIEW_COMPACT_HEIGHT : PREVIEW_DEFAULT_HEIGHT,
      borderColor: preset.theme.accentColor,
      boxShadow: `0 20px 40px ${preset.theme.accentColor}22`,
      background: `linear-gradient(160deg, ${appearance.colors.hair}, ${appearance.colors.top} 48%, ${appearance.colors.bottom})`,
      transform: `scale(${zoom}) rotateY(${rotation}deg)`,
    }),
    [appearance.colors.bottom, appearance.colors.hair, appearance.colors.top, compact, preset.theme.accentColor, rotation, zoom],
  );
  const actions = useMemo<CharacterMenuActions>(
    () => ({
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu,
      reset,
      setName,
      setColor,
      setHair,
      setFace,
      equipOutfit,
      setZoom,
      setRotation,
      rotatePreview,
      setTagFilter,
      setOwnedOnly,
      toggleCloseUp,
    }),
    [
      closeMenu,
      equipOutfit,
      openMenu,
      reset,
      rotatePreview,
      setColor,
      setFace,
      setHair,
      setName,
      setRotation,
      setZoom,
      toggleCloseUp,
      toggleMenu,
    ],
  );
  return useMemo(
    () => ({
      isOpen,
      controlled,
      isCloseUp: previewMode === 'closeUp',
      previewMode,
      zoom,
      rotation,
      tagFilter,
      ownedOnly,
      compact,
      bodyColumns,
      preset,
      features,
      labels,
      labelMaps,
      selectedSections,
      rightSections,
      selectedSlots,
      colorOptions,
      hairOptions,
      faceOptions,
      appearance,
      outfits,
      assetsBySlot,
      rootClassName: className,
      classNameFor,
      styleFor,
      getButtonStyle,
      getPanelStyle,
      getSectionStyle,
      getPreviewGlyphStyle,
      getAssetInitial,
      actions,
    }),
    [
      actions,
      appearance,
      assetsBySlot,
      bodyColumns,
      className,
      classNameFor,
      colorOptions,
      compact,
      controlled,
      faceOptions,
      features,
      getButtonStyle,
      getPanelStyle,
      getPreviewGlyphStyle,
      getSectionStyle,
      hairOptions,
      isOpen,
      labelMaps,
      labels,
      outfits,
      ownedOnly,
      preset,
      previewMode,
      rightSections,
      rotation,
      selectedSections,
      selectedSlots,
      styleFor,
      tagFilter,
      zoom,
    ],
  );
}
