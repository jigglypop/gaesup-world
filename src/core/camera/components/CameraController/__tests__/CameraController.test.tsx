import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useGaesupStore } from '../../../../stores/gaesupStore';
import { CameraController } from '../index';

describe('CameraController 커스텀 UI', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetMode();
  });
  test('루트 renderer로 기본 컨트롤러 마크업을 대체한다', () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CameraController
          labels={{ title: 'Custom Camera' }}
          renderers={{
            root: (controller) => (
              <section data-testid="camera-root">
                <span>{controller.labels.title}</span>
                <span>{controller.activeMode}</span>
              </section>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const customRoot = root.root.findByProps({ 'data-testid': 'camera-root' });
    expect(customRoot.findAllByType('span').map((node) => node.children[0])).toEqual([
      'Custom Camera',
      'thirdPerson',
    ]);
    expect(() => root.root.findByProps({ className: 'camera-controller-panel' })).toThrow();
    act(() => {
      root.unmount();
    });
  });
  test('모드 버튼 renderer가 store 모드를 변경한다', () => {
    const handleModeChange = jest.fn();
    useGaesupStore
      .getState()
      .setCameraOption({ xDistance: 7, yDistance: 8, zDistance: 9, fov: 66, enableZoom: true });
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(
        <CameraController
          modes={[{ value: 'fixed', label: 'Fixed View' }]}
          onModeChange={handleModeChange}
          renderers={{
            modeButton: (controller, mode, active) => (
              <button
                type="button"
                data-testid="mode-button"
                data-active={active ? 'true' : 'false'}
                onClick={() => controller.actions.selectMode(mode.value)}
              >
                {mode.label}
              </button>
            ),
          }}
        />,
      );
    });
    const root = renderer as ReactTestRenderer;
    const button = root.root.findByProps({ 'data-testid': 'mode-button' });
    expect(button.props['data-active']).toBe('false');
    act(() => {
      const handleClick = button.props.onClick as () => void;
      handleClick();
    });
    const state = useGaesupStore.getState();
    expect(state.mode.control).toBe('fixed');
    expect(state.cameraOption.xDistance).toBe(0);
    expect(state.cameraOption.yDistance).toBe(0);
    expect(state.cameraOption.zDistance).toBe(0);
    expect(state.cameraOption.fov).toBe(75);
    expect(state.cameraOption.enableZoom).toBe(false);
    expect(handleModeChange).toHaveBeenCalledWith('fixed');
    expect(root.root.findByProps({ 'data-testid': 'mode-button' }).props['data-active']).toBe(
      'true',
    );
    act(() => {
      root.unmount();
    });
  });
});
