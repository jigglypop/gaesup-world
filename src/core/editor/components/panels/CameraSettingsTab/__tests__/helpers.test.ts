import type { CameraOptionType } from '../../../../../camera/core/types';
import {
  createCameraSettingsUpdate,
  formatCameraSettingsValue,
  readCameraSettingsValue,
  resolveVisibleSections,
} from '../helpers';
import type { CameraSettingsField, CameraSettingsSection } from '../types';

const cameraOption: CameraOptionType = {
  fov: 75,
  smoothing: { position: 0.2, rotation: 0.3, fov: 0.4 },
  bounds: { minY: 2, maxY: 50 },
};
describe('CameraSettingsTab helper', () => {
  test('카메라 옵션 값을 필드 경로로 읽어야 한다', () => {
    const field: CameraSettingsField = {
      key: 'smoothing-position',
      label: 'Pos',
      kind: 'range',
      path: 'smoothing.position',
      defaultValue: 0.1,
    };
    expect(readCameraSettingsValue(cameraOption, field)).toBe(0.2);
  });
  test('중첩 카메라 옵션 업데이트를 만들어야 한다', () => {
    const field: CameraSettingsField = {
      key: 'bounds-max',
      label: 'Max Y',
      kind: 'range',
      path: 'bounds.maxY',
      defaultValue: 50,
    };
    expect(createCameraSettingsUpdate(cameraOption, field, 70)).toEqual({
      bounds: { minY: 2, maxY: 70 },
    });
  });
  test('가림 반투명 체크박스는 collisionMode를 push와 fade로 오간다', () => {
    const field: CameraSettingsField = {
      key: 'collision-fade',
      label: 'Fade',
      kind: 'checkbox',
      path: 'collisionMode',
      defaultValue: false,
    };
    expect(readCameraSettingsValue(cameraOption, field)).toBe(false);
    expect(readCameraSettingsValue({ collisionMode: 'fade' }, field)).toBe(true);
    expect(createCameraSettingsUpdate(cameraOption, field, true)).toEqual({ collisionMode: 'fade' });
    expect(createCameraSettingsUpdate(cameraOption, field, false)).toEqual({ collisionMode: 'push' });
    const opacity: CameraSettingsField = { key: 'fade-opacity', label: 'Opacity', kind: 'range', path: 'collisionFadeOpacity', defaultValue: 0.3 };
    expect(readCameraSettingsValue(cameraOption, opacity)).toBe(0.3);
    expect(createCameraSettingsUpdate(cameraOption, opacity, 0.5)).toEqual({ collisionFadeOpacity: 0.5 });
  });
  test('숨김 섹션과 숨김 필드를 제외해야 한다', () => {
    const sections: readonly CameraSettingsSection[] = [
      {
        key: 'visible',
        title: 'Visible',
        fields: [
          { key: 'shown', label: 'Shown', kind: 'checkbox', defaultValue: false },
          { key: 'hidden', label: 'Hidden', kind: 'checkbox', defaultValue: false, visible: false },
        ],
      },
      {
        key: 'hidden-section',
        title: 'Hidden',
        visible: false,
        fields: [{ key: 'hidden-field', label: 'Hidden', kind: 'checkbox', defaultValue: false }],
      },
    ];
    expect(resolveVisibleSections(sections)).toEqual([
      {
        key: 'visible',
        title: 'Visible',
        fields: [{ key: 'shown', label: 'Shown', kind: 'checkbox', defaultValue: false }],
      },
    ]);
  });
  test('체크박스와 숫자 값을 표시 문자열로 포맷해야 한다', () => {
    expect(
      formatCameraSettingsValue(
        { key: 'focus', label: 'Focus', kind: 'checkbox', defaultValue: false },
        true,
        {
          modePrefix: 'Mode',
          fallbackMode: 'thirdPerson',
          enabled: 'Enabled',
          disabled: 'Disabled',
        },
      ),
    ).toBe('Enabled');
    expect(
      formatCameraSettingsValue(
        { key: 'fov', label: 'FOV', kind: 'range', defaultValue: 75, step: 5, suffix: 'deg' },
        90,
        { modePrefix: 'Mode', fallbackMode: 'thirdPerson', enabled: 'On', disabled: 'Off' },
      ),
    ).toBe('90deg');
  });
});
