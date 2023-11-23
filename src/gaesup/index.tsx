'use client';

import { Collider } from '@dimforge/rapier3d-compat';
import { RapierRigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import Camera from './camera';
import check from './check';
import initProps from './initial/initProps';
import initSetting from './initial/initSetting';
import calculation from './physics';
import {
  GaesupCapsuleCollider,
  GaesupGroup,
  GaesupRigidBody,
  GaesupSlopeRay
} from './ref';
import { callbackType, controllerType, refsType } from './type';
import CharacterGltf from './utils/CharacterGltf';
import VehicleGltf from './utils/VehicleGltf';

export default function Controller(props: controllerType) {
  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);

  const refs: refsType = {
    capsuleColliderRef,
    rigidBodyRef,
    outerGroupRef,
    slopeRayOriginRef
  };

  const prop = {
    ...initProps({
      props,
      refs
    }),
    ...refs
  };

  const callbacks: callbackType = {
    onReady: props.onReady,
    onFrame: props.onFrame,
    onDestory: props.onDestory,
    onAnimate: props.onAnimate
  };

  initSetting(prop);
  check(prop);
  calculation(prop);

  return (
    <>
      <Camera prop={prop} />
      <GaesupRigidBody
        ref={rigidBodyRef}
        groundRay={prop.groundRay}
        controllerProps={props}
      >
        <GaesupCapsuleCollider ref={capsuleColliderRef} />
        <GaesupGroup ref={outerGroupRef}>
          <GaesupSlopeRay
            slopeRay={prop.slopeRay}
            groundRay={prop.groundRay}
            ref={slopeRayOriginRef}
          />
          {props.children}
          {props.options?.mode === 'normal' && (
            <CharacterGltf
              prop={prop}
              url={props.url}
              character={props.character}
              groundRay={prop.groundRay}
              refs={refs}
              callbacks={callbacks}
            />
          )}
          {/* {props.options?.mode === 'airplane' && <CharacterGltf {...props} />} */}
          {props.options?.mode === 'vehicle' && <VehicleGltf {...props} />}
        </GaesupGroup>
      </GaesupRigidBody>
    </>
  );
}
