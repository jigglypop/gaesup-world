import { useRef } from 'react';

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
  const currentPositionRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const nextTargetRef = useRef(new THREE.Vector3());
  const isInitializedRef = useRef(false);

  // Delta 기반 부드러운 움직임 - 미세진동 완전 제거
  useFrame((_, delta) => {
    if (!spriteRef.current) return;
    
    const targetPosition = nextTargetRef.current;
    targetPosition.set(
      playerPosition.x + offset.x,
      playerPosition.y + offset.y,
      playerPosition.z + offset.z
    );
    
    // 첫 실행시 즉시 위치 설정
    if (!isInitializedRef.current) {
      spriteRef.current.position.copy(targetPosition);
      currentPositionRef.current.copy(targetPosition);
      targetPositionRef.current.copy(targetPosition);
      isInitializedRef.current = true;
      return;
    }
    
    // 목표 위치 변화 감지 (임계값 기반, sqrt 회피)
    const positionDeltaSq = targetPosition.distanceToSquared(targetPositionRef.current);
    if (positionDeltaSq > 0.0025) { // 0.05^2
      targetPositionRef.current.copy(targetPosition);
    }
    
    // 부드러운 이동 (lerp + damping)
    const dampingFactor = 1.0 - Math.exp(-8.0 * delta);
    const currentPos = currentPositionRef.current;
    const targetPos = targetPositionRef.current;
    
    currentPos.lerp(targetPos, dampingFactor);
    
    // 매우 가까우면 목표 위치로 스냅 (sqrt 회피)
    if (currentPos.distanceToSquared(targetPos) < 0.000001) { // 0.001^2
      currentPos.copy(targetPos);
    }
    
    // 스프라이트 위치 업데이트
    spriteRef.current.position.copy(currentPos);
  });

  return spriteRef;
} 