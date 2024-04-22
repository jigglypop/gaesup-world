import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
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

  const memorized = useMemo(() => {
    return (
      <VehicleInnerRef
        isActive={false}
        componentType={"vehicle"}
        name={"vehicle"}
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
      </VehicleInnerRef>
    );
  }, [props.position, props.rotation, props.currentAnimation]);

  return <>{memorized}</>;
}
