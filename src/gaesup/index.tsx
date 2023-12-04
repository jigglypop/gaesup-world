"use client";

import { Collider, RevoluteImpulseJoint } from "@dimforge/rapier3d-compat";
import { useLoader } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
import { colliderAtom } from "./stores/collider";
import { optionsAtom } from "./stores/options";
import { GLTFResult, callbackType, controllerType, refsType } from "./type";
import { S3 } from "./utils/constant";

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

  const airplaneGltf: GLTFResult = useLoader(
    GLTFLoader,
    props.airplaneUrl || props.url
  );

  console.log("airplaneGltf", airplaneGltf);

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

  const { scene: airplaneScene } = airplaneGltf;

  const airplaneSize = new THREE.Box3()
    .setFromObject(airplaneScene)
    .getSize(new THREE.Vector3());

  useEffect(() => {
    if (airplaneSize.x !== 0 && airplaneSize.y !== 0 && airplaneSize.z !== 0) {
      setCollider((collider) => ({
        ...collider,
        airplaneSizeX: airplaneSize.x,
        airplaneSizeY: airplaneSize.y,
        airplaneSizeZ: airplaneSize.z,
        airplaneX: airplaneSize.x / 2,
        airplaneY: airplaneSize.y / 2,
        airplaneZ: airplaneSize.z / 2,
      }));
    }
  }, [airplaneSize.x, airplaneSize.y, airplaneSize.z]);

  return (
    <>
      {options.mode === "normal" && (
        <Character props={props} characterGltf={characterGltf} />
      )}
      {options.mode === "vehicle" && (
        <Vehicle
          characterGltf={characterGltf}
          props={props}
          vehicleGltf={vehicleGltf}
          wheelGltf={wheelGltf}
        />
      )}

      {options.mode === "airplane" && (
        <Airplane props={props} airplaneGltf={airplaneGltf} />
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
  characterGltf,
  vehicleGltf,
  wheelGltf,
}: {
  props: controllerType;
  characterGltf: GLTFResult;
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
          <CharacterGltf
            gltf={characterGltf}
            prop={prop}
            url={props.url}
            character={props.character}
            groundRay={prop.groundRay}
            refs={refs}
            callbacks={callbacks}
            isRider={true}
          />
          <VehicleGltf gltf={vehicleGltf} />
        </VehicleRigidBody>
        <Wheels prop={prop} />
      </VehicleGroup>
    </>
  );
}

export function Airplane({
  props,
  airplaneGltf,
}: {
  props: controllerType;
  airplaneGltf: GLTFResult;
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
          <AirplaneCollider />
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
          <AirplaneGltf gltf={airplaneGltf} />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
