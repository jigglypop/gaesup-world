import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { RefObject, useCallback } from "react";
import { groundRayType } from "../../controller/type";

export function useRayHit() {
  const { rapier, world } = useRapier();

  const getRayHit = useCallback(
    ({ ray, ref }: { ray: groundRayType; ref: RefObject<Collider> }) => {
      try {
        // 디버깅을 위한 로그
        if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
          console.log('Ray casting - Origin:', ray.origin, 'Direction:', ray.dir, 'Length:', ray.length);
        }
        
        // 유효성 검사
        if (!ray.rayCast || !ref.current || !world) {
          console.warn('Invalid ray cast parameters:', { ray, refExists: !!ref.current, worldExists: !!world });
          return null;
        }
        
        // 최대 거리 설정
        const maxToi = ray.length * 2;
        
        // Rapier의 world.castRay를 직접 사용
        let hit = null;
        try {
          hit = world.castRay(
            ray.rayCast,
            maxToi,
            true, // solid
            undefined,
            undefined,
            ref.current as any,
            undefined
          );
        } catch (err) {
          console.error('Error in world.castRay:', err);
          return null;
        }
        
        // hit 결과 검증 및 보정
        if (hit) {
          // TOI 값 검증
          if (hit.toi === undefined || isNaN(hit.toi)) {
            if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
              console.warn('Hit detected but TOI is invalid:', hit);
            }
            
            // TOI 값이 없으면 기본값 설정 (지면에 가까운 것으로 간주)
            hit.toi = ray.length * 0.3;
          }
          
          // 유효한 충돌체와 관련 프로퍼티 확인
          if (!hit.collider) {
            console.warn('Hit without valid collider detected');
            return null;
          }
          
          if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
            console.log('Hit detected! TOI:', hit.toi, 'Collider:', hit.collider);
          }
        } else if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
          console.log('No hit detected');
        }
        
        return hit;
      } catch (error) {
        console.error('Error in ray casting:', error);
        return null;
      }
    },
    [rapier, world]
  );

  return getRayHit;
}
