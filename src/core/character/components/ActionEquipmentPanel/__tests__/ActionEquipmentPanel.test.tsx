import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { DEFAULT_CHARACTER_EQUIPMENT_PRESETS } from '../../../actionEquipment';
import { useCharacterStore } from '../../../stores/characterStore';
import { ActionEquipmentPanel } from '../index';

describe('ActionEquipmentPanel 커스텀 UI', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetAppearance();
  });
  test('루트 renderer로 기본 패널 마크업을 대체한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <ActionEquipmentPanel
          labels={{ title: 'Quick Kit' }}
          renderers={{
            root: (panel, children) => (
              <section data-testid="equipment-root">
                <span>{panel.labels.title}</span>
                {children}
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const customRoot = root.root.findByProps({ 'data-testid': 'equipment-root' });
    expect(customRoot.findAllByType('span')[0].children).toEqual(['Quick Kit']);
    expect(() => root.root.findByProps({ className: 'action-equipment-panel' })).toThrow();
    act(() => {
      root.unmount();
    });
  });
  test('버튼 renderer가 패널 액션을 사용해 캐릭터 상태를 변경한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <ActionEquipmentPanel
          faceSequence={['default', 'wink']}
          presets={[DEFAULT_CHARACTER_EQUIPMENT_PRESETS[0]!]}
          labelMaps={{ face: { wink: 'Custom Wink' } }}
          renderers={{
            faceButton: (panel) => (
              <button type="button" data-testid="face-button" onClick={panel.actions.cycleFace}>
                {panel.faceButtonLabel}
              </button>
            ),
            presetButton: (panel, preset) => (
              <button
                type="button"
                data-testid="preset-button"
                onClick={() => panel.actions.applyPreset(preset)}
              >
                {preset.label}
              </button>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const faceButton = root.root.findByProps({ 'data-testid': 'face-button' });
    expect(faceButton.children).toEqual(['Face: Default']);
    act(() => {
      const handleClick = faceButton.props.onClick as () => void;
      handleClick();
    });
    expect(useCharacterStore.getState().appearance.face).toBe('wink');
    expect(root.root.findByProps({ 'data-testid': 'face-button' }).children).toEqual([
      'Face: Custom Wink',
    ]);
    act(() => {
      const handleClick = root.root.findByProps({ 'data-testid': 'preset-button' }).props
        .onClick as () => void;
      handleClick();
    });
    expect(useCharacterStore.getState().outfits.weapon).toBe('starter-weapon-layer');
    act(() => {
      root.unmount();
    });
  });
});
