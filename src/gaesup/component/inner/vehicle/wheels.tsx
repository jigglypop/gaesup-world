import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { RefObject, createRef, useContext, useRef } from "react";
import * as THREE from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { GaesupContext } from "../../../context";

const WheelJoint = ({
  body,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: [number, number, number];
  wheelAnchor: [number, number, number];
  rotationAxis: [number, number, number];
}) => {
  const joint = useRevoluteJoint(body, wheel, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);
  const { activeState } = useContext(GaesupContext);
  useFrame(() => {
    if (joint.current) {
      joint.current.configureMotorPosition(
        activeState.position.length(),
        0.8,
        0
      );
    }
  });
  return null;
};

export function WheelsRef({
  vehicleSize,
  rigidBodyRef,
  wheelUrl,
}: {
  vehicleSize: THREE.Vector3;
  rigidBodyRef: RefObject<RapierRigidBody>;
  wheelUrl: string;
}) {
  const { size: wheelSize } = useGltfAndSize({
    url: wheelUrl,
  });

  const X = (vehicleSize.x - wheelSize.x) / 2;
  const Z = (vehicleSize.z - 2 * wheelSize.z) / 2;
  const wheelPositions: [number, number, number][] = [
    [-X, 0, Z],
    [-X, 0, -Z],
    [X, 0, Z],
    [X, 0, -Z],
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );

  return (
    <>
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <RigidBody
              key={index}
              position={wheelPosition}
              colliders={false}
              type="dynamic"
              ref={wheelRef}
              rotation={[0, 0, Math.PI / 2]}
            >
              <CylinderCollider
                rotation={[0, 0, Math.PI / 2]}
                args={[wheelSize.x / 2, wheelSize.y / 2]}
              />
              <Gltf src={wheelUrl} />
            </RigidBody>
          );
        })}
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <WheelJoint
              key={index}
              body={rigidBodyRef}
              wheel={wheelRef}
              bodyAnchor={wheelPosition}
              wheelAnchor={[0, 0, 0]}
              rotationAxis={[1, 0, 0]}
            />
          );
        })}
    </>
  );
}
