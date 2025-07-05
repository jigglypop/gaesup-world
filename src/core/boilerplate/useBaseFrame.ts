import { useFrame } from '@react-three/fiber';
import { AbstractBridge } from './AbstractBridge';
import { useRef, useCallback } from 'react';
import { IDisposable, UseBaseFrameOptions } from './types';

/**
 * 매 프레임마다 Bridge에 스냅샷 업데이트를 요청하는 제네릭 훅.
 * @param bridge - 사용할 Bridge 인스턴스.
 * @param id - 엔티티 ID.
 * @param callback - 프레임마다 실행할 추가 콜백 (선택적).
 * @param options - 프레임 실행 옵션.
 */
export function useBaseFrame<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  callback?: () => void,
  options: UseBaseFrameOptions = {}
) {
  const lastUpdateTime = useRef(0);
  const { 
    priority = 0, 
    enabled = true, 
    throttle = 0,
    skipWhenHidden = true 
  } = options;

  const frameHandler = useCallback((state: any, delta: number) => {
    if (!enabled || !bridge) return;

    // 문서가 숨겨진 경우 스킵
    if (skipWhenHidden && document.hidden) return;

    // 쓰로틀링
    if (throttle > 0) {
      const now = performance.now();
      if (now - lastUpdateTime.current < throttle) return;
      lastUpdateTime.current = now;
    }

    // 브릿지 알림
    bridge.notifyListeners(id);

    // 추가 콜백 실행
    if (callback) {
      callback();
    }
  }, [bridge, id, callback, enabled, throttle, skipWhenHidden]);

  useFrame(frameHandler, priority);
}

/**
 * 조건부로 프레임 업데이트를 수행하는 훅.
 */
export function useConditionalFrame<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  condition: () => boolean,
  callback?: () => void,
  options?: UseBaseFrameOptions
) {
  const wrappedCallback = useCallback(() => {
    if (condition()) {
      if (callback) callback();
    }
  }, [condition, callback]);

  useBaseFrame(bridge, id, wrappedCallback, options);
}

/**
 * 특정 FPS로 제한된 프레임 업데이트를 수행하는 훅.
 */
export function useThrottledFrame<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  fps: number,
  callback?: () => void,
  options?: Omit<UseBaseFrameOptions, 'throttle'>
) {
  const throttle = 1000 / fps;
  useBaseFrame(bridge, id, callback, { ...options, throttle });
} 