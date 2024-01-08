import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RapierRigidBody, quat } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
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

  const { position, euler, currentAnimation, airplaneUrl, airplaneSize } =
    useMemo(() => {
      return {
        position: props.position,
        euler: props.euler,
        currentAnimation: props.currentAnimation,
        airplaneUrl: props.airplaneUrl,
        airplaneSize: props.airplaneSize,
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
      rigidBodyRef.current.setGravityScale(
        props.position.y < 10
          ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1
          : 0.1,
        false
      );
    }
  });

  return (
    <OuterGroupRef ref={refs.outerGroupRef}>
      {props.children}
      {airplaneUrl && (
        <RigidBodyRef
          ref={refs.rigidBodyRef}
          position={position}
          rotation={euler}
          onCollisionEnter={props.onCollisionEnter}
        >
          <InnerGroupRef
            currentAnimation={currentAnimation}
            ref={refs.innerGroupRef}
            url={airplaneUrl}
          />
          <CuboidCollider
            ref={colliderRef}
            args={[airplaneSize.x / 2, airplaneSize.y / 2, airplaneSize.z / 2]}
            position={[0, airplaneSize.y / 2, 0]}
          />
        </RigidBodyRef>
      )}
    </OuterGroupRef>
  );
}
