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
  CharacterCapsuleCollider,
  CharacterGroup,
  CharacterRigidBody,
  CharacterSlopeRay,
} from "./ref/character";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import { colliderAtom } from "./stores/collider";
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

  const vehicleGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.kartUrl || props.url
  );
  const wheelGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.wheelsUrl || S3 + "/wheel.glb"
  );
  const characterGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.characterUrl || props.url
  );

  const { scene: characterScene } = characterGltf;
  const [collider, setCollider] = useAtom(colliderAtom);
  const characterSize = new THREE.Box3()
    .setFromObject(characterScene)
    .getSize(new THREE.Vector3());

  useEffect(() => {
    if (
      characterSize.x !== 0 &&
      characterSize.y !== 0 &&
      characterSize.z !== 0
    ) {
      const height = characterSize.y / 2;
      const halfHeight = height / 2;
      const diameter = Math.max(characterSize.x, characterSize.z);
      const radius = diameter / 2;
      setCollider((collider) => ({
        ...collider,
        height: height - diameter / 2,
        halfHeight: halfHeight - radius / 2,
        diameter,
        radius,
      }));
    }
  }, [characterSize.x, characterSize.y, characterSize.z]);

  const { scene: vehicleScene } = vehicleGltf;
  const { scene: wheelScene } = wheelGltf;

  const vehicleSize = new THREE.Box3()
    .setFromObject(vehicleScene)
    .getSize(new THREE.Vector3());
  const wheelsize = new THREE.Box3()
    .setFromObject(wheelScene)
    .getSize(new THREE.Vector3());

  useEffect(() => {
    if (
      vehicleSize.x !== 0 &&
      vehicleSize.y !== 0 &&
      vehicleSize.z !== 0 &&
      wheelsize.x !== 0 &&
      wheelsize.y !== 0 &&
      wheelsize.z !== 0
    ) {
      setCollider((collider) => ({
        ...collider,
        sizeX: vehicleSize.x,
        sizeY: wheelsize.y,
        sizeZ: vehicleSize.z,
        wheelSizeX: wheelsize.x,
        wheelSizeY: wheelsize.y,
        wheelSizeZ: wheelsize.z,
        x: vehicleSize.x / 2,
        y: wheelsize.y / 2,
        z: vehicleSize.z / 2,
      }));
    }
  }, [
    vehicleSize.x,
    vehicleSize.y,
    vehicleSize.z,
    wheelsize.x,
    wheelsize.y,
    wheelsize.z,
  ]);

  return (
    <>
      {options.mode === "normal" && (
        <Character props={props} characterGltf={characterGltf} />
      )}
      {options.mode === "vehicle" && (
        <Vehicle
          props={props}
          vehicleGltf={vehicleGltf}
          wheelGltf={wheelGltf}
        />
      )}
    </>
  );
}

export function Character({
  props,
  characterGltf,
}: {
  props: controllerType;
  characterGltf: GLTFResult;
}) {
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

  return (
    <>
      <Camera prop={prop} />
      <CharacterRigidBody
        ref={rigidBodyRef}
        groundRay={prop.groundRay}
        controllerProps={props}
      >
        <CharacterCapsuleCollider
          url={props.characterUrl || props.url}
          ref={capsuleColliderRef}
          gltf={characterGltf}
        />
        <CharacterGroup ref={outerGroupRef}>
          <CharacterSlopeRay
            slopeRay={prop.slopeRay}
            groundRay={prop.groundRay}
            ref={slopeRayOriginRef}
          />
          {props.children}
          <CharacterGltf
            gltf={characterGltf}
            prop={prop}
            url={props.url}
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

export function Vehicle({
  props,
  vehicleGltf,
  wheelGltf,
}: {
  props: controllerType;
  vehicleGltf: GLTFResult;
  wheelGltf: GLTFResult;
}) {
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

  return (
    <>
      <Camera prop={prop} />
      <VehicleGroup ref={outerGroupRef}>
        <VehicleRigidBody ref={rigidBodyRef} groundRay={prop.groundRay}>
          <VehicleCollider
            url={props.kartUrl || props.url}
            gltf={vehicleGltf}
            wheelGltf={wheelGltf}
          />
          <VehicleGltf gltf={vehicleGltf} />
        </VehicleRigidBody>
        <Wheels prop={prop} />
      </VehicleGroup>
    </>
  );
}
