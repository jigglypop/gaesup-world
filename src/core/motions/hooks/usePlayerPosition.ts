import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGaesupStore } from '@stores/gaesupStore';
import { useStateSystem } from './useStateSystem';
import * as THREE from 'three';

export interface UsePlayerPositionOptions {
  updateInterval?: number; // milliseconds, 0 means every frame
}

export interface UsePlayerPositionResult {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isMoving: boolean;
  isGrounded: boolean;
  speed: number;
}

const defaultResult: UsePlayerPositionResult = {
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  isMoving: false,
  isGrounded: false,
  speed: 0,
};

export function usePlayerPosition(options: UsePlayerPositionOptions = {}): UsePlayerPositionResult {
  const { updateInterval = 0 } = options;
  const [state, setState] = useState<UsePlayerPositionResult>(defaultResult);
  const lastUpdateRef = useRef<number>(0);
  const refs = useGaesupStore((state) => state.refs);
  const { activeState, gameStates } = useStateSystem();

  // Update state from refs and activeState
  useFrame(() => {
    // Check update interval
    if (updateInterval > 0) {
      const now = performance.now();
      if (now - lastUpdateRef.current < updateInterval) return;
      lastUpdateRef.current = now;
    }

    if (refs?.rigidBodyRef?.current) {
      const rigidBody = refs.rigidBodyRef.current;
      const translation = rigidBody.translation();
      const linvel = rigidBody.linvel();
      const rotation = rigidBody.rotation();

      // Convert Rapier types to Three.js types
      const position = new THREE.Vector3(translation.x, translation.y, translation.z);
      const velocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);
      const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      const euler = new THREE.Euler().setFromQuaternion(quaternion);

      setState({
        position,
        velocity,
        rotation: euler,
        isMoving: gameStates?.isMoving || false,
        isGrounded: gameStates?.isOnTheGround || false,
        speed: velocity.length(),
      });
    } else if (activeState?.position) {
      // Fallback to activeState if refs not available
      setState({
        position: activeState.position.clone(),
        velocity: activeState.velocity?.clone() || new THREE.Vector3(),
        rotation: activeState.euler?.clone() || new THREE.Euler(),
        isMoving: gameStates?.isMoving || false,
        isGrounded: gameStates?.isOnTheGround || false,
        speed: activeState.velocity?.length() || 0,
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