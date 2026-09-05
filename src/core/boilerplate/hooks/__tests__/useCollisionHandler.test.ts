import { renderHook } from '@testing-library/react';
import { useCollisionHandler, CollisionHandlerOptions } from '../useCollisionHandler';
import { CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';

// Mock 데이터
const mockCollisionEnterPayload: CollisionEnterPayload = {
  target: {} as any,
  other: {} as any,
  manifold: null,
  flipped: false,
};

const mockCollisionExitPayload: CollisionExitPayload = {
  target: {} as any,
  other: {} as any,
  flipped: false,
};

describe('useCollisionHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 동작', () => {
    test('옵션 없이 사용할 수 있어야 함', () => {
      const options: CollisionHandlerOptions = {};
      
      expect(() => {
        renderHook(() => useCollisionHandler(options));
      }).not.toThrow();
    });

    test('모든 핸들러가 정의되어야 함', () => {
      const options: CollisionHandlerOptions = {};
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(result.current.handleIntersectionEnter).toBeDefined();
      expect(result.current.handleIntersectionExit).toBeDefined();
      expect(result.current.handleCollisionEnter).toBeDefined();
      expect(typeof result.current.handleIntersectionEnter).toBe('function');
      expect(typeof result.current.handleIntersectionExit).toBe('function');
      expect(typeof result.current.handleCollisionEnter).toBe('function');
    });
  });

  describe('IntersectionEnter 핸들러', () => {
    test('onIntersectionEnter 콜백이 호출되어야 함', () => {
      const onIntersectionEnter = jest.fn();
      const options: CollisionHandlerOptions = { onIntersectionEnter };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionEnter(mockCollisionEnterPayload);
      
      expect(onIntersectionEnter).toHaveBeenCalledWith(mockCollisionEnterPayload);
      expect(onIntersectionEnter).toHaveBeenCalledTimes(1);
    });

    test('userData의 onNear 함수가 호출되어야 함', () => {
      const onNear = jest.fn();
      const userData = { onNear, testData: 'test' };
      const options: CollisionHandlerOptions = { userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionEnter(mockCollisionEnterPayload);
      
      expect(onNear).toHaveBeenCalledWith(mockCollisionEnterPayload, userData);
      expect(onNear).toHaveBeenCalledTimes(1);
    });

    test('onIntersectionEnter와 userData.onNear가 모두 호출되어야 함', () => {
      const onIntersectionEnter = jest.fn();
      const onNear = jest.fn();
      const userData = { onNear };
      const options: CollisionHandlerOptions = { onIntersectionEnter, userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionEnter(mockCollisionEnterPayload);
      
      expect(onIntersectionEnter).toHaveBeenCalledWith(mockCollisionEnterPayload);
      expect(onNear).toHaveBeenCalledWith(mockCollisionEnterPayload, userData);
    });

    test('userData.onNear가 함수가 아닌 경우 에러가 발생하지 않아야 함', () => {
      const userData = { onNear: 'not a function' };
      const options: CollisionHandlerOptions = { userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
    });

    test('userData가 없는 경우 에러가 발생하지 않아야 함', () => {
      const options: CollisionHandlerOptions = {};
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
    });
  });

  describe('IntersectionExit 핸들러', () => {
    test('onIntersectionExit 콜백이 호출되어야 함', () => {
      const onIntersectionExit = jest.fn();
      const options: CollisionHandlerOptions = { onIntersectionExit };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionExit(mockCollisionExitPayload);
      
      expect(onIntersectionExit).toHaveBeenCalledWith(mockCollisionExitPayload);
      expect(onIntersectionExit).toHaveBeenCalledTimes(1);
    });

    test('userData의 onFar 함수가 호출되어야 함', () => {
      const onFar = jest.fn();
      const userData = { onFar };
      const options: CollisionHandlerOptions = { userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionExit(mockCollisionExitPayload);
      
      expect(onFar).toHaveBeenCalledWith(mockCollisionExitPayload, userData);
    });

    test('onIntersectionExit와 userData.onFar가 모두 호출되어야 함', () => {
      const onIntersectionExit = jest.fn();
      const onFar = jest.fn();
      const userData = { onFar };
      const options: CollisionHandlerOptions = { onIntersectionExit, userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleIntersectionExit(mockCollisionExitPayload);
      
      expect(onIntersectionExit).toHaveBeenCalledWith(mockCollisionExitPayload);
      expect(onFar).toHaveBeenCalledWith(mockCollisionExitPayload, userData);
    });
  });

  describe('CollisionEnter 핸들러', () => {
    test('onCollisionEnter 콜백이 호출되어야 함', () => {
      const onCollisionEnter = jest.fn();
      const options: CollisionHandlerOptions = { onCollisionEnter };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      result.current.handleCollisionEnter(mockCollisionEnterPayload);
      
      expect(onCollisionEnter).toHaveBeenCalledWith(mockCollisionEnterPayload);
      expect(onCollisionEnter).toHaveBeenCalledTimes(1);
    });

    test('onCollisionEnter가 없어도 에러가 발생하지 않아야 함', () => {
      const options: CollisionHandlerOptions = {};
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleCollisionEnter(mockCollisionEnterPayload)).not.toThrow();
    });
  });

  describe('옵션 변경 처리', () => {
    test('옵션이 변경되면 새로운 핸들러가 생성되어야 함', () => {
      const initialOptions: CollisionHandlerOptions = {
        onIntersectionEnter: jest.fn()
      };
      
      const { result, rerender } = renderHook(
        (options) => useCollisionHandler(options),
        { initialProps: initialOptions }
      );
      
      const initialHandler = result.current.handleIntersectionEnter;
      
      const newOptions: CollisionHandlerOptions = {
        onIntersectionEnter: jest.fn()
      };
      
      rerender(newOptions);
      
      expect(result.current.handleIntersectionEnter).not.toBe(initialHandler);
    });

    test('같은 참조의 옵션이면 핸들러가 재생성되지 않아야 함', () => {
      const callback = jest.fn();
      const userData = { onNear: jest.fn() };
      const options: CollisionHandlerOptions = {
        onIntersectionEnter: callback,
        userData
      };
      
      const { result, rerender } = renderHook(
        () => useCollisionHandler(options)
      );
      
      const initialHandler = result.current.handleIntersectionEnter;
      
      rerender();
      
      expect(result.current.handleIntersectionEnter).toBe(initialHandler);
    });
  });

  describe('에러 처리', () => {
    test('콜백에서 에러가 발생해도 다른 핸들러에 영향을 주지 않아야 함', () => {
      const onIntersectionEnter = jest.fn(() => {
        throw new Error('Test error');
      });
      const onNear = jest.fn();
      const userData = { onNear };
      const options: CollisionHandlerOptions = { onIntersectionEnter, userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      // onIntersectionEnter에서 에러가 발생하지만 onNear는 여전히 호출되어야 함
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
      expect(onIntersectionEnter).toHaveBeenCalled();
      expect(onNear).toHaveBeenCalledWith(mockCollisionEnterPayload, userData);
    });

    test('userData.onNear에서 에러가 발생해도 처리되어야 함', () => {
      const onNear = jest.fn(() => {
        throw new Error('onNear error');
      });
      const userData = { onNear };
      const options: CollisionHandlerOptions = { userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
      expect(onNear).toHaveBeenCalledWith(mockCollisionEnterPayload, userData);
    });
  });

  describe('userData 다양한 케이스', () => {
    test('userData에 다양한 데이터가 있어도 올바르게 작동해야 함', async () => {
      const onNear = jest.fn();
      const onFar = jest.fn();
      const userData = {
        onNear,
        onFar,
        id: 'test-entity',
        position: { x: 0, y: 0, z: 0 },
        metadata: { type: 'player' }
      };
      const options: CollisionHandlerOptions = { userData };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      await result.current.handleIntersectionEnter(mockCollisionEnterPayload);
      await result.current.handleIntersectionExit(mockCollisionExitPayload);
      
      expect(onNear).toHaveBeenCalledWith(mockCollisionEnterPayload, userData);
      expect(onFar).toHaveBeenCalledWith(mockCollisionExitPayload, userData);
    });

    test('userData가 null이어도 안전해야 함', async () => {
      const options: CollisionHandlerOptions = { userData: null as any };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
    });

    test('userData가 undefined여도 안전해야 함', async () => {
      const options: CollisionHandlerOptions = { userData: undefined };
      
      const { result } = renderHook(() => useCollisionHandler(options));
      
      expect(() => result.current.handleIntersectionEnter(mockCollisionEnterPayload)).not.toThrow();
    });
  });

  describe('성능 테스트', () => {
    test('핸들러 호출이 충분히 가벼워야 함', () => {
      // Creating React hook instances is dominated by test harness overhead and is not a
      // stable benchmark. Instead, measure the hot-path: handler invocation.
      const noop = () => {};
      const userData = { onNear: noop, onFar: noop };
      const { result } = renderHook(() =>
        useCollisionHandler({
          onIntersectionEnter: noop,
          onIntersectionExit: noop,
          onCollisionEnter: noop,
          userData,
        }),
      );

      const startTime = performance.now();
      for (let i = 0; i < 200_000; i++) {
        result.current.handleIntersectionEnter(mockCollisionEnterPayload);
      }
      const endTime = performance.now();

      // Keep this strict but stable across environments.
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
}); 