import { useFrame } from '@react-three/fiber';
import { AbstractBridge } from '../bridge/AbstractBridge';
import { useRef, useCallback } from 'react';
import { IDisposable, UseBaseFrameOptions } from '../types';

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
    if (skipWhenHidden && document.hidden) return;
    if (throttle > 0) {
      const now = performance.now();
      if (now - lastUpdateTime.current < throttle) return;
      lastUpdateTime.current = now;
    }
    bridge.notifyListeners(id);
    if (callback) {
      callback();
    }
  }, [bridge, id, callback, enabled, throttle, skipWhenHidden]);
  useFrame(frameHandler, priority);
}

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