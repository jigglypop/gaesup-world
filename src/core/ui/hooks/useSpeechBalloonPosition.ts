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
  const velocityRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const isInitializedRef = useRef(false);

  // Delta 기반 부드러운 움직임 - 미세진동 완전 제거
  useFrame((state, delta) => {
    if (!spriteRef.current) return;
    
    const targetPosition = new THREE.Vector3(
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
    
    // 목표 위치 변화 감지 (임계값 기반)
    const positionDelta = targetPosition.distanceTo(targetPositionRef.current);
    if (positionDelta > 0.05) {
      targetPositionRef.current.copy(targetPosition);
    }
    
    // 부드러운 이동 (lerp + damping)
    const dampingFactor = 1.0 - Math.exp(-8.0 * delta); // 부드러운 감쇠
    const currentPos = currentPositionRef.current;
    const targetPos = targetPositionRef.current;
    
    // 벡터 lerp를 사용한 부드러운 이동
    currentPos.lerp(targetPos, dampingFactor);
    
    // 매우 가까우면 목표 위치로 스냅
    if (currentPos.distanceTo(targetPos) < 0.001) {
      currentPos.copy(targetPos);
    }
    
    // 스프라이트 위치 업데이트
    spriteRef.current.position.copy(currentPos);
  });

  return spriteRef;
} 