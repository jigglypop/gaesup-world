import {
  ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
  ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
} from '../defaults';
import {
  cx,
  mergeActionEquipmentPanelFaceLabels,
  mergeActionEquipmentPanelFeatures,
  mergeActionEquipmentPanelLabels,
  mergeActionEquipmentPanelStyle,
} from '../helpers';

describe('ActionEquipmentPanel helper', () => {
  test('클래스 이름을 비어 있지 않은 값만 조합한다', () => {
    expect(cx('root', false, null, undefined, 'custom')).toBe('root custom');
  });
  test('기능과 라벨 기본값을 사용자 설정으로 덮어쓴다', () => {
    expect(mergeActionEquipmentPanelFeatures({ reset: false })).toEqual({
      ...ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES,
      reset: false,
    });
    expect(mergeActionEquipmentPanelLabels({ title: 'Custom' })).toEqual({
      ...ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS,
      title: 'Custom',
    });
  });
  test('표정 라벨과 슬롯 스타일을 병합한다', () => {
    expect(mergeActionEquipmentPanelFaceLabels({ wink: 'Custom Wink' }).wink).toBe('Custom Wink');
    expect(
      mergeActionEquipmentPanelStyle({ button: { opacity: 1 }, root: { minWidth: 12 } }, 'button', {
        display: 'flex',
      }),
    ).toEqual({ display: 'flex', opacity: 1 });
    expect(ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES.root).toBe('action-equipment-panel');
  });
});
