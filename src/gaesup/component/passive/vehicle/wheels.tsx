import { RapierRigidBody } from "@react-three/rapier";
import { createRef, useRef } from "react";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
import { WheelRegidBodyRef } from "./wheel";

export type useSetWheelType = {
  wheelPositions: [number, number, number][];
};

export function Wheels({
  props,
  rigidBodyRef,
  url,
}: {
  props: gaesupPassivePropsType;
  rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
  url: string;
}) {
  const { wheelOffset, vehicleCollider: collider } = props;
  const { vehicleSizeX, vehicleSizeZ, wheelSizeX, wheelSizeZ } = collider;
  const X = (vehicleSizeX - wheelSizeX) / 2 + wheelOffset;
  const Z = (vehicleSizeZ - 2 * wheelSizeZ) / 2 + wheelOffset;
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
            vehicleCollider: collider,
            wheelAnchor: [0, 0, 0],
            rotationAxis: [1, 0, 0],
            url,
          }}
        />
      ))}
    </>
  );
}
