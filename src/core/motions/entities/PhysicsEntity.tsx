import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, euler } from '@react-three/rapier';
import { RefObject, forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGaesupStore } from '@stores/gaesupStore';
import { useAnimationPlayer } from '@hooks/useAnimationPlayer';
import { useGltfAndSize } from '@utils/gltf';
import usePhysicsLoop from '../index';
import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './PartsGroupRef';
import { useSetGroundRay } from './setGroundRay';
import { PhysicsEntityProps } from './types';
import { Camera } from '../../camera';

function RidingAnimation({
  url,
  active = false,
}: {
  url: string;
  active?: boolean;
}) {
  const { animations: ridingAnimations } = useGLTF(url);
  const { actions: ridingActions } = useAnimations(ridingAnimations);

  useAnimationPlayer(ridingActions, active);

  return null;
}

export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
  (props, rigidBodyRef) => {
    const { size } = useGltfAndSize({ url: props.url || '' });
    const setGroundRay = useSetGroundRay();
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
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

    useEffect(() => {
      return () => {
        if (clone) {
          clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();

              if (Array.isArray(child.material)) {
                child.material.forEach((material) => {
                  Object.keys(material).forEach((key) => {
                    const prop = material[key];
                    if (prop?.isTexture) {
                      prop.dispose();
                    }
                  });
                  material.dispose();
                });
              } else if (child.material) {
                const material = child.material;
                Object.keys(material).forEach((key) => {
                  if (material[key]?.isTexture) {
                    material[key].dispose();
                  }
                });
                material.dispose();
              }
            }
          });
        }

        if (skeleton) {
          skeleton.dispose();
        }

        if (actions) {
          Object.values(actions).forEach((action) => {
            if (action) {
              action.stop();
              action.getMixer().uncacheAction(action.getClip());
            }
          });
        }
      };
    }, [clone, skeleton, actions]);

    useEffect(() => {
      if (props.groundRay && props.colliderRef) {
        setGroundRay({
          groundRay: props.groundRay,
          length: 2.0,
          colliderRef: props.colliderRef,
        });
      }
    }, [props.groundRay, props.colliderRef, setGroundRay]);

    if (props.isActive) {
      usePhysicsLoop({
        outerGroupRef: props.outerGroupRef,
        innerGroupRef: props.innerGroupRef,
        rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
        colliderRef: props.colliderRef,
        groundRay: props.groundRay,
      });
    }

    const isRiding = useGaesupStore((state) => state.states.isRiding);
    const mode = useGaesupStore((state) => state.mode);

    useAnimationPlayer(actions, props.isActive && !isRiding);
    
    useEffect(() => {
      if (!props.isActive && actions && actions.idle) {
        actions.idle.reset().play();
      }
    }, [actions, props.isActive]);
    
    if (props.onReady) props.onReady();
    if (props.onFrame) props.onFrame();
    if (props.onAnimate && actions) props.onAnimate();
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    const safeRotationY = props.rotation instanceof THREE.Euler ? props.rotation.y : 0;

    const handleIntersectionEnter = async (payload: any) => {
      if (props.onIntersectionEnter) {
        await props.onIntersectionEnter(payload);
      }
      if (props.userData?.onNear) {
        await props.userData.onNear(payload, props.userData);
      }
    };

    const handleIntersectionExit = async (payload: any) => {
      if (props.onIntersectionExit) {
        await props.onIntersectionExit(payload);
      }
      if (props.userData?.onLeave) {
        await props.userData.onLeave(payload);
      }
    };

    const handleCollisionEnter = async (payload: any) => {
      if (props.onCollisionEnter) {
        await props.onCollisionEnter(payload);
      }
      if (props.userData?.onNear) {
        await props.userData.onNear(payload, props.userData);
      }
    };

    return (
      <group ref={props.outerGroupRef} userData={{ intangible: true }}>
        {props.isActive && <Camera />}
        {props.ridingUrl && mode.type !== 'character' && (
          <RidingAnimation url={props.ridingUrl} active={isRiding} />
        )}
        <RigidBody
          canSleep={false}
          ccd={true}
          colliders={false}
          ref={rigidBodyRef}
          name={props.name || (props.isActive ? 'character' : props.componentType)}
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
              ref={props.colliderRef as any}
              args={[(size.y / 2 - size.x) * 1.2, size.x * 1.2]}
              position={[0, size.x * 1.2, 0]}
            />
          )}
          <InnerGroupRef
            objectNode={objectNode as THREE.Object3D}
            animationRef={animationRef as RefObject<THREE.Group | null>}
            nodes={nodes}
            ref={props.innerGroupRef as RefObject<THREE.Group | null>}
            isActive={props.isActive}
            isRiderOn={props.isRiderOn}
            enableRiding={props.enableRiding}
            ridingUrl={props.ridingUrl}
            offset={props.offset}
            parts={props.parts}
          >
            {props.children}
            {partsComponents}
          </InnerGroupRef>
        </RigidBody>
      </group>
    );
  },
);
