import { useCallback } from 'react';

import type { CollisionEnterPayload, CollisionPayload } from '@react-three/rapier';

import type { RuntimeValue } from '../types';

export type CollisionHandlerArg = CollisionPayload | CollisionEnterPayload | CollisionUserData | undefined;
export type CollisionHandlerFn = (...args: CollisionHandlerArg[]) => void;
export type CollisionHandlerValue = CollisionHandlerFn | RuntimeValue;
export type CollisionUserData = Record<string, CollisionHandlerValue>;

export interface CollisionHandlerOptions {
  onIntersectionEnter?: (payload: CollisionPayload) => void;
  onIntersectionExit?: (payload: CollisionPayload) => void;
  onCollisionEnter?: (payload: CollisionEnterPayload) => void;
  userData?: CollisionUserData;
}

export function useCollisionHandler(options: CollisionHandlerOptions) {
  const {
    onIntersectionEnter,
    onIntersectionExit,
    onCollisionEnter,
    userData,
  } = options;

  const safeCall = (fn: CollisionHandlerValue, ...args: CollisionHandlerArg[]) => {
    if (typeof fn !== 'function') return;
    try {
      fn(...args);
    } catch {
      // Handlers must not break the physics/event loop.
    }
  };

  const handleIntersectionEnter = useCallback(
    (payload: CollisionPayload) => {
      safeCall(onIntersectionEnter, payload);
      safeCall(userData?.['onNear'], payload, userData);
    },
    [onIntersectionEnter, userData],
  );

  const handleIntersectionExit = useCallback(
    (payload: CollisionPayload) => {
      safeCall(onIntersectionExit, payload);
      // Support both names; onFar is the preferred semantic pair for onNear.
      safeCall(userData?.['onFar'], payload, userData);
      safeCall(userData?.['onLeave'], payload, userData);
    },
    [onIntersectionExit, userData],
  );

  const handleCollisionEnter = useCallback(
    (payload: CollisionEnterPayload) => {
      safeCall(onCollisionEnter, payload);
      safeCall(userData?.['onNear'], payload, userData);
    },
    [onCollisionEnter, userData],
  );

  return {
    handleIntersectionEnter,
    handleIntersectionExit,
    handleCollisionEnter,
  };
} 
