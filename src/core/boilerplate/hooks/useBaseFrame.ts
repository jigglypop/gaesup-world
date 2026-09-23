import { useRef, useCallback } from 'react';

import { useEngineFrame } from '../../runtime/frame';
import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable, MILLISECONDS_IN_SECOND, UseBaseFrameOptions } from '../types';

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
  // Allow the first frame to run immediately when throttle > 0.
  const lastUpdateTime = useRef(Number.NEGATIVE_INFINITY);
  const {
    priority = 0,
    enabled = true,
    throttle = 0,
    skipWhenHidden = true
  } = options;
  const frameHandler = useCallback((_delta: number, elapsedMs: number) => {
    if (!enabled || !bridge) return;
    if (skipWhenHidden && document.hidden) return;
    if (throttle > 0) {
      if (elapsedMs - lastUpdateTime.current < throttle) return;
      lastUpdateTime.current = elapsedMs;
    }
    bridge.notifyListeners(id);
    if (callback) {
      callback();
    }
  }, [bridge, id, callback, enabled, throttle, skipWhenHidden]);
  useEngineFrame('snapshot', frameHandler, {
    order: priority,
    label: `bridge:${id}`,
    active: enabled && bridge !== null,
  });
}

/** @deprecated Use useEngineFrame options instead. */
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

/** @deprecated Use useEngineFrame options instead. */
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
  const throttle = MILLISECONDS_IN_SECOND / fps;
  useBaseFrame(bridge, id, callback, { ...options, throttle });
}
