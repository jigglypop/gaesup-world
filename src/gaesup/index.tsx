"use client";

import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Camera from "./camera";
import check from "./check";
import AirplaneGltf from "./gltf/AirplaneGltf";
import CharacterGltf from "./gltf/CharacterGltf";
import VehicleGltf from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import initProps from "./initial/initProps";
import calculation from "./physics";
import {
  AirplaneCollider,
  AirplaneGroup,
  AirplaneRigidBody,
} from "./ref/airplane";
import {
  CharacterCapsuleCollider,
  CharacterGroup,
  CharacterRigidBody,
  CharacterSlopeRay,
} from "./ref/character";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import { optionsAtom } from "./stores/options";
import { callbackType, controllerType, refsType } from "./type";

export default function Controller(props: controllerType) {
  const [options, setOptions] = useAtom(optionsAtom);

  useEffect(() => {
    setOptions((options) => ({
      ...options,
      ...props.options,
    }));
  }, []);

  return (
    <>
      {options.mode === "normal" && <Character props={props} />}
      {options.mode === "vehicle" && <Vehicle props={props} />}
      {options.mode === "airplane" && <Airplane props={props} />}
    </>
  );
}

export function Character({ props }: { props: controllerType }) {
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
    airplaneUrl: props.airplaneUrl,
  };

  const callbacks: callbackType = {
    onReady: props.onReady,
    onFrame: props.onFrame,
    onDestory: props.onDestory,
    onAnimate: props.onAnimate,
  };

  check(prop);
  calculation(prop);

  return (
    <>
      <Camera prop={prop} />
      <CharacterRigidBody
        ref={rigidBodyRef}
        groundRay={prop.groundRay}
        controllerProps={props}
      >
        <CharacterCapsuleCollider ref={capsuleColliderRef} />
        <CharacterGroup ref={outerGroupRef}>
          <CharacterSlopeRay
            slopeRay={prop.slopeRay}
            groundRay={prop.groundRay}
            ref={slopeRayOriginRef}
          />
          {props.children}
          <CharacterGltf
            prop={prop}
            character={props.character}
            groundRay={prop.groundRay}
            refs={refs}
            callbacks={callbacks}
          />
        </CharacterGroup>
      </CharacterRigidBody>
    </>
  );
}

export function Vehicle({ props }: { props: controllerType }) {
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

  check(prop);
  calculation(prop);

  return (
    <>
      <Camera prop={prop} />
      <VehicleGroup ref={outerGroupRef}>
        <VehicleRigidBody ref={rigidBodyRef} groundRay={prop.groundRay}>
          <VehicleCollider />
          <CharacterGltf
            prop={prop}
            character={props.character}
            groundRay={prop.groundRay}
            refs={refs}
            callbacks={callbacks}
            isRider={true}
          />
          <VehicleGltf />
        </VehicleRigidBody>
        <Wheels prop={prop} />
      </VehicleGroup>
    </>
  );
}

export function Airplane({ props }: { props: controllerType }) {
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
    airplaneUrl: props.airplaneUrl,
  };

  const callbacks: callbackType = {
    onReady: props.onReady,
    onFrame: props.onFrame,
    onDestory: props.onDestory,
    onAnimate: props.onAnimate,
  };

  check(prop);
  calculation(prop);

  return (
    <>
      <Camera prop={prop} />
      <AirplaneGroup ref={outerGroupRef}>
        <AirplaneRigidBody ref={rigidBodyRef} groundRay={prop.groundRay}>
          <AirplaneCollider ref={capsuleColliderRef} />
          {/* <CharacterGltf
            gltf={characterGltf}
            prop={prop}
            url={props.url}
            character={props.character}
            groundRay={prop.groundRay}
            refs={refs}
            callbacks={callbacks}
            isRider={true}
          /> */}
          <AirplaneGltf />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
