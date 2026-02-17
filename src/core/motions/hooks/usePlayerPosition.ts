import { useRef, useState, useEffect } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import { useStateSystem } from './useStateSystem';
import { MotionBridge } from '../bridge/MotionBridge';

export interface UsePlayerPositionOptions {
  updateInterval?: number; // milliseconds, 0 means every frame
  entityId?: string; // Entity ID to track
}

export interface UsePlayerPositionResult {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isMoving: boolean;
  isGrounded: boolean;
  speed: number;
  height: number; // Character height from bounding box
}

const createDefaultResult = (): UsePlayerPositionResult => ({
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  isMoving: false,
  isGrounded: false,
  speed: 0,
  height: 2.0, // Default character height
});

export function usePlayerPosition(
  options: UsePlayerPositionOptions = {},
): UsePlayerPositionResult {
  const { updateInterval = 0, entityId } = options;

  // Keep stable references for consumers; update vectors in-place.
  const resultRef = useRef<UsePlayerPositionResult | null>(null);
  if (!resultRef.current) {
    resultRef.current = createDefaultResult();
  }

  const [, forceUpdate] = useState(0);
  const lastUpdateRef = useRef<number>(0);
  const lastBridgeEventRef = useRef<number>(0);
  const lastPositionSnapshot = useRef({ x: 0, y: 0, z: 0 });
  const inferredEntityIdRef = useRef<string | undefined>(undefined);
  const bridgeRef = useRef<MotionBridge | null>(null);
  const { activeState, gameStates } = useStateSystem();

  const getTargetEntityId = (bridge: MotionBridge): string | undefined => {
    if (entityId) return entityId;
    if (inferredEntityIdRef.current) return inferredEntityIdRef.current;
    const activeEntities = bridge.getActiveEntities();
    inferredEntityIdRef.current = activeEntities[0];
    return inferredEntityIdRef.current;
  };

  useEffect(() => {
    inferredEntityIdRef.current = undefined;
    bridgeRef.current = BridgeFactory.getOrCreate('motion') as MotionBridge | null;
    const bridge = bridgeRef.current;
    if (!bridge) return undefined;

    const unsubscribe = bridge.subscribe((snapshot, snapshotEntityId) => {
      const targetEntityId = getTargetEntityId(bridge);
      if (!targetEntityId || snapshotEntityId !== targetEntityId) return;

      const now = performance.now();
      lastBridgeEventRef.current = now;

      if (updateInterval > 0 && now - lastUpdateRef.current < updateInterval) return;
      lastUpdateRef.current = now;

      const result = resultRef.current!;
      result.position.copy(snapshot.position);
      result.velocity.copy(snapshot.velocity);
      result.rotation.copy(snapshot.rotation);
      result.isMoving = snapshot.isMoving;
      result.isGrounded = snapshot.isGrounded;
      result.speed = snapshot.speed;
      result.height = 2.0;

      forceUpdate((v) => v + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [entityId, updateInterval]);

  // Fallback polling path (keeps position updating even when no bridge events are emitted).
  useFrame(() => {
    const now = performance.now();
    if (updateInterval > 0 && now - lastUpdateRef.current < updateInterval) return;

    const result = resultRef.current!;
    const bridge = bridgeRef.current;

    // Only trigger React re-render when position actually changed (threshold: 0.001).
    const posChanged = (p: THREE.Vector3) => {
      const s = lastPositionSnapshot.current;
      const dx = p.x - s.x, dy = p.y - s.y, dz = p.z - s.z;
      if (dx * dx + dy * dy + dz * dz > 0.000001) {
        s.x = p.x; s.y = p.y; s.z = p.z;
        return true;
      }
      return false;
    };

    if (bridge) {
      const targetEntityId = getTargetEntityId(bridge);

      const recentBridgeEvent = now - lastBridgeEventRef.current < 16;
      if (!recentBridgeEvent && targetEntityId) {
        const snapshot = bridge.snapshot(targetEntityId);
        if (snapshot) {
          result.position.copy(snapshot.position);
          result.velocity.copy(snapshot.velocity);
          result.rotation.copy(snapshot.rotation);
          result.isMoving = snapshot.isMoving;
          result.isGrounded = snapshot.isGrounded;
          result.speed = snapshot.speed;
          result.height = 2.0;

          lastUpdateRef.current = now;
          if (posChanged(result.position)) forceUpdate((v) => v + 1);
          return;
        }
      }
    }

    if (activeState?.position) {
      result.position.copy(activeState.position);
      if (activeState.velocity) {
        result.velocity.copy(activeState.velocity);
      } else {
        result.velocity.set(0, 0, 0);
      }
      if (activeState.euler) {
        result.rotation.copy(activeState.euler);
      } else {
        result.rotation.set(0, 0, 0);
      }
      result.isMoving = gameStates?.isMoving || false;
      result.isGrounded = gameStates?.isOnTheGround || false;
      result.speed = activeState.velocity ? activeState.velocity.length() : 0;
      result.height = 2.0;

      lastUpdateRef.current = now;
      if (posChanged(result.position)) forceUpdate((v) => v + 1);
    }
  });

  return resultRef.current;
}

// Hook for components that need player position in world space
export function usePlayerWorldPosition(options: UsePlayerPositionOptions = {}): THREE.Vector3 {
  const { position } = usePlayerPosition(options);
  return position;
}