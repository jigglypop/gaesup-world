import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite } from 'three';
import * as THREE from 'three';

export interface UseSpeechBalloonPositionProps {
  playerPosition: THREE.Vector3;
  offset: { x: number; y: number; z: number };
}

export function useSpeechBalloonPosition({ 
  playerPosition, 
  offset 
}: UseSpeechBalloonPositionProps) {
  const spriteRef = useRef<Sprite>(null);

  // Update sprite position based on player position
  useFrame(() => {
    if (spriteRef.current) {
      spriteRef.current.position.set(
        playerPosition.x + offset.x,
        playerPosition.y + offset.y,
        playerPosition.z + offset.z
      );
    }
  });

  return spriteRef;
} 