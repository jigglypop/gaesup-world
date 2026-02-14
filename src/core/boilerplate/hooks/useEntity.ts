import { useRef, RefObject } from 'react';

import type { RapierCollider, RapierRigidBody } from '@react-three/rapier';
import type { Group } from 'three';

import type { GroundRay } from '@core/motions/entities/types';
import { useAnimationSetup } from '@core/motions/hooks/setup/useAnimationSetup';
import { useMotionSetup } from '@core/motions/hooks/setup/useMotionSetup';
import { usePhysicsBridge } from '@core/motions/hooks/usePhysicsBridge';
import type { PhysicsCalculationProps } from '@core/motions/types';
import { useAnimationPlayer } from '@hooks/useAnimationPlayer';
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
  } = options;

  const entityId = useRef<string>(
    id || `entity-${Date.now()}-${Math.random()}`,
  ).current;

  const activeMode = useGaesupStore((state) => state.mode);
  const modeType = activeMode?.type ?? 'character';
  const active = isActive === true;

  // 1. Animation Logic
  useAnimationSetup(actions, modeType, active);
  useAnimationPlayer(active && modeType === 'character');

  // 2. Motion Logic
  const { executeMotionCommand, getMotionSnapshot } = useMotionSetup(
    entityId,
    rigidBodyRef,
    modeType,
    active,
  );

  // 3. Physics Logic
  if (active) {
    const physicsProps: PhysicsCalculationProps = {
      rigidBodyRef,
      ...(outerGroupRef ? { outerGroupRef } : {}),
      ...(innerGroupRef ? { innerGroupRef } : {}),
      ...(colliderRef ? { colliderRef } : {}),
      ...(groundRay ? { groundRay } : {}),
    };
    usePhysicsBridge(physicsProps);
  }

  // 4. Collision Logic
  const collisionHandlers = useCollisionHandler(options);

  // 5. Lifecycle Logic
  useEntityLifecycle(options);

  return {
    executeMotionCommand,
    getMotionSnapshot,
    mode: activeMode,
    ...collisionHandlers,
  };
} 