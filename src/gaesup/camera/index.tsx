import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { cameraPropType } from '../physics/type';
import normal, { makeNormalCameraPosition } from './control/normal';
import orbit from './control/orbit';
import { GaesupWorldDispatchContext } from '../world/context';

export default function Camera(prop: cameraPropType) {
  const { worldContext } = prop;
  const dispatch = useContext(GaesupWorldDispatchContext);
  // 레이캐스트 최적화를 위한 참조 및 메모이제이션
  const frameCountRef = useRef(0);
  const raycastIntervalRef = useRef(2); // 2 프레임마다 레이캐스트 수행
  const lastRaycastResultRef = useRef<THREE.Intersection<THREE.Object3D>[]>([]);
  // 레이캐스트를 위한 임시 객체들 (재사용)
  const tempRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []); // 레이캐스트 타겟 객체 캐싱
  const raycastTargets = useRef<THREE.Object3D[]>([]);
  // 레이캐스트 수행 함수 (최적화 버전)
  const performRaycast = (state) => {
    if (!worldContext.cameraOption || !worldContext.activeState) return;
    // 프레임 카운트 증가 및 레이캐스트 빈도 제한
    frameCountRef.current++;
    if (frameCountRef.current % raycastIntervalRef.current !== 0) {
      return lastRaycastResultRef.current;
    }
    // 타겟 객체가 없으면 레이캐스트 수행하지 않음
    if (raycastTargets.current.length === 0 && state.scene) {
      // 충돌 감지가 필요한 객체만 필터링 (intangible이 false인 객체)
      raycastTargets.current = state.scene.children.filter((obj) => !obj.userData?.intangible);
    }
    // 카메라에서 캐릭터 방향으로 레이캐스트 수행
    tempVector.copy(worldContext.activeState.position);
    const cameraPosition = worldContext.cameraOption.position.clone();
    tempRaycaster.set(cameraPosition, tempVector.sub(cameraPosition).normalize());
    tempRaycaster.far = worldContext.cameraOption.maxDistance || 10;
    // 최적화: 충돌 감지가 필요한 객체들만 대상으로 레이캐스트 수행
    const intersects = tempRaycaster.intersectObjects(raycastTargets.current, true);
    // 결과 캐싱
    lastRaycastResultRef.current = intersects;
    // 레이캐스트 결과에 따른 카메라 포지션 조정
    if (intersects.length > 0 && worldContext.cameraOption) {
      handleCameraCollision(intersects, cameraPosition);
    }
    return intersects;
  };

  // 카메라 충돌 처리 함수
  const handleCameraCollision = (intersects, cameraPosition) => {
    const collision = intersects[0];
    // 충돌 지점까지의 거리 계산
    const distanceToCollision = collision.distance;
    const maxDistance = Math.abs(worldContext.cameraOption.maxDistance || 10);
    // 충돌 지점이 최대 거리보다 가까우면 카메라 위치 조정
    if (distanceToCollision < maxDistance) {
      const direction = tempVector
        .copy(worldContext.activeState.position)
        .sub(cameraPosition)
        .normalize();
      // 충돌 지점 앞으로 카메라 위치 조정 (약간의 여유 공간 추가)
      const newPosition = worldContext.activeState.position
        .clone()
        .sub(direction.multiplyScalar(distanceToCollision * 0.9));
      worldContext.cameraOption.position.copy(newPosition);
      dispatch({
        type: 'update',
        payload: {
          cameraOption: { ...worldContext.cameraOption },
        },
      });
    }
  };

  useFrame((state) => {
    prop.state = state;
    // 카메라 제어 유형에 따른 처리
    if (!worldContext.block.camera) {
      if (worldContext.mode.control === 'orbit') {
        orbit(prop);
      } else if (worldContext.mode.control === 'normal') {
        normal(prop);
      }
      // 레이캐스트 수행 (충돌 감지)
      if (worldContext.cameraOption && worldContext.cameraOption.maxDistance) {
        performRaycast(state);
      }
    }
    // 포커스가 아닐 때 카메라가 activeState 따라가기
    if (!worldContext.cameraOption.focus) {
      worldContext.cameraOption.target = worldContext.activeState.position;
      worldContext.cameraOption.position = makeNormalCameraPosition(
        worldContext.activeState,
        worldContext.cameraOption,
      );
    }
  });

  return null;
}
