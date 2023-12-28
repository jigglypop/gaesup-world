import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { passiveVehiclePropsType } from "./type";
import { Wheels } from "./wheels";

export function PassiveVehicle(props: passiveVehiclePropsType) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const colliderRef = useRef<Collider>(null);

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    capsuleColliderRef: colliderRef,
  };

  const {
    position,
    euler,
    vehicleSize,
    wheelSize,
    currentAnimation,
    wheelUrl,
    vehicleUrl,
  } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
      vehicleSize: props.vehicleSize,
      wheelSize: props.wheelSize,
      currentAnimation: props.currentAnimation,
      wheelUrl: props.url.wheelUrl,
      vehicleUrl: props.url.vehicleUrl,
    };
  }, [props]);

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      {props.children}
      {vehicleUrl && (
        <RigidBodyRef
          ref={refs.rigidBodyRef}
          position={position}
          rotation={euler}
        >
          <InnerGroupRef
            currentAnimation={currentAnimation}
            ref={refs.innerGroupRef}
            url={vehicleUrl}
          />
          <CuboidCollider
            ref={colliderRef}
            args={[vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2]}
            position={[0, vehicleSize.y + wheelSize.y || 0, 0]}
          />
        </RigidBodyRef>
      )}
      {wheelUrl && (
        <Wheels
          vehicleSize={vehicleSize}
          wheelSize={wheelSize}
          rigidBodyRef={rigidBodyRef}
          url={wheelUrl}
        />
      )}
    </OuterGroupRef>
  );
}
