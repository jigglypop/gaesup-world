import { useCallback } from 'react';
import { CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';

export interface CollisionHandlerOptions {
  onIntersectionEnter?: (payload: CollisionEnterPayload) => void;
  onIntersectionExit?: (payload: CollisionExitPayload) => void;
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
    async (payload: CollisionEnterPayload) => {
      if (onIntersectionEnter) onIntersectionEnter(payload);
      if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
        await userData['onNear'](payload, userData);
      }
    },
    [onIntersectionEnter, userData],
  );

  const handleIntersectionExit = useCallback(
    async (payload: CollisionExitPayload) => {
      if (onIntersectionExit) onIntersectionExit(payload);
      if (userData?.['onLeave'] && typeof userData['onLeave'] === 'function') {
        await userData['onLeave'](payload);
      }
    },
    [onIntersectionExit, userData],
  );

  const handleCollisionEnter = useCallback(
    async (payload: CollisionEnterPayload) => {
      if (onCollisionEnter) onCollisionEnter(payload);
      if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
        await userData['onNear'](payload, userData);
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