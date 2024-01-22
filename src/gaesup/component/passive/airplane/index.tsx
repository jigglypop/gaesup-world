import { Collider } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import {
  CollisionEnterPayload,
  RapierRigidBody,
  quat,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { urlsType } from "../../../world/context/type";
import { AirplaneInnerRef } from "../../inner/airplane";

export type passiveAirplanePropsType = {
  position: THREE.Vector3;
  euler: THREE.Euler;
  urls: urlsType;
  currentAnimation: string;
  offset?: THREE.Vector3;
  children?: React.ReactNode;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};

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

  const { position, euler, currentAnimation, urls } = useMemo(() => {
    return {
      position: props.position,
      euler: props.euler,
      currentAnimation: props.currentAnimation,
      urls: props.urls,
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
    <AirplaneInnerRef
      refs={refs}
      urls={urls}
      position={position}
      rotation={euler}
      userData={{ intangible: true }}
      onCollisionEnter={props.onCollisionEnter}
      currentAnimation={props.currentAnimation}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}
