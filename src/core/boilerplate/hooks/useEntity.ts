import { useRef, RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { useGaesupStore } from '@stores/gaesupStore';
import { useAnimationPlayer } from '@hooks/useAnimationPlayer';
import { useAnimationSetup } from '@core/motions/hooks/setup/useAnimationSetup';
import { useMotionSetup } from '@core/motions/hooks/setup/useMotionSetup';
import { usePhysicsBridge } from '@core/motions/hooks/usePhysicsBridge';
import { PhysicsCalculationProps } from '@core/motions/types';
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
  outerGroupRef?: RefObject<THREE.Group>;
  innerGroupRef?: RefObject<THREE.Group>;
  colliderRef?: RefObject<any>;
  groundRay?: any;
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
  const modeType = activeMode?.type;

  // 1. Animation Logic
  useAnimationSetup(actions, modeType, isActive);
  useAnimationPlayer(isActive && modeType === 'character');

  // 2. Motion Logic
  const { executeMotionCommand, getMotionSnapshot } = useMotionSetup(
    entityId,
    rigidBodyRef,
    modeType,
    isActive,
  );

  // 3. Physics Logic
  if (isActive) {
    const physicsProps: PhysicsCalculationProps = {
      outerGroupRef,
      innerGroupRef,
      rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
      colliderRef,
      groundRay,
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