import {
  CHARACTER_MENU_DEFAULT_CLASSES,
  CHARACTER_MENU_DEFAULT_FEATURES,
  CHARACTER_MENU_DEFAULT_LABEL_MAPS,
  MENU_PRESETS,
} from '../config';
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
} from '../helpers';
import type { AssetRecord } from '../../../../assets';

describe('CharacterMenu helper', () => {
  test('클래스 이름을 빈 값 없이 합친다', () => {
    expect(cx('base', false, undefined, 'active')).toBe('base active');
  });
  test('기능 설정은 기본값 프리셋 사용자값 순서로 병합한다', () => {
    const features = mergeFeatures(MENU_PRESETS.compact, { colorPicker: true, closeButton: false });
    expect(features).toEqual({
      ...CHARACTER_MENU_DEFAULT_FEATURES,
      ...MENU_PRESETS.compact.features,
      colorPicker: true,
      closeButton: false,
    });
  });
  test('스타일은 기본값 프리셋 사용자값 순서로 병합한다', () => {
    const preset = {
      ...MENU_PRESETS.default,
      styles: {
        panel: { width: 320 },
      },
    };
    expect(mergeStyles('panel', preset, { panel: { width: 400 } }, { height: 200 })).toEqual({
      height: 200,
      width: 400,
    });
  });
  test('프리셋은 사용자 프리셋을 기본 프리셋보다 우선한다', () => {
    const custom = {
      ...MENU_PRESETS.default,
      id: 'default',
      name: 'Custom default',
    };
    expect(resolvePreset('default', { default: custom }).name).toBe('Custom default');
  });
  test('라벨 맵은 부분 오버라이드를 기본 라벨과 합친다', () => {
    const labelMaps = mergeLabelMaps({ slots: { weapon: 'Tool' } });
    expect(labelMaps.slots.weapon).toBe('Tool');
    expect(labelMaps.colors.body).toBe(CHARACTER_MENU_DEFAULT_LABEL_MAPS.colors.body);
  });
  test('섹션은 기능과 숨김 설정을 반영한다', () => {
    const sections = resolveSections(
      ['preview', 'identity', 'colors', 'outfits'],
      MENU_PRESETS.default,
      ['preview'],
      { ...CHARACTER_MENU_DEFAULT_FEATURES, colorPicker: false },
    );
    expect(sections).toEqual(['identity', 'outfits']);
  });
  test('슬롯은 프리셋 슬롯과 숨김 설정을 반영한다', () => {
    expect(resolveSlots(undefined, MENU_PRESETS.compact, ['weapon'])).toEqual([
      'hat',
      'top',
      'bottom',
      'shoes',
    ]);
  });
  test('에셋 슬롯과 보유 상태를 판정한다', () => {
    const ownedHat: AssetRecord = {
      id: 'owned-hat',
      name: 'Owned Hat',
      kind: 'characterPart',
      slot: 'hat',
      metadata: { owned: true },
    };
    const lockedHat: AssetRecord = {
      ...ownedHat,
      id: 'locked-hat',
      metadata: { owned: false },
    };
    expect(matchesSlot(ownedHat, 'hat')).toBe(true);
    expect(matchesSlot(ownedHat, 'top')).toBe(false);
    expect(isOwnedAsset(ownedHat)).toBe(true);
    expect(isOwnedAsset(lockedHat)).toBe(false);
    expect(getAssetInitial(ownedHat)).toBe('O');
  });
  test('기본 클래스와 프리셋은 공개 메뉴 렌더링에 필요한 값을 가진다', () => {
    expect(CHARACTER_MENU_DEFAULT_CLASSES.panel).toContain('character-menu-panel');
    expect(MENU_PRESETS.creative.sections).toContain('outfits');
    expect(MENU_PRESETS.minimal.features.assetBrowser).toBe(false);
  });
});
