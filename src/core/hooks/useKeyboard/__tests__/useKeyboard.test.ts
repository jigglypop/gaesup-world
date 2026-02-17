import 'reflect-metadata';

import { renderHook, act } from '@testing-library/react';

import { useKeyboard } from '../index';

const mockExecuteCommand = jest.fn();
jest.mock('../../../interactions/bridge/InteractionBridge', () => ({
  InteractionBridge: {
    getGlobal: jest.fn().mockReturnValue({
      executeCommand: (...args: unknown[]) => mockExecuteCommand(...args),
    }),
  },
}));

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      automation: { queue: { isRunning: false } },
      stopAutomation: jest.fn(),
    }),
  ),
}));

const fireKeyEvent = (code: string, type: 'keydown' | 'keyup') => {
  const event = new KeyboardEvent(type, { code, bubbles: true });
  window.dispatchEvent(event);
};

describe('useKeyboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태에서 pressedKeys는 비어있어야 합니다', () => {
    const { result } = renderHook(() => useKeyboard());
    expect(result.current.pressedKeys).toHaveLength(0);
  });

  describe('key mapping', () => {
    it('KeyS를 누르면 forward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'input',
          action: 'updateKeyboard',
          data: { forward: true },
        }),
      );
    });

    it('KeyW를 누르면 backward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyW', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { backward: true } }),
      );
    });

    it('KeyA를 누르면 leftward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyA', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { leftward: true } }),
      );
    });

    it('KeyD를 누르면 rightward가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyD', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { rightward: true } }),
      );
    });

    it('ShiftLeft를 누르면 shift가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('ShiftLeft', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { shift: true } }),
      );
    });

    it('Space를 누르면 space가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('Space', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { space: true } }),
      );
    });

    it('KeyE를 누르면 keyE가 true로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyE', 'keydown'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { keyE: true } }),
      );
    });

    it('매핑되지 않은 키는 무시되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyX', 'keydown'));
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('key up', () => {
    it('키를 떼면 false로 설정되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      mockExecuteCommand.mockClear();
      act(() => fireKeyEvent('KeyS', 'keyup'));
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { forward: false } }),
      );
    });

    it('눌리지 않은 키를 떼면 무시되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keyup'));
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('duplicate key prevention', () => {
    it('이미 눌린 키를 다시 눌러도 중복 전송하지 않아야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      mockExecuteCommand.mockClear();
      act(() => fireKeyEvent('KeyS', 'keydown'));
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('pushKey', () => {
    it('pushKey로 직접 키 상태를 설정할 수 있어야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      act(() => {
        result.current.pushKey('forward', true);
      });
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({ data: { forward: true } }),
      );
    });

    it('pushKey가 true를 반환해야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      let returnVal: boolean | undefined;
      act(() => {
        returnVal = result.current.pushKey('forward', true);
      });
      expect(returnVal).toBe(true);
    });
  });

  describe('clearAllKeys', () => {
    it('모든 키를 false로 리셋해야 합니다', () => {
      const { result } = renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      act(() => fireKeyEvent('KeyD', 'keydown'));
      mockExecuteCommand.mockClear();
      act(() => {
        result.current.clearAllKeys();
      });
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            forward: false,
            backward: false,
            leftward: false,
            rightward: false,
            shift: false,
            space: false,
          }),
        }),
      );
    });
  });

  describe('visibility change', () => {
    it('페이지가 숨겨지면 모든 키가 해제되어야 합니다', () => {
      renderHook(() => useKeyboard());
      act(() => fireKeyEvent('KeyS', 'keydown'));
      mockExecuteCommand.mockClear();

      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ forward: false }),
        }),
      );

      Object.defineProperty(document, 'hidden', { value: false, writable: true });
    });
  });

  describe('cleanup', () => {
    it('unmount 시 이벤트 리스너가 제거되어야 합니다', () => {
      const { unmount } = renderHook(() => useKeyboard());
      unmount();
      mockExecuteCommand.mockClear();
      act(() => fireKeyEvent('KeyS', 'keydown'));
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });
});
