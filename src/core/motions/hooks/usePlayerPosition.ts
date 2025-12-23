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

const defaultResult: UsePlayerPositionResult = {
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  isMoving: false,
  isGrounded: false,
  speed: 0,
  height: 2.0, // Default character height
};

export function usePlayerPosition(options: UsePlayerPositionOptions = {}): UsePlayerPositionResult {
  const { updateInterval = 0, entityId } = options;
  const [state, setState] = useState<UsePlayerPositionResult>(defaultResult);
  const lastUpdateRef = useRef<number>(0);
  const bridgeRef = useRef<MotionBridge | null>(null);
  const { activeState, gameStates } = useStateSystem();

  // Initialize Motion Bridge
  useEffect(() => {
    bridgeRef.current = BridgeFactory.get('motion') as MotionBridge;
  }, []);

  // Update state from multiple sources
  useFrame(() => {
    // Check update interval
    if (updateInterval > 0) {
      const now = performance.now();
      if (now - lastUpdateRef.current < updateInterval) return;
      lastUpdateRef.current = now;
    }

    let position: THREE.Vector3 | null = null;
    let velocity: THREE.Vector3 | null = null;
    let rotation: THREE.Euler | null = null;

    // Try Motion Bridge first (most reliable)
    if (bridgeRef.current) {
      let targetEntityId = entityId;
      
      // If no specific entityId, use the first active entity (likely the player)
      if (!targetEntityId) {
        const activeEntities = bridgeRef.current.getActiveEntities();
        targetEntityId = activeEntities[0]; // First entity is usually the player
      }
      
      if (targetEntityId) {
        const snapshot = bridgeRef.current.snapshot(targetEntityId);
        if (snapshot && snapshot.position) {
          position = snapshot.position.clone();
          velocity = snapshot.velocity.clone();
          rotation = snapshot.rotation.clone();
          
          setState({
            position,
            velocity,
            rotation,
            isMoving: snapshot.isMoving,
            isGrounded: snapshot.isGrounded,
            speed: snapshot.speed,
            height: 2.0, // Default height, could be enhanced with actual model data
          });
          return;
        }
      }
    }

    // Final fallback to activeState
    if (activeState?.position) {
      setState({
        position: activeState.position.clone(),
        velocity: activeState.velocity?.clone() || new THREE.Vector3(),
        rotation: activeState.euler?.clone() || new THREE.Euler(),
        isMoving: gameStates?.isMoving || false,
        isGrounded: gameStates?.isOnTheGround || false,
        speed: activeState.velocity?.length() || 0,
        height: 2.0, // Default height for fallback case
      });
    }
  });

  return state;
}

// Hook for components that need player position in world space
export function usePlayerWorldPosition(options: UsePlayerPositionOptions = {}): THREE.Vector3 {
  const { position } = usePlayerPosition(options);
  return position;
} 