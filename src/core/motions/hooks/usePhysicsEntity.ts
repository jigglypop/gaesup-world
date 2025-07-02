import { RefObject, useEffect, useMemo, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import { MotionBridge } from '../bridge/MotionBridge';
import { useGaesupStore } from '../../stores';
import { PhysicsEntityProps } from '../entities/types';
import usePhysicsLoop from '..';
import { useAnimationPlayer } from '../../hooks';

interface UsePhysicsEntityProps
  extends Pick<
    PhysicsEntityProps,
    | 'onIntersectionEnter'
    | 'onIntersectionExit'
    | 'onCollisionEnter'
    | 'userData'
    | 'outerGroupRef'
    | 'innerGroupRef'
    | 'colliderRef'
    | 'groundRay'
    | 'onFrame'
    | 'onAnimate'
    | 'onReady'
  > {
  rigidBodyRef?: RefObject<RapierRigidBody | null>;
  actions: Record<string, THREE.AnimationAction | null>;
  name?: string;
  isActive?: boolean;
}

let globalMotionBridge: MotionBridge | null = null;

function getGlobalMotionBridge(): MotionBridge {
  if (!globalMotionBridge) {
    globalMotionBridge = new MotionBridge();
  }
  return globalMotionBridge;
}

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
  const animationBridgeRef = useRef<boolean>(false);
  const entityIdRef = useRef<string>(
    name || `entity-${Date.now()}-${Math.random()}`
  );
  const registeredRef = useRef<boolean>(false);

  const mode = useGaesupStore((state) => state.mode);
  const isRiding = useGaesupStore((state) => state.states.isRiding);
  const modeType = mode?.type;

  useEffect(() => {
    if (actions && modeType && isActive && !animationBridgeRef.current) {
      const animationBridge = getGlobalAnimationBridge();
      animationBridge.registerAnimations(modeType as any, actions);
      animationBridgeRef.current = true;
      
      return () => {
        if (animationBridgeRef.current) {
          animationBridge.unregisterAnimations(modeType as any);
          animationBridgeRef.current = false;
        }
      };
    }
  }, [actions, modeType, isActive]);

  useEffect(() => {
    if (isActive && rigidBodyRef && !registeredRef.current) {
      const motionBridge = getGlobalMotionBridge();
      motionBridge.registerEntity(
        entityIdRef.current,
        modeType === 'vehicle' || modeType === 'airplane'
          ? 'vehicle'
          : 'character',
        rigidBodyRef.current
      );
      registeredRef.current = true;

      return () => {
        if (registeredRef.current) {
          motionBridge.unregisterEntity(entityIdRef.current);
          registeredRef.current = false;
        }
      };
    }
  }, [isActive, rigidBodyRef, modeType]);

  const handleIntersectionEnter = useMemo(
    () => async (payload: any) => {
      if (onIntersectionEnter) {
        await onIntersectionEnter(payload);
      }
      if (userData?.onNear) {
        await userData.onNear(payload, userData);
      }
    },
    [onIntersectionEnter, userData]
  );

  const handleIntersectionExit = useMemo(
    () => async (payload: any) => {
      if (onIntersectionExit) {
        await onIntersectionExit(payload);
      }
      if (userData?.onLeave) {
        await userData.onLeave(payload);
      }
    },
    [onIntersectionExit, userData]
  );

  const handleCollisionEnter = useMemo(
    () => async (payload: any) => {
      if (onCollisionEnter) {
        await onCollisionEnter(payload);
      }
      if (userData?.onNear) {
        await userData.onNear(payload, userData);
      }
    },
    [onCollisionEnter, userData]
  );

  if (isActive) {
    usePhysicsLoop({
      outerGroupRef,
      innerGroupRef,
      rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
      colliderRef,
      groundRay
    });
  }

  useAnimationPlayer(isActive && modeType === 'character');

  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);

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
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [onFrame, onAnimate, actions]);

  const executeMotionCommand = useMemo(
    () => (command: any) => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        motionBridge.execute(entityIdRef.current, command);
      }
    },
    [isActive]
  );

  const updateMotion = useMemo(
    () => (deltaTime: number) => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        motionBridge.updateEntity(entityIdRef.current, deltaTime);
      }
    },
    [isActive]
  );

  const getMotionSnapshot = useMemo(
    () => () => {
      if (registeredRef.current && isActive) {
        const motionBridge = getGlobalMotionBridge();
        return motionBridge.snapshot(entityIdRef.current);
      }
      return null;
    },
    [isActive]
  );

  return {
    executeMotionCommand,
    updateMotion,
    getMotionSnapshot,
    mode,
    isRiding,
    handleIntersectionEnter,
    handleIntersectionExit,
    handleCollisionEnter
  };
} 