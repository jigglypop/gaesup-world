import { Collider } from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
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

  const {
    position,
    euler,
    // vehicleSize,
    // wheelSize,
    currentAnimation,
    urls,
    // wheelUrl,
    // vehicleUrl,
  } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
      // vehicleSize: props.vehicleSize,
      // wheelSize: props.wheelSize,
      currentAnimation: props.currentAnimation,
      urls: props.urls,
      // wheelUrl: props.url.wheelUrl,
      // vehicleUrl: props.url.vehicleUrl,
    };
  }, [props]);

  return (
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      position={position}
      rotation={euler}
      userData={{ intangible: true }}
      onCollisionEnter={props.onCollisionEnter}
    >
      {props.children}
    </VehicleInnerRef>
  );
}
