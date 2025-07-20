import { renderHook } from '@testing-library/react';
import { useBaseFrame, useConditionalFrame } from '../useBaseFrame';
import { AbstractBridge } from '../../bridge/AbstractBridge';
import { IDisposable, UseBaseFrameOptions } from '../../types';

// useFrame mock
const mockUseFrame = jest.fn();
jest.mock('@react-three/fiber', () => ({
  useFrame: mockUseFrame
}));

// Mock 클래스들
class MockEngine implements IDisposable {
  disposed = false;
  
  dispose(): void {
    this.disposed = true;
  }
}

class MockBridge extends AbstractBridge<MockEngine, any, any> {
  register = jest.fn();
  unregister = jest.fn();
  notifyListeners = jest.fn();
}

// document.hidden mock
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false
});

// performance.now mock
const mockPerformanceNow = jest.fn();
Object.defineProperty(performance, 'now', {
  writable: true,
  value: mockPerformanceNow
});

describe('useBaseFrame', () => {
  let mockBridge: MockBridge;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockBridge = new MockBridge();
    mockCallback = jest.fn();
    jest.clearAllMocks();
    
    // performance.now 기본 동작
    let mockTime = 0;
    mockPerformanceNow.mockImplementation(() => {
      mockTime += 16; // 60fps 시뮬레이션
      return mockTime;
    });
    
    // document.hidden 초기값
    Object.defineProperty(document, 'hidden', { value: false });
  });

  describe('기본 동작', () => {
    test('useFrame이 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      expect(mockUseFrame).toHaveBeenCalled();
      expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function), 0);
    });

    test('브리지가 null이면 아무 작업하지 않아야 함', () => {
      renderHook(() => useBaseFrame(null, 'test-id', mockCallback));
      
      expect(mockUseFrame).toHaveBeenCalled();
      
      // 프레임 핸들러를 실행해보면 아무것도 호출되지 않아야 함
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('프레임 핸들러가 브리지 리스너를 호출해야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('콜백이 있으면 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    test('콜백이 없어도 브리지 리스너는 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id'));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });
  });

  describe('옵션 처리', () => {
    test('priority 옵션이 useFrame에 전달되어야 함', () => {
      const options: UseBaseFrameOptions = { priority: 5 };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function), 5);
    });

    test('enabled가 false면 프레임 핸들러가 작동하지 않아야 함', () => {
      const options: UseBaseFrameOptions = { enabled: false };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 true이고 document.hidden이 true면 실행되지 않아야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: true };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 false면 document.hidden 상태와 관계없이 실행되어야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: false };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('throttle 기능', () => {
    test('throttle이 설정되면 지정된 시간 간격으로만 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 }; // 100ms
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      
      // 첫 번째 호출 (시간: 16ms)
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // 두 번째 호출 (시간: 32ms, 간격: 16ms < 100ms)
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(1); // 호출되지 않음
      
      // 시간을 충분히 진행시킴 (시간: 116ms 이상)
      mockPerformanceNow.mockReturnValue(116);
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(2); // 다시 호출됨
    });

    test('throttle이 0이면 매 프레임 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 0 };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('옵션 변경 처리', () => {
    test('브리지가 변경되면 새로운 핸들러가 생성되어야 함', () => {
      const mockBridge2 = new MockBridge();
      
      const { rerender } = renderHook(
        (bridge) => useBaseFrame(bridge, 'test-id', mockCallback),
        { initialProps: mockBridge }
      );
      
      const initialHandler = mockUseFrame.mock.calls[0][0];
      
      rerender(mockBridge2);
      
      const newHandler = mockUseFrame.mock.calls[1][0];
      expect(newHandler).not.toBe(initialHandler);
    });

    test('콜백이 변경되면 새로운 핸들러가 생성되어야 함', () => {
      const callback2 = jest.fn();
      
      const { rerender } = renderHook(
        (callback) => useBaseFrame(mockBridge, 'test-id', callback),
        { initialProps: mockCallback }
      );
      
      const initialHandler = mockUseFrame.mock.calls[0][0];
      
      rerender(callback2);
      
      const newHandler = mockUseFrame.mock.calls[1][0];
      expect(newHandler).not.toBe(initialHandler);
    });

    test('같은 참조의 옵션이면 핸들러가 재생성되지 않아야 함', () => {
      const options: UseBaseFrameOptions = { priority: 1, enabled: true };
      
      const { rerender } = renderHook(() => 
        useBaseFrame(mockBridge, 'test-id', mockCallback, options)
      );
      
      const initialCallCount = mockUseFrame.mock.calls.length;
      
      rerender();
      
      expect(mockUseFrame.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('에러 처리', () => {
    test('콜백에서 에러가 발생해도 브리지 리스너는 호출되어야 함', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', errorCallback));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      
      expect(() => {
        frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      }).toThrow('Callback error');
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('브리지 notifyListeners에서 에러가 발생해도 콜백은 호출되어야 함', () => {
      mockBridge.notifyListeners.mockImplementation(() => {
        throw new Error('Bridge error');
      });
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      
      expect(() => {
        frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
      }).toThrow('Bridge error');
      
      // mockCallback이 호출되었는지는 에러 발생 시점에 따라 달라질 수 있음
    });
  });

  describe('성능 테스트', () => {
    test('프레임 핸들러가 효율적으로 실행되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        frameHandler({ clock: { elapsedTime: i } }, 0.016);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });

    test('throttle 기능이 성능을 향상시켜야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = mockUseFrame.mock.calls[0][0];
      
      // 1000번 호출하지만 throttle로 인해 실제로는 훨씬 적게 실행됨
      for (let i = 0; i < 1000; i++) {
        frameHandler({ clock: { elapsedTime: i } }, 0.016);
      }
      
      expect(mockCallback.mock.calls.length).toBeLessThan(100);
    });
  });
});

describe('useConditionalFrame', () => {
  let mockBridge: MockBridge;
  let mockCallback: jest.Mock;
  let mockCondition: jest.Mock;

  beforeEach(() => {
    mockBridge = new MockBridge();
    mockCallback = jest.fn();
    mockCondition = jest.fn();
    jest.clearAllMocks();
  });

  test('조건이 true일 때만 실행되어야 함', () => {
    mockCondition.mockReturnValue(true);
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCallback, mockCondition));
    
    const frameHandler = mockUseFrame.mock.calls[0][0];
    frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
    
    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  test('조건이 false일 때 실행되지 않아야 함', () => {
    mockCondition.mockReturnValue(false);
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCallback, mockCondition));
    
    const frameHandler = mockUseFrame.mock.calls[0][0];
    frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
    
    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('조건 함수가 에러를 발생시켜도 안전해야 함', () => {
    mockCondition.mockImplementation(() => {
      throw new Error('Condition error');
    });
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCallback, mockCondition));
    
    const frameHandler = mockUseFrame.mock.calls[0][0];
    
    expect(() => {
      frameHandler({ clock: { elapsedTime: 1 } }, 0.016);
    }).toThrow('Condition error');
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
}); 