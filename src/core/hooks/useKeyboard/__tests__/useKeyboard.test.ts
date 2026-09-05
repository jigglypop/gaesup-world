import 'reflect-metadata';

import { renderHook, act } from '@testing-library/react';

import { useKeyboard } from '../index';
import { createMemoryInputBackend } from '../../../interactions/core/adapter';
import { useInputBackend } from '../../../interactions/hooks';

const mockUpdateKeyboard = jest.fn();
const mockUpdateMouse = jest.fn();
const mockStopAutomation = jest.fn();
let mockStoreState: Record<string, unknown>;
const mockInputBackend = {
  ...createMemoryInputBackend(),
  updateKeyboard: (...args: unknown[]) => mockUpdateKeyboard(...args),
  updateMouse: (...args: unknown[]) => mockUpdateMouse(...args),
};

jest.mock('../../../interactions/hooks', () => ({
  useInputBackend: jest.fn(() => mockInputBackend),
}));

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockStoreState),
  ),
}));

const fireKeyEvent = (code: string, type: 'keydown' | 'keyup') => {
  const event = new KeyboardEvent(type, { code, bubbles: true });
  window.dispatchEvent(event);
};

describe('useKeyboard', () => {
  it('blocks disabled input, releases held keys on disable, and resumes on enable', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useKeyboard(true, true, undefined, enabled),
      { initialProps: { enabled: false } },
    );
    act(() => fireKeyEvent('KeyW', 'keydown'));
    expect(result.current.pushKey('forward', true)).toBe(false);
    expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    rerender({ enabled: true });
    act(() => fireKeyEvent('KeyW', 'keydown'));
    expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: true });
    rerender({ enabled: false });
    expect(mockUpdateKeyboard).toHaveBeenLastCalledWith(expect.objectContaining({ forward: false }));
    mockUpdateKeyboard.mockClear();
    act(() => fireKeyEvent('KeyW', 'keydown'));
    expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    rerender({ enabled: true });
    act(() => fireKeyEvent('KeyW', 'keydown'));
    expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: true });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useInputBackend).mockReturnValue(mockInputBackend);
    mockStoreState = {
      automation: { queue: { isRunning: false } },
      interaction: { isActive: true },
      stopAutomation: mockStopAutomation,
    };
  });

  it('초기 상태에서 pressedKeys는 비어있어야 합니다', () => {
    const { result } = renderHook(() => useKeyboard());
    expect(result.current.pressedKeys).toHaveLength(0);
  });

  describe('key mapping', () => {
    it.each(['input', 'textarea', 'select'])('leaves %s input to the browser', (tagName) => {
      renderHook(() => useKeyboard());
      const field = document.createElement(tagName);
      document.body.append(field);
      try {
        const event = new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true, cancelable: true });
        act(() => { field.dispatchEvent(event); });
        expect(event.defaultPrevented).toBe(false);
        expect(mockUpdateKeyboard).not.toHaveBeenCalled();
      } finally {
        field.remove();
      }
    });

    it('releases held movement when keyboard input moves into a field', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      const field = document.createElement('input');
      document.body.append(field);
      try {
        act(() => { field.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true })); });
        expect(mockUpdateKeyboard).toHaveBeenCalledWith(expect.objectContaining({ forward: false }));
      } finally {
        field.remove();
      }
    });

    it('KeyW를 누르면 forward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ forward: true });
    });

    it('KeyS를 누르면 backward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ backward: true });
    });

    it('KeyA를 누르면 leftward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyA', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ leftward: true });
    });

    it('KeyD를 누르면 rightward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyD', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ rightward: true });
    });

    it('ShiftLeft를 누르면 shift가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('ShiftLeft', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ shift: true });
    });

    it('Space를 누르면 space가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('Space', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ space: true });
    });

    it('KeyE를 누르면 keyE가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyE', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ keyE: true });
    });

    it('매핑되지 않은 키는 무시되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyX', 'keydown'));
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    });
  });

  describe('key up', () => {
    it('키를 떼면 false로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      act(() => fireKeyEvent('KeyW', 'keyup'));
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ forward: false });
    });

    it('눌리지 않은 키를 떼면 무시되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keyup'));
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    });
  });

  describe('duplicate key prevention', () => {
    it('이미 눌린 키를 다시 눌러도 중복 전송하지 않아야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    });
  });

  describe('pushKey', () => {
    it('pushKey로 직접 키 상태를 설정할 수 있어야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      act(() => {
        result.current.pushKey('forward', true);
      });
      expect(mockUpdateKeyboard).toHaveBeenCalledWith({ forward: true });
    });

    it('pushKey가 true를 반환해야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      let returnVal: boolean | undefined;
      act(() => {
        returnVal = result.current.pushKey('forward', true);
      });
      expect(returnVal).toBe(true);
    });

    it('interaction이 비활성화되어 있으면 pushKey를 무시해야 합니다', () => {
      mockStoreState = {
        ...mockStoreState,
        interaction: { isActive: false },
      };
      const { result } = renderHook(() => useKeyboard());
      let returnVal: boolean | undefined;

      act(() => {
        returnVal = result.current.pushKey('forward', true);
      });

      expect(returnVal).toBe(false);
      expect(mockUpdateKeyboard).not.toHaveBeenCalledWith({ forward: true });
    });
  });

  describe('clearAllKeys', () => {
    it('모든 키를 false로 리셋해야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      act(() => fireKeyEvent('KeyD', 'keydown'));
      mockUpdateKeyboard.mockClear();
      act(() => {
        result.current.clearAllKeys();
      });
      expect(mockUpdateKeyboard).toHaveBeenCalledWith(
        expect.objectContaining({
          forward: false,
          backward: false,
          leftward: false,
          rightward: false,
          shift: false,
          space: false,
        }),
      );
    });
  });

  describe('visibility change', () => {
    it('페이지가 숨겨지면 모든 키가 해제되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();

      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(mockUpdateKeyboard).toHaveBeenCalledWith(
        expect.objectContaining({ forward: false }),
      );

      Object.defineProperty(document, 'hidden', { value: false, writable: true });
    });
  });

  describe('cleanup', () => {
    it('releases the previous backend on replacement without transferring held keys', () => {
      const previous = createMemoryInputBackend();
      const next = createMemoryInputBackend();
      jest.mocked(useInputBackend).mockReturnValue(previous);
      const { result, rerender, unmount } = renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(previous.getKeyboard().forward).toBe(true);
      jest.mocked(useInputBackend).mockReturnValue(next);
      rerender();
      expect(previous.getKeyboard().forward).toBe(false);
      expect(next.getKeyboard().forward).toBe(false);
      expect(result.current.isKeyPressed('KeyW')).toBe(false);
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(next.getKeyboard().forward).toBe(true);
      unmount();
      expect(next.getKeyboard().forward).toBe(false);
    });

    it('releases held input when the browser window loses focus', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      act(() => { window.dispatchEvent(new Event('blur')); });
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith(expect.objectContaining({ forward: false }));
    });

    it('keeps another subscriber held until the last owner unmounts', () => {
      const first = renderHook(() => useKeyboard());
      const second = renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockUpdateKeyboard).toHaveBeenCalledTimes(1);
      mockUpdateKeyboard.mockClear();
      first.unmount();
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
      second.unmount();
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: false });
    });

    it('keeps physical input held when a screen button releases the same action', () => {
      const { result, unmount } = renderHook(() => useKeyboard());
      act(() => { result.current.pushKey('forward', true); });
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      act(() => { result.current.pushKey('forward', false); });
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
      act(() => fireKeyEvent('KeyW', 'keyup'));
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: false });
      unmount();
    });

    it('preserves held input across automation setting rerenders', () => {
      const { rerender, unmount } = renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      mockUpdateKeyboard.mockClear();
      mockStoreState = { ...mockStoreState, automation: { queue: { isRunning: true } } };
      rerender();
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
      unmount();
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: false });
    });

    it('turning off physical listeners releases physical keys while preserving screen input', () => {
      const { result, rerender, unmount } = renderHook(
        ({ listen }) => useKeyboard(true, true, undefined, true, listen),
        { initialProps: { listen: true } },
      );
      act(() => {
        fireKeyEvent('KeyW', 'keydown');
        fireKeyEvent('KeyD', 'keydown');
        result.current.pushKey('forward', true);
      });
      mockUpdateKeyboard.mockClear();
      rerender({ listen: false });
      expect(mockUpdateKeyboard).toHaveBeenCalledTimes(1);
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ rightward: false });
      act(() => { result.current.pushKey('forward', false); });
      expect(mockUpdateKeyboard).toHaveBeenLastCalledWith({ forward: false });
      mockUpdateKeyboard.mockClear();
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
      unmount();
    });

    it('unmount 시 이벤트 리스너가 제거되어야 합니다', () => {
      const { unmount } = renderHook(() => useKeyboard());
      unmount();
      mockUpdateKeyboard.mockClear();
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockUpdateKeyboard).not.toHaveBeenCalled();
    });
  });
});
