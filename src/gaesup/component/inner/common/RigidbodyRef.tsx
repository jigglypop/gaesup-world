import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, euler } from '@react-three/rapier';
import { useAtom } from 'jotai';
import { MutableRefObject, forwardRef, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useSubscribeActions, usePlayActions } from '../../../atoms/animationAtoms';
import { cameraOptionAtom } from '../../../atoms/cameraOptionAtom';
import Camera from '../../../camera';
import initCallback from '../../../controller/initialize/callback';
import { useGltfAndSize } from '../../../hooks/useGaesupGltf';
import calculation from '../../../physics';
import { cameraPropType } from '../../../physics/type';
import { GaesupContext } from '../../../context';
import { InnerGroupRef } from './InnerGroupRef';
import { PartsGroupRef } from './partsGroupRef';
import { useSetGroundRay } from './setGroundRay';
import { rigidBodyRefType } from './type';

export const RigidBodyRef = forwardRef(
  (props: rigidBodyRefType, ref: MutableRefObject<RapierRigidBody>) => {
    const { size } = useGltfAndSize({ url: props.url || '' });
    
    const setGroundRay = useSetGroundRay();
    const worldContext = useContext(GaesupContext);
    const [cameraOption] = useAtom(cameraOptionAtom);

    // GLTF와 애니메이션을 먼저 로드
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const skeleton = useMemo(() => {
      let skel = null;
      clone.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skel = child.skeleton;
        }
      });
      return skel;
    }, [clone]);

    useEffect(() => {
      if (props.groundRay && props.colliderRef) {
        setGroundRay({
          groundRay: props.groundRay,
          length: 2.0,
          colliderRef: props.colliderRef,
        });
      }
    }, [props.groundRay, props.colliderRef, setGroundRay]);

    // Active 관련 로직을 다시 컴포넌트 최상위로 이동 (Hook 규칙 준수)
    if (props.isActive) {
      useSubscribeActions({
        type: props.componentType,
        groundRay: props.groundRay,
        animations: animations,
      });
      const cameraProps: cameraPropType = {
        state: null,
        worldContext,
        controllerOptions: props.controllerOptions,
        cameraOption,
      };

      Camera(cameraProps);
      calculation({
        outerGroupRef: props.outerGroupRef,
        innerGroupRef: props.innerGroupRef,
        rigidBodyRef: ref,
        colliderRef: props.colliderRef,
        groundRay: props.groundRay,
      });
    }

    usePlayActions({
      type: props.componentType,
      actions,
      animationRef,
      currentAnimation: props.isActive ? undefined : props.currentAnimation,
      isActive: props.isActive,
    });
    initCallback({
      props,
      actions,
      componentType: props.componentType,
    });
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find((node) => node.type === 'Object3D');
    const safeRotationY = props.rotation?.clone ? props.rotation.clone().y : props.rotation?.y || 0;

    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={props.name}
        position={props.position}
        rotation={euler().set(0, safeRotationY, 0).clone()}
        userData={props.userData}
        type={props.rigidbodyType || (props.isActive ? 'dynamic' : 'fixed')}
        sensor={props.sensor}
        onIntersectionEnter={props.onIntersectionEnter}
        onIntersectionExit={props.onIntersectionExit}
        onCollisionEnter={props.onCollisionEnter}
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
          objectNode={objectNode}
          animationRef={animationRef}
          nodes={nodes}
          ref={props.innerGroupRef}
          isActive={props.isActive}
          isRiderOn={props.isRiderOn}
          enableRiding={props.enableRiding}
          ridingUrl={props.ridingUrl}
          offset={props.offset}
          parts={props.parts}
        >
          {props.children}
          {props.parts &&
            props.parts.length > 0 &&
            props.parts.map(({ url, color }, key) => {
              if (!url) return null;
              return (
                <PartsGroupRef
                  url={url}
                  isActive={props.isActive}
                  componentType={props.componentType}
                  currentAnimation={props.currentAnimation}
                  color={color}
                  key={key + url}
                  skeleton={skeleton}
                />
              );
            })}
        </InnerGroupRef>
      </RigidBody>
    );
  },
);
