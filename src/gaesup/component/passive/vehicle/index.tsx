import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";
import { VehicleInnerRef } from "../../inner/vehicle";
import { passiveVehiclePropsType } from "./type";

export function PassiveVehicle(props: passiveVehiclePropsType) {
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

  return (
    <VehicleInnerRef
      userData={{ intangible: true }}
      componentType={"vehicle"}
      name={"vehicle"}
      isActive={false}
      {...props}
      {...refs}
    >
      {props.children}
    </VehicleInnerRef>
  );
}
