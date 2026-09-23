import { useRef, RefObject } from 'react';

import type { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import type { Group } from 'three';

import type { AnimatorControllerDefinition } from '@core/animation/core/animator/types';
import type { GroundRay } from '@core/motions/entities/types';
import type { PhysicsEntityProps } from '@core/motions/entities/types';
import { useAnimationSetup } from '@core/motions/hooks/setup/useAnimationSetup';
import { useMotionSetup } from '@core/motions/hooks/setup/useMotionSetup';
import { useCharacterAnimator } from '@core/motions/hooks/useCharacterAnimator';
import {
  usePhysicsBridge,
  type UsePhysicsBridgeOptions,
} from '@core/motions/hooks/usePhysicsBridge';
import { useGaesupStore } from '@stores/gaesupStore';

import {
  useCollisionHandler,
  CollisionHandlerOptions,
} from './useCollisionHandler';
import {
  useEntityLifecycle,
  EntityLifecycleOptions,
} from './useEntityLifecycle';

export interface UseEntityOptions
  extends CollisionHandlerOptions,
    EntityLifecycleOptions {
  id?: string;
  rigidBodyRef: RefObject<RapierRigidBody>;
  isActive?: boolean;
  outerGroupRef?: RefObject<Group>;
  innerGroupRef?: RefObject<Group>;
  colliderRef?: RefObject<RapierCollider>;
  groundRay?: GroundRay;
  colliderSize?: PhysicsEntityProps['colliderSize'];
  animatorController?: AnimatorControllerDefinition;
}

export function useEntity(options: UseEntityOptions) {
  const {
    id,
    rigidBodyRef,
    isActive,
    actions,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
    groundRay,
    colliderSize,
    animatorController,
  } = options;

  const entityId = useRef<string>(
    id || `entity-${Date.now()}-${Math.random()}`,
  ).current;

  const activeMode = useGaesupStore((state) => state.mode);
  const modeType = activeMode?.type ?? 'character';
  const active = isActive === true;

  useAnimationSetup(actions, modeType, active);
  useCharacterAnimator({
    enabled: active && modeType === 'character',
    ...(animatorController ? { controller: animatorController } : {}),
  });

  const { executeMotionCommand, getMotionSnapshot } = useMotionSetup(
    entityId,
    rigidBodyRef,
    modeType,
    active,
  );

  const physicsProps: UsePhysicsBridgeOptions = {
    entityId,
    rigidBodyRef,
    enabled: active,
    ...(outerGroupRef ? { outerGroupRef } : {}),
    ...(innerGroupRef ? { innerGroupRef } : {}),
    ...(colliderRef ? { colliderRef } : {}),
    ...(groundRay ? { groundRay } : {}),
    ...(colliderSize ? { colliderSize } : {}),
  };
  usePhysicsBridge(physicsProps);

  const collisionHandlers = useCollisionHandler(options);

  useEntityLifecycle(options);

  return {
    executeMotionCommand,
    getMotionSnapshot,
    mode: activeMode,
    ...collisionHandlers,
  };
}
