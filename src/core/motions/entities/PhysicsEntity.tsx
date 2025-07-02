import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, euler } from '@react-three/rapier';
import { RefObject, forwardRef, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGaesupStore } from '../../stores';
import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './PartsGroupRef';
import { useSetGroundRay } from './setGroundRay';
import { PhysicsEntityProps } from './types';
import { useGltfAndSize } from './useGaesupGltf';
import { usePhysicsEntity } from '../hooks/usePhysicsEntity';

// AnimationActions 타입 정의
type AnimationActions = {
  [key: string]: THREE.AnimationAction | undefined;
  idle?: THREE.AnimationAction;
  walk?: THREE.AnimationAction;
  run?: THREE.AnimationAction;
  fly?: THREE.AnimationAction;
};

function RidingAnimation({
  url,
  active = false,
}: {
  url: string;
  active?: boolean;
}) {
  const { animations: ridingAnimations } = useGLTF(url);
  const { actions: ridingActions } = useAnimations(ridingAnimations);
  
  useEffect(() => {
    if (active && ridingActions.ride) {
      ridingActions.ride.reset().play();
    }
    return () => {
      if (ridingActions.ride) {
        ridingActions.ride.stop();
      }
    };
  }, [active, ridingActions]);
  
  return null;
}

function VehicleAnimation({
  actions,
  isActive = false,
  modeType = 'vehicle',
}: {
  actions: AnimationActions;
  isActive?: boolean;
  modeType?: string;
}) {
  const keyboard = useGaesupStore((state) => state.interaction?.keyboard);
  const prevStateRef = useRef({ isMoving: false, isRunning: false });
    if (!isActive || !actions) return;
    
    const isMoving = keyboard?.forward || keyboard?.backward;
    const isRunning = keyboard?.shift && isMoving;
    const prevState = prevStateRef.current;
    
    if (prevState.isMoving === isMoving && prevState.isRunning === isRunning) {
      return;
    }
    
    prevStateRef.current = { isMoving, isRunning };
    
    Object.values(actions).forEach((action) => {
      if (action) action.stop();
    });
    
    if (modeType === 'airplane') {
      if (actions.fly) {
        actions.fly.reset().play();
      } else if (actions.idle) {
        actions.idle.reset().play();
      }
    } else {
      if (isRunning && actions.run) {
        actions.run.reset().play();
      } else if (isMoving && actions.walk) {
        actions.walk.reset().play();
      } else if (actions.idle) {
        actions.idle.reset().play();
      }
    }
}

export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
  (props, rigidBodyRef) => {
    const { size } = useGltfAndSize({ url: props.url || '' });
    const setGroundRay = useSetGroundRay();
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
    const {
      mode,
      isRiding,
      handleIntersectionEnter,
      handleIntersectionExit,
      handleCollisionEnter
    } = usePhysicsEntity({
      ...props,
      rigidBodyRef: rigidBodyRef as RefObject<RapierRigidBody>,
      actions
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
        {props.ridingUrl && mode.type !== 'character' && (
          <RidingAnimation url={props.ridingUrl} active={isRiding} />
        )}
        {(mode?.type === 'vehicle' || mode?.type === 'airplane') && props.isActive && (
          <VehicleAnimation actions={actions} isActive={true} modeType={mode.type} />
        )}
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