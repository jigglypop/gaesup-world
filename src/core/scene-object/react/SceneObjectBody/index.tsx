import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  RigidBody,
  type CollisionPayload,
} from '@react-three/rapier';

import type { SceneObjectBodyProps, SceneObjectPhysicsEventKind } from './types';
import {
  SCENE_COMPONENT_TYPES,
  type ColliderComponentData,
  type RigidBodyComponentData,
} from '../../components';
import { getSceneObjectComponent } from '../../query';
import type { SceneComponentType, SceneObject, SceneVector3 } from '../../types';

export const SCENE_OBJECT_BODY_ID_KEY = 'sceneObjectId';

const DEFAULT_BOX_SIZE: SceneVector3 = [1, 1, 1];
const DEFAULT_RADIUS = 0.5;
const DEFAULT_CAPSULE_HEIGHT = 1;
const HALF = 0.5;

const RIGID_BODY_TYPES = {
  fixed: 'fixed',
  dynamic: 'dynamic',
  kinematic: 'kinematicPosition',
} as const;

function findEnabledData<TData>(object: SceneObject, type: SceneComponentType): TData | undefined {
  const component = getSceneObjectComponent(object, type);
  return component?.enabled ? (component.data as TData) : undefined;
}

function resolveOtherId({ other }: CollisionPayload): string {
  const body = other.rigidBodyObject;
  const id: unknown = body?.userData[SCENE_OBJECT_BODY_ID_KEY];
  return typeof id === 'string' ? id : body?.name ?? '';
}

export function SceneObjectBody({ object, collisionGroups, onPhysicsEvent, children }: SceneObjectBodyProps) {
  const collider = findEnabledData<ColliderComponentData>(object, SCENE_COMPONENT_TYPES.collider);
  if (!collider) return <>{children}</>;
  const rigidBody = findEnabledData<RigidBodyComponentData>(object, SCENE_COMPONENT_TYPES.rigidBody);
  const groups = object.layer ? collisionGroups?.get(object.layer) : undefined;
  const colliderProps = {
    sensor: collider.trigger === true,
    ...(groups !== undefined ? { collisionGroups: groups } : {}),
    ...(rigidBody?.mass !== undefined ? { mass: rigidBody.mass } : {}),
  };
  const emit = (kind: SceneObjectPhysicsEventKind) => (payload: CollisionPayload) => {
    onPhysicsEvent?.(kind, object.id, resolveOtherId(payload));
  };
  const size = collider.size ?? DEFAULT_BOX_SIZE;
  const radius = collider.radius ?? DEFAULT_RADIUS;
  const height = collider.height ?? DEFAULT_CAPSULE_HEIGHT;

  return (
    <RigidBody
      type={RIGID_BODY_TYPES[rigidBody?.type ?? 'fixed']}
      colliders={collider.shape === 'mesh' ? 'trimesh' : false}
      position={[...object.transform.position]}
      rotation={[...object.transform.rotation]}
      userData={{ [SCENE_OBJECT_BODY_ID_KEY]: object.id }}
      {...(rigidBody?.gravityScale !== undefined ? { gravityScale: rigidBody.gravityScale } : {})}
      {...(rigidBody?.lockRotations ? { lockRotations: true } : {})}
      {...(collider.shape === 'mesh' ? colliderProps : {})}
      onIntersectionEnter={emit('triggerEnter')}
      onIntersectionExit={emit('triggerExit')}
      onCollisionEnter={emit('collisionEnter')}
      onCollisionExit={emit('collisionExit')}
    >
      {collider.shape === 'box' && (
        <CuboidCollider args={[size[0] * HALF, size[1] * HALF, size[2] * HALF]} {...colliderProps} />
      )}
      {collider.shape === 'sphere' && <BallCollider args={[radius]} {...colliderProps} />}
      {collider.shape === 'capsule' && (
        <CapsuleCollider args={[Math.max(0, height * HALF - radius), radius]} {...colliderProps} />
      )}
      {children}
    </RigidBody>
  );
}
