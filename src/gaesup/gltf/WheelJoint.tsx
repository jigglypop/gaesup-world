import { RapierRigidBody } from "@react-three/rapier";
import { createRef, useContext, useRef } from "react";
import { WheelRegidBodyRef } from "../ref/vehicle";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import { propType } from "../type";

export function Wheels({ prop }: { prop: propType }) {
  const { rigidBodyRef, constant } = prop;
  const { wheelOffset } = constant;
  const { vehicleCollider: collider } =
    useContext<gaesupWorldPropType>(GaesupWorldContext);
  const { vehicleSizeX, vehicleSizeZ, wheelSizeX, wheelSizeZ } = collider;
  const X = (vehicleSizeX + wheelSizeX) / 2 + wheelOffset;
  const Z = (vehicleSizeZ + wheelSizeZ) / 2 + wheelOffset;
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
          wheelPosition={wheelPosition}
          bodyRef={rigidBodyRef}
          wheel={wheelRefs.current[index]}
          bodyAnchor={wheelPosition}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[1, 0, 0]}
        />
      ))}
    </>
  );
}
