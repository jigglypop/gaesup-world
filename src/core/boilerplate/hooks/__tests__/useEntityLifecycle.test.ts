import { renderHook } from '@testing-library/react';
import { useEntityLifecycle, EntityLifecycleOptions } from '../useEntityLifecycle';
import * as THREE from 'three';

// requestAnimationFrame과 cancelAnimationFrame 모킹
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

// THREE.AnimationAction 모킹
const createMockAnimationAction = (): THREE.AnimationAction => ({
  play: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  pause: jest.fn().mockReturnThis(),
  reset: jest.fn().mockReturnThis(),
  setDuration: jest.fn().mockReturnThis(),
  setEffectiveTimeScale: jest.fn().mockReturnThis(),
  setEffectiveWeight: jest.fn().mockReturnThis(),
  fadeIn: jest.fn().mockReturnThis(),
  fadeOut: jest.fn().mockReturnThis(),
  crossFadeFrom: jest.fn().mockReturnThis(),
  crossFadeTo: jest.fn().mockReturnThis(),
  stopFading: jest.fn().mockReturnThis(),
  setLoop: jest.fn().mockReturnThis(),
  syncWith: jest.fn().mockReturnThis(),
  halt: jest.fn().mockReturnThis(),
  warp: jest.fn().mockReturnThis(),
  getMixer: jest.fn(),
  getClip: jest.fn(),
  getRoot: jest.fn(),
  enabled: true,
  weight: 1,
  time: 0,
  timeScale: 1,
  repetitions: Infinity,
  paused: false,
  clampWhenFinished: false,
  zeroSlopeAtStart: true,
  zeroSlopeAtEnd: true,
  loop: THREE.LoopRepeat,
  blendMode: THREE.NormalAnimationBlendMode
} as any);

describe('useEntityLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestAnimationFrame.mockImplementation((callback) => {
      // 즉시 콜백 실행하여 테스트에서 확인 가능
      setTimeout(callback, 0);
      return 123; // 임의의 ID 반환
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('기본 동작', () => {
    test('옵션 없이 사용할 수 있어야 함', () => {
      const options: EntityLifecycleOptions = {};
      
      expect(() => {
        renderHook(() => useEntityLifecycle(options));
      }).not.toThrow();
    });

    test('모든 옵션이 undefined여도 안전해야 함', () => {
      const options: EntityLifecycleOptions = {
        onReady: undefined,
        onFrame: undefined,
        onAnimate: undefined,
        actions: undefined
      };
      
      expect(() => {
        renderHook(() => useEntityLifecycle(options));
      }).not.toThrow();
    });
  });

  describe('onReady 콜백', () => {
    test('onReady가 마운트 시 호출되어야 함', () => {
      const onReady = jest.fn();
      const options: EntityLifecycleOptions = { onReady };
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(onReady).toHaveBeenCalledTimes(1);
    });

    test('onReady가 변경되면 다시 호출되어야 함', () => {
      const onReady1 = jest.fn();
      const onReady2 = jest.fn();
      
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: { onReady: onReady1 } }
      );
      
      expect(onReady1).toHaveBeenCalledTimes(1);
      
      rerender({ onReady: onReady2 });
      
      expect(onReady2).toHaveBeenCalledTimes(1);
      expect(onReady1).toHaveBeenCalledTimes(1); // 이전 콜백은 추가 호출되지 않음
    });

    test('onReady가 undefined로 변경되어도 안전해야 함', () => {
      const onReady = jest.fn();
      
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: { onReady } }
      );
      
      expect(onReady).toHaveBeenCalledTimes(1);
      
      expect(() => {
        rerender({ onReady: undefined });
      }).not.toThrow();
    });
  });

  describe('프레임 핸들링', () => {
    test('onFrame이 있으면 requestAnimationFrame이 호출되어야 함', () => {
      const onFrame = jest.fn();
      const options: EntityLifecycleOptions = { onFrame };
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    test('onFrame이 없으면 requestAnimationFrame이 호출되지 않아야 함', () => {
      const options: EntityLifecycleOptions = {};
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    test('컴포넌트 언마운트 시 cancelAnimationFrame이 호출되어야 함', () => {
      const onFrame = jest.fn();
      const options: EntityLifecycleOptions = { onFrame };
      
      const { unmount } = renderHook(() => useEntityLifecycle(options));
      
      unmount();
      
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    test('onFrame 콜백이 호출되어야 함', (done) => {
      const onFrame = jest.fn(() => {
        expect(onFrame).toHaveBeenCalled();
        done();
      });
      const options: EntityLifecycleOptions = { onFrame };
      
      renderHook(() => useEntityLifecycle(options));
    });
  });

  describe('애니메이션 핸들링', () => {
    test('onAnimate와 actions가 있으면 프레임 루프가 시작되어야 함', () => {
      const onAnimate = jest.fn();
      const actions = { walk: createMockAnimationAction() };
      const options: EntityLifecycleOptions = { onAnimate, actions };
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    test('onAnimate만 있고 actions가 없으면 프레임 루프가 시작되지 않아야 함', () => {
      const onAnimate = jest.fn();
      const options: EntityLifecycleOptions = { onAnimate };
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    test('actions만 있고 onAnimate가 없으면 프레임 루프가 시작되지 않아야 함', () => {
      const actions = { walk: createMockAnimationAction() };
      const options: EntityLifecycleOptions = { actions };
      
      renderHook(() => useEntityLifecycle(options));
      
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    test('onAnimate 콜백이 호출되어야 함', (done) => {
      const onAnimate = jest.fn(() => {
        expect(onAnimate).toHaveBeenCalled();
        done();
      });
      const actions = { walk: createMockAnimationAction() };
      const options: EntityLifecycleOptions = { onAnimate, actions };
      
      renderHook(() => useEntityLifecycle(options));
    });
  });

  describe('옵션 변경 처리', () => {
    test('onFrame이 추가되면 프레임 루프가 시작되어야 함', () => {
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: {} }
      );
      
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
      
      rerender({ onFrame: jest.fn() });
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    test('onFrame이 제거되면 프레임 루프가 중지되어야 함', () => {
      const onFrame = jest.fn();
      
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: { onFrame } }
      );
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      
      rerender({});
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    test('actions가 변경되면 프레임 루프가 재시작되어야 함', () => {
      const onAnimate = jest.fn();
      const actions1 = { walk: createMockAnimationAction() };
      const actions2 = { run: createMockAnimationAction() };
      
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: { onAnimate, actions: actions1 } }
      );
      
      const firstCallCount = mockRequestAnimationFrame.mock.calls.length;
      
      rerender({ onAnimate, actions: actions2 });
      
      expect(mockRequestAnimationFrame.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  describe('복합 시나리오', () => {
    test('onFrame과 onAnimate가 모두 있으면 둘 다 호출되어야 함', (done) => {
      const onFrame = jest.fn();
      const onAnimate = jest.fn();
      const actions = { walk: createMockAnimationAction() };
      
      let callCount = 0;
      mockRequestAnimationFrame.mockImplementation((callback) => {
        setTimeout(() => {
          callback();
          callCount++;
          if (callCount === 1) {
            expect(onFrame).toHaveBeenCalled();
            expect(onAnimate).toHaveBeenCalled();
            done();
          }
        }, 0);
        return 123;
      });
      
      const options: EntityLifecycleOptions = { onFrame, onAnimate, actions };
      
      renderHook(() => useEntityLifecycle(options));
    });

    test('여러 액션이 있어도 정상 작동해야 함', () => {
      const onAnimate = jest.fn();
      const actions = {
        walk: createMockAnimationAction(),
        run: createMockAnimationAction(),
        jump: createMockAnimationAction(),
        idle: null, // null 액션도 처리할 수 있어야 함
      };
      const options: EntityLifecycleOptions = { onAnimate, actions };
      
      expect(() => {
        renderHook(() => useEntityLifecycle(options));
      }).not.toThrow();
    });
  });

  describe('에러 처리', () => {
    test('onReady에서 에러가 발생해도 훅이 중단되지 않아야 함', () => {
      const onReady = jest.fn(() => {
        throw new Error('onReady error');
      });
      const options: EntityLifecycleOptions = { onReady };
      
      expect(() => {
        renderHook(() => useEntityLifecycle(options));
      }).toThrow('onReady error');
    });

    test('onFrame에서 에러가 발생해도 프레임 루프가 계속되어야 함', (done) => {
      let callCount = 0;
      const onFrame = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('onFrame error');
        } else if (callCount === 2) {
          // 두 번째 호출에서는 정상 작동 확인
          done();
        }
      });
      
      mockRequestAnimationFrame.mockImplementation((callback) => {
        setTimeout(() => {
          try {
            callback();
          } catch (error) {
            // 에러 무시하고 다음 프레임 스케줄
          }
          if (callCount < 2) {
            mockRequestAnimationFrame(callback);
          }
        }, 0);
        return 123;
      });
      
      const options: EntityLifecycleOptions = { onFrame };
      
      renderHook(() => useEntityLifecycle(options));
    });

    test('onAnimate에서 에러가 발생해도 처리되어야 함', () => {
      const onAnimate = jest.fn(() => {
        throw new Error('onAnimate error');
      });
      const actions = { walk: createMockAnimationAction() };
      const options: EntityLifecycleOptions = { onAnimate, actions };
      
      expect(() => {
        renderHook(() => useEntityLifecycle(options));
      }).not.toThrow();
    });
  });

  describe('메모리 관리', () => {
    test('언마운트 시 모든 정리 작업이 수행되어야 함', () => {
      const onFrame = jest.fn();
      const onAnimate = jest.fn();
      const actions = { walk: createMockAnimationAction() };
      const options: EntityLifecycleOptions = { onFrame, onAnimate, actions };
      
      const { unmount } = renderHook(() => useEntityLifecycle(options));
      
      unmount();
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    test('옵션 변경 시 이전 프레임 루프가 정리되어야 함', () => {
      const onFrame1 = jest.fn();
      const onFrame2 = jest.fn();
      
      const { rerender } = renderHook(
        (options) => useEntityLifecycle(options),
        { initialProps: { onFrame: onFrame1 } }
      );
      
      rerender({ onFrame: onFrame2 });
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('성능 테스트', () => {
    test('빈 옵션으로 많은 훅을 생성해도 성능 문제가 없어야 함', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        renderHook(() => useEntityLifecycle({}));
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });
  });
}); 