import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, quat } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { AirplaneCollider } from "./collider";
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

  const { euler } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
      currentAnimation: props.currentAnimation,
      airplaneUrl: props.airplaneUrl,
    };
  }, [props]);

  useFrame(() => {
    if (innerGroupRef && innerGroupRef.current) {
      const _euler = euler.clone();
      _euler.y = 0;
      innerGroupRef.current.setRotationFromQuaternion(
        quat()
          .setFromEuler(innerGroupRef.current.rotation.clone())
          .slerp(quat().setFromEuler(_euler), 0.2)
      );
    }
    if (rigidBodyRef && rigidBodyRef.current) {
      rigidBodyRef.current.setGravityScale(props.gravity, false);
    }
  });

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      {props.airplaneUrl && (
        <RigidBodyRef
          ref={refs.rigidBodyRef}
          position={props.position}
          rotation={props.euler}
        >
          <InnerGroupRef
            currentAnimation={props.currentAnimation}
            ref={refs.innerGroupRef}
            url={props.airplaneUrl}
          />
          <AirplaneCollider
            airplaneSize={props.airplaneSize}
            ref={colliderRef}
          />
        </RigidBodyRef>
      )}
    </OuterGroupRef>
  );
}
