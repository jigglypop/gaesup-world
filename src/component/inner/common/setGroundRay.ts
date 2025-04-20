import { useRapier } from '@react-three/rapier';
import { useRayHit } from '../../../hooks/useRayHit';
import { setGroundRayType } from './type';
import * as THREE from 'three';

export function useSetGroundRay() {
  const { rapier, world } = useRapier();
  const getRayHit = useRayHit();
  
  const setGroundRay = ({ groundRay, length, colliderRef }: setGroundRayType) => {
    try {
      // 기본 검증 - 필수 파라미터 확인
      if (!groundRay || !colliderRef || !colliderRef.current || !world) {
        console.warn('Missing required parameters for ground ray setup');
        return;
      }
      
      // 길이 설정 - 캐릭터의 크기를 고려하여 충분히 길게 설정
      const enhancedLength = length * 1.5; // 기존 길이보다 50% 더 길게
      groundRay.length = enhancedLength;
      
      // 메인 레이(중앙 수직 방향) 설정
      if (!(groundRay.dir instanceof THREE.Vector3)) {
        groundRay.dir = new THREE.Vector3(0, -1, 0);
      } else if (groundRay.dir.length() !== 1) {
        groundRay.dir.normalize();
      }
      
      // 원점이 벡터인지 확인
      if (!(groundRay.origin instanceof THREE.Vector3)) {
        groundRay.origin = new THREE.Vector3(0, 0, 0);
      }
      
      // 다중 레이를 위한 오프셋 설정 (캐릭터 반경을 고려)
      const estimatedRadius = 0.5; // 캡슐 콜라이더의 반지름 추정
      
      // Ray 객체 직접 생성
      try {
        groundRay.rayCast = new rapier.Ray(
          { x: groundRay.origin.x, y: groundRay.origin.y, z: groundRay.origin.z },
          { x: groundRay.dir.x, y: groundRay.dir.y, z: groundRay.dir.z }
        );
      } catch (err) {
        console.error('Error creating ray:', err);
        return;
      }
      
      // 메인 레이 캐스팅
      groundRay.hit = null; // 이전 히트 정보 초기화
      const mainHit = getRayHit({
        ray: groundRay,
        ref: colliderRef,
      });
      
      // 메인 레이에 히트가 없거나 TOI가 유효하지 않으면 추가 레이 시도
      if (!mainHit || mainHit.toi === undefined || isNaN(mainHit.toi)) {
        // 캐릭터 반경 주변에 여러 개의 추가 레이를 배치
        const offsets = [
          new THREE.Vector3(estimatedRadius * 0.8, 0, 0),          // 오른쪽
          new THREE.Vector3(-estimatedRadius * 0.8, 0, 0),         // 왼쪽
          new THREE.Vector3(0, 0, estimatedRadius * 0.8),          // 앞
          new THREE.Vector3(0, 0, -estimatedRadius * 0.8),         // 뒤
          new THREE.Vector3(estimatedRadius * 0.6, 0, estimatedRadius * 0.6), // 대각선
        ];
        
        // 각 오프셋 위치에서 레이 캐스팅 시도
        for (const offset of offsets) {
          try {
            const offsetOrigin = groundRay.origin.clone().add(offset);
            const offsetRay = new rapier.Ray(
              { x: offsetOrigin.x, y: offsetOrigin.y, z: offsetOrigin.z },
              { x: groundRay.dir.x, y: groundRay.dir.y, z: groundRay.dir.z }
            );
            
            const offsetHit = world.castRay(
              offsetRay,
              enhancedLength * 1.2, // 오프셋 레이는 더 길게
              true,
              undefined,
              undefined,
              colliderRef.current as any,
              undefined
            );
            
            if (offsetHit && (offsetHit.toi !== undefined && !isNaN(offsetHit.toi))) {
              // 유효한 히트 발견
              groundRay.hit = offsetHit;
              break;
            }
          } catch (error) {
            console.warn('Error in additional ray casting:', error);
            // 에러가 나도 계속 다음 레이 시도
            continue;
          }
        }
      } else {
        groundRay.hit = mainHit;
      }
      
      // 유효한 히트가 있고 충돌체 부모가 있으면 설정
      if (groundRay.hit && groundRay.hit.collider) {
        try {
          groundRay.parent = groundRay.hit.collider.parent();
        } catch (e) {
          console.warn('Error getting collider parent:', e);
        }
        
        // 디버깅 메시지 출력 (필요시)
        if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
          console.log('Ground ray hit success:', {
            toi: groundRay.hit.toi,
            position: groundRay.origin,
            collider: groundRay.hit.collider
          });
        }
      } else {
        // 히트가 없으면 null 설정 (이전 히트 데이터 제거)
        groundRay.hit = null;
        groundRay.parent = null;
      }
    } catch (error) {
      console.error('Error in setGroundRay:', error);
      groundRay.hit = null;
      groundRay.parent = null;
    }
  };
  
  return setGroundRay;
}
