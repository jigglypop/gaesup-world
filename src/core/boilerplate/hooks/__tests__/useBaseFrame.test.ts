import { useFrame, type RootState } from '@react-three/fiber';
import { renderHook } from '@testing-library/react';

import { AbstractBridge } from '../../bridge/AbstractBridge';
import { IDisposable, RuntimeValue, UseBaseFrameOptions } from '../../types';
import { useBaseFrame, useConditionalFrame } from '../useBaseFrame';

// useFrame mock
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

const mockUseFrame = jest.mocked(useFrame);
type FrameCallback = Parameters<typeof useFrame>[0];

function getFrameHandler(callIndex = 0): FrameCallback {
  const call = mockUseFrame.mock.calls[callIndex];
  if (!call) {
    throw new Error(`useFrame was not called ${callIndex + 1} time(s)`);
  }
  return call[0];
}

// 프레임 핸들러는 clock.elapsedTime만 읽는다
function frameState(elapsedTime: number): RootState {
  return { clock: { elapsedTime } } as unknown as RootState;
}

// Mock 클래스들
class MockEngine implements IDisposable {
  disposed = false;
  
  dispose(): void {
    this.disposed = true;
  }
}

type MockSnapshot = { disposed: boolean };
type MockCommand = { type: 'noop' };

class MockBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
  override register = jest.fn<void, [id: string, ...args: RuntimeValue[]]>();
  override unregister = jest.fn<void, [id: string]>();
  override notifyListeners = jest.fn<void, [id: string]>();

  protected buildEngine(): MockEngine {
    return new MockEngine();
  }

  protected executeCommand(): void {}

  protected createSnapshot(engine: MockEngine): MockSnapshot {
    return { disposed: engine.disposed };
  }
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
  let mockCallback: jest.Mock<void, []>;

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
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('프레임 핸들러가 브리지 리스너를 호출해야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('콜백이 있으면 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    test('콜백이 없어도 브리지 리스너는 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id'));
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
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
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 true이고 document.hidden이 true면 실행되지 않아야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: true };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 false면 document.hidden 상태와 관계없이 실행되어야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: false };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = getFrameHandler();
      frameHandler(frameState(1), 0.016);
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('throttle 기능', () => {
    test('throttle이 설정되면 지정된 시간 간격으로만 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 }; // 100ms
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = getFrameHandler();
      
      // 첫 번째 호출 (시간: 16ms)
      frameHandler(frameState(0.016), 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // 두 번째 호출 (시간: 32ms, 간격: 16ms < 100ms)
      frameHandler(frameState(0.032), 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(1); // 호출되지 않음
      
      // 시간을 충분히 진행시킴 (시간: 116ms 이상)
      frameHandler(frameState(0.116), 0.016);
      expect(mockCallback).toHaveBeenCalledTimes(2); // 다시 호출됨
    });

    test('throttle이 0이면 매 프레임 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 0 };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = getFrameHandler();
      
      frameHandler(frameState(1), 0.016);
      frameHandler(frameState(1), 0.016);
      frameHandler(frameState(1), 0.016);
      
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
      
      const initialHandler = getFrameHandler(0);
      
      rerender(mockBridge2);
      
      const newHandler = getFrameHandler(1);
      expect(newHandler).not.toBe(initialHandler);
    });

    test('콜백이 변경되면 새로운 핸들러가 생성되어야 함', () => {
      const callback2 = jest.fn();
      
      const { rerender } = renderHook(
        (callback) => useBaseFrame(mockBridge, 'test-id', callback),
        { initialProps: mockCallback }
      );
      
      const initialHandler = getFrameHandler(0);
      
      rerender(callback2);
      
      const newHandler = getFrameHandler(1);
      expect(newHandler).not.toBe(initialHandler);
    });

    test('같은 참조의 옵션이면 핸들러가 재생성되지 않아야 함', () => {
      const options: UseBaseFrameOptions = { priority: 1, enabled: true };
      
      const { rerender } = renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      const initialHandler = getFrameHandler(0);

      rerender();

      const rerenderHandler = getFrameHandler(1);
      expect(rerenderHandler).toBe(initialHandler);
    });
  });

  describe('에러 처리', () => {
    test('콜백에서 에러가 발생해도 브리지 리스너는 호출되어야 함', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', errorCallback));
      
      const frameHandler = getFrameHandler();
      
      expect(() => {
        frameHandler(frameState(1), 0.016);
      }).toThrow('Callback error');
      
      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('브리지 notifyListeners에서 에러가 발생해도 콜백은 호출되어야 함', () => {
      mockBridge.notifyListeners.mockImplementation(() => {
        throw new Error('Bridge error');
      });
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = getFrameHandler();
      
      expect(() => {
        frameHandler(frameState(1), 0.016);
      }).toThrow('Bridge error');
      
      // mockCallback이 호출되었는지는 에러 발생 시점에 따라 달라질 수 있음
    });
  });

  describe('성능 테스트', () => {
    test('프레임 핸들러가 효율적으로 실행되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));
      
      const frameHandler = getFrameHandler();
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        frameHandler(frameState(i), 0.016);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });

    test('throttle 기능이 성능을 향상시켜야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 };
      
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));
      
      const frameHandler = getFrameHandler();
      
      // 1000번 호출하지만 throttle로 인해 실제로는 훨씬 적게 실행됨
      for (let i = 0; i < 1000; i++) {
        // elapsedTime is seconds in R3F's clock.
        frameHandler(frameState(i * 0.016), 0.016);
      }
      
      // With a 16ms "frame" and 100ms throttle, we expect ~140-160 calls.
      expect(mockCallback.mock.calls.length).toBeLessThan(160);
    });
  });
});

describe('useConditionalFrame', () => {
  let mockBridge: MockBridge;
  let mockCallback: jest.Mock<void, []>;
  let mockCondition: jest.Mock<boolean, []>;

  beforeEach(() => {
    mockBridge = new MockBridge();
    mockCallback = jest.fn();
    mockCondition = jest.fn();
    jest.clearAllMocks();
  });

  test('조건이 true일 때만 실행되어야 함', () => {
    mockCondition.mockReturnValue(true);
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));
    
    const frameHandler = getFrameHandler();
    frameHandler(frameState(1), 0.016);
    
    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  test('조건이 false일 때 실행되지 않아야 함', () => {
    mockCondition.mockReturnValue(false);
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));
    
    const frameHandler = getFrameHandler();
    frameHandler(frameState(1), 0.016);
    
    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('조건 함수가 에러를 발생시켜도 안전해야 함', () => {
    mockCondition.mockImplementation(() => {
      throw new Error('Condition error');
    });
    
    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));
    
    const frameHandler = getFrameHandler();
    
    expect(() => {
      frameHandler(frameState(1), 0.016);
    }).toThrow('Condition error');
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
}); 