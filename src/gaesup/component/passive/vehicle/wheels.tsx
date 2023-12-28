import { RapierRigidBody } from "@react-three/rapier";
import { createRef, useRef } from "react";
import { WheelRegidBodyRef } from "./wheel";

export type useSetWheelType = {
  wheelPositions: [number, number, number][];
};

export function Wheels({
  vehicleSize,
  wheelSize,
  rigidBodyRef,
  url,
}: {
  vehicleSize: THREE.Vector3;
  wheelSize: THREE.Vector3;
  rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
  url: string;
}) {
  const X = (vehicleSize.x - wheelSize.x) / 2 + 0.5;
  const Z = (vehicleSize.z - 2 * wheelSize.z) / 2 + 0.5;
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
      {wheelPositions.map((wheelPosition, index) => (
        <WheelRegidBodyRef
          key={index}
          ref={wheelRefs.current[index]}
          props={{
            wheelPosition,
            bodyRef: rigidBodyRef,
            wheel: wheelRefs.current[index],
            bodyAnchor: wheelPosition,
            wheelSize,
            wheelAnchor: [0, 0, 0],
            rotationAxis: [1, 0, 0],
            url,
          }}
        />
      ))}
    </>
  );
}
