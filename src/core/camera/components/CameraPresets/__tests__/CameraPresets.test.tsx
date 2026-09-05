import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useGaesupStore } from '../../../../stores/gaesupStore';
import { CameraPresets } from '../index';
import type { CameraPreset } from '../types';

const TEST_PRESET: CameraPreset = {
  id: 'test-fixed',
  name: 'Test Fixed',
  description: 'Fixed camera test preset',
  config: {
    mode: 'fixed',
    distance: { x: 1, y: 2, z: 3 },
    fov: 55,
  },
};

describe('CameraPresets 커스텀 UI', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
    useGaesupStore
      .getState()
      .setCameraOption({ xDistance: 0, yDistance: 0, zDistance: 0, fov: 75 });
  });
  test('루트 renderer로 기본 프리셋 마크업을 대체한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CameraPresets
          presets={[TEST_PRESET]}
          renderers={{
            root: (presets) => (
              <section data-testid="presets-root">
                <span>{presets.presets.length}</span>
                <span>{presets.currentPresetId ?? 'none'}</span>
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const customRoot = root.root.findByProps({ 'data-testid': 'presets-root' });
    expect(customRoot.findAllByType('span').map((node) => node.children[0])).toEqual(['1', 'none']);
    expect(() => root.root.findByProps({ className: 'camera-presets-panel' })).toThrow();
    act(() => {
      root.unmount();
    });
  });
  test('프리셋 버튼 renderer가 store 카메라 옵션을 변경한다', () => {
    const handleApply = jest.fn();
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CameraPresets
          presets={[TEST_PRESET]}
          onApplyPreset={handleApply}
          renderers={{
            presetButton: (presets, preset, active) => (
              <button
                type="button"
                data-testid="preset-button"
                data-active={active ? 'true' : 'false'}
                onClick={() => presets.actions.applyPreset(preset)}
              >
                {preset.name}
              </button>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const button = root.root.findByProps({ 'data-testid': 'preset-button' });
    expect(button.props['data-active']).toBe('false');
    act(() => {
      const handleClick = button.props.onClick as () => void;
      handleClick();
    });
    const state = useGaesupStore.getState();
    expect(state.mode.control).toBe('fixed');
    expect(state.cameraOption.xDistance).toBe(1);
    expect(state.cameraOption.yDistance).toBe(2);
    expect(state.cameraOption.zDistance).toBe(3);
    expect(state.cameraOption.fov).toBe(55);
    expect(handleApply).toHaveBeenCalledWith(TEST_PRESET);
    expect(root.root.findByProps({ 'data-testid': 'preset-button' }).props['data-active']).toBe(
      'true',
    );
    act(() => {
      root.unmount();
    });
  });
});
