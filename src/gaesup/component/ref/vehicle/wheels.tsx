import { RapierRigidBody } from "@react-three/rapier";
import { createRef, useContext, useRef } from "react";
import { GaesupControllerContext } from "../../../controller/context";
import { controllerInnerType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { WheelRegidBodyRef } from "./wheel";

export function Wheels({ props }: { props: controllerInnerType }) {
  const { rigidBodyRef } = props;
  const {
    vehicle: { wheelOffset },
  } = useContext(GaesupControllerContext);
  const { vehicleCollider: collider } = useContext(GaesupWorldContext);
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
