import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

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
import { PhysicsEntityProps, SetGroundRayType } from '../types';


export function useSetGroundRay() {
  return ({ groundRay, length, colliderRef }: SetGroundRayType) => {
    if (!colliderRef.current || !groundRay) return;
    if (!groundRay.origin || !groundRay.dir) return;
    const raycaster = new THREE.Raycaster();
    raycaster.set(groundRay.origin, groundRay.dir);
    raycaster.far = length;
    const intersections = raycaster.intersectObjects([], true);
    if (intersections.length > 0) {
      colliderRef.current.setActiveEvents(1);
    }
  };
}

export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
  (props, forwardedRef) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null!);
    useImperativeHandle(forwardedRef, () => rigidBodyRef.current);
    const { size } = useGltfAndSize({ url: props.url || '' });
    const setGroundRay = useSetGroundRay();
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
    
    const {
      handleIntersectionEnter,
      handleIntersectionExit,
      handleCollisionEnter,
    } = useEntity({
      ...props,
      id: props.name,
      rigidBodyRef,
      actions,
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
              currentAnimation={props.currentAnimation}
              color={color}
              key={`${props.componentType}-${url}-${color || 'default'}-${index}`}
              skeleton={skeleton}
            />
          );
        })
        .filter(Boolean);
    }, [props.parts, props.componentType, props.currentAnimation, skeleton]);

    if (props.groundRay && props.colliderRef) {
      setGroundRay({
        groundRay: props.groundRay,
        length: 2.0,
        colliderRef: props.colliderRef
      });
    }

    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    const safeRotationY = props.rotation instanceof THREE.Euler ? props.rotation.y : 0;

    return (
      <group ref={props.outerGroupRef} userData={{ intangible: true }}>
        <RigidBody
          canSleep={false}
          ccd={true}
          colliders={false}
          ref={rigidBodyRef}
          name={props.name}
          position={props.position}
          rotation={euler().set(0, safeRotationY, 0)}
          userData={props.userData}
          type={props.rigidbodyType || (props.isActive ? 'dynamic' : 'fixed')}
          sensor={props.sensor}
          onIntersectionEnter={handleIntersectionEnter}
          onIntersectionExit={handleIntersectionExit}
          onCollisionEnter={handleCollisionEnter}
          {...props.rigidBodyProps}
        >
          {!props.isNotColliding && (
            <CapsuleCollider
              ref={props.colliderRef}
              args={[(size.y / 2 - size.x) * 1.2, size.x * 1.2]}
              position={[0, size.x * 1.2, 0]}
            />
          )}
          <InnerGroupRef
            objectNode={objectNode}
            animationRef={animationRef}
            nodes={nodes}
            ref={props.innerGroupRef}
            isActive={props.isActive}
            componentType={props.componentType}
            modelYawOffset={props.modelYawOffset}
            isRiderOn={props.isRiderOn}
            enableRiding={props.enableRiding}
            ridingUrl={props.ridingUrl}
            offset={props.offset}
            parts={props.parts}
            frustumCulled={false}
          >
            {props.children}
            {partsComponents}
          </InnerGroupRef>
        </RigidBody>
      </group>
    );
  },
);