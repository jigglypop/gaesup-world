import { useCallback, useEffect, useRef, RefObject } from 'react';
import { CollisionEnterPayload, CollisionExitPayload, RapierRigidBody } from '@react-three/rapier';
import { useMotion } from './useMotion';
import { UsePhysicsEntityProps } from './types';
import { useGaesupStore } from '@stores/gaesupStore';
import { useStateSystem } from './useStateSystem';
import { useAnimationSetup } from './setup/useAnimationSetup';
import { useMotionSetup } from './setup/useMotionSetup';
import { useAnimationPlayer } from '@hooks/useAnimationPlayer';
import { usePhysicsBridge } from './usePhysicsBridge';
import { PhysicsCalculationProps } from '../types';

/**
 * 기존 usePhysicsEntity 인터페이스를 유지하는 wrapper
 * 새로운 코드에서는 useMotion을 직접 사용하세요
 */
export function usePhysicsEntity({
  rigidBodyRef,
  actions,
  name,
  isActive,
  onIntersectionEnter,
  onIntersectionExit,
  onCollisionEnter,
  userData,
  outerGroupRef,
  innerGroupRef,
  colliderRef,
  groundRay,
  onFrame,
  onAnimate,
  onReady
}: UsePhysicsEntityProps) {
  const entityId = useRef<string>(
    name || `entity-${Date.now()}-${Math.random()}`
  ).current;
  
  const activeMode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  const isRiding = gameStates.isRiding;
  const modeType = activeMode?.type;
  
  // 애니메이션 설정
  useAnimationSetup(actions, modeType, isActive);
  
  // 모션 설정
  const { 
    executeMotionCommand, 
    getMotionSnapshot 
  } = useMotionSetup(entityId, rigidBodyRef, modeType, isActive);
  
  // 물리 브릿지 (isActive일 때만 실행)
  if (isActive) {
    const physicsProps: PhysicsCalculationProps = {
      outerGroupRef,
      innerGroupRef,
      rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
      colliderRef,
      groundRay
    };
    usePhysicsBridge(physicsProps);
  }
  
  // 애니메이션 플레이어
  useAnimationPlayer(isActive && modeType === 'character');

  // 충돌 핸들러
  const handleIntersectionEnter = useCallback(async (payload: CollisionEnterPayload) => {
    if (onIntersectionEnter) onIntersectionEnter(payload);
    if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
      await userData['onNear'](payload, userData);
    }
  }, [onIntersectionEnter, userData]);

  const handleIntersectionExit = useCallback(async (payload: CollisionExitPayload) => {
    if (onIntersectionExit) onIntersectionExit(payload);
    if (userData?.['onLeave'] && typeof userData['onLeave'] === 'function') {
      await userData['onLeave'](payload);
    }
  }, [onIntersectionExit, userData]);

  const handleCollisionEnter = useCallback(async (payload: CollisionEnterPayload) => {
    if (onCollisionEnter) onCollisionEnter(payload);
    if (userData?.['onNear'] && typeof userData['onNear'] === 'function') {
      await userData['onNear'](payload, userData);
    }
  }, [onCollisionEnter, userData]);

  // onReady 콜백
  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);
  
  // 프레임 핸들러
  useEffect(() => {
    let animationId: number;
    const frameHandler = () => {
      if (onFrame) onFrame();
      if (onAnimate && actions) onAnimate();
      animationId = requestAnimationFrame(frameHandler);
    };
    if (onFrame || (onAnimate && actions)) {
      animationId = requestAnimationFrame(frameHandler);
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, [onFrame, onAnimate, actions]);

  return {
    executeMotionCommand,
    getMotionSnapshot,
    mode: activeMode,
    isRiding,
    handleIntersectionEnter,
    handleIntersectionExit,
    handleCollisionEnter
  };
} 