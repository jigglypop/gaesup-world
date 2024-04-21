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
      outerGroupRef={outerGroupRef}
      innerGroupRef={innerGroupRef}
      rigidBodyRef={rigidBodyRef}
      colliderRef={colliderRef}
      controllerOptions={props.controllerOptions}
      refs={refs}
      userData={{ intangible: true }}
      componentType={"vehicle"}
      name={"vehicle"}
      isRiderOn={props.isRiderOn}
      enableRiding={props.enableRiding}
      isActive={false}
      {...props}
    >
      {props.children}
    </VehicleInnerRef>
  );
}
