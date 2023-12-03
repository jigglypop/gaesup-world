"use client";

import { S3 } from "@/components/main";
import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { useLoader } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Camera from "./camera";
import check from "./check";
import VehicleGltf from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import initProps from "./initial/initProps";
import initSetting from "./initial/initSetting";
import calculation from "./physics";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import { GLTFResult, callbackType, controllerType, refsType } from "./type";

export default function Controller(props: controllerType) {
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
  };

  const callbacks: callbackType = {
    onReady: props.onReady,
    onFrame: props.onFrame,
    onDestory: props.onDestory,
    onAnimate: props.onAnimate,
  };

  initSetting(prop);
  check(prop);
  calculation(prop, refs);

  const gltf: GLTFResult = useLoader(GLTFLoader, props.url);
  const wheelGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.wheelsUrl || S3 + "/wheel.glb"
  );

  return (
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
  );
}
