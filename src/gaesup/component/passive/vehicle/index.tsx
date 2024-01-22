import { Collider } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { urlsType } from "../../../world/context/type";
import { VehicleInnerRef } from "../../inner/vehicle";

export type passiveVehiclePropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  children?: React.ReactNode;
  offset?: THREE.Vector3;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};
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

  const { position, euler, currentAnimation, urls } = props;

  return (
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      position={position}
      rotation={euler}
      userData={{ intangible: true }}
      onCollisionEnter={props.onCollisionEnter}
      currentAnimation={currentAnimation}
    >
      {props.children}
    </VehicleInnerRef>
  );
}
