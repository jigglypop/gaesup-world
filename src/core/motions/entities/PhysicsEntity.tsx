import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, euler } from '@react-three/rapier';
import { RefObject, forwardRef, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGaesupStore } from '../../stores';
import { useAnimationPlayer } from '../../hooks';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';
import usePhysicsLoop from '../index';
import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './PartsGroupRef';
import { useSetGroundRay } from './setGroundRay';
import { PhysicsEntityProps } from './types';
import { Camera } from '../../camera';
import { useGltfAndSize } from './useGaesupGltf';

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
  
  useEffect(() => {
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
  }, [actions, isActive, keyboard?.forward, keyboard?.backward, keyboard?.shift, modeType]);

  return null;
}

export const PhysicsEntity = forwardRef<RapierRigidBody, PhysicsEntityProps>(
  (props, rigidBodyRef) => {
    const { size } = useGltfAndSize({ url: props.url || '' });
    const setGroundRay = useSetGroundRay();
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
    const animationBridgeRef = useRef<boolean>(false);
    
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

    const mode = useGaesupStore((state) => state.mode);
    const isRiding = useGaesupStore((state) => state.states.isRiding);

    useEffect(() => {
      if (actions && mode?.type && props.isActive && !animationBridgeRef.current) {
        const bridge = getGlobalAnimationBridge();
        bridge.registerAnimations(mode.type as any, actions);
        animationBridgeRef.current = true;
        
        return () => {
          bridge.unregisterAnimations(mode.type as any);
          animationBridgeRef.current = false;
        };
      }
    }, [actions, mode?.type, props.isActive]);

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
    
    useAnimationPlayer(props.isActive && mode?.type === 'character');
    
    useEffect(() => {
      if (props.onReady) props.onReady();
    }, [props.onReady]);
    
    useEffect(() => {
      let animationId: number;
      
      const frameHandler = () => {
        if (props.onFrame) props.onFrame();
        if (props.onAnimate && actions) props.onAnimate();
        
        // 계속해서 다음 프레임을 요청
        animationId = requestAnimationFrame(frameHandler);
      };
      
      if (props.onFrame || (props.onAnimate && actions)) {
        animationId = requestAnimationFrame(frameHandler);
        
        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
        };
      }
    }, [props.onFrame, props.onAnimate, actions]);
    
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    const safeRotationY = props.rotation instanceof THREE.Euler ? props.rotation.y : 0;

    const handleIntersectionEnter = useMemo(() => async (payload: any) => {
      if (props.onIntersectionEnter) {
        await props.onIntersectionEnter(payload);
      }
      if (props.userData?.onNear) {
        await props.userData.onNear(payload, props.userData);
      }
    }, [props.onIntersectionEnter, props.userData]);

    const handleIntersectionExit = useMemo(() => async (payload: any) => {
      if (props.onIntersectionExit) {
        await props.onIntersectionExit(payload);
      }
      if (props.userData?.onLeave) {
        await props.userData.onLeave(payload);
      }
    }, [props.onIntersectionExit, props.userData]);

    const handleCollisionEnter = useMemo(() => async (payload: any) => {
      if (props.onCollisionEnter) {
        await props.onCollisionEnter(payload);
      }
      if (props.userData?.onNear) {
        await props.userData.onNear(payload, props.userData);
      }
    }, [props.onCollisionEnter, props.userData]);

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
            frustumCulled={false}>
            {props.children}
            {partsComponents}
          </InnerGroupRef>
        </RigidBody>
      </group>
    );
  },
);