import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { AirplaneInnerRef } from "../../inner/airplane";
import { passiveAirplanePropsType } from "./type";

export function PassiveAirplane(props: passiveAirplanePropsType) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    colliderRef,
  };

  useFrame(() => {
    if (innerGroupRef && innerGroupRef.current) {
      const _euler = props.rotation.clone();
      _euler.y = 0;
      innerGroupRef.current.setRotationFromQuaternion(
        quat()
          .setFromEuler(innerGroupRef.current.rotation.clone())
          .slerp(quat().setFromEuler(_euler), 0.2)
      );
    }
    if (rigidBodyRef && rigidBodyRef.current) {
      rigidBodyRef.current.setGravityScale(
        props.position.y < 10
          ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1
          : 0.1,
        false
      );
    }
  });

  return (
    <AirplaneInnerRef
      isActive={false}
      componentType={"airplane"}
      name={"airplane"}
      controllerOptions={
        props.controllerOptions || {
          lerp: {
            cameraTurn: 1,
            cameraPosition: 1,
          },
        }
      }
      position={props.position.clone()}
      rotation={props.rotation.clone()}
      currentAnimation={props.currentAnimation}
      {...props}
      {...refs}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}
