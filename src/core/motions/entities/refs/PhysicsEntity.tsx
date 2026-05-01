import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  euler,
} from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useEntity } from '@core/boilerplate/hooks/useEntity';

import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './PartsGroupRef';
import { useGltfAndSize } from '../../hooks';
import { PhysicsEntityProps } from '../types';

const EMPTY_GLTF_DATA_URI =
  'data:application/json,' +
  encodeURIComponent(
    JSON.stringify({
      asset: { version: '2.0' },
      scenes: [{ nodes: [] }],
      nodes: [],
    }),
  );

function resolveAnimationKey(
  actions: Record<string, THREE.AnimationAction | null>,
  requested: string,
): string | undefined {
  if (actions[requested]) return requested;
  const keys = Object.keys(actions);
  const normalized = requested.toLowerCase();
  return keys.find((key) => key.toLowerCase() === normalized)
    ?? keys.find((key) => key.toLowerCase().includes(normalized))
    ?? (keys.length === 1 ? keys[0] : undefined);
}

export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
  (props, forwardedRef) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null!);
    useImperativeHandle(forwardedRef, () => rigidBodyRef.current);
    const { size } = useGltfAndSize({ url: props.url || '' });
    const modelUrl = props.url?.trim() ? props.url : EMPTY_GLTF_DATA_URI;
    const { scene, animations } = useGLTF(modelUrl);
    const { actions, ref: animationRef } = useAnimations(animations);
    const activeAnimationRef = useRef<string | undefined>(undefined);
    
    const {
      handleIntersectionEnter,
      handleIntersectionExit,
      handleCollisionEnter,
    } = useEntity({
      rigidBodyRef,
      ...(props.name ? { id: props.name } : {}),
      ...(props.userData ? { userData: props.userData } : {}),
      ...(props.onIntersectionEnter ? { onIntersectionEnter: props.onIntersectionEnter } : {}),
      ...(props.onIntersectionExit ? { onIntersectionExit: props.onIntersectionExit } : {}),
      ...(props.onCollisionEnter ? { onCollisionEnter: props.onCollisionEnter } : {}),
      ...(props.onReady ? { onReady: props.onReady } : {}),
      ...(props.onFrame ? { onFrame: props.onFrame } : {}),
      ...(props.onAnimate ? { onAnimate: props.onAnimate } : {}),
      ...(props.onDestroy || props.onDestory ? { onDestroy: props.onDestroy ?? props.onDestory } : {}),
      actions,
      isActive: props.isActive,
      ...(props.outerGroupRef ? { outerGroupRef: props.outerGroupRef } : {}),
      ...(props.innerGroupRef ? { innerGroupRef: props.innerGroupRef } : {}),
      ...(props.colliderRef ? { colliderRef: props.colliderRef } : {}),
      ...(props.groundRay ? { groundRay: props.groundRay } : {}),
    });

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const skeleton = useMemo(() => {
      let skel: THREE.Skeleton | null = null;
      clone.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skel = child.skeleton;
        }
      });
      return skel;
    }, [clone]);

    const partsComponents = useMemo(() => {
      if (!props.parts || props.parts.length === 0) return null;
      return props.parts
        .map(({ url, color }, index) => {
          if (!url) return null;
          return (
            <PartsGroupRef
              url={url}
              isActive={true}
              componentType={props.componentType}
              {...(props.currentAnimation ? { currentAnimation: props.currentAnimation } : {})}
              {...(color ? { color } : {})}
              key={`${props.componentType}-${url}-${color || 'default'}-${index}`}
              {...(skeleton ? { skeleton } : {})}
            />
          );
        })
        .filter(Boolean);
    }, [props.parts, props.componentType, props.currentAnimation, skeleton]);

    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    const safeRotationY = props.rotation instanceof THREE.Euler ? props.rotation.y : 0;
    const outerGroupProps = props.outerGroupRef ? { ref: props.outerGroupRef } : {};
    const innerGroupProps = props.innerGroupRef ? { ref: props.innerGroupRef } : {};
    const rigidBodyBehavior = props.isActive
      ? { canSleep: false, ccd: true }
      : { canSleep: true, ccd: false };
    const collider = useMemo(() => {
      if (props.colliderSize) {
        const radius = Math.max(0.05, props.colliderSize.radius);
        const halfHeight = Math.max(0.05, props.colliderSize.height * 0.5 - radius);
        return {
          halfHeight,
          radius,
          y: halfHeight + radius,
        };
      }
      const width = Math.max(size.x, 0.1);
      const depth = Math.max(size.z, 0.1);
      const bodyRadius =
        props.componentType === 'character'
          ? Math.max(0.18, Math.min(width, depth) * 0.35)
          : Math.max(0.2, width * 1.2);
      const bodyHalfHeight = Math.max(0.05, size.y * 0.5 - bodyRadius);
      return {
        halfHeight: bodyHalfHeight,
        radius: bodyRadius,
        y: bodyHalfHeight + bodyRadius,
      };
    }, [props.colliderSize, props.componentType, size.x, size.y, size.z]);

    useEffect(() => {
      if (!props.currentAnimation) return;
      const nextKey = resolveAnimationKey(actions, props.currentAnimation);
      if (!nextKey || activeAnimationRef.current === nextKey) return;

      const previous = activeAnimationRef.current ? actions[activeAnimationRef.current] : undefined;
      const next = actions[nextKey];
      previous?.fadeOut(0.2);
      next?.reset().fadeIn(0.2).play();
      activeAnimationRef.current = nextKey;
    }, [actions, props.currentAnimation]);

    return (
      <group {...outerGroupProps} userData={{ intangible: true }}>
        <RigidBody
          {...rigidBodyBehavior}
          colliders={false}
          ref={rigidBodyRef}
          {...(props.name ? { name: props.name } : {})}
          position={props.position}
          rotation={euler().set(0, safeRotationY, 0)}
          userData={props.userData}
          type={props.rigidbodyType || (props.isActive ? 'dynamic' : 'fixed')}
          {...(props.sensor !== undefined ? { sensor: props.sensor } : {})}
          onIntersectionEnter={handleIntersectionEnter}
          onIntersectionExit={handleIntersectionExit}
          onCollisionEnter={handleCollisionEnter}
          {...props.rigidBodyProps}
        >
          {!props.isNotColliding && (
            <CapsuleCollider
              ref={props.colliderRef}
              args={[collider.halfHeight, collider.radius]}
              position={[0, collider.y, 0]}
            />
          )}
          <InnerGroupRef
            animationRef={animationRef}
            nodes={nodes}
            {...innerGroupProps}
            isActive={props.isActive}
            componentType={props.componentType}
            {...(objectNode ? { objectNode } : {})}
            {...(props.modelYawOffset !== undefined ? { modelYawOffset: props.modelYawOffset } : {})}
            {...(props.isRiderOn !== undefined ? { isRiderOn: props.isRiderOn } : {})}
            {...(props.enableRiding !== undefined ? { enableRiding: props.enableRiding } : {})}
            {...(props.ridingUrl ? { ridingUrl: props.ridingUrl } : {})}
            {...(props.offset ? { offset: props.offset } : {})}
            {...(props.baseColor ? { baseColor: props.baseColor } : {})}
            {...(props.excludeBaseNodes ? { excludeBaseNodes: props.excludeBaseNodes } : {})}
            {...(props.parts ? { parts: props.parts } : {})}
          >
            {props.children}
            {partsComponents}
          </InnerGroupRef>
        </RigidBody>
      </group>
    );
  },
);

PhysicsEntity.displayName = 'PhysicsEntity';