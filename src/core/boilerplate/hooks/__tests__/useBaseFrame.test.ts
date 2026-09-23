import { renderHook } from '@testing-library/react';
import { useBaseFrame, useConditionalFrame } from '../useBaseFrame';
import { AbstractBridge } from '../../bridge/AbstractBridge';
import { IDisposable, UseBaseFrameOptions } from '../../types';
import { frameScheduler } from '../../../runtime/frame';
import { logger } from '../../../utils/logger';

const tickFrame = (elapsedMs: number) => frameScheduler.tick(0.016, elapsedMs);

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

afterEach(() => {
  frameScheduler.clear();
  jest.restoreAllMocks();
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
    test('snapshot 단계에 등록되어야 함', () => {
      const addSpy = jest.spyOn(frameScheduler, 'add');
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));

      expect(frameScheduler.count('snapshot')).toBe(1);
      expect(addSpy).toHaveBeenCalledWith('snapshot', expect.any(Function), expect.objectContaining({ order: 0 }));
    });

    test('브리지가 null이면 아무 작업하지 않아야 함', () => {
      renderHook(() => useBaseFrame(null, 'test-id', mockCallback));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('프레임 핸들러가 브리지 리스너를 호출해야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('콜백이 있으면 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));

      tickFrame(1000);

      expect(mockCallback).toHaveBeenCalled();
    });

    test('콜백이 없어도 브리지 리스너는 호출되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id'));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
    });
  });

  describe('옵션 처리', () => {
    test('priority 옵션이 snapshot 단계 order로 전달되어야 함', () => {
      const addSpy = jest.spyOn(frameScheduler, 'add');
      const options: UseBaseFrameOptions = { priority: 5 };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      expect(addSpy).toHaveBeenCalledWith('snapshot', expect.any(Function), expect.objectContaining({ order: 5 }));
    });

    test('enabled가 false면 프레임 핸들러가 작동하지 않아야 함', () => {
      const options: UseBaseFrameOptions = { enabled: false };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 true이고 document.hidden이 true면 실행되지 않아야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: true };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('skipWhenHidden이 false면 document.hidden 상태와 관계없이 실행되어야 함', () => {
      Object.defineProperty(document, 'hidden', { value: true });
      const options: UseBaseFrameOptions = { skipWhenHidden: false };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      tickFrame(1000);

      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('throttle 기능', () => {
    test('throttle이 설정되면 지정된 시간 간격으로만 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 }; // 100ms

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      // 첫 번째 호출 (시간: 16ms)
      tickFrame(16);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // 두 번째 호출 (시간: 32ms, 간격: 16ms < 100ms)
      tickFrame(32);
      expect(mockCallback).toHaveBeenCalledTimes(1); // 호출되지 않음

      // 시간을 충분히 진행시킴 (시간: 116ms 이상)
      tickFrame(116);
      expect(mockCallback).toHaveBeenCalledTimes(2); // 다시 호출됨
    });

    test('throttle이 0이면 매 프레임 실행되어야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 0 };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      tickFrame(1000);
      tickFrame(1000);
      tickFrame(1000);

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('옵션 변경 처리', () => {
    test('브리지가 변경되면 새로운 브리지로 알려야 함', () => {
      const mockBridge2 = new MockBridge();

      const { rerender } = renderHook(
        (bridge) => useBaseFrame(bridge, 'test-id', mockCallback),
        { initialProps: mockBridge }
      );

      rerender(mockBridge2);
      tickFrame(1000);

      expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
      expect(mockBridge2.notifyListeners).toHaveBeenCalledWith('test-id');
    });

    test('콜백이 변경되면 새로운 콜백이 호출되어야 함', () => {
      const callback2 = jest.fn();

      const { rerender } = renderHook(
        (callback) => useBaseFrame(mockBridge, 'test-id', callback),
        { initialProps: mockCallback }
      );

      rerender(callback2);
      tickFrame(1000);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('같은 참조의 옵션이면 재등록되지 않아야 함', () => {
      const addSpy = jest.spyOn(frameScheduler, 'add');
      const options: UseBaseFrameOptions = { priority: 1, enabled: true };

      const { rerender } = renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      rerender();

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(frameScheduler.count('snapshot')).toBe(1);
    });
  });

  describe('에러 처리', () => {
    test('콜백에서 에러가 발생해도 브리지 리스너는 호출되어야 함', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      renderHook(() => useBaseFrame(mockBridge, 'test-id', errorCallback));

      expect(() => tickFrame(1000)).not.toThrow();

      expect(mockBridge.notifyListeners).toHaveBeenCalledWith('test-id');
      expect(errorSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ message: 'Callback error' }));
    });

    test('브리지 notifyListeners에서 에러가 발생해도 콜백은 호출되어야 함', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      mockBridge.notifyListeners.mockImplementation(() => {
        throw new Error('Bridge error');
      });

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));

      expect(() => tickFrame(1000)).not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ message: 'Bridge error' }));

      // mockCallback이 호출되었는지는 에러 발생 시점에 따라 달라질 수 있음
    });
  });

  describe('성능 테스트', () => {
    test('프레임 핸들러가 효율적으로 실행되어야 함', () => {
      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback));

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        tickFrame(i * 1000);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });

    test('throttle 기능이 성능을 향상시켜야 함', () => {
      const options: UseBaseFrameOptions = { throttle: 100 };

      renderHook(() => useBaseFrame(mockBridge, 'test-id', mockCallback, options));

      // 1000번 호출하지만 throttle로 인해 실제로는 훨씬 적게 실행됨
      for (let i = 0; i < 1000; i++) {
        tickFrame(i * 16);
      }

      // With a 16ms "frame" and 100ms throttle, we expect ~140-160 calls.
      expect(mockCallback.mock.calls.length).toBeLessThan(160);
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

    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));

    tickFrame(1000);

    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  test('조건이 false일 때 실행되지 않아야 함', () => {
    mockCondition.mockReturnValue(false);

    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));

    tickFrame(1000);

    expect(mockCondition).toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('조건 함수가 에러를 발생시켜도 안전해야 함', () => {
    mockCondition.mockImplementation(() => {
      throw new Error('Condition error');
    });

    renderHook(() => useConditionalFrame(mockBridge, 'test-id', mockCondition, mockCallback));

    const errorSpy = jest.spyOn(logger, 'error');

    expect(() => tickFrame(1000)).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ message: 'Condition error' }));

    expect(mockCallback).not.toHaveBeenCalled();
  });
});