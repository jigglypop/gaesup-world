import { RapierRigidBody } from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { createRef, useRef } from "react";
import { WheelRegidBodyRef } from "../ref/vehicle";
import { colliderAtom } from "../stores/collider";
import { propType } from "../type";

export function Wheels({ prop }: { prop: propType }) {
  const { rigidBodyRef, constant } = prop;
  const { wheelOffset } = constant;
  const collider = useAtomValue(colliderAtom);
  const { sizeX, sizeZ, wheelSizeX, wheelSizeZ } = collider;
  const _sizeX = (sizeX + wheelSizeX) / 2 + wheelOffset;
  const _sizeZ = (sizeZ + wheelSizeZ) / 2 + wheelOffset;
  const wheelPositions: [number, number, number][] = [
    [-_sizeX, 0, _sizeZ],
    [-_sizeX, 0, -_sizeZ],
    [_sizeX, 0, _sizeZ],
    [_sizeX, 0, -_sizeZ],
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
