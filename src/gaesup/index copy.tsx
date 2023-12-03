"use client";

import { S3 } from "@/components/main";
import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { useLoader } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Camera from "./camera";
import check from "./check";
import CharacterGltf from "./gltf/CharacterGltf";
import VehicleGltf from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import initProps from "./initial/initProps";
import initSetting from "./initial/initSetting";
import calculation from "./physics";
import {
  GaesupCapsuleCollider,
  GaesupGroup,
  GaesupRigidBody,
  GaesupSlopeRay,
} from "./ref/character";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import { optionsAtom } from "./stores/options";
import { GLTFResult, callbackType, controllerType, refsType } from "./type";

export default function Controller(props: controllerType) {
  const [options, setOptions] = useAtom(optionsAtom);
  useEffect(() => {
    setOptions((options) => ({
      ...options,
      ...props.options,
    }));
  }, []);

  const capsuleColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const slopeRayOriginRef = useRef<THREE.Mesh>(null);
  const jointRefs = useRef<RevoluteImpulseJoint>(null);

  const refs: refsType = {
    capsuleColliderRef,
    rigidBodyRef,
    outerGroupRef,
    slopeRayOriginRef,
    jointRefs,
  };

  const prop = {
    ...initProps({
      props,
      refs,
    }),
    ...refs,
    characterUrl: props.characterUrl,
    kartUrl: props.kartUrl,
  };

  const callbacks: callbackType = {
    onReady: props.onReady,
    onFrame: props.onFrame,
    onDestory: props.onDestory,
    onAnimate: props.onAnimate,
  };

  initSetting(prop);
  check(prop);
  calculation(prop);

  const gltf: GLTFResult = useLoader(GLTFLoader, props.kartUrl || props.url);
  const wheelGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.wheelsUrl || S3 + "/wheel.glb"
  );

  return (
    <>
      {/* <VehicleGroup ref={outerGroupRef}>
        <VehicleRigidBody ref={rigidBodyRef} groundRay={prop.groundRay}>
          <VehicleCollider gltf={gltf} wheelGltf={wheelGltf} />
          <VehicleGltf gltf={gltf} />
        </VehicleRigidBody>
        <Wheels prop={prop} />
      </VehicleGroup> */}
      {options.mode === "normal" && (
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
              <CharacterGltf
                prop={prop}
                url={props.url}
                character={props.character}
                groundRay={prop.groundRay}
                refs={refs}
                callbacks={callbacks}
              />
            </GaesupGroup>
          </GaesupRigidBody>
        </>
      )}
      {options.mode === "vehicle" && (
        <>
          <Camera prop={prop} />
          <VehicleGroup ref={outerGroupRef}>
            <VehicleRigidBody ref={rigidBodyRef} groundRay={prop.groundRay}>
              <VehicleCollider gltf={gltf} wheelGltf={wheelGltf} />
              <VehicleGltf gltf={gltf} />
            </VehicleRigidBody>
            <Wheels prop={prop} />
          </VehicleGroup>
        </>
      )}
    </>
  );
}
