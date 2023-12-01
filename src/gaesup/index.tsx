"use client";

import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import * as THREE from "three";
import Camera from "./camera";
import check from "./check";
import initProps from "./initial/initProps";
import initSetting from "./initial/initSetting";
import calculation from "./physics";
import { optionsAtom } from "./stores/options";
import { callbackType, controllerType, refsType } from "./type";
import VehicleGltf from "./utils/VehicleGltf";

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
  const options = useAtomValue(optionsAtom);

  return (
    <>
      <Camera prop={prop} />

      <VehicleGltf
        prop={prop}
        url={props.url}
        character={props.character}
        groundRay={prop.groundRay}
        refs={refs}
        callbacks={callbacks}
      />
    </>
  );
}
