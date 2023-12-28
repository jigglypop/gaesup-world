import { RapierRigidBody } from "@react-three/rapier";
import { createRef, useContext, useRef } from "react";
import { controllerInnerType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { WheelRegidBodyRef } from "./wheel";

export type useSetWheelType = {
  wheelPositions: [number, number, number][];
};

export function Wheels({ props }: { props: controllerInnerType }) {
  const { rigidBodyRef } = props;
  const { vehicleCollider: collider } = useContext(GaesupWorldContext);
  const { vehicleSizeX, vehicleSizeZ, wheelSizeX, wheelSizeZ } = collider;
  const X = (vehicleSizeX - wheelSizeX) / 2 + 0.5;
  const Z = (vehicleSizeZ - 2 * wheelSizeZ) / 2 + 0.5;
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
          index={index}
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
