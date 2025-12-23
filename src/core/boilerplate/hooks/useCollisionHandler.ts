import { useCallback } from 'react';

import type { CollisionEnterPayload, CollisionPayload } from '@react-three/rapier';

export interface CollisionHandlerOptions {
  onIntersectionEnter?: (payload: CollisionPayload) => void;
  onIntersectionExit?: (payload: CollisionPayload) => void;
  onCollisionEnter?: (payload: CollisionEnterPayload) => void;
  userData?: Record<string, unknown>;
}

export function useCollisionHandler(options: CollisionHandlerOptions) {
  const {
    onIntersectionEnter,
    onIntersectionExit,
    onCollisionEnter,
    userData,
  } = options;

  const handleIntersectionEnter = useCallback(
    (payload: CollisionPayload) => {
      if (onIntersectionEnter) onIntersectionEnter(payload);
      if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
        void userData['onNear'](payload, userData);
      }
    },
    [onIntersectionEnter, userData],
  );

  const handleIntersectionExit = useCallback(
    (payload: CollisionPayload) => {
      if (onIntersectionExit) onIntersectionExit(payload);
      if (userData?.['onLeave'] && typeof userData['onLeave'] === 'function') {
        void userData['onLeave'](payload);
      }
    },
    [onIntersectionExit, userData],
  );

  const handleCollisionEnter = useCallback(
    (payload: CollisionEnterPayload) => {
      if (onCollisionEnter) onCollisionEnter(payload);
      if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
        void userData['onNear'](payload, userData);
      }
    },
    [onCollisionEnter, userData],
  );

  return {
    handleIntersectionEnter,
    handleIntersectionExit,
    handleCollisionEnter,
  };
} 