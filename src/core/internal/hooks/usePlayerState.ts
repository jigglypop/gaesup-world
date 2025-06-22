import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { playerState } from '../stores/playerState';
import { useGaesupStore } from '../../stores/gaesupStore';

export function usePlayerState() {
  const rigidBodyRef = useRef<any>(null);
  const lastUpdateTime = useRef(0);
  const mode = useGaesupStore((state) => state.mode);
  const isPaused = useGaesupStore((state) => state.states.isPaused);
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || isPaused) return;
    playerState.updateFromRigidBody(rigidBodyRef.current);
    const velocityMagnitude = playerState.velocity.length();
    playerState.isMoving = velocityMagnitude > 0.1;
    playerState.isOnGround = Math.abs(playerState.velocity.y) < 0.01;
    const now = Date.now();
    if (now - lastUpdateTime.current > 50) { 
      lastUpdateTime.current = now;
      window.dispatchEvent(new CustomEvent('gaesup:playerUpdate', {
        detail: {
          position: playerState.position.clone(),
          rotation: playerState.euler.y,
          isMoving: playerState.isMoving,
        }
      }));
    }
  });
  useEffect(() => {
    playerState.reset();
  }, [mode]);
  
  return {
    playerState,
    rigidBodyRef,
    setRigidBody: (ref: any) => {
      rigidBodyRef.current = ref;
      if (ref) {
        playerState.isActive = true;
      }
    },
  };
}

/**
 * Public hook for components that need to read player state
 * This triggers re-renders only when necessary
 */
export function usePlayerPosition() {
  const [position, setPosition] = useState(() => playerState.position.clone());
  const [rotation, setRotation] = useState(() => playerState.euler.y);
  
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setPosition(event.detail.position);
      setRotation(event.detail.rotation);
    };
    
    window.addEventListener('gaesup:playerUpdate', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('gaesup:playerUpdate', handleUpdate as EventListener);
    };
  }, []);
  
  return { position, rotation };
}
